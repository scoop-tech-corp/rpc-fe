import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Button, Chip, Grid, Stack, TextField, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, processDownloadPDF } from 'service/service-global';
import { ReactTable } from 'components/third-party/ReactTable';
import { EditOutlined } from '@ant-design/icons';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  getLoanProductDetail,
  submitLoanProduct,
  approvalLoanProduct,
  loanOutProduct,
  returnLoanProduct,
  deleteLoanProduct,
  downloadLoanProductPDF
} from '../service';
import dayjs from 'dayjs';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ConfirmationC from 'components/ConfirmationC';
import ModalC from 'components/ModalC';

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'warning' },
  pending: { label: 'Pending', color: 'secondary' },
  approved: { label: 'Approved', color: 'primary' },
  active: { label: 'Active', color: 'info' },
  returned: { label: 'Returned', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' }
};

const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography variant="h6" fontWeight="bold">
      {label}
    </Typography>
    <Typography variant="body1">{value ?? '-'}</Typography>
  </Grid>
);

const ProductLoanDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsPageSize, setDetailsPageSize] = useState(5);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(5);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [openLoanOut, setOpenLoanOut] = useState(false);
  const [loanDate, setLoanDate] = useState(dayjs());
  const [openReturn, setOpenReturn] = useState(false);
  const [returnDate, setReturnDate] = useState(dayjs());
  const [returnNote, setReturnNote] = useState('');
  const [returnDetails, setReturnDetails] = useState([]);

  const columnDetails = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: 'SKU', accessor: 'sku', isNotSorting: true },
      { Header: <FormattedMessage id="product" />, accessor: 'productName', isNotSorting: true },
      { Header: <FormattedMessage id="product-type" />, accessor: 'productType', isNotSorting: true },
      { Header: <FormattedMessage id="loaned-qty" />, accessor: 'loanedQty', isNotSorting: true },
      {
        Header: <FormattedMessage id="suggested-price" />,
        accessor: 'suggestedPrice',
        isNotSorting: true,
        Cell: ({ value }) => (value ? Number(value).toLocaleString('id-ID') : '-')
      },
      { Header: <FormattedMessage id="sold-qty" />, accessor: 'soldQty', isNotSorting: true },
      { Header: <FormattedMessage id="returned-qty" />, accessor: 'returnedQty', isNotSorting: true },
      {
        Header: <FormattedMessage id="revenue" />,
        accessor: 'revenue',
        isNotSorting: true,
        Cell: ({ value }) => (value ? Number(value).toLocaleString('id-ID') : '-')
      },
      {
        Header: 'Return Status',
        accessor: 'returnStatus',
        isNotSorting: true,
        Cell: ({ value }) => {
          const color = value === 'returned' ? 'success' : 'warning';
          return <Chip color={color} label={value ?? '-'} size="small" variant="light" />;
        }
      }
    ],
    []
  );

  const columnLogs = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: <FormattedMessage id="action" />, accessor: 'action', isNotSorting: true },
      { Header: <FormattedMessage id="description" />, accessor: 'description', isNotSorting: true },
      { Header: <FormattedMessage id="performed-by" />, accessor: 'user.firstName', isNotSorting: true },
      { Header: <FormattedMessage id="created-at" />, accessor: 'created_at', isNotSorting: true }
    ],
    []
  );

  const fetchDetail = async () => {
    await getLoanProductDetail(id)
      .then((resp) => {
        const detailData = resp.data?.data ?? resp.data;
        setData(detailData);
        if (detailData?.details) {
          setReturnDetails(
            detailData.details.map((d) => ({
              id: d.id,
              productName: d.productName,
              loanedQty: d.loanedQty,
              soldQty: 0,
              actualSellingPrice: d.suggestedPrice ?? 0,
              itemNote: ''
            }))
          );
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusInfo = STATUS_MAP[data?.status] ?? { label: data?.status ?? '-', color: 'default' };
  const isDraft = data?.status === 'draft';
  const isPending = data?.status === 'pending';
  const isApproved = data?.status === 'approved';
  const isActive = data?.status === 'active';
  const isReturned = data?.status === 'returned';

  const handleDownloadPDF = async () => {
    try {
      const resp = await downloadLoanProductPDF(Number(id));
      processDownloadPDF(resp, `loan-product-${data?.loanNumber}`);
      dispatch(snackbarSuccess('PDF downloaded successfully'));
    } catch (err) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const handleSubmit = async (value) => {
    if (!value) { setConfirmSubmit(false); return; }
    await submitLoanProduct(Number(id))
      .then((resp) => {
        if (resp.status === 200) {
          setConfirmSubmit(false);
          dispatch(snackbarSuccess('Loan product submitted for approval'));
          fetchDetail();
        }
      })
      .catch((err) => {
        if (err) { setConfirmSubmit(false); dispatch(snackbarError(createMessageBackend(err, true, true))); }
      });
  };

  const handleDelete = async (value) => {
    if (!value) { setConfirmDelete(false); return; }
    await deleteLoanProduct(Number(id))
      .then((resp) => {
        if (resp.status === 200) {
          setConfirmDelete(false);
          dispatch(snackbarSuccess('Loan product deleted'));
          navigate('/product/loan');
        }
      })
      .catch((err) => {
        if (err) { setConfirmDelete(false); dispatch(snackbarError(createMessageBackend(err, true, true))); }
      });
  };

  const handleApprove = async (value) => {
    if (!value) { setConfirmApprove(false); return; }
    await approvalLoanProduct({ id: Number(id), isApproved: true })
      .then((resp) => {
        if (resp.status === 200) {
          setConfirmApprove(false);
          dispatch(snackbarSuccess('Loan product approved'));
          fetchDetail();
        }
      })
      .catch((err) => {
        if (err) { setConfirmApprove(false); dispatch(snackbarError(createMessageBackend(err, true, true))); }
      });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await approvalLoanProduct({ id: Number(id), isApproved: false, rejectedReason: rejectReason })
      .then((resp) => {
        if (resp.status === 200) {
          setOpenReject(false);
          setRejectReason('');
          dispatch(snackbarSuccess('Loan product rejected'));
          fetchDetail();
        }
      })
      .catch((err) => {
        if (err) { setOpenReject(false); dispatch(snackbarError(createMessageBackend(err, true, true))); }
      });
  };

  const handleLoanOut = async () => {
    await loanOutProduct({ id: Number(id), loanDate: dayjs(loanDate).format('YYYY-MM-DD') })
      .then((resp) => {
        if (resp.status === 200) {
          setOpenLoanOut(false);
          dispatch(snackbarSuccess('Products loaned out successfully'));
          fetchDetail();
        }
      })
      .catch((err) => {
        if (err) { setOpenLoanOut(false); dispatch(snackbarError(createMessageBackend(err, true, true))); }
      });
  };

  const handleReturn = async () => {
    await returnLoanProduct({
      id: Number(id),
      returnDate: dayjs(returnDate).format('YYYY-MM-DD'),
      returnNote,
      details: returnDetails.map((d) => ({
        id: d.id,
        soldQty: d.soldQty,
        actualSellingPrice: d.actualSellingPrice,
        itemNote: d.itemNote
      }))
    })
      .then((resp) => {
        if (resp.status === 200) {
          setOpenReturn(false);
          dispatch(snackbarSuccess('Loan product returned successfully'));
          navigate('/product/loan');
        }
      })
      .catch((err) => {
        if (err) { setOpenReturn(false); dispatch(snackbarError(createMessageBackend(err, true, true))); }
      });
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="loan-detail" />} isBreadcrumb={true} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard
            title={<FormattedMessage id="information" />}
            secondary={
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {isDraft && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<EditOutlined />}
                      onClick={() => navigate(`/product/loan/form/${id}`)}
                    >
                      <FormattedMessage id="edit" />
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setConfirmSubmit(true)}>
                      <FormattedMessage id="submit" />
                    </Button>
                    <Button variant="contained" color="error" onClick={() => setConfirmDelete(true)}>
                      <FormattedMessage id="delete" />
                    </Button>
                  </>
                )}
                {isPending && (
                  <>
                    <Button variant="contained" color="success" onClick={() => setConfirmApprove(true)}>
                      <FormattedMessage id="approve" />
                    </Button>
                    <Button variant="contained" color="error" onClick={() => setOpenReject(true)}>
                      <FormattedMessage id="reject" />
                    </Button>
                  </>
                )}
                {isApproved && (
                  <Button variant="contained" color="primary" onClick={() => setOpenLoanOut(true)}>
                    Loan Out
                  </Button>
                )}
                {isActive && (
                  <Button variant="contained" color="success" onClick={() => setOpenReturn(true)}>
                    <FormattedMessage id="return" />
                  </Button>
                )}
                {isReturned && (
                  <Button variant="contained" color="primary" onClick={handleDownloadPDF}>
                    Download PDF
                  </Button>
                )}
              </Stack>
            }
          >
            <Grid container spacing={2}>
              <DetailItem label={<FormattedMessage id="loan-number" />} value={data?.loanNumber} />
              <DetailItem label={<FormattedMessage id="location" />} value={data?.location?.locationName} />
              <DetailItem label={<FormattedMessage id="staff" />} value={data?.staff?.firstName} />
              <DetailItem label={<FormattedMessage id="event-name" />} value={data?.eventName} />
              <DetailItem label={<FormattedMessage id="event-date" />} value={data?.eventDate} />
              <DetailItem label={<FormattedMessage id="event-address" />} value={data?.eventAddress} />
              <DetailItem label={<FormattedMessage id="return-deadline" />} value={data?.returnDeadline} />
              <DetailItem label={<FormattedMessage id="loan-date" />} value={data?.loanDate} />
              <DetailItem label={<FormattedMessage id="return-date" />} value={data?.returnDate} />
              <DetailItem label={<FormattedMessage id="total-items" />} value={data?.totalItems} />
              <DetailItem label={<FormattedMessage id="total-loaned-qty" />} value={data?.totalLoanedQty} />
              <DetailItem label={<FormattedMessage id="total-sold-qty" />} value={data?.totalSoldQty} />
              <DetailItem label={<FormattedMessage id="total-returned-qty" />} value={data?.totalReturnedQty} />
              <DetailItem
                label={<FormattedMessage id="total-revenue" />}
                value={data?.totalRevenue ? Number(data.totalRevenue).toLocaleString('id-ID') : null}
              />
              <DetailItem label={<FormattedMessage id="approver" />} value={data?.approver?.firstName} />
              <DetailItem label={<FormattedMessage id="approved-at" />} value={data?.approvedAt} />
              <DetailItem label={<FormattedMessage id="note" />} value={data?.note} />
              {data?.rejectedReason && (
                <DetailItem label="Rejected Reason" value={data?.rejectedReason} />
              )}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="h6" fontWeight="bold">
                  Status
                </Typography>
                <Chip color={statusInfo.color} label={statusInfo.label} size="small" variant="light" />
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="product-details" />}>
            <ScrollX>
              <ReactTable
                columns={columnDetails}
                data={(data?.details ?? []).slice((detailsPage - 1) * detailsPageSize, detailsPage * detailsPageSize)}
                totalPagination={Math.ceil((data?.details ?? []).length / detailsPageSize)}
                setPageNumber={detailsPage}
                setPageRow={detailsPageSize}
                colSpanPagination={10}
                onOrder={() => {}}
                onGotoPage={(page) => setDetailsPage(page)}
                onPageSize={(size) => {
                  setDetailsPageSize(size);
                  setDetailsPage(1);
                }}
              />
            </ScrollX>
          </MainCard>
        </Grid>

        {data?.logs?.length > 0 && (
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="log" />}>
              <ScrollX>
                <ReactTable
                  columns={columnLogs}
                  data={(data?.logs ?? []).slice((logsPage - 1) * logsPageSize, logsPage * logsPageSize)}
                  totalPagination={Math.ceil((data?.logs ?? []).length / logsPageSize)}
                  setPageNumber={logsPage}
                  setPageRow={logsPageSize}
                  colSpanPagination={5}
                  onOrder={() => {}}
                  onGotoPage={(page) => setLogsPage(page)}
                  onPageSize={(size) => {
                    setLogsPageSize(size);
                    setLogsPage(1);
                  }}
                />
              </ScrollX>
            </MainCard>
          </Grid>
        )}
      </Grid>

      {confirmSubmit && (
        <ConfirmationC
          open={confirmSubmit}
          title={<FormattedMessage id="submit" />}
          content="Are you sure you want to submit this loan product for approval?"
          onClose={handleSubmit}
          btnTrueText="Yes"
          btnFalseText="Cancel"
        />
      )}

      {confirmDelete && (
        <ConfirmationC
          open={confirmDelete}
          title={<FormattedMessage id="delete" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
          onClose={handleDelete}
          btnTrueText="Yes"
          btnFalseText="Cancel"
        />
      )}

      {confirmApprove && (
        <ConfirmationC
          open={confirmApprove}
          title={<FormattedMessage id="approve" />}
          content="Are you sure you want to approve this loan product?"
          onClose={handleApprove}
          btnTrueText="Yes"
          btnFalseText="Cancel"
        />
      )}

      {openReject && (
        <ModalC
          open={openReject}
          title={<FormattedMessage id="reject" />}
          onOk={handleReject}
          onCancel={() => { setOpenReject(false); setRejectReason(''); }}
          disabledOk={!rejectReason.trim()}
          maxWidth="xs"
          fullWidth
        >
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejected Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </ModalC>
      )}

      {openLoanOut && (
        <ModalC
          open={openLoanOut}
          title="Loan Out"
          onOk={handleLoanOut}
          onCancel={() => setOpenLoanOut(false)}
          maxWidth="xs"
          fullWidth
        >
          <Box sx={{ pt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label={<FormattedMessage id="loan-date" />}
                value={loanDate}
                onChange={(val) => setLoanDate(val)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
        </ModalC>
      )}

      {openReturn && (
        <ModalC
          open={openReturn}
          title={<FormattedMessage id="return" />}
          onOk={handleReturn}
          onCancel={() => {
            setOpenReturn(false);
            setReturnNote('');
            setReturnDate(dayjs());
            if (data?.details) {
              setReturnDetails(
                data.details.map((d) => ({
                  id: d.id,
                  productName: d.productName,
                  loanedQty: d.loanedQty,
                  soldQty: 0,
                  actualSellingPrice: d.suggestedPrice ?? 0,
                  itemNote: ''
                }))
              );
            }
          }}
          maxWidth="md"
          fullWidth
        >
          <Stack spacing={3} sx={{ pt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label={<FormattedMessage id="return-date" />}
                value={returnDate}
                onChange={(val) => setReturnDate(val)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Return Note"
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
            />

            {returnDetails.map((det, idx) => (
              <MainCard key={det.id} title={det.productName} sx={{ bgcolor: 'background.default' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Loaned Qty: <strong>{det.loanedQty}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label={<FormattedMessage id="sold-qty" />}
                      value={det.soldQty}
                      inputProps={{ min: 0, max: det.loanedQty }}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        setReturnDetails((prev) =>
                          prev.map((d, i) => (i === idx ? { ...d, soldQty: Number(e.target.value) } : d))
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Actual Selling Price"
                      value={det.actualSellingPrice}
                      inputProps={{ min: 0 }}
                      onChange={(e) =>
                        setReturnDetails((prev) =>
                          prev.map((d, i) => (i === idx ? { ...d, actualSellingPrice: Number(e.target.value) } : d))
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Item Note"
                      value={det.itemNote}
                      onChange={(e) =>
                        setReturnDetails((prev) =>
                          prev.map((d, i) => (i === idx ? { ...d, itemNote: e.target.value } : d))
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </MainCard>
            ))}
          </Stack>
        </ModalC>
      )}
    </>
  );
};

export default ProductLoanDetail;
