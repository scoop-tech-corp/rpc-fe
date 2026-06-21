import { CheckOutlined, CloseOutlined, DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaidIcon from '@mui/icons-material/Paid';
import PaymentsIcon from '@mui/icons-material/Payments';
import PetsIcon from '@mui/icons-material/Pets';
import ReceiptIcon from '@mui/icons-material/Receipt';
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
import FormReject from 'components/FormReject';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import TabPanel from 'components/TabPanelC';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import {
  CONSTANT_ADMINISTRATOR,
  CONSTANT_STAFF,
  JOB_DOKTER,
  JOB_HELPER,
  JOB_KASIR,
  JOB_PARAMEDIS,
  JOB_VETNURSE,
  isAdminOrManager
} from 'constant/role';
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
  acceptTransactionBreeding,
  deleteTransactionBreeding,
  exportTransactionBreeding,
  getTransactionBreedingIndex,
  getTransactionBreedingStats,
  initiateBreedingCheckout
} from './service';
import TreatmentBreeding from './components/treatment';
import Payment from './components/payment';
import PolicyAgreementBreeding from './components/policy-agreement';
import PrepaymentBreeding from './components/prepayment';
import PapanKerjaHarianBreeding from './components/papan-kerja-harian';
import AdditionalTreatmentBreeding from './components/additional-treatment';
import CheckoutBreeding from './components/checkout';

// ─── Status chip config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'menunggu dokter': { color: 'warning', label: 'Menunggu Dokter' },
  'ditolak dokter': { color: 'error', label: 'Ditolak Dokter' },
  'cek kondisi pet': { color: 'info', label: 'Cek Kondisi Pet' },
  'pet diterima masuk breeding': { color: 'info', label: 'Pet Diterima' },
  'pet ditolak breeding': { color: 'error', label: 'Pet Ditolak' },
  'pet dipindahkan ke pet clinic': { color: 'warning', label: 'Pindah ke Klinik' },
  'menunggu persetujuan policy': { color: 'warning', label: 'Menunggu Policy' },
  'proses pacak': { color: 'primary', label: 'Proses Pacak' },
  'proses check-out': { color: 'warning', label: 'Proses Check-Out' },
  selesai: { color: 'success', label: 'Selesai' },
  batal: { color: 'error', label: 'Batal' }
};

const StatusChip = ({ value }) => {
  const cfg = STATUS_CONFIG[(value || '').toLowerCase()];
  return <Chip label={cfg?.label ?? value} color={cfg?.color ?? 'default'} size="small" sx={{ fontWeight: 500, minWidth: 110 }} />;
};

// ─── Status options per tab untuk filter ─────────────────────────────────────
const STATUS_OPTIONS = {
  ongoing: [
    'Menunggu Dokter',
    'Ditolak Dokter',
    'Cek Kondisi Pet',
    'Pet Diterima Masuk Breeding',
    'Pet Ditolak Breeding',
    'Pet Dipindahkan ke Pet Clinic',
    'Menunggu Persetujuan Policy',
    'Proses Pacak',
    'Proses Check-Out'
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
const TransactionBreeding = () => {
  const { user } = useAuth();
  let [searchParams, setSearchParams] = useSearchParams();
  const tabQueryParam = useMemo(() => {
    return searchParams.get('tab') || 'ongoing';
  }, [searchParams]);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getTransactionBreedingIndex,
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
  const [reassignDialog, setReassignDialog] = useState({ isOpen: false, data: { listDoctor: [], transactionId: null } });
  const [checkConditionPetDialog, setCheckConditionPetDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [treatmentDialog, setTreatmentDialog] = useState({ isOpen: false, data: { locationId: null } });
  const [paymentDialog, setPaymentDialog] = useState({ isOpen: false, data: {} });
  const [policyDialog, setPolicyDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [prepaymentDialog, setPrepaymentDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [papanKerjaDialog, setPapanKerjaDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [additionalTreatmentDialog, setAdditionalTreatmentDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [checkoutDialog, setCheckoutDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [acceptRejectDialog, setAcceptRejectDialog] = useState({ accept: false, reject: false, transactionId: null });

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const resp = await getTransactionBreedingStats();
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

  const onConfirm = async (value) => {
    if (value) {
      await deleteTransactionBreeding(selectedRow)
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

  const onAcceptReject = async (value, reason) => {
    const { transactionId } = acceptRejectDialog;
    setAcceptRejectDialog({ accept: false, reject: false, transactionId: null });

    if (!value) return; // user batal / tutup dialog

    try {
      if (acceptRejectDialog.accept) {
        // status=1 → terima → Cek Kondisi Pet
        await acceptTransactionBreeding({ transactionId, status: 1 });
        dispatch(snackbarSuccess('Pasien diterima — lanjut ke Cek Kondisi Pet'));
      } else {
        // status=0 → tolak → wajib kirim reason
        await acceptTransactionBreeding({ transactionId, status: 0, reason });
        dispatch(snackbarSuccess('Pasien ditolak'));
      }
      setParams((_params) => ({ ..._params }));
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onExport = async () => {
    await exportTransactionBreeding(params)
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
          const statusRow = data.row.original.status;
          const statusLower = (statusRow || '').toLowerCase();
          const isPetCheckRow = +data.row.original.isPetCheck;
          const isTreatmentRow = +data.row.original.isTreatment;
          const transactionIdRow = +data.row.original.id;
          const locationIdRow = +data.row.original.locationId;
          const isFinished = ['selesai', 'batal'].includes(statusLower);

          // Role helpers
          const isAdminMgr = isAdminOrManager(user?.role);
          const isKasir = user?.jobName === JOB_KASIR;
          const isDokter = user?.jobName === JOB_DOKTER;
          const isMonitoring = [JOB_VETNURSE, JOB_HELPER, JOB_PARAMEDIS].includes(user?.jobName);

          const doReassign = async () => {
            const getLocations = await getDoctorStaffByLocationList(locationIdRow);
            setReassignDialog({ isOpen: true, data: { listDoctor: getLocations, transactionId: transactionIdRow } });
          };

          return (
            <Stack spacing={0.1} direction="row" justifyContent="center" flexWrap="wrap">
              {/* ── Edit: Admin/Manager/Kasir, status ongoing ── */}
              {(isAdminMgr || isKasir) && !isFinished && (
                <Tooltip title={<FormattedMessage id="edit" />} arrow>
                  <IconButton size="large" color="primary" onClick={() => setFormTransactionConfig({ isOpen: true, id: transactionIdRow })}>
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Menunggu Dokter: Terima + Tolak (Dokter/Admin) ── */}
              {(isAdminMgr || isDokter) && statusLower === 'menunggu dokter' && (
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

              {/* ── Menunggu Dokter: Reassign (Admin/Kasir) ── */}
              {(isAdminMgr || isKasir) && statusLower === 'menunggu dokter' && (
                <Tooltip title={<FormattedMessage id="reassign" />} arrow>
                  <IconButton size="large" color="warning" onClick={doReassign}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Ditolak Dokter: Reassign (Admin/Kasir) ── */}
              {(isAdminMgr || isKasir) && statusLower === 'ditolak dokter' && (
                <Tooltip title={<FormattedMessage id="reassign" />} arrow>
                  <IconButton size="large" color="warning" onClick={doReassign}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Cek Kondisi Pet (Dokter — via flag isPetCheck) ── */}
              {Boolean(isPetCheckRow) && statusLower === 'cek kondisi pet' && (
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

              {/* ── Pet diterima masuk Breeding: Input Treatment (Dokter/Admin — via flag isTreatment) ── */}
              {Boolean(isTreatmentRow) && statusLower === 'pet diterima masuk breeding' && (isAdminMgr || isDokter) && (
                <Tooltip title={<FormattedMessage id="treatment" />} arrow>
                  <IconButton
                    size="large"
                    color="secondary"
                    onClick={() =>
                      setTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                    }
                  >
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Menunggu Persetujuan Policy: TTD Owner (Admin/Kasir) ── */}
              {(isAdminMgr || isKasir) && statusLower === 'menunggu persetujuan policy' && (
                <Tooltip title="Policy Agreement Owner" arrow>
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => setPolicyDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                  >
                    <DescriptionIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Proses Pacak ── */}
              {statusLower === 'proses pacak' && (
                <>
                  {/* Papan Kerja Harian: Admin/Dokter/Vetnurse/Helper/Paramedis */}
                  {(isAdminMgr || isDokter || isMonitoring) && (
                    <Tooltip title="Papan Kerja Harian" arrow>
                      <IconButton
                        size="large"
                        color="info"
                        onClick={() => setPapanKerjaDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                      >
                        <AssignmentIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Tindakan Tambahan: Admin/Dokter */}
                  {(isAdminMgr || isDokter) && (
                    <Tooltip title="Tindakan Tambahan" arrow>
                      <IconButton
                        size="large"
                        color="secondary"
                        onClick={() => setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                      >
                        <ScienceIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Bayar DP: Admin/Kasir */}
                  {(isAdminMgr || isKasir) && (
                    <Tooltip title="Bayar DP" arrow>
                      <IconButton
                        size="large"
                        color="success"
                        onClick={() => setPrepaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                      >
                        <AccountBalanceWalletIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Inisiasi Check-Out: Admin/Kasir */}
                  {(isAdminMgr || isKasir) && (
                    <Tooltip title="Inisiasi Check-Out" arrow>
                      <IconButton
                        size="large"
                        color="error"
                        onClick={async () => {
                          try {
                            await initiateBreedingCheckout(transactionIdRow);
                            dispatch(snackbarSuccess('Check-out diinisiasi. Silakan proses pembayaran.'));
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
                </>
              )}

              {/* ── Proses Check-Out: Bayar (Admin/Kasir) ── */}
              {(isAdminMgr || isKasir) && statusLower === 'proses check-out' && (
                <Tooltip title="Proses Pembayaran Akhir" arrow>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={() => setCheckoutDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                  >
                    <ReceiptIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ── Legacy fallback: Proses Pembayaran ── */}
              {(isAdminMgr || isKasir) && statusLower === 'proses pembayaran' && (
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

              {/* ── Hapus: hanya Admin, status Selesai/Batal ── */}
              {user?.role === CONSTANT_ADMINISTRATOR && isFinished && (
                <Tooltip title={<FormattedMessage id="delete" />} arrow>
                  <IconButton
                    size="large"
                    color="error"
                    onClick={() => {
                      setSelectedRow([transactionIdRow]);
                      setDialog(true);
                    }}
                  >
                    <DeleteFilled />
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
      <HeaderPageCustom title={<FormattedMessage id="transaction-pacak" />} isBreadcrumb={true} />

      {/* ─── Mini Dashboard Stats ─── */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PetsIcon />} label="Semua Aktif" value={stats?.aktif} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<FavoriteIcon />} label="Proses Pacak" value={stats?.dalamProses} color="secondary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PaymentsIcon />} label="Proses Check-Out" value={stats?.prosesCheckout} color="warning" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon />} label="Selesai Hari Ini" value={stats?.finishedToday} color="success" />
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
              {(user?.role === CONSTANT_ADMINISTRATOR || user?.role === CONSTANT_STAFF) && tabQueryParam === 'ongoing' && (
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

      {treatmentDialog.isOpen && (
        <TreatmentBreeding
          open={treatmentDialog.isOpen}
          data={treatmentDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setTreatmentDialog({ isOpen: false, data: { locationId: null } });
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

      {/* ── Policy Agreement ── */}
      {policyDialog.isOpen && (
        <PolicyAgreementBreeding
          open={policyDialog.isOpen}
          data={policyDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPolicyDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {/* ── Prepayment / DP ── */}
      {prepaymentDialog.isOpen && (
        <PrepaymentBreeding
          open={prepaymentDialog.isOpen}
          data={prepaymentDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPrepaymentDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {/* ── Papan Kerja Harian ── */}
      {papanKerjaDialog.isOpen && (
        <PapanKerjaHarianBreeding
          open={papanKerjaDialog.isOpen}
          data={papanKerjaDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPapanKerjaDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {/* ── Tindakan Tambahan ── */}
      {additionalTreatmentDialog.isOpen && (
        <AdditionalTreatmentBreeding
          open={additionalTreatmentDialog.isOpen}
          data={additionalTreatmentDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setAdditionalTreatmentDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {/* ── Checkout ── */}
      {checkoutDialog.isOpen && (
        <CheckoutBreeding
          open={checkoutDialog.isOpen}
          data={checkoutDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setCheckoutDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {/* ── Accept Pasien ── */}
      <ConfirmationC
        open={acceptRejectDialog.accept}
        title="Terima Pasien Breeding"
        content="Apakah Anda yakin ingin menerima pasien ini untuk proses breeding?"
        onClose={(response) => onAcceptReject(response)}
        btnTrueText="Ya, Terima"
        btnFalseText="Batal"
      />

      {/* ── Reject Pasien ── */}
      {acceptRejectDialog.reject && (
        <FormReject
          open={acceptRejectDialog.reject}
          title="Alasan Penolakan Pasien"
          onClose={() => onAcceptReject(false)}
          onSubmit={(reason) => onAcceptReject(true, reason)}
        />
      )}
    </>
  );
};

export default TransactionBreeding;
