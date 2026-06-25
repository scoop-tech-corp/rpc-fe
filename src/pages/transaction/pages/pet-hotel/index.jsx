import { CheckOutlined, CloseOutlined, DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import HotelIcon from '@mui/icons-material/Hotel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PaidIcon from '@mui/icons-material/Paid';
import PaymentsIcon from '@mui/icons-material/Payments';
import PetsIcon from '@mui/icons-material/Pets';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import { ReactTable } from 'components/third-party/ReactTable';
import { CONSTANT_ADMINISTRATOR, JOB_DOKTER, JOB_HELPER, JOB_KASIR, JOB_PARAMEDIS, JOB_VETNURSE, isAdminOrManager } from 'constant/role';
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
import TreatmentPetHotel from './components/treatment';
import {
  acceptTransactionPetHotel,
  deleteTransactionPetHotel,
  exportTransactionPetHotel,
  getTransactionPetHotelIndex,
  getTransactionPetHotelStats
} from './service';
import Payment from './components/payment';
import PapanKerjaHarian from './components/papan-kerja-harian';
import PapanKerjaVetnurse from './components/papan-kerja-vetnurse';
import AdditionalTreatment from './components/additional-treatment';
import ExtendStay from './components/extend-stay';
import Prepayment from './components/prepayment';
import CheckOut from './components/checkout';
import PolicyAgreement from './components/policy-agreement';
import { initiateCheckOut } from './service';

// ─── Status chip config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'menunggu dokter': { color: 'warning', label: 'Menunggu Dokter' },
  'ditolak dokter': { color: 'error', label: 'Ditolak Dokter' },
  'cek kondisi pet': { color: 'info', label: 'Cek Kondisi Pet' },
  'pet check-in': { color: 'primary', label: 'Pet Check-in' },
  'menunggu persetujuan policy': { color: 'warning', label: 'Menunggu Policy' },
  'dalam perawatan': { color: 'secondary', label: 'Dalam Perawatan' },
  'proses check-out': { color: 'warning', label: 'Proses Check-out' },
  'menunggu konfirmasi pembayaran': { color: 'info', label: 'Menunggu Konfirmasi' },
  selesai: { color: 'success', label: 'Selesai' },
  batal: { color: 'error', label: 'Batal' }
};

const StatusChip = ({ value }) => {
  const cfg = STATUS_CONFIG[(value || '').toLowerCase()];
  return <Chip label={cfg?.label ?? value} color={cfg?.color ?? 'default'} size="small" sx={{ fontWeight: 500, minWidth: 120 }} />;
};

// ─── Status options per tab untuk filter ─────────────────────────────────────
const STATUS_OPTIONS = {
  ongoing: [
    'Menunggu Dokter',
    'Ditolak Dokter',
    'Cek Kondisi Pet',
    'Pet Check-in',
    'Dalam Perawatan',
    'Menunggu Persetujuan Policy',
    'Proses Check-out',
    'Menunggu Konfirmasi Pembayaran'
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
const TransactionPetHotel = () => {
  const { user } = useAuth();
  let [searchParams, setSearchParams] = useSearchParams();
  const tabQueryParam = useMemo(() => {
    return searchParams.get('tab') || 'ongoing';
  }, [searchParams]);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getTransactionPetHotelIndex,
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
  const [treatmentDialog, setTreatmentDialog] = useState({ isOpen: false, data: { locationId: null } });
  const [paymentDialog, setPaymentDialog] = useState({ isOpen: false, data: {} });
  const [papanKerjaHarianDialog, setPapanKerjaHarianDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [papanKerjaVetnurseDialog, setPapanKerjaVetnurseDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [additionalTreatmentDialog, setAdditionalTreatmentDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [extendStayDialog, setExtendStayDialog] = useState({ isOpen: false, data: { transactionId: null, currentEndDate: null } });
  const [prepaymentDialog, setPrepaymentDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [checkoutDialog, setCheckoutDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [policyAgreementDialog, setPolicyAgreementDialog] = useState({ isOpen: false, data: { transactionId: null } });

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const resp = await getTransactionPetHotelStats();
      if (resp?.data) setStats(resp.data);
    } catch (_) {
      /* silent — backend endpoint optional */
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
      await deleteTransactionPetHotel(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess(intl.formatMessage({ id: 'success-delete-transaction' })));
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
    await exportTransactionPetHotel(params)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onConfirmAcceptReject = async (val, type) => {
    if (val) {
      await acceptTransactionPetHotel({
        transactionId: acceptRejectDialog.transactionId,
        status: type === 'accept' ? 1 : 0,
        reason: type === 'reject' ? val : ''
      })
        .then((resp) => {
          if (resp.status === 200) {
            setAcceptRejectDialog({ accept: false, reject: false, transactionId: null });
            dispatch(snackbarSuccess(intl.formatMessage({ id: type === 'accept' ? 'success-accept-patient' : 'success-cancel-patient' })));
            setParams((_p) => ({ ..._p }));
          }
        })
        .catch((err) => {
          setAcceptRejectDialog({ accept: false, reject: false, transactionId: null });
          dispatch(snackbarError(createMessageBackend(err)));
        });
    } else {
      setAcceptRejectDialog({ accept: false, reject: false, transactionId: null });
    }
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
  const showActionColumn = !(tabQueryParam === 'finished' && user?.role !== CONSTANT_ADMINISTRATOR);

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
      ...(showActionColumn
        ? [
            {
              Header: <FormattedMessage id="action" />,
              accessor: 'action',
              style: { textAlign: 'center' },
              isNotSorting: true,
              Cell: (data) => {
                const statusRow = data.row.original.status;
                const statusLower = (statusRow || '').toLowerCase();
                const isPetCheckRow = +data.row.original.isPetCheck;
                const transactionIdRow = +data.row.original.id;
                const locationIdRow = +data.row.original.locationId;
                const isTreatmentRow = +data.row.original.isTreatment;
                const isFinished = ['selesai', 'batal'].includes(statusLower);

                const doReassign = async () => {
                  const getLocations = await getDoctorStaffByLocationList(+data.row.original.locationId);
                  setReassignDialog({ isOpen: true, data: { listDoctor: getLocations, transactionId: +data.row.original.id } });
                };

                return (
                  <Stack spacing={0.1} direction="row" justifyContent="center" flexWrap="wrap">
                    {/* Edit */}
                    {(isAdminOrManager(user?.role) || (user?.jobName === JOB_KASIR && statusLower !== 'proses check-out')) &&
                      !isFinished && (
                        <Tooltip title={<FormattedMessage id="edit" />} arrow>
                          <IconButton
                            size="large"
                            color="primary"
                            onClick={() => setFormTransactionConfig({ isOpen: true, id: transactionIdRow })}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>
                      )}

                    {/* Accept / Reject — menunggu dokter */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) && statusLower === 'menunggu dokter' && (
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

                    {/* Reassign — ditolak dokter */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && statusLower === 'ditolak dokter' && (
                      <Tooltip title={<FormattedMessage id="reassign" />} arrow>
                        <IconButton size="large" color="warning" onClick={doReassign}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Cek Kondisi Pet */}
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

                    {/* Input Treatment — pet check-in */}
                    {Boolean(isTreatmentRow) &&
                      statusLower === 'pet check-in' &&
                      (isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) && (
                        <Tooltip title={<FormattedMessage id="treatment" />} arrow>
                          <IconButton
                            size="large"
                            color="info"
                            onClick={() =>
                              setTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                            }
                          >
                            <MedicalServicesIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                    {/* Dalam Perawatan group */}
                    {statusLower === 'dalam perawatan' && (
                      <>
                        {(isAdminOrManager(user?.role) || [JOB_HELPER, JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName)) && (
                          <Tooltip title={<FormattedMessage id="papan-kerja-harian" />} arrow>
                            <IconButton
                              size="large"
                              color="warning"
                              onClick={() => setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <EventNoteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isAdminOrManager(user?.role) || [JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName)) && (
                          <Tooltip title={<FormattedMessage id="papan-kerja-vetnurse" />} arrow>
                            <IconButton
                              size="large"
                              color="secondary"
                              onClick={() => setPapanKerjaVetnurseDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="bayar-dp" />} arrow>
                            <IconButton
                              size="large"
                              color="success"
                              onClick={() => setPrepaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <AccountBalanceWalletIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="extend-stay" />} arrow>
                            <IconButton
                              size="large"
                              color="info"
                              onClick={() =>
                                setExtendStayDialog({
                                  isOpen: true,
                                  data: { transactionId: transactionIdRow, currentEndDate: data.row.original.endDate }
                                })
                              }
                            >
                              <DateRangeIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="additional-treatment" />} arrow>
                            <IconButton
                              size="large"
                              color="secondary"
                              onClick={() => setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <AddBoxIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="initiate-checkout" />} arrow>
                            <IconButton
                              size="large"
                              color="error"
                              onClick={async () => {
                                try {
                                  await initiateCheckOut({ transactionId: transactionIdRow });
                                  dispatch(snackbarSuccess(intl.formatMessage({ id: 'initiate-checkout-success' })));
                                  setParams((_p) => ({ ..._p }));
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

                    {/* Menunggu Persetujuan Policy */}
                    {statusLower === 'menunggu persetujuan policy' && (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                      <Tooltip title={<FormattedMessage id="policy-agreement-owner" />} arrow>
                        <IconButton
                          size="large"
                          color="primary"
                          onClick={() => setPolicyAgreementDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                        >
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Proses Check-out */}
                    {statusLower === 'proses check-out' && (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                      <Tooltip title={<FormattedMessage id="process-checkout-payment" />} arrow>
                        <IconButton
                          size="large"
                          color="success"
                          onClick={() => setCheckoutDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Menunggu Konfirmasi Pembayaran */}
                    {statusLower === 'menunggu konfirmasi pembayaran' && (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                      <Tooltip title={<FormattedMessage id="confirm-payment" />} arrow>
                        <IconButton
                          size="large"
                          color="warning"
                          onClick={() =>
                            setPaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                          }
                        >
                          <PaidIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Delete — admin, status selesai/batal */}
                    {user?.role === CONSTANT_ADMINISTRATOR && isFinished && (
                      <Tooltip title={<FormattedMessage id="delete-transaction" />} arrow>
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
            }
          ]
        : []),
      {
        Header: <FormattedMessage id="registration-no" />,
        accessor: 'registrationNo',
        Cell: (data) => {
          const getId = data.row.original.id;
          const getLocationId = data.row.original.locationId;
          const getEndDate = data.row.original.endDate;

          return (
            <Link
              sx={{ cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
              onClick={() =>
                setDetailTransactionConfig({ isOpen: true, data: { id: getId, locationId: getLocationId, endDate: getEndDate } })
              }
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
    [showActionColumn, user]
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
      <HeaderPageCustom title={<FormattedMessage id="transaction-pet-hotel" />} isBreadcrumb={true} />

      {/* ─── Mini Dashboard Stats ─── */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<HotelIcon />} label="Sedang Menginap" value={stats?.menginap} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<ExitToAppIcon />} label="Proses Check-out" value={stats?.prosesCheckout} color="warning" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon />} label="Selesai Hari Ini" value={stats?.finishedToday} color="success" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PaymentsIcon />} label="Menunggu Konfirmasi" value={stats?.menungguKonfirmasi} color="info" />
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
            } else if (action === 'reassign') {
              const listDoctor = await getDoctorStaffByLocationList(+detailTransactionConfig.data.locationId);
              setReassignDialog({ isOpen: true, data: { listDoctor, transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'check-pet-condition') {
              setCheckConditionPetDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'treatment') {
              setTreatmentDialog({
                isOpen: true,
                data: { transactionId: detailTransactionConfig.data.id, locationId: detailTransactionConfig.data.locationId }
              });
            } else if (action === 'papan-kerja-harian') {
              setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'papan-kerja-vetnurse') {
              setPapanKerjaVetnurseDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'additional-treatment') {
              setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'extend-stay') {
              setExtendStayDialog({
                isOpen: true,
                data: { transactionId: detailTransactionConfig.data.id, currentEndDate: detailTransactionConfig.data.endDate }
              });
            } else if (action === 'prepayment') {
              setPrepaymentDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'checkout') {
              setCheckoutDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'initiate-checkout') {
              try {
                await initiateCheckOut({ transactionId: detailTransactionConfig.data.id });
                dispatch(snackbarSuccess(intl.formatMessage({ id: 'initiate-checkout-success' })));
                setParams((_p) => ({ ..._p }));
              } catch (err) {
                dispatch(snackbarError(createMessageBackend(err)));
              }
            } else if (action === 'confirm-payment') {
              setPaymentDialog({
                isOpen: true,
                data: { transactionId: detailTransactionConfig.data.id, locationId: detailTransactionConfig.data.locationId }
              });
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

      <ConfirmationC
        open={acceptRejectDialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-this-patient" />}
        onClose={(response) => onConfirmAcceptReject(response, 'accept')}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      <FormReject
        open={acceptRejectDialog.reject}
        title={<FormattedMessage id="confirm-and-please-fill-in-the-reasons-for-cancel-this-patient" />}
        onSubmit={(response) => onConfirmAcceptReject(response, 'reject')}
        onClose={() => setAcceptRejectDialog({ accept: false, reject: false, transactionId: null })}
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
        <TreatmentPetHotel
          open={treatmentDialog.isOpen}
          data={treatmentDialog.data}
          onClose={(resp) => {
            const savedTransactionId = treatmentDialog.data.transactionId;
            setTreatmentDialog({ isOpen: false, data: { locationId: null } });
            if (resp) {
              setParams((_params) => ({ ..._params }));
              const isDokter = user?.jobName === JOB_DOKTER;
              if (!isDokter) {
                setPolicyAgreementDialog({ isOpen: true, data: { transactionId: savedTransactionId } });
              }
            }
          }}
        />
      )}

      {policyAgreementDialog.isOpen && (
        <PolicyAgreement
          open={policyAgreementDialog.isOpen}
          data={policyAgreementDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPolicyAgreementDialog({ isOpen: false, data: { transactionId: null } });
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

      {papanKerjaHarianDialog.isOpen && (
        <PapanKerjaHarian
          open={papanKerjaHarianDialog.isOpen}
          data={papanKerjaHarianDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPapanKerjaHarianDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {papanKerjaVetnurseDialog.isOpen && (
        <PapanKerjaVetnurse
          open={papanKerjaVetnurseDialog.isOpen}
          data={papanKerjaVetnurseDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setPapanKerjaVetnurseDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {additionalTreatmentDialog.isOpen && (
        <AdditionalTreatment
          open={additionalTreatmentDialog.isOpen}
          data={additionalTreatmentDialog.data}
          onClose={() => setAdditionalTreatmentDialog({ isOpen: false, data: { transactionId: null } })}
        />
      )}

      {extendStayDialog.isOpen && (
        <ExtendStay
          open={extendStayDialog.isOpen}
          data={extendStayDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_params) => ({ ..._params }));
            setExtendStayDialog({ isOpen: false, data: { transactionId: null, currentEndDate: null } });
          }}
        />
      )}

      {prepaymentDialog.isOpen && (
        <Prepayment
          open={prepaymentDialog.isOpen}
          data={prepaymentDialog.data}
          onClose={() => setPrepaymentDialog({ isOpen: false, data: { transactionId: null } })}
        />
      )}

      {checkoutDialog.isOpen && (
        <CheckOut
          open={checkoutDialog.isOpen}
          data={checkoutDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_p) => ({ ..._p }));
            setCheckoutDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}
    </>
  );
};

export default TransactionPetHotel;
