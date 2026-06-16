import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadPDF, processDownloadExcel } from 'service/service-global';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';

import {
  getQuotationList,
  getQuotationDetail,
  updateQuotationStatus,
  duplicateQuotation,
  convertQuotationToTransaction,
  printQuotation,
  deleteQuotation,
  exportQuotationExcel,
  STATUS_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  STATUS_COLOR
} from './service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';

import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PrintIcon from '@mui/icons-material/Print';
import SendIcon from '@mui/icons-material/Send';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import FormQuotation from './components/form-quotation';

let paramList = {};

// ── Status label map ───────────────────────────────────────────────────────────
const STATUS_LABEL = {
  draft:     'Draft',
  sent:      'Sent',
  accepted:  'Accepted',
  rejected:  'Rejected',
  expired:   'Expired',
  converted: 'Converted',
};

const QuotationPage = () => {
  const theme       = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl        = useIntl();
  const dispatch    = useDispatch();

  const [listData, setListData]   = useState({ data: [], totalPagination: 0 });
  const [locationList, setLocationList] = useState([]);

  // Filters
  const [filterLocation, setFilterLocation]   = useState(null);
  const [filterStatus, setFilterStatus]       = useState(null);
  const [filterService, setFilterService]     = useState(null);
  const [filterDateFrom, setFilterDateFrom]   = useState(null);
  const [filterDateTo, setFilterDateTo]       = useState(null);
  const [keywordSearch, setKeywordSearch]     = useState('');

  // Dialogs
  const [formDialog, setFormDialog]           = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog]     = useState({ open: false, type: '', row: null });
  const [statusDialog, setStatusDialog]       = useState({ open: false, status: '', row: null });
  const [convertDialog, setConvertDialog]     = useState({ open: false, row: null });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = () => {
    getQuotationList(paramList)
      .then((resp) => setListData({ data: resp.data?.data || [], totalPagination: resp.data?.totalPagination || 0 }))
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => {
    paramList = { goToPage: 1, rowPerPage: 10, orderValue: 'desc', orderColumn: 'created_at' };
    getLocationList().then((resp) => setLocationList(resp || []));
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterApply = () => {
    paramList = {
      ...paramList,
      locationId:    filterLocation?.id || filterLocation?.value || '',
      status:        filterStatus?.value || '',
      typeOfService: filterService?.value || '',
      dateFrom:      filterDateFrom ? filterDateFrom.format('YYYY-MM-DD') : '',
      dateTo:        filterDateTo   ? filterDateTo.format('YYYY-MM-DD')   : '',
      search:        keywordSearch,
      goToPage:      1,
    };
    fetchData();
  };

  const onResetFilter = () => {
    setFilterLocation(null);
    setFilterStatus(null);
    setFilterService(null);
    setFilterDateFrom(null);
    setFilterDateTo(null);
    setKeywordSearch('');
    paramList = { goToPage: 1, rowPerPage: 10, orderValue: 'desc', orderColumn: 'created_at' };
    fetchData();
  };

  const onOrderingChange = (event) => {
    paramList.orderValue  = event.order;
    paramList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramList.rowPerPage = event;
    fetchData();
  };

  // ── Open form (create / edit) ─────────────────────────────────────────────
  const onOpenCreate = () => setFormDialog({ open: true, data: null });

  const onOpenEdit = async (row) => {
    try {
      const resp = await getQuotationDetail(row.id);
      setFormDialog({ open: true, data: resp.data });
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const onPrint = async (row) => {
    try {
      const resp = await printQuotation(row.id);
      processDownloadPDF(resp, `quotation-${row.quotationNo}`);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Export Excel ──────────────────────────────────────────────────────────
  const onExportExcel = async () => {
    await exportQuotationExcel(paramList)
      .then(processDownloadExcel)
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  // ── Send — ubah status + otomatis download PDF untuk dibagikan ──────────
  const onSend = (row) => setStatusDialog({ open: true, status: 'sent', row });

  // ── Accept / Reject ───────────────────────────────────────────────────────
  const onAccept = (row) => setStatusDialog({ open: true, status: 'accepted', row });
  const onReject = (row) => setStatusDialog({ open: true, status: 'rejected', row });

  const onConfirmStatusChange = async () => {
    const { row, status } = statusDialog;
    try {
      const resp = await updateQuotationStatus(row.id, status);
      const msg = resp?.data?.message || `${intl.formatMessage({ id: 'status' })}: ${STATUS_LABEL[status]}`;
      dispatch(snackbarSuccess(msg));
      setStatusDialog({ open: false, status: '', row: null });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Duplicate ─────────────────────────────────────────────────────────────
  const onDuplicate = (row) => setConfirmDialog({ open: true, type: 'duplicate', row });

  // ── Convert ───────────────────────────────────────────────────────────────
  const onConvert = (row) => setConvertDialog({ open: true, row });

  const onConfirmConvert = async () => {
    try {
      const resp = await convertQuotationToTransaction(convertDialog.row.id);
      const msg  = resp.data?.message || intl.formatMessage({ id: 'convert-to-transaction' });
      dispatch(snackbarSuccess(msg));
      setConvertDialog({ open: false, row: null });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const onDelete = (row) => setConfirmDialog({ open: true, type: 'delete', row });

  const onConfirmAction = async () => {
    const { type, row } = confirmDialog;
    try {
      if (type === 'delete') {
        await deleteQuotation(row.id);
        dispatch(snackbarSuccess(intl.formatMessage({ id: 'quotation-delete-success' })));
      } else if (type === 'duplicate') {
        await duplicateQuotation(row.id);
        dispatch(snackbarSuccess(intl.formatMessage({ id: 'quotation-duplicate-success' })));
      }
      setConfirmDialog({ open: false, type: '', row: null });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    { Header: <FormattedMessage id="quotation-no" />, accessor: 'quotationNo', isNotSorting: false },
    { Header: <FormattedMessage id="customer" />, accessor: 'customerName', isNotSorting: false },
    { Header: <FormattedMessage id="pet" />, accessor: 'petName', isNotSorting: true, Cell: ({ value }) => value || '-' },
    { Header: <FormattedMessage id="location" />, accessor: 'locationName', isNotSorting: false },
    {
      Header: <FormattedMessage id="service-type" />,
      accessor: 'typeOfService',
      isNotSorting: true,
      Cell: ({ value }) => {
        const opt = SERVICE_TYPE_OPTIONS.find((o) => o.value === value);
        return <Chip label={opt?.label || value} size="small" variant="outlined" />;
      }
    },
    {
      Header: <FormattedMessage id="total" />,
      accessor: 'finalAmount',
      isNotSorting: false,
      Cell: ({ value }) => `Rp ${Number(value).toLocaleString('id-ID')}`
    },
    {
      Header: <FormattedMessage id="status" />,
      accessor: 'status',
      isNotSorting: true,
      Cell: ({ value }) => (
        <Chip
          label={STATUS_LABEL[value] || value}
          size="small"
          color={STATUS_COLOR[value] || 'default'}
          variant="light"
        />
      )
    },
    {
      Header: <FormattedMessage id="valid-until-date" />,
      accessor: 'validUntil',
      isNotSorting: false,
      Cell: ({ value }) => {
        const isExpired = new Date(value) < new Date();
        return (
          <Typography variant="caption" color={isExpired ? 'error.main' : 'text.primary'}>
            {value}
          </Typography>
        );
      }
    },
    { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy', isNotSorting: true },
    { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt', isNotSorting: true },
    {
      Header: <FormattedMessage id="action" />,
      accessor: 'action',
      isNotSorting: true,
      Cell: ({ row }) => {
        const { status } = row.original;
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {/* Print — semua status */}
            <Tooltip title="Print PDF">
              <IconButton size="small" color="primary" onClick={() => onPrint(row.original)}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Edit — hanya draft */}
            {status === 'draft' && (
              <Tooltip title="Edit">
                <IconButton size="small" color="warning" onClick={() => onOpenEdit(row.original)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Send — hanya draft */}
            {status === 'draft' && (
              <Tooltip title={intl.formatMessage({ id: 'send-to-customer' })}>
                <IconButton size="small" color="info" onClick={() => onSend(row.original)}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Accept / Reject — hanya sent */}
            {status === 'sent' && (
              <>
                <Tooltip title={intl.formatMessage({ id: 'mark-accepted' })}>
                  <IconButton size="small" color="success" onClick={() => onAccept(row.original)}>
                    <CheckCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={intl.formatMessage({ id: 'mark-rejected' })}>
                  <IconButton size="small" color="error" onClick={() => onReject(row.original)}>
                    <CancelOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* Convert — hanya accepted */}
            {status === 'accepted' && (
              <Tooltip title={intl.formatMessage({ id: 'convert-to-transaction' })}>
                <IconButton size="small" color="secondary" onClick={() => onConvert(row.original)}>
                  <SwapHorizIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Duplicate — semua */}
            <Tooltip title={intl.formatMessage({ id: 'duplicate' })}>
              <IconButton size="small" onClick={() => onDuplicate(row.original)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Delete — hanya draft */}
            {status === 'draft' && (
              <Tooltip title={intl.formatMessage({ id: 'delete' })}>
                <IconButton size="small" color="error" onClick={() => onDelete(row.original)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <HeaderPageCustom
        title={<FormattedMessage id="quotation" />}
        isBreadcrumb
      />

      <MainCard content={false}>
        {/* ── Filter Bar ── */}
        <Box sx={{ p: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1.5} flexWrap="wrap" alignItems="flex-end">

              <Stack spacing={0.4}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="location" /></Typography>
                <Autocomplete
                  size="small" sx={{ minWidth: 160 }}
                  options={locationList}
                  value={filterLocation}
                  getOptionLabel={(o) => o?.locationName || o?.label || ''}
                  isOptionEqualToValue={(o, v) => (o?.id || o?.value) === (v?.id || v?.value)}
                  onChange={(_, v) => setFilterLocation(v)}
                  renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'all-location' })} />}
                />
              </Stack>

              <Stack spacing={0.4}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="status" /></Typography>
                <Select
                  size="small" sx={{ minWidth: 130 }}
                  value={filterStatus?.value || ''}
                  onChange={(e) => setFilterStatus(STATUS_OPTIONS.find((o) => o.value === e.target.value) || null)}
                  displayEmpty
                >
                  <MenuItem value=""><em><FormattedMessage id="all-status" /></em></MenuItem>
                  {STATUS_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </Stack>

              <Stack spacing={0.4}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="service-type" /></Typography>
                <Select
                  size="small" sx={{ minWidth: 140 }}
                  value={filterService?.value || ''}
                  onChange={(e) => setFilterService(SERVICE_TYPE_OPTIONS.find((o) => o.value === e.target.value) || null)}
                  displayEmpty
                >
                  <MenuItem value=""><em><FormattedMessage id="all-service-type" /></em></MenuItem>
                  {SERVICE_TYPE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </Stack>

              <Stack spacing={0.4}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="from-date" /></Typography>
                <DesktopDatePicker
                  inputFormat="DD/MM/YYYY" value={filterDateFrom}
                  onChange={setFilterDateFrom}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 140 }} />}
                />
              </Stack>

              <Stack spacing={0.4}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="to-date" /></Typography>
                <DesktopDatePicker
                  inputFormat="DD/MM/YYYY" value={filterDateTo}
                  onChange={setFilterDateTo}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 140 }} />}
                />
              </Stack>

              <Box flex={1} />
              <GlobalFilter filter={keywordSearch} setFilter={setKeywordSearch} size="small" />

              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={onResetFilter}><FormattedMessage id="reset" /></Button>
                <Button size="small" variant="contained" onClick={onFilterApply}>
                  <FormattedMessage id="search" />
                </Button>
              </Stack>
            </Stack>
          </LocalizationProvider>
        </Box>

        <Divider />

        {/* ── Action Bar ── */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={onExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onOpenCreate}
          >
            <FormattedMessage id="create-quotation" />
          </Button>
        </Box>

        <Divider />

        {/* ── Table ── */}
        <ScrollX>
          <ReactTable
            columns={columns}
            data={listData.data}
            totalPagination={listData.totalPagination}
            setPageNumber={paramList.goToPage}
            setPageRow={paramList.rowPerPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
            colSpanPagination={11}
          />
        </ScrollX>
      </MainCard>

      {/* ══ Form Create / Edit ══ */}
      {formDialog.open && (
        <FormQuotation
          open={formDialog.open}
          data={formDialog.data}
          onClose={(refresh) => {
            setFormDialog({ open: false, data: null });
            if (refresh) fetchData();
          }}
        />
      )}

      {/* ══ Confirm Status Dialog ══ */}
      <Dialog open={statusDialog.open} maxWidth="xs" fullWidth>
        <DialogTitle>
          {statusDialog.status === 'sent'     && <FormattedMessage id="send-quotation" />}
          {statusDialog.status === 'accepted' && <FormattedMessage id="mark-accepted" />}
          {statusDialog.status === 'rejected' && <FormattedMessage id="mark-rejected" />}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            {statusDialog.status === 'sent' && (
              <>
                Kirim quotation <strong>{statusDialog.row?.quotationNo}</strong> ke customer?
                <Alert severity="info" sx={{ mt: 1.5, borderRadius: 1 }}>
                  PDF quotation akan dikirim otomatis ke <strong>email customer</strong> yang terdaftar.
                  Status quotation akan berubah menjadi <strong>Sent</strong>.
                </Alert>
              </>
            )}
            {statusDialog.status === 'accepted' && (
              <>{intl.formatMessage({ id: 'mark-accepted' })} — {statusDialog.row?.quotationNo}?</>
            )}
            {statusDialog.status === 'rejected' && (
              <>{intl.formatMessage({ id: 'mark-rejected' })} — {statusDialog.row?.quotationNo}?</>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, status: '', row: null })}><FormattedMessage id="cancel" /></Button>
          <Button variant="contained" onClick={onConfirmStatusChange} autoFocus><FormattedMessage id="confirm" /></Button>
        </DialogActions>
      </Dialog>

      {/* ══ Confirm Convert Dialog ══ */}
      <Dialog open={convertDialog.open} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapHorizIcon color="secondary" />
          <FormattedMessage id="convert-to-transaction" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {intl.formatMessage({ id: 'quotation-no' })} <strong>{convertDialog.row?.quotationNo}</strong>{' '}
            → <strong>
              {convertDialog.row?.typeOfService === 'clinic' && 'Pet Clinic'}
              {convertDialog.row?.typeOfService === 'hotel'  && 'Pet Hotel'}
              {!['clinic','hotel'].includes(convertDialog.row?.typeOfService) && convertDialog.row?.typeOfService}
            </strong>
          </DialogContentText>
          {convertDialog.row?.typeOfService === 'clinic' && (
            <Alert severity="info" sx={{ mt: 1.5, borderRadius: 1 }}>
              <FormattedMessage id="transaction-pet-clinic" /> — Queue
            </Alert>
          )}
          {convertDialog.row?.typeOfService === 'hotel' && (
            <Alert severity="info" sx={{ mt: 1.5, borderRadius: 1 }}>
              <FormattedMessage id="transaction-pet-hotel" />
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialog({ open: false, row: null })}><FormattedMessage id="cancel" /></Button>
          <Button variant="contained" color="secondary" onClick={onConfirmConvert} autoFocus>
            <FormattedMessage id="convert-now" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Confirm Duplicate / Delete Dialog ══ */}
      <Dialog open={confirmDialog.open} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmDialog.type === 'duplicate' && <FormattedMessage id="duplicate-quotation" />}
          {confirmDialog.type === 'delete'    && <FormattedMessage id="delete-quotation" />}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'duplicate' && (
              <>{intl.formatMessage({ id: 'duplicate' })} — {confirmDialog.row?.quotationNo}?</>
            )}
            {confirmDialog.type === 'delete' && (
              <>{intl.formatMessage({ id: 'delete' })} — {confirmDialog.row?.quotationNo}?</>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', row: null })}><FormattedMessage id="cancel" /></Button>
          <Button
            variant="contained"
            color={confirmDialog.type === 'delete' ? 'error' : 'primary'}
            onClick={onConfirmAction}
            autoFocus
          >
            {confirmDialog.type === 'delete' ? <FormattedMessage id="delete" /> : <FormattedMessage id="duplicate" />}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuotationPage;
