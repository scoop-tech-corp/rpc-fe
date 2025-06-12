import { Box, Button, Grid, InputLabel, Stack, Tab, Tabs } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend, processDownloadPDF } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import ConfirmationC from 'components/ConfirmationC';
import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import { ReactTable } from 'components/third-party/ReactTable';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';
import LogActivityDetailTransaction from 'pages/transaction/detail/log-activity';
import {
  confirmPaymentPetShopTransaction,
  deletePetShopTransaction,
  generateInvoicePetShopTransaction,
  getTransactionPetShopDetail
} from 'pages/transaction/service';
import PropTypes from 'prop-types';
import { formatThousandSeparator } from 'utils/func';
import configGlobal from '../../../../../config';
import { useNavigate } from 'react-router';
import useAuth from 'hooks/useAuth';

const TransactionDetailPetShop = (props) => {
  const { id } = props.data;
  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [data, setData] = useState({ detail: {}, log: [] });
  const summaryProducts = useMemo(() => data.detail?.products || [], [data]);
  const [filterLog, setFilterLog] = useState({}); // { dateRange: null }
  const [confirmPaymentDialog, setConfirmPaymentDialog] = useState({ open: false });
  const [file, setFile] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onChangeTab = (value) => setTabSelected(value);
  const dispatch = useDispatch();

  const onCancel = () => props.onClose(false);

  const onExport = async () => {
    try {
      const resp = await generateInvoicePetShopTransaction(id);
      processDownloadPDF(resp, 'nota_petshop');
      dispatch(snackbarSuccess(`Success export pet shop transaction`));
    } catch (err) {
      if (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    }
  };

  const onConfirmPayment = async () => {
    try {
      await confirmPaymentPetShopTransaction({
        transactionId: id,
        proof: file[0]
      });

      dispatch(snackbarSuccess('Success confirm payment pet shop transaction'));
      setConfirmPaymentDialog({ open: false });
    } catch (err) {
      if (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    }
  };

  const onDelete = async (response) => {
    if (response) {
      try {
        await deletePetShopTransaction([id]);
        dispatch(snackbarSuccess('Success delete pet shop transaction'));
        setDialog(false);
        props.onClose();
      } catch (err) {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      }
    } else {
      setDialog(false);
    }
  };

  const fetchData = async () => {
    const resp = await getTransactionPetShopDetail({
      id,
      ...filterLog
    });
    const getData = resp.data;
    setData({ detail: getData.detail, log: getData?.transactionLogs || [] });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLog]);

  const summaryColumns = useMemo(
    () => [
      {
        Header: 'No.',
        accessor: (_, index) => index + 1, // nomor urut dimulai dari 1
        id: 'rowNumber',
        isNotSorting: true,
        Cell: ({ row }) => row.index + 1
      },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'item_name',
        Cell: (data) => {
          const bundleIncludedItems = data.row.original?.included_items || [];

          return (
            <div>
              <p>{data.value}</p>
              {bundleIncludedItems.length > 0 && (
                <>
                  {bundleIncludedItems.map((item, index) => (
                    <p key={item.name + index}>
                      {item.name} (harga normal Rp {formatThousandSeparator(item.normal_price)})
                    </p>
                  ))}
                </>
              )}
            </div>
          );
        },
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        isNotSorting: true,
        Cell: (data) => (data.value === 'productSell' ? 'Product Sell' : 'Product Clinic')
      },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="bonus" />, accessor: 'bonus', isNotSorting: true },
      { Header: <FormattedMessage id="discount" />, accessor: 'discount', Cell: (data) => `${data.value}%`, isNotSorting: true },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unit_price',
        Cell: (data) => {
          const unitPrice = data?.value || data.row.original.total;

          return 'Rp ' + formatThousandSeparator(unitPrice || 0);
        },
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'total',
        Cell: (data) => 'Rp ' + formatThousandSeparator(data.value),
        isNotSorting: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-transaction" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="md"
        action={{
          element: (
            <Stack direction="row" gap={1} marginLeft="auto">
              {['administrator', 'office'].includes(user?.role) && (
                <Button
                  variant="contained"
                  aria-controls={props.open ? 'quick-access' : undefined}
                  aria-haspopup="true"
                  onClick={() => {
                    navigate(`/transaction/pet-shop/edit/${id}`);
                  }}
                >
                  <FormattedMessage id="edit" />
                </Button>
              )}
              <Button variant="contained" aria-controls={props.open ? 'quick-access' : undefined} aria-haspopup="true" onClick={onExport}>
                <FormattedMessage id="print-invoice" />
              </Button>
              <Button
                variant="contained"
                aria-controls={props.open ? 'quick-access' : undefined}
                aria-haspopup="true"
                onClick={() => {
                  setConfirmPaymentDialog({ open: true });
                }}
              >
                <FormattedMessage id="confirm-payment" />
              </Button>
              <Button
                variant="contained"
                color="error"
                aria-controls={props.open ? 'quick-access' : undefined}
                aria-haspopup="true"
                onClick={() => setDialog(true)}
              >
                <FormattedMessage id="delete" />
              </Button>
            </Stack>
          ),
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="detail transaction tab"
          >
            <Tab label={<FormattedMessage id="details" />} id="detail-transaction-tab-0" aria-controls="detail-transaction-tabpanel-0" />
            <Tab
              label={<FormattedMessage id="log-activity" />}
              id="detail-transaction-tab-1"
              aria-controls="detail-transaction-tabpanel-1"
            />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="detail-transaction">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="created-by" />
                  </InputLabel>
                  {data.detail.createdBy || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="location" />
                  </InputLabel>
                  {data.detail.locationName || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="created-at" />
                  </InputLabel>
                  {data.detail.createdAt || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="customer-name" />
                  </InputLabel>
                  {data.detail.customerName || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="notes" />
                  </InputLabel>
                  {data.detail.notes || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="payment-method" />
                  </InputLabel>
                  {data.detail.paymentMethod || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="proof-of-payment" />
                  </InputLabel>
                  <div>
                    {data.detail?.proofOfPayment ? (
                      <img
                        width={100}
                        height={150}
                        src={`${configGlobal.apiUrl}/storage/${data.detail.proofOfPayment}`}
                        alt="proof-of-payment"
                      />
                    ) : (
                      <FormattedMessage id="no-proof-of-payment-yet" />
                    )}
                  </div>
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={2} marginTop={4}>
              <h3>
                <FormattedMessage id="products" />{' '}
              </h3>
              <ReactTable columns={summaryColumns} data={summaryProducts} />
            </Stack>
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="detail-transaction">
            <LogActivityDetailTransaction
              data={data.log}
              onFetchData={(e) => {
                if (e) setFilterLog(e);
              }}
            />
          </TabPanel>
        </Box>
      </ModalC>

      <ModalC
        title={<FormattedMessage id="confirm-payment" />}
        open={confirmPaymentDialog.open}
        onOk={onConfirmPayment}
        onCancel={() => setConfirmPaymentDialog({ open: false })}
        fullWidth
        maxWidth="sm"
      >
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="upload-image" />
          </InputLabel>
          <SingleFileUpload
            file={file}
            setFieldValue={(name, value) => {
              setFile(value);
            }}
          />
        </Stack>
      </ModalC>

      {/* <ConfirmationC
        open={dialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-this-patient" />}
        onClose={(response) => onConfirm(response, 'accept')}
        btnTrueText="Ok"
      /> */}

      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onDelete(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

TransactionDetailPetShop.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TransactionDetailPetShop;
