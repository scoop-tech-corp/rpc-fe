import { CheckOutlined, CloseOutlined, DeleteFilled, PlusOutlined } from '@ant-design/icons';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DrawIcon from '@mui/icons-material/Draw';
import DownloadIcon from '@mui/icons-material/Download';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaidIcon from '@mui/icons-material/Paid';
import PaymentsIcon from '@mui/icons-material/Payments';
import PetsIcon from '@mui/icons-material/Pets';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScienceIcon from '@mui/icons-material/Science';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import ConfirmationC from 'components/ConfirmationC';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import TabPanel from 'components/TabPanelC';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import FormReject from 'components/FormReject';
import { CONSTANT_ADMINISTRATOR, JOB_DOKTER, JOB_KASIR, isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import useGetList from 'hooks/useGetList';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createMessageBackend,
  getCustomerGroupList,
  getDoctorStaffByLocationList,
  getLocationList,
  processDownloadExcel
} from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import { TabList } from '../../service';
import CheckPetCondition from './components/check-pet-condition';
import ReassignModalC from './components/reassign';
import TransactionDetail from './detail';
import FormTransaction from './form-transaction';
import {
  deleteTransactionPetSalon,
  exportTransactionPetSalon,
  getTransactionPetSalonIndex,
  getTransactionPetSalonStats,
  acceptTransactionPetSalon,
  initiateCheckoutPetSalon
} from './service';
import Payment from './components/payment';
import TreatmentPetSalon from './components/treatment';
import PolicyAgreementPetSalon from './components/policy-agreement';
import MarkSalonDone from './components/mark-done';

// ─── Status chip config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'menunggu dokter': { color: 'warning', label: 'Menunggu Dokter' },
  'ditolak dokter': { color: 'error', label: 'Ditolak Dokter' },
  'cek kondisi pet': { color: 'info', label: 'Cek Kondisi Pet' },
  'pet diterima masuk pet hotel': { color: 'primary', label: 'Pet Diterima' },
  'menunggu persetujuan policy': { color: 'warning', label: 'Menunggu Policy' },
  'proses salon': { color: 'secondary', label: 'Proses Salon' },
  'menunggu penjemputan': { color: 'info', label: 'Menunggu Jemput' },
  'proses pembayaran': { color: 'warning', label: 'Proses Pembayaran' },
  selesai: { color: 'success', label: 'Selesai' },
  batal: { color: 'error', label: 'Batal' }
};

const StatusChip = ({ value }) => {
  const cfg = STATUS_CONFIG[(value || '').toLowerCase()];
  return <Chip label={cfg?.label ?? value} color={cfg?.color ?? 'default'} size="small" sx={{ fontWeight: 500, minWidth: 115 }} />;
};

// ─── Status options per tab untuk filter ─────────────────────────────────────
const STATUS_OPTIONS = {
  ongoing: [
    'Menunggu Dokter',
    'Ditolak Dokter',
    'Cek Kondisi Pet',
    'Pet Diterima Masuk Pet Hotel',
    'Menunggu Persetujuan Policy',
    'Proses Salon',
    'Menunggu Penjemputan',
    'Proses Pembayaran'
  ],
  finished: ['Selesai', 'Batal']
};

// ─── Mini Dashboard Card ──────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <Card variant="outlined" sx={{ borderLeft: 4, borderColor: `${color}.main` }}>
    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ color: `${color}.main`, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" color={`${color}.main`}>
            {value ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TransactionPetSalon = () => {
  const { user } = useAuth();
  let [searchParams, setSearchParams] = useSearchParams();
  const tabQueryParam = useMemo(() => {
    return searchParams.get('tab') || 'ongoing';
  }, [searchParams]);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getTransactionPetSalonIndex,
    { status: tabQueryParam, locationId: [], customerGroupId: [], statusFilter: '', startDateFrom: '', startDateTo: '' },
    'search'
  );

  const intl = useIntl();
  const dispatch = useDispatch();

  // ── State ──
  const [stats, setStats] = useState(null);
  const [formTransactionConfig, setFormTransactionConfig] = useState({ isOpen: false, id: null, queueId: null });
  const [detailTransactionConfig, setDetailTransactionConfig] = useState({ isOpen: false, data: { id: null } });
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [filterLocationList, setFilterLocationList] = useState([]);
  const [selectedFilterCustomerGroup, setFilterCustomerGroup] = useState([]);
  const [filterCustomerGroupList, setFilterCustomerGroupList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDateFrom, setFilterStartDateFrom] = useState('');
  const [filterStartDateTo, setFilterStartDateTo] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [acceptRejectDialog, setAcceptRejectDialog] = useState({ accept: false, reject: false, transactionId: null });
  const [reassignDialog, setReassignDialog] = useState({ isOpen: false, data: { listDoctor: [], transactionId: null } });
  const [checkConditionPetDialog, setCheckConditionPetDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [treatmentDialog, setTreatmentDialog] = useState({ isOpen: false, data: { transactionId: null, locationId: null } });
  const [policyAgreementDialog, setPolicyAgreementDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [markDoneDialog, setMarkDoneDialog] = useState({ isOpen: false, data: { transactionId: null, locationId: null } });
  const [paymentDialog, setPaymentDialog] = useState({ isOpen: false, data: {} });

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const resp = await getTransactionPetSalonStats();
      if (resp?.data) setStats(resp.data);
    } catch (_) {
      /* silent */
    }
  }, []);

  // Auto-open form create jika ada ?queueId= di URL (dari Queue Management)
  useEffect(() => {
    const queueId = searchParams.get('queueId');
    if (queueId) {
      setFormTransactionConfig({ isOpen: true, id: null, queueId: Number(queueId) });
      setSearchParams(
        (prev) => {
          prev.delete('queueId');
          return prev;
        },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickAdd = () => {
    setFormTransactionConfig((prevState) => ({ ...prevState, isOpen: true }));
  };

  const onAcceptReject = async (value, reason) => {
    const { transactionId } = acceptRejectDialog;
    const isAccepting = acceptRejectDialog.accept;
    setAcceptRejectDialog({ accept: false, reject: false, transactionId: null });
    if (!value) return;
    try {
      await acceptTransactionPetSalon({
        transactionId,
        status: isAccepting ? 1 : 0,
        reason: isAccepting ? '' : reason || ''
      });
      dispatch(snackbarSuccess(isAccepting ? 'Pasien diterima' : 'Pasien ditolak'));
      setParams((_params) => ({ ..._params }));
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteTransactionPetSalon(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Transaction'));
            setParams((_params) => ({ ..._params }));
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  const onExport = async () => {
    await exportTransactionPetSalon(params)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const getDataDropdown = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    const getLocation = await getLocationList();
    const getCustomerGroup = await getCustomerGroupList();

    setFilterLocationList(getLocation);
    setFilterCustomerGroupList(getCustomerGroup);

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    setSearchParams({ tab: tabQueryParam });
    setTabSelected(TabList[tabQueryParam]);
    getDataDropdown();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats();
  }, [list, fetchStats]);

  // ── Advanced filter handlers ──
  const applyAdvancedFilter = () => {
    setParams((prev) => ({ ...prev, statusFilter: filterStatus, startDateFrom: filterStartDateFrom, startDateTo: filterStartDateTo }));
  };

  const resetAdvancedFilter = () => {
    setFilterStatus('');
    setFilterStartDateFrom('');
    setFilterStartDateTo('');
    setParams((prev) => ({ ...prev, statusFilter: '', startDateFrom: '', startDateTo: '' }));
  };

  const hasAdvancedFilter = !!(filterStatus || filterStartDateFrom || filterStartDateTo);

  // ── Columns ──
  const columnCheckbox = () => {
    return user?.role === CONSTANT_ADMINISTRATOR
      ? [
          {
            title: 'Row Selection',
            Header: (header) => {
              useEffect(() => {
                const selectRows = header.selectedFlatRows.map(({ original }) => original.id);
                setSelectedRow(selectRows);
              }, [header.selectedFlatRows]);

              return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
            },
            accessor: 'selection',
            Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
            disableSortBy: true,
            style: { width: '10px' }
          }
        ]
      : [];
  };

  const columnCustomerGroup = () => {
    return user?.role === CONSTANT_ADMINISTRATOR
      ? [
          {
            Header: 'Customer Group',
            accessor: 'customerGroup',
            Cell: (data) =>
              data.value ? (
                <Chip label={data.value} size="small" color="primary" variant="outlined" />
              ) : (
                <Typography variant="caption" color="text.disabled">
                  —
                </Typography>
              )
          }
        ]
      : [];
  };

  const columns = useMemo(
    () => [
      ...columnCheckbox(),
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        style: { textAlign: 'center' },
        isNotSorting: true,
        Cell: (data) => {
          const statusRow = (data.row.original.status ?? '').toLowerCase();
          const isPetCheckRow = +data.row.original.isPetCheck;
          const transactionIdRow = +data.row.original.id;
          const locationIdRow = +data.row.original.locationId;
          const isAdminMgr = isAdminOrManager(user?.role);
          const isKasir = user?.jobName === JOB_KASIR;
          const isDokter = user?.jobName === JOB_DOKTER;

          const doReassign = async () => {
            const getLocations = await getDoctorStaffByLocationList(locationIdRow);
            setReassignDialog({ isOpen: true, data: { listDoctor: getLocations, transactionId: transactionIdRow } });
          };

          return (
            <Stack spacing={0.1} direction="row" justifyContent="center">
              {/* ── Menunggu Dokter: Accept + Reject ── */}
              {(isAdminMgr || isDokter) && statusRow === 'menunggu dokter' && (
                <>
                  <Tooltip title={<FormattedMessage id="accept-patient" />} arrow>
                    <IconButton
                      size="large"
                      color="success"
                      onClick={() => setAcceptRejectDialog({ accept: true, reject: false, transactionId: transactionIdRow })}
                    >
                      <CheckOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={<FormattedMessage id="cancel-patient" />} arrow>
                    <IconButton
                      size="large"
                      color="error"
                      onClick={() => setAcceptRejectDialog({ accept: false, reject: true, transactionId: transactionIdRow })}
                    >
                      <CloseOutlined />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {/* ── Ditolak Dokter: Reassign ── */}
              {(isAdminMgr || isKasir) && statusRow === 'ditolak dokter' && (
                <Tooltip title={<FormattedMessage id="reassign" />} arrow>
                  <IconButton size="large" color="warning" onClick={doReassign}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Cek Kondisi Pet ── */}
              {Boolean(isPetCheckRow) && (
                <Tooltip title={<FormattedMessage id="check-pet-condition" />} arrow>
                  <IconButton
                    size="large"
                    color="info"
                    onClick={() => setCheckConditionPetDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                  >
                    <PetsIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Pet diterima: Input Treatment ── */}
              {(isAdminMgr || isDokter) && statusRow === 'pet diterima masuk pet hotel' && (
                <Tooltip title={<FormattedMessage id="treatment" />} arrow>
                  <IconButton
                    size="large"
                    color="primary"
                    onClick={() =>
                      setTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                    }
                  >
                    <ScienceIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Menunggu Persetujuan Policy ── */}
              {(isAdminMgr || isKasir) && statusRow === 'menunggu persetujuan policy' && (
                <Tooltip title={<FormattedMessage id="policy-agreement" />} arrow>
                  <IconButton
                    size="large"
                    color="primary"
                    onClick={() => setPolicyAgreementDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                  >
                    <DrawIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Proses Salon: Tandai Selesai ── */}
              {(isAdminMgr || isDokter) && statusRow === 'proses salon' && (
                <Tooltip title={<FormattedMessage id="mark-salon-done" />} arrow>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={() =>
                      setMarkDoneDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                    }
                  >
                    <ContentCutIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Menunggu Penjemputan: Initiate Checkout ── */}
              {(isAdminMgr || isKasir) && statusRow === 'menunggu penjemputan' && (
                <Tooltip title={<FormattedMessage id="initiate-checkout" />} arrow>
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={async () => {
                      try {
                        await initiateCheckoutPetSalon(transactionIdRow);
                        setParams((_params) => ({ ..._params }));
                      } catch (err) {
                        dispatch(snackbarError(createMessageBackend(err)));
                      }
                    }}
                  >
                    <ExitToAppIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Proses Pembayaran: Payment ── */}
              {(isAdminMgr || isKasir) && statusRow === 'proses pembayaran' && (
                <Tooltip title={<FormattedMessage id="payment" />} arrow>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={() => setPaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })}
                  >
                    <PaidIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        }
      },
      {
        Header: <FormattedMessage id="registration-no" />,
        accessor: 'registrationNo',
        Cell: (data) => {
          const getId = data.row.original.id;
          return (
            <Link
              sx={{ cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
              onClick={() => setDetailTransactionConfig({ isOpen: true, data: { id: getId } })}
            >
              {data.value}
            </Link>
          );
        }
      },
      {
        Header: 'Pasien',
        accessor: 'petName',
        Cell: (data) => (
          <Stack spacing={0}>
            <Typography variant="body2" fontWeight={600}>
              🐾 {data.value || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.row.original.firstName || '—'}
            </Typography>
          </Stack>
        )
      },
      ...columnCustomerGroup(),
      {
        Header: 'Periode',
        accessor: 'startDate',
        Cell: (data) => {
          const start = data.value;
          const end = data.row.original.endDate;
          if (!start)
            return (
              <Typography variant="caption" color="text.disabled">
                —
              </Typography>
            );
          return (
            <Stack spacing={0}>
              <Typography variant="caption" fontWeight={500}>
                {start}
              </Typography>
              {end && (
                <Typography variant="caption" color="text.secondary">
                  s/d {end}
                </Typography>
              )}
            </Stack>
          );
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => <StatusChip value={data.value} />
      },
      {
        Header: 'PIC Dokter',
        accessor: 'picDoctor',
        Cell: (data) => <Typography variant="caption">{data.value || '—'}</Typography>
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const renderContent = () => (
    <ScrollX>
      <ReactTable
        columns={columns}
        data={list || []}
        colSpanPagination={8}
        totalPagination={totalPagination}
        setPageNumber={params.goToPage}
        setPageRow={params.rowPerPage}
        onGotoPage={goToPage}
        onOrder={orderingChange}
        onPageSize={changeLimit}
      />
    </ScrollX>
  );

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="transaction-pet-salon" />} isBreadcrumb={true} />

      {/* ─── Mini Dashboard Stats ─── */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PetsIcon />} label="Antrian Grooming" value={stats?.antrianGrooming} color="info" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<ContentCutIcon />} label="Proses Salon" value={stats?.prosesSalon} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon />} label="Selesai Hari Ini" value={stats?.finishedToday} color="success" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PaymentsIcon />} label="Proses Pembayaran" value={stats?.prosesPembayaran} color="warning" />
        </Grid>
      </Grid>

      <MainCard content={true} boxShadow>
        {/* ─── Filter Bar ─── */}
        <Grid container spacing={2} mb={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={user?.role === CONSTANT_ADMINISTRATOR ? 4 : 6}>
            <GlobalFilter
              placeHolder={intl.formatMessage({ id: 'search' })}
              globalFilter={keyword}
              setGlobalFilter={changeKeyword}
              className="fullWidth"
              style={{ height: '41.3px' }}
            />
          </Grid>
          {/* Admin: Location + Customer Group */}
          {user?.role === CONSTANT_ADMINISTRATOR && (
            <>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  id="filterLocation"
                  multiple
                  limitTags={1}
                  options={filterLocationList}
                  value={selectedFilterLocation}
                  className="fullWidth"
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, selected) => {
                    setFilterLocation(selected);
                    setParams((prevParams) => ({ ...prevParams, locationId: selected.map((dt) => dt.value) }));
                  }}
                  renderInput={(p) => <TextField {...p} label={<FormattedMessage id="filter-location" />} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  id="filter-customer-group"
                  multiple
                  limitTags={1}
                  options={filterCustomerGroupList}
                  value={selectedFilterCustomerGroup}
                  className="fullWidth"
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, selected) => {
                    setFilterCustomerGroup(selected);
                    setParams((prevParams) => ({ ...prevParams, customerGroupId: selected.map((dt) => dt.value) }));
                  }}
                  renderInput={(p) => <TextField {...p} label={<FormattedMessage id="customer-group" />} />}
                />
              </Grid>
            </>
          )}
          {/* Action Buttons */}
          <Grid item xs={12} sm={user?.role === CONSTANT_ADMINISTRATOR ? 12 : 6}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                color={showAdvancedFilter ? 'primary' : 'inherit'}
                onClick={() => setShowAdvancedFilter((v) => !v)}
              >
                Filter Lanjutan
                {hasAdvancedFilter && <Chip label="aktif" size="small" color="primary" sx={{ ml: 0.5, height: 16, fontSize: 10 }} />}
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && tabQueryParam === 'ongoing' && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="transaction" />
                </Button>
              )}
            </Stack>
          </Grid>

          {/* Advanced Filter (collapsible) */}
          <Grid item xs={12}>
            <Collapse in={showAdvancedFilter}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                  <FilterListIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Filter Lanjutan
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter Status</InputLabel>
                      <Select value={filterStatus} label="Filter Status" onChange={(e) => setFilterStatus(e.target.value)}>
                        <MenuItem value="">
                          <em>Semua Status</em>
                        </MenuItem>
                        {(STATUS_OPTIONS[tabQueryParam] || []).map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tgl Mulai (Dari)"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={filterStartDateFrom}
                      onChange={(e) => setFilterStartDateFrom(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tgl Mulai (Sampai)"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={filterStartDateTo}
                      onChange={(e) => setFilterStartDateTo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" size="small" onClick={applyAdvancedFilter} fullWidth>
                        Terapkan
                      </Button>
                      <Button variant="outlined" size="small" onClick={resetAdvancedFilter} fullWidth>
                        Reset
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Grid>
        </Grid>

        {/* ─── Tabs ─── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => {
              const tabs = ['ongoing', 'finished'];
              setSearchParams({ tab: tabs[value] });
              setTabSelected(value);
              setSelectedRow([]);
              resetAdvancedFilter();
              setParams((prevParams) => ({ ...prevParams, status: tabs[value], statusFilter: '', startDateFrom: '', startDateTo: '' }));
            }}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="transaction list tab"
          >
            <Tab label={<FormattedMessage id="ongoing" />} id="transaction-list-tab-0" aria-controls="transaction-list-tabpanel-0" />
            <Tab label={<FormattedMessage id="finished" />} id="transaction-list-tab-1" aria-controls="transaction-list-tabpanel-1" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="transaction-list">
            {renderContent()}
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="transaction-list">
            {renderContent()}
          </TabPanel>
        </Box>

        {/* ── Delete selected rows ── */}
        {selectedRow.length > 0 && (
          <Stack direction="row" justifyContent="flex-end" mt={1}>
            <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)} style={{ width: 160 }}>
              Hapus ({selectedRow.length})
            </Button>
          </Stack>
        )}
      </MainCard>

      {/* ─── Modals ─── */}
      {formTransactionConfig.isOpen && (
        <FormTransaction
          open={formTransactionConfig.isOpen}
          id={Number(formTransactionConfig.id)}
          queueId={formTransactionConfig.queueId}
          onClose={(e) => {
            setFormTransactionConfig({ isOpen: false, id: null, queueId: null });
            if (e) setParams((_params) => ({ ..._params }));
          }}
        />
      )}

      {detailTransactionConfig.isOpen && (
        <TransactionDetail
          open={detailTransactionConfig.isOpen}
          data={detailTransactionConfig.data}
          onClose={async (action) => {
            if (action === 'edit') {
              setFormTransactionConfig({ isOpen: true, id: detailTransactionConfig.data.id });
            } else if (['accept-patient', 'cancel-patient', 'delete'].includes(action)) {
              setParams((_params) => ({ ..._params }));
            }
            setDetailTransactionConfig({ isOpen: false, data: { id: null } });
          }}
        />
      )}

      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      {reassignDialog.isOpen && (
        <ReassignModalC
          open={reassignDialog.isOpen}
          data={reassignDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setReassignDialog({ isOpen: false, data: { listDoctor: [], transactionId: null } });
          }}
        />
      )}

      {checkConditionPetDialog.isOpen && (
        <CheckPetCondition
          open={checkConditionPetDialog.isOpen}
          data={checkConditionPetDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setCheckConditionPetDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {paymentDialog.isOpen && (
        <Payment
          open={paymentDialog.isOpen}
          data={paymentDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPaymentDialog({ isOpen: false, data: {} });
          }}
        />
      )}

      {/* ── Accept Confirmation ── */}
      <ConfirmationC
        open={acceptRejectDialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content="Apakah Anda yakin ingin menerima pasien ini untuk proses salon?"
        onClose={(confirmed) => onAcceptReject(confirmed)}
        btnTrueText="Ya, Terima"
        btnFalseText="Batal"
      />

      {/* ── Reject with reason ── */}
      {acceptRejectDialog.reject && (
        <FormReject
          open={acceptRejectDialog.reject}
          title="Alasan Penolakan Pasien"
          onClose={() => onAcceptReject(false)}
          onSubmit={(reason) => onAcceptReject(true, reason)}
        />
      )}

      {/* ── Treatment Input ── */}
      {treatmentDialog.isOpen && (
        <TreatmentPetSalon
          open={treatmentDialog.isOpen}
          data={treatmentDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setTreatmentDialog({ isOpen: false, data: { transactionId: null, locationId: null } });
          }}
        />
      )}

      {/* ── Policy Agreement ── */}
      {policyAgreementDialog.isOpen && (
        <PolicyAgreementPetSalon
          open={policyAgreementDialog.isOpen}
          data={policyAgreementDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPolicyAgreementDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {/* ── Mark Salon Done ── */}
      {markDoneDialog.isOpen && (
        <MarkSalonDone
          open={markDoneDialog.isOpen}
          data={markDoneDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setMarkDoneDialog({ isOpen: false, data: { transactionId: null, locationId: null } });
          }}
        />
      )}
    </>
  );
};

export default TransactionPetSalon;
