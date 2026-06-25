import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { DollarOutlined, EyeOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import {
  getInstallmentList,
  getInstallmentDetail,
  getInstallmentSummary,
  createInstallmentPlan,
  recordInstallmentPayment,
  previewLateFee,
  cancelInstallmentPlan
} from './service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';

// ── Constants ─────────────────────────────────────────────────────────────────

const TRANSACTION_TYPES = ['Pet Clinic', 'Pet Hotel', 'Pet Salon', 'Breeding', 'Pet Shop'];

const STATUS_COLOR = {
  active: 'info',
  completed: 'success',
  cancelled: 'default'
};

const SCHEDULE_STATUS_COLOR = {
  unpaid: 'warning',
  partial: 'info',
  paid: 'success',
  overdue: 'error'
};

const fmtRp = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID') : '-');

const defaultPlan = {
  transactionType: '',
  transactionId: '',
  totalAmount: '',
  downPayment: '',
  tenor: '',
  intervalType: 'monthly',
  intervalValue: 1,
  startDate: '',
  lateFeeType: '',
  lateFeeValue: '',
  lateFeeGracePeriod: 0,
  notes: ''
};

const defaultPayment = {
  scheduleId: null,
  paymentDate: new Date().toISOString().slice(0, 10),
  amount: '',
  lateFee: 0,
  paymentMethodId: '',
  notes: ''
};

let paramList = {};

// ── Component ─────────────────────────────────────────────────────────────────

const InstallmentPage = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const intl = useIntl();

  const scheduleStatusLabel = {
    unpaid: intl.formatMessage({ id: 'schedule-status-unpaid' }),
    partial: intl.formatMessage({ id: 'schedule-status-partial' }),
    paid: intl.formatMessage({ id: 'schedule-status-paid' }),
    overdue: intl.formatMessage({ id: 'schedule-status-overdue' })
  };

  const intervalLabel = {
    daily: intl.formatMessage({ id: 'installment-interval-daily' }),
    weekly: intl.formatMessage({ id: 'installment-interval-weekly' }),
    monthly: intl.formatMessage({ id: 'installment-interval-monthly' })
  };

  const statusLabel = {
    active: intl.formatMessage({ id: 'installment-active' }),
    completed: intl.formatMessage({ id: 'installment-completed' }),
    cancelled: intl.formatMessage({ id: 'installment-cancelled' })
  };

  const [listData, setListData] = useState({ data: [], totalPagination: 0 });
  const [summary, setSummary] = useState(null);
  const [locationList, setLocationList] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filterLoc, setFilterLoc] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // dialogs
  const [addDialog, setAddDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [payDialog, setPayDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  const [planForm, setPlanForm] = useState(defaultPlan);
  const [planLoading, setPlanLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [payForm, setPayForm] = useState(defaultPayment);
  const [payLoading, setPayLoading] = useState(false);
  const [lateFeePreview, setLateFeePreview] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchList = async () => {
    try {
      const r = await getInstallmentList(paramList);
      setListData({ data: r.data.data, totalPagination: r.data.totalPagination });
    } catch (e) {
      dispatch(snackbarError(createMessageBackend(e)));
    }
  };

  const fetchSummary = async () => {
    try {
      const r = await getInstallmentSummary(filterLoc ? { locationId: filterLoc } : {});
      setSummary(r.data);
    } catch {
      /* silent */
    }
  };

  const clearParam = () => {
    paramList = {
      rowPerPage: 10,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: '',
      status: '',
      transactionType: ''
    };
    setKeyword('');
    setFilterLoc('');
    setFilterStatus('');
    setFilterType('');
  };

  const initList = () => {
    clearParam();
    fetchList();
    fetchSummary();
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    import('utils/axios').then(({ default: axios }) => {
      axios
        .get('paymentmethod')
        .then((r) => setPaymentMethods(r.data?.data || []))
        .catch(() => {});
    });
    initList();
  }, []); // eslint-disable-line

  // ── Table handlers ─────────────────────────────────────────────────────────
  const onSearch = (v) => {
    paramList.keyword = v;
    setKeyword(v);
    fetchList();
  };
  const onFilterLoc = (v) => {
    paramList.locationId = v;
    setFilterLoc(v);
    fetchList();
  };
  const onFilterStatus = (v) => {
    paramList.status = v;
    setFilterStatus(v);
    fetchList();
  };
  const onFilterType = (v) => {
    paramList.transactionType = v;
    setFilterType(v);
    fetchList();
  };
  const onOrder = (e) => {
    paramList.orderValue = e.order;
    paramList.orderColumn = e.column;
    fetchList();
  };
  const onPage = (v) => {
    paramList.goToPage = v;
    fetchList();
  };
  const onSize = (v) => {
    paramList.rowPerPage = v;
    fetchList();
  };

  // ── Detail ─────────────────────────────────────────────────────────────────
  const onOpenDetail = useCallback(
    async (row) => {
      setDetailDialog(true);
      setDetailLoading(true);
      setDetailData(null);
      try {
        const r = await getInstallmentDetail(row.id);
        setDetailData(r.data);
      } catch (e) {
        dispatch(snackbarError(createMessageBackend(e)));
      } finally {
        setDetailLoading(false);
      }
    },
    [dispatch]
  );

  // ── Record Payment ─────────────────────────────────────────────────────────
  const onOpenPay = (schedule) => {
    setPayForm({ ...defaultPayment, scheduleId: schedule.id });
    setLateFeePreview(null);
    setPayDialog(true);
  };

  const onPayDateChange = async (date, scheduleId) => {
    setPayForm((p) => ({ ...p, paymentDate: date }));
    if (!date || !scheduleId) return;
    try {
      const r = await previewLateFee({ scheduleId, paymentDate: date });
      setLateFeePreview(r.data);
      if (r.data.lateFee > 0) setPayForm((p) => ({ ...p, lateFee: r.data.lateFee }));
    } catch {
      /* silent */
    }
  };

  const onSubmitPayment = async () => {
    if (!payForm.amount || !payForm.paymentDate) return;
    setPayLoading(true);
    try {
      await recordInstallmentPayment(payForm);
      dispatch(snackbarSuccess(intl.formatMessage({ id: 'installment-payment-success' })));
      setPayDialog(false);
      if (detailData?.data?.id) onOpenDetail({ id: detailData.data.id });
      fetchList();
      fetchSummary();
    } catch (e) {
      dispatch(snackbarError(createMessageBackend(e)));
    } finally {
      setPayLoading(false);
    }
  };

  // ── Create Plan ────────────────────────────────────────────────────────────
  const onSubmitPlan = async () => {
    if (!planForm.transactionType || !planForm.transactionId || !planForm.totalAmount || !planForm.tenor || !planForm.startDate) return;
    setPlanLoading(true);
    try {
      await createInstallmentPlan(planForm);
      dispatch(snackbarSuccess(intl.formatMessage({ id: 'installment-plan-created-msg' })));
      setAddDialog(false);
      setPlanForm(defaultPlan);
      initList();
    } catch (e) {
      dispatch(snackbarError(createMessageBackend(e)));
    } finally {
      setPlanLoading(false);
    }
  };

  // ── Cancel Plan ────────────────────────────────────────────────────────────
  const onConfirmCancel = async (ok) => {
    if (!ok) {
      setCancelDialog(false);
      return;
    }
    try {
      await cancelInstallmentPlan(cancelTarget);
      dispatch(snackbarSuccess(intl.formatMessage({ id: 'installment-plan-cancelled-msg' })));
      setCancelDialog(false);
      initList();
    } catch (e) {
      dispatch(snackbarError(createMessageBackend(e)));
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      { Header: 'Customer', accessor: 'customerName' },
      { Header: intl.formatMessage({ id: 'installment-type' }), accessor: 'transactionType' },
      { Header: intl.formatMessage({ id: 'installment-total-bill-col' }), accessor: 'totalAmount', Cell: ({ value }) => fmtRp(value) },
      { Header: intl.formatMessage({ id: 'installment-outstanding-amount' }), accessor: 'outstandingAmount', Cell: ({ value }) => fmtRp(value) },
      {
        Header: intl.formatMessage({ id: 'installment-tenor-col' }),
        accessor: 'tenor',
        Cell: ({ row }) => `${row.original.tenor}x ${intervalLabel[row.original.intervalType]}`
      },
      { Header: intl.formatMessage({ id: 'installment-start' }), accessor: 'startDate', Cell: ({ value }) => fmtDate(value) },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <Chip label={statusLabel[value] || value} color={STATUS_COLOR[value] || 'default'} size="small" />
        )
      },
      {
        Header: intl.formatMessage({ id: 'action' }),
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={intl.formatMessage({ id: 'installment-detail' })}>
              <IconButton size="small" color="info" onClick={() => onOpenDetail(row.original)}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            {row.original.status === 'active' && (
              <Tooltip title={intl.formatMessage({ id: 'installment-cancel' })}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setCancelTarget(row.original.id);
                    setCancelDialog(true);
                  }}
                >
                  <StopOutlined />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )
      }
    ],
    [onOpenDetail, intl] // eslint-disable-line
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="installment" />} />

      {/* Summary cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            {
              label: intl.formatMessage({ id: 'installment-total-outstanding' }),
              value: `Rp ${summary.totalOutstanding}`,
              color: 'info.main'
            },
            {
              label: intl.formatMessage({ id: 'installment-overdue-receivables' }),
              value: `Rp ${summary.totalOverdue}`,
              color: 'error.main'
            },
            {
              label: intl.formatMessage({ id: 'installment-active-plans' }),
              value: summary.countActive,
              color: 'primary.main'
            },
            {
              label: intl.formatMessage({ id: 'installment-completed-plans' }),
              value: summary.countCompleted,
              color: 'success.main'
            }
          ].map((s) => (
            <Grid item xs={6} sm={3} key={s.label}>
              <MainCard sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={s.color}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      )}

      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={2} sx={{ p: 2 }}>
            {/* Filter bar */}
            <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <GlobalFilter globalFilter={keyword} setGlobalFilter={onSearch} size="small" />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>
                    <FormattedMessage id="location" />
                  </InputLabel>
                  <Select value={filterLoc} label={intl.formatMessage({ id: 'location' })} onChange={(e) => onFilterLoc(e.target.value)}>
                    <MenuItem value="">
                      <FormattedMessage id="all" />
                    </MenuItem>
                    {locationList.map((l) => (
                      <MenuItem key={l.value} value={l.value}>
                        {l.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>
                    <FormattedMessage id="installment-type" />
                  </InputLabel>
                  <Select
                    value={filterType}
                    label={intl.formatMessage({ id: 'installment-type' })}
                    onChange={(e) => onFilterType(e.target.value)}
                  >
                    <MenuItem value="">
                      <FormattedMessage id="all" />
                    </MenuItem>
                    {TRANSACTION_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={filterStatus} label="Status" onChange={(e) => onFilterStatus(e.target.value)}>
                    <MenuItem value="">
                      <FormattedMessage id="all" />
                    </MenuItem>
                    <MenuItem value="active">
                      <FormattedMessage id="installment-active" />
                    </MenuItem>
                    <MenuItem value="completed">
                      <FormattedMessage id="installment-completed" />
                    </MenuItem>
                    <MenuItem value="cancelled">
                      <FormattedMessage id="installment-cancelled" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setAddDialog(true)} size="small">
                <FormattedMessage id="installment-create-plan" />
              </Button>
            </Stack>

            <ReactTable
              columns={columns}
              data={listData.data}
              totalPagination={listData.totalPagination}
              setPageNumber={paramList.goToPage}
              setPageRow={paramList.rowPerPage}
              onGotoPage={onPage}
              onPageSize={onSize}
              onOrder={onOrder}
            />
          </Stack>
        </ScrollX>
      </MainCard>

      {/* ── Cancel Confirmation ──────────────────────────────────────────────── */}
      <ConfirmationC
        open={cancelDialog}
        title={intl.formatMessage({ id: 'installment-cancel' })}
        content={intl.formatMessage({ id: 'installment-cancel-confirm' })}
        onClose={onConfirmCancel}
        btnTrueText={intl.formatMessage({ id: 'yes' })}
        btnFalseText={intl.formatMessage({ id: 'no' })}
      />

      {/* ── Add Plan Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <FormattedMessage id="installment-create-plan" />
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>
                <FormattedMessage id="installment-type" />
              </InputLabel>
              <Select
                value={planForm.transactionType}
                label={intl.formatMessage({ id: 'installment-type' })}
                onChange={(e) => setPlanForm((p) => ({ ...p, transactionType: e.target.value }))}
              >
                {TRANSACTION_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={intl.formatMessage({ id: 'installment-transaction-id' })}
              value={planForm.transactionId}
              size="small"
              required
              onChange={(e) => setPlanForm((p) => ({ ...p, transactionId: e.target.value }))}
              helperText={intl.formatMessage({ id: 'installment-transaction-id-helper' })}
            />

            <Stack direction="row" spacing={1}>
              <TextField
                label={intl.formatMessage({ id: 'installment-total-bill' })}
                value={planForm.totalAmount}
                size="small"
                required
                fullWidth
                type="number"
                onChange={(e) => setPlanForm((p) => ({ ...p, totalAmount: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
              />
              <TextField
                label={intl.formatMessage({ id: 'installment-down-payment-rp' })}
                value={planForm.downPayment}
                size="small"
                fullWidth
                type="number"
                onChange={(e) => setPlanForm((p) => ({ ...p, downPayment: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
              />
            </Stack>

            <Divider>
              <Typography variant="caption">
                <FormattedMessage id="installment-plan-schedule" />
              </Typography>
            </Divider>

            <Stack direction="row" spacing={1}>
              <TextField
                label={intl.formatMessage({ id: 'installment-tenor-count' })}
                value={planForm.tenor}
                size="small"
                required
                fullWidth
                type="number"
                onChange={(e) => setPlanForm((p) => ({ ...p, tenor: e.target.value }))}
              />
              <TextField
                label={intl.formatMessage({ id: 'installment-every' })}
                value={planForm.intervalValue}
                size="small"
                fullWidth
                type="number"
                onChange={(e) => setPlanForm((p) => ({ ...p, intervalValue: e.target.value }))}
                inputProps={{ min: 1 }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>
                  <FormattedMessage id="installment-interval" />
                </InputLabel>
                <Select
                  value={planForm.intervalType}
                  label={intl.formatMessage({ id: 'installment-interval' })}
                  onChange={(e) => setPlanForm((p) => ({ ...p, intervalType: e.target.value }))}
                >
                  <MenuItem value="daily">
                    <FormattedMessage id="installment-interval-daily" />
                  </MenuItem>
                  <MenuItem value="weekly">
                    <FormattedMessage id="installment-interval-weekly" />
                  </MenuItem>
                  <MenuItem value="monthly">
                    <FormattedMessage id="installment-interval-monthly" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label={intl.formatMessage({ id: 'installment-first-date' })}
              value={planForm.startDate}
              size="small"
              required
              type="date"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setPlanForm((p) => ({ ...p, startDate: e.target.value }))}
            />

            {/* Preview nominal per cicilan */}
            {planForm.totalAmount && planForm.downPayment !== undefined && planForm.tenor > 0 && (
              <Box sx={{ p: 1.5, bgcolor: 'info.lighter', borderRadius: 1 }}>
                <Typography variant="body2">
                  💰 {intl.formatMessage({ id: 'installment-per-amount' })}:{' '}
                  <strong>
                    {fmtRp(Math.floor(((+planForm.totalAmount - +(planForm.downPayment || 0)) / +planForm.tenor) * 100) / 100)}
                  </strong>{' '}
                  ({intl.formatMessage({ id: 'installment-rounding-note' })})
                </Typography>
              </Box>
            )}

            <Divider>
              <Typography variant="caption">
                <FormattedMessage id="installment-late-fee-policy" />
              </Typography>
            </Divider>

            <Stack direction="row" spacing={1}>
              <FormControl size="small" fullWidth>
                <InputLabel>
                  <FormattedMessage id="installment-late-fee-type" />
                </InputLabel>
                <Select
                  value={planForm.lateFeeType}
                  label={intl.formatMessage({ id: 'installment-late-fee-type' })}
                  onChange={(e) => setPlanForm((p) => ({ ...p, lateFeeType: e.target.value }))}
                >
                  <MenuItem value="">
                    <FormattedMessage id="installment-late-fee-no" />
                  </MenuItem>
                  <MenuItem value="fixed">
                    <FormattedMessage id="installment-late-fee-fixed" />
                  </MenuItem>
                  <MenuItem value="percent">
                    <FormattedMessage id="installment-late-fee-percent" />
                  </MenuItem>
                </Select>
              </FormControl>
              {planForm.lateFeeType && (
                <TextField
                  label={
                    planForm.lateFeeType === 'fixed'
                      ? intl.formatMessage({ id: 'installment-late-fee-rp-day' })
                      : intl.formatMessage({ id: 'installment-late-fee-pct-day' })
                  }
                  value={planForm.lateFeeValue}
                  size="small"
                  fullWidth
                  type="number"
                  onChange={(e) => setPlanForm((p) => ({ ...p, lateFeeValue: e.target.value }))}
                />
              )}
            </Stack>

            {planForm.lateFeeType && (
              <TextField
                label={intl.formatMessage({ id: 'installment-grace-period' })}
                value={planForm.lateFeeGracePeriod}
                size="small"
                type="number"
                fullWidth
                onChange={(e) => setPlanForm((p) => ({ ...p, lateFeeGracePeriod: e.target.value }))}
                helperText={intl.formatMessage({ id: 'installment-grace-period-helper' })}
              />
            )}

            <TextField
              label={intl.formatMessage({ id: 'notes' })}
              value={planForm.notes}
              size="small"
              multiline
              rows={2}
              fullWidth
              onChange={(e) => setPlanForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialog(false)} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            variant="contained"
            onClick={onSubmitPlan}
            disabled={
              planLoading ||
              !planForm.transactionType ||
              !planForm.transactionId ||
              !planForm.totalAmount ||
              !planForm.tenor ||
              !planForm.startDate
            }
          >
            {planLoading ? <CircularProgress size={18} /> : <FormattedMessage id="installment-create-btn" />}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Detail Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <span>
              <FormattedMessage id="installment-detail" />
            </span>
            {detailData?.data?.status && (
              <Chip label={statusLabel[detailData.data.status] || detailData.data.status} color={STATUS_COLOR[detailData.data.status]} size="small" />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            detailData && (
              <Box>
                {/* Plan Info */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {[
                    ['Customer', detailData.data.customerName],
                    [intl.formatMessage({ id: 'installment-type' }), detailData.data.transactionType],
                    [intl.formatMessage({ id: 'installment-total-bill-col' }), fmtRp(detailData.data.totalAmount)],
                    ['Down Payment', fmtRp(detailData.data.downPayment)],
                    [intl.formatMessage({ id: 'installment-outstanding-amount' }), fmtRp(detailData.data.outstandingAmount)],
                    [
                      intl.formatMessage({ id: 'installment-tenor-col' }),
                      `${detailData.data.tenor}x ${intervalLabel[detailData.data.intervalType]}`
                    ],
                    [intl.formatMessage({ id: 'installment-start' }), fmtDate(detailData.data.startDate)],
                    [
                      intl.formatMessage({ id: 'installment-penalty' }),
                      detailData.data.lateFeeType
                        ? `${
                            detailData.data.lateFeeType === 'fixed'
                              ? `Rp ${Number(detailData.data.lateFeeValue).toLocaleString('id-ID')}`
                              : `${detailData.data.lateFeeValue}%`
                          }/hari (grace ${detailData.data.lateFeeGracePeriod} hari)`
                        : intl.formatMessage({ id: 'installment-penalty-none-val' })
                    ]
                  ].map(([label, val]) => (
                    <Grid item xs={6} sm={3} key={label}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {val}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Progress */}
                {detailData.data.totalAmount > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">
                        <FormattedMessage id="installment-payment-progress" />
                      </Typography>
                      <Typography variant="caption">
                        {Math.round(
                          ((+detailData.data.totalAmount - +detailData.data.outstandingAmount) / +detailData.data.totalAmount) * 100
                        )}
                        %
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        100,
                        ((+detailData.data.totalAmount - +detailData.data.outstandingAmount) / +detailData.data.totalAmount) * 100
                      )}
                      color={detailData.data.status === 'completed' ? 'success' : 'primary'}
                    />
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" mb={1}>
                  <FormattedMessage id="installment-schedule" />
                </Typography>

                {/* Schedules */}
                <Stepper orientation="vertical" nonLinear>
                  {(detailData.schedules || []).map((s) => (
                    <Step key={s.id} active completed={s.status === 'paid'}>
                      <StepLabel
                        StepIconProps={{ sx: { color: `${SCHEDULE_STATUS_COLOR[s.status]}.main` } }}
                        optional={
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="caption">
                              {intl.formatMessage({ id: 'installment-due-date' })}: {fmtDate(s.dueDate)}
                            </Typography>
                            <Chip
                              label={scheduleStatusLabel[s.status] || s.status}
                              color={SCHEDULE_STATUS_COLOR[s.status]}
                              size="small"
                            />
                            {detailData.data.status === 'active' && s.status !== 'paid' && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DollarOutlined />}
                                onClick={() => onOpenPay(s)}
                                sx={{ ml: 1 }}
                              >
                                <FormattedMessage id="installment-pay" />
                              </Button>
                            )}
                          </Stack>
                        }
                      >
                        <Stack direction="row" spacing={2} alignItems="baseline">
                          <Typography variant="body2" fontWeight={600}>
                            {intl.formatMessage({ id: 'installment-no' })}
                            {s.installmentNo}
                          </Typography>
                          <Typography variant="caption">
                            {fmtRp(s.paidAmount)} / {fmtRp(s.scheduledAmount)}
                            {s.paidAmount < s.scheduledAmount && (
                              <span style={{ color: '#f44336' }}>
                                {' '}
                                ({intl.formatMessage({ id: 'installment-remaining' })} {fmtRp(s.scheduledAmount - s.paidAmount)})
                              </span>
                            )}
                          </Typography>
                          {s.lateFeeCharged > 0 && (
                            <Typography variant="caption" color="error.main">
                              + {intl.formatMessage({ id: 'installment-late-fee-label' })} {fmtRp(s.lateFeeCharged)}
                            </Typography>
                          )}
                        </Stack>
                      </StepLabel>
                      <StepContent>
                        {(s.payments || []).map((pay) => (
                          <Box key={pay.id} sx={{ pl: 1, mb: 0.5, borderLeft: '2px solid', borderColor: 'success.light' }}>
                            <Typography variant="caption">
                              {fmtDate(pay.paymentDate)} — {fmtRp(pay.amount)}
                              {pay.lateFee > 0 &&
                                ` + ${intl.formatMessage({ id: 'installment-late-fee-label' })} ${fmtRp(pay.lateFee)}`}
                              {pay.paymentMethodName && ` — ${pay.paymentMethodName}`}
                              {pay.confirmedByName?.trim() &&
                                ` (${intl.formatMessage({ id: 'installment-confirmed-by' })}: ${pay.confirmedByName})`}
                              {pay.notes && ` — "${pay.notes}"`}
                            </Typography>
                          </Box>
                        ))}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailDialog(false)} color="inherit">
            <FormattedMessage id="close" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Pay Dialog ───────────────────────────────────────────────────────── */}
      <Dialog open={payDialog} onClose={() => setPayDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>
          <FormattedMessage id="installment-record-payment" />
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={intl.formatMessage({ id: 'installment-payment-date' })}
              type="date"
              value={payForm.paymentDate}
              size="small"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => onPayDateChange(e.target.value, payForm.scheduleId)}
            />

            {lateFeePreview && lateFeePreview.daysLate > 0 && (
              <Box sx={{ p: 1.5, bgcolor: 'error.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="error.dark">
                  {intl.formatMessage(
                    { id: 'installment-late-warning' },
                    { days: lateFeePreview.daysLate, fee: lateFeePreview.lateFeeFormatted }
                  )}
                </Typography>
              </Box>
            )}

            <TextField
              label={intl.formatMessage({ id: 'installment-payment-amount' })}
              value={payForm.amount}
              size="small"
              type="number"
              required
              onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
            />

            <TextField
              label={intl.formatMessage({ id: 'installment-late-fee-paid' })}
              value={payForm.lateFee}
              size="small"
              type="number"
              onChange={(e) => setPayForm((p) => ({ ...p, lateFee: +e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>
                <FormattedMessage id="payment-method" />
              </InputLabel>
              <Select
                value={payForm.paymentMethodId}
                label={intl.formatMessage({ id: 'payment-method' })}
                onChange={(e) => setPayForm((p) => ({ ...p, paymentMethodId: e.target.value }))}
              >
                <MenuItem value="">—</MenuItem>
                {paymentMethods
                  .filter((pm) => !pm.isDeleted)
                  .map((pm) => (
                    <MenuItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label={intl.formatMessage({ id: 'notes' })}
              value={payForm.notes}
              size="small"
              multiline
              rows={2}
              onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPayDialog(false)} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            variant="contained"
            onClick={onSubmitPayment}
            disabled={payLoading || !payForm.amount || !payForm.paymentDate}
            startIcon={payLoading ? <CircularProgress size={16} color="inherit" /> : <DollarOutlined />}
          >
            <FormattedMessage id="installment-save-payment" />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallmentPage;
