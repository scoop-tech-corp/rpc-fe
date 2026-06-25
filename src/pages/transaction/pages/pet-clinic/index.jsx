import { CheckOutlined, CloseOutlined, DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PetsIcon from '@mui/icons-material/Pets';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RefreshIcon from '@mui/icons-material/Refresh';
import HotelIcon from '@mui/icons-material/Hotel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
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
import { CONSTANT_ADMINISTRATOR, JOB_DOKTER, JOB_KASIR, JOB_PARAMEDIS, JOB_VETNURSE, isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import useGetList from 'hooks/useGetList';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createMessageBackend,
  getDoctorStaffByLocationList,
  getCustomerGroupList,
  getLocationList,
  processDownloadExcel
} from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import TransactionPetClinicDetail from './detail';
import FormTransaction from 'pages/transaction/form-transaction';
import ReassignModalC from 'pages/transaction/reassign';
import CheckPetConditionPetClinic from './components/check-pet-condition';
import ServiceAndRecipe from './components/service-recipe';
import Payment from './components/payment';
import PrepaymentPetClinic from './components/prepayment';
import AdditionalTreatmentPetClinic from './components/additional-treatment';
import PapanKerjaHarianPetClinic from './components/papan-kerja-harian';
import TreatmentPetClinic from './components/treatment';
import PolicyAgreementPetClinic from './components/policy-agreement';
import {
  getTransactionPetClinicIndex,
  getTransactionPetClinicStats,
  deleteTransactionPetClinic,
  acceptTransactionPetClinic,
  exportTransactionPetClinic,
  initiateCheckoutPetClinic
} from './service.jsx';

// ─── Status chip config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'menunggu dokter': { color: 'warning', label: 'Menunggu Dokter' },
  'ditolak dokter': { color: 'error', label: 'Ditolak Dokter' },
  'cek kondisi pet': { color: 'info', label: 'Cek Kondisi Pet' },
  'input service dan obat': { color: 'primary', label: 'Input Service & Obat' },
  'proses rawat inap': { color: 'secondary', label: 'Proses Rawat Inap' },
  'menunggu persetujuan policy': { color: 'warning', label: 'Menunggu Policy' },
  'dalam perawatan': { color: 'info', label: 'Dalam Perawatan' },
  'proses pembayaran': { color: 'warning', label: 'Proses Pembayaran' },
  'menunggu pembayaran berikutnya': { color: 'warning', label: 'Menunggu Pembayaran' },
  selesai: { color: 'success', label: 'Selesai' },
  batal: { color: 'error', label: 'Batal' }
};

const StatusChip = ({ value }) => {
  const cfg = STATUS_CONFIG[(value || '').toLowerCase()];
  return <Chip label={cfg?.label ?? value} color={cfg?.color ?? 'default'} size="small" sx={{ fontWeight: 500, minWidth: 110 }} />;
};

// ─── Tab config ───────────────────────────────────────────────────────────────
// Admin/Manager: 4 tab (Semua, Rawat Jalan, Rawat Inap, Selesai)
// Lainnya: 3 tab (Rawat Jalan, Rawat Inap, Selesai)
const TABS_ADMIN = ['semua', 'rawat-jalan', 'rawat-inap', 'finished'];
const TABS_NON_ADMIN = ['rawat-jalan', 'rawat-inap', 'finished'];

const getTabParams = (tabKey) => {
  switch (tabKey) {
    case 'semua':
      return { status: 'ongoing', typeOfCare: '' };
    case 'rawat-jalan':
      return { status: '', typeOfCare: '1' };
    case 'rawat-inap':
      return { status: '', typeOfCare: '2' };
    case 'finished':
      return { status: 'finished', typeOfCare: '' };
    default:
      return { status: '', typeOfCare: '1' };
  }
};

// Default tab per role
const getDefaultTabKey = (user) => {
  if ([JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName)) return 'rawat-inap';
  return 'rawat-jalan';
};

// Status options per tab untuk filter
const STATUS_OPTIONS = {
  semua: [
    'Menunggu Dokter',
    'Ditolak Dokter',
    'Cek Kondisi Pet',
    'Input Service dan Obat',
    'Proses Rawat Inap',
    'Menunggu Persetujuan Policy',
    'Dalam Perawatan',
    'Menunggu Pembayaran Berikutnya',
    'Proses Pembayaran'
  ],
  'rawat-jalan': ['Menunggu Dokter', 'Ditolak Dokter', 'Cek Kondisi Pet', 'Input Service dan Obat', 'Proses Pembayaran'],
  'rawat-inap': [
    'Proses Rawat Inap',
    'Menunggu Persetujuan Policy',
    'Dalam Perawatan',
    'Menunggu Pembayaran Berikutnya',
    'Proses Pembayaran'
  ],
  finished: ['Selesai', 'Batal']
};

// ─── Mini Dashboard Card ──────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, onClick }) => (
  <Card
    variant="outlined"
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      borderLeft: 4,
      borderColor: `${color}.main`,
      transition: 'box-shadow .15s',
      '&:hover': onClick ? { boxShadow: 3 } : {}
    }}
    onClick={onClick}
  >
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
const TransactionPetClinic = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = isAdminOrManager(user?.role);
  const tabKeys = isAdmin ? TABS_ADMIN : TABS_NON_ADMIN;

  const tabQueryParam = useMemo(() => {
    const t = searchParams.get('tab');
    return tabKeys.includes(t) ? t : getDefaultTabKey(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const tabSelected = tabKeys.indexOf(tabQueryParam);

  const initialParams = useMemo(
    () => ({
      ...getTabParams(tabQueryParam),
      locationId: [],
      customerGroupId: [],
      statusFilter: '',
      startDateFrom: '',
      startDateTo: ''
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabQueryParam]
  );

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getTransactionPetClinicIndex,
    initialParams,
    'search'
  );

  const intl = useIntl();
  const dispatch = useDispatch();

  // ── State ──
  const [stats, setStats] = useState(null);
  const [filterLocationList, setFilterLocationList] = useState([]);
  const [filterCustomerGroupList, setFilterCustomerGroupList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedFilterCustomerGroup, setFilterCustomerGroup] = useState([]);
  const [selectedFilterTypeOfCare, setFilterTypeOfCare] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDateFrom, setFilterStartDateFrom] = useState('');
  const [filterStartDateTo, setFilterStartDateTo] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [formTransactionConfig, setFormTransactionConfig] = useState({ isOpen: false, id: null, queueId: null });
  const [detailTransactionConfig, setDetailTransactionConfig] = useState({ isOpen: false, data: { id: null, locationId: null } });
  const [acceptRejectDialog, setAcceptRejectDialog] = useState({ accept: false, reject: false, transactionId: null });
  const [reassignDialog, setReassignDialog] = useState({ isOpen: false, data: { listDoctor: [], transactionId: null } });
  const [checkConditionPetDialog, setCheckConditionPetDialog] = useState({ isOpen: false, data: {} });
  const [serviceAndRecipeDialog, setServiceAndRecipeDialog] = useState({ isOpen: false, data: {} });
  const [paymentDialog, setPaymentDialog] = useState({ isOpen: false, data: {} });
  const [papanKerjaHarianDialog, setPapanKerjaHarianDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [prepaymentDialog, setPrepaymentDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [additionalTreatmentDialog, setAdditionalTreatmentDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [treatmentDialog, setTreatmentDialog] = useState({ isOpen: false, data: { transactionId: null, locationId: null } });
  const [policyAgreementDialog, setPolicyAgreementDialog] = useState({ isOpen: false, data: { transactionId: null } });

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const resp = await getTransactionPetClinicStats();
      if (resp?.data) setStats(resp.data);
    } catch (_) {
      /* silent */
    }
  }, []);

  useEffect(() => {
    // Set default tab on first load
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: getDefaultTabKey(user) }, { replace: true });
    }
    getLocationList().then(setFilterLocationList);
    getCustomerGroupList().then(setFilterCustomerGroupList);
    fetchStats();
    loaderService.setManualLoader(false);
    loaderGlobalConfig.setLoader(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh stats saat list berubah
  useEffect(() => {
    fetchStats();
  }, [list, fetchStats]);

  // ── Handlers ──
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

  const onClickAdd = () => setFormTransactionConfig((prev) => ({ ...prev, isOpen: true }));

  const onConfirmDelete = async (value) => {
    if (value) {
      await deleteTransactionPetClinic(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess(intl.formatMessage({ id: 'success-delete-transaction' })));
            setParams((_p) => ({ ..._p }));
          }
        })
        .catch((err) => {
          if (err) dispatch(snackbarError(createMessageBackend(err)));
        });
    } else setDialog(false);
  };

  const onExport = async () => {
    await exportTransactionPetClinic(params)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onConfirmAcceptReject = async (val, type) => {
    if (val) {
      await acceptTransactionPetClinic({
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
    } else setAcceptRejectDialog({ accept: false, reject: false, transactionId: null });
  };

  const switchTab = (newTabKey) => {
    setSearchParams({ tab: newTabKey });
    setSelectedRow([]);
    setFilterStatus('');
    setFilterStartDateFrom('');
    setFilterStartDateTo('');
    setParams((prev) => ({
      ...prev,
      ...getTabParams(newTabKey),
      statusFilter: '',
      startDateFrom: '',
      startDateTo: ''
    }));
  };

  const applyAdvancedFilter = () => {
    setParams((prev) => ({ ...prev, statusFilter: filterStatus, startDateFrom: filterStartDateFrom, startDateTo: filterStartDateTo }));
  };

  const resetAdvancedFilter = () => {
    setFilterStatus('');
    setFilterStartDateFrom('');
    setFilterStartDateTo('');
    setParams((prev) => ({ ...prev, statusFilter: '', startDateFrom: '', startDateTo: '' }));
  };

  // ── Columns ──
  const showActionColumn = !(tabQueryParam === 'finished' && user?.role !== CONSTANT_ADMINISTRATOR);

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
                const statusRow = data.row.original.status?.toLowerCase() || '';
                const transactionIdRow = +data.row.original.id;
                const locationIdRow = +data.row.original.locationId;
                const isFinished = ['selesai', 'batal'].includes(statusRow);
                const doReassign = async () => {
                  const getLocations = await getDoctorStaffByLocationList(locationIdRow);
                  setReassignDialog({ isOpen: true, data: { listDoctor: getLocations, transactionId: transactionIdRow } });
                };
                return (
                  <Stack spacing={0.5} direction="row" justifyContent="center" flexWrap="wrap">
                    {/* Edit */}
                    {(isAdmin || user?.jobName === JOB_KASIR) && !isFinished && (
                      <Tooltip title={<FormattedMessage id="edit-transaction" />} arrow>
                        <IconButton
                          size="large"
                          color="primary"
                          onClick={() => setFormTransactionConfig({ isOpen: true, id: transactionIdRow })}
                        >
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Accept/Reject */}
                    {(isAdmin || user?.jobName === JOB_DOKTER) && statusRow === 'menunggu dokter' && (
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
                    {/* Reassign */}
                    {(isAdmin || user?.jobName === JOB_KASIR) && statusRow === 'ditolak dokter' && (
                      <Tooltip title={<FormattedMessage id="reassign" />} arrow>
                        <IconButton size="large" color="warning" onClick={doReassign}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Cek Kondisi Pet */}
                    {(isAdmin || user?.jobName === JOB_DOKTER) && statusRow === 'cek kondisi pet' && (
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
                    {/* Input Service & Resep */}
                    {(isAdmin || user?.jobName === JOB_DOKTER) && statusRow === 'input service dan obat' && (
                      <Tooltip title={<FormattedMessage id="input-service-resep" />} arrow>
                        <IconButton
                          size="large"
                          color="info"
                          onClick={() =>
                            setServiceAndRecipeDialog({
                              isOpen: true,
                              data: { transactionId: transactionIdRow, locationId: locationIdRow }
                            })
                          }
                        >
                          <MedicalServicesIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Input Treatment Plan */}
                    {(isAdmin || user?.jobName === JOB_DOKTER) && statusRow === 'proses rawat inap' && (
                      <Tooltip title={<FormattedMessage id="input-treatment-plan" />} arrow>
                        <IconButton
                          size="large"
                          color="secondary"
                          onClick={() =>
                            setTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                          }
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Menunggu Policy */}
                    {statusRow === 'menunggu persetujuan policy' && (
                      <>
                        {(isAdmin || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="policy-agreement" />} arrow>
                            <IconButton
                              size="large"
                              color="primary"
                              onClick={() => setPolicyAgreementDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <DescriptionIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isAdmin || user?.jobName === JOB_KASIR) && (
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
                      </>
                    )}
                    {/* Dalam Perawatan */}
                    {statusRow === 'dalam perawatan' && (
                      <>
                        {(isAdmin || [JOB_DOKTER, JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName)) && (
                          <Tooltip title={<FormattedMessage id="papan-kerja-harian" />} arrow>
                            <IconButton
                              size="large"
                              color="info"
                              onClick={() => setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <EventNoteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(isAdmin || user?.jobName === JOB_KASIR) && (
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
                        {(isAdmin || user?.jobName === JOB_DOKTER) && (
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
                        {(isAdmin || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="complete-inpatient" />} arrow>
                            <IconButton
                              size="large"
                              color="error"
                              onClick={async () => {
                                try {
                                  await initiateCheckoutPetClinic({ transactionId: transactionIdRow });
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
                    {/* Proses Pembayaran */}
                    {(isAdmin || user?.jobName === JOB_KASIR) && statusRow === 'proses pembayaran' && (
                      <Tooltip title={<FormattedMessage id="process-payment" />} arrow>
                        <IconButton
                          size="large"
                          color="success"
                          onClick={() =>
                            setPaymentDialog({
                              isOpen: true,
                              data: {
                                transactionId: transactionIdRow,
                                locationId: locationIdRow,
                                isInpatient: +data.row.original.typeOfCare === 2
                              }
                            })
                          }
                        >
                          <PointOfSaleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Delete */}
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
        Cell: (data) => (
          <Link
            onClick={() =>
              setDetailTransactionConfig({ isOpen: true, data: { id: data.row.original.id, locationId: data.row.original.locationId } })
            }
            sx={{ cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
          >
            {data.value}
          </Link>
        )
      },
      {
        Header: <FormattedMessage id="patient" />,
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
      ...(isAdmin
        ? [
            {
              Header: <FormattedMessage id="customer-group" />,
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
        : []),
      {
        Header: <FormattedMessage id="period" />,
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
                  <FormattedMessage id="until" /> {end}
                </Typography>
              )}
            </Stack>
          );
        }
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: (data) => <StatusChip value={data.value} />
      },
      {
        Header: <FormattedMessage id="doctor" />,
        accessor: 'picDoctor',
        Cell: (data) => <Typography variant="caption">{data.value || '—'}</Typography>
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showActionColumn, user, tabQueryParam, isAdmin]
  );

  const renderContent = () => (
    <ScrollX>
      <ReactTable
        columns={columns}
        data={list || []}
        colSpanPagination={7}
        totalPagination={totalPagination}
        setPageNumber={params.goToPage}
        setPageRow={params.rowPerPage}
        onGotoPage={goToPage}
        onOrder={orderingChange}
        onPageSize={changeLimit}
      />
    </ScrollX>
  );

  const hasAdvancedFilter = !!(filterStatus || filterStartDateFrom || filterStartDateTo);

  // Tab label dengan badge
  const tabLabel = (key, label) => {
    const countMap = {
      semua: (stats?.rawatJalan ?? 0) + (stats?.rawatInap ?? 0),
      'rawat-jalan': stats?.rawatJalan,
      'rawat-inap': stats?.rawatInap,
      finished: null
    };
    const count = countMap[key];
    return (
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <span>{label}</span>
        {count > 0 && (
          <Chip
            label={count}
            size="small"
            color={key === 'rawat-inap' ? 'info' : key === 'finished' ? 'default' : 'warning'}
            sx={{ height: 18, fontSize: 11, fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }}
          />
        )}
      </Stack>
    );
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="transaction-pet-clinic" />} isBreadcrumb />

      {/* ─── Mini Dashboard Stats ─── */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<LocalHospitalIcon />}
            label={intl.formatMessage({ id: 'outpatient-active' })}
            value={stats?.rawatJalan}
            color="primary"
            onClick={() => switchTab('rawat-jalan')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<HotelIcon />}
            label={intl.formatMessage({ id: 'inpatient-active' })}
            value={stats?.rawatInap}
            color="info"
            onClick={() => switchTab('rawat-inap')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<CheckCircleIcon />}
            label={intl.formatMessage({ id: 'finished-today' })}
            value={stats?.finishedToday}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<PaymentsIcon />}
            label={intl.formatMessage({ id: 'process-payment' })}
            value={stats?.prosesPembayaran}
            color="warning"
            onClick={() => {
              switchTab('semua');
              setFilterStatus('Proses Pembayaran');
              setTimeout(applyAdvancedFilter, 50);
            }}
          />
        </Grid>
      </Grid>

      <MainCard content boxShadow>
        {/* ─── Filter Bar ─── */}
        <Grid container spacing={2} mb={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={isAdmin ? 4 : 6}>
            <GlobalFilter
              placeHolder={intl.formatMessage({ id: 'search' })}
              globalFilter={keyword}
              setGlobalFilter={changeKeyword}
              className="fullWidth"
              style={{ height: '41.3px' }}
            />
          </Grid>
          {/* Admin: Location + Customer Group */}
          {isAdmin && (
            <>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  id="filterLocation"
                  multiple
                  limitTags={1}
                  options={filterLocationList}
                  value={selectedFilterLocation}
                  className="fullWidth"
                  isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                  onChange={(_, sel) => {
                    setFilterLocation(sel);
                    setParams((p) => ({ ...p, locationId: sel.map((d) => d.value) }));
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
                  isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                  onChange={(_, sel) => {
                    setFilterCustomerGroup(sel);
                    setParams((p) => ({ ...p, customerGroupId: sel.map((d) => d.value) }));
                  }}
                  renderInput={(p) => <TextField {...p} label={<FormattedMessage id="customer-group" />} />}
                />
              </Grid>
            </>
          )}
          {/* Admin: Type of Care (tab finished only) */}
          {isAdmin && tabQueryParam === 'finished' && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>
                  <FormattedMessage id="care-type" />
                </InputLabel>
                <Select
                  value={selectedFilterTypeOfCare}
                  label={intl.formatMessage({ id: 'care-type' })}
                  onChange={(e) => {
                    setFilterTypeOfCare(e.target.value);
                    setParams((_p) => ({ ..._p, typeOfCare: e.target.value }));
                  }}
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="all" />
                    </em>
                  </MenuItem>
                  <MenuItem value={1}>
                    <FormattedMessage id="outpatient" />
                  </MenuItem>
                  <MenuItem value={2}>
                    <FormattedMessage id="inpatient" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {/* Action Buttons */}
          <Grid item xs={12} sm={isAdmin ? 12 : 6}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                color={showAdvancedFilter ? 'primary' : 'inherit'}
                onClick={() => setShowAdvancedFilter((v) => !v)}
              >
                <FormattedMessage id="filter-status" />
                {hasAdvancedFilter && (
                  <Chip
                    label={intl.formatMessage({ id: 'active' })}
                    size="small"
                    color="primary"
                    sx={{ ml: 0.5, height: 16, fontSize: 10 }}
                  />
                )}
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              {(isAdmin || user?.jobName === JOB_KASIR) && ['rawat-jalan', 'rawat-inap'].includes(tabQueryParam) && (
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
                  <FormattedMessage id="filter-status" />
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>
                        <FormattedMessage id="filter-status" />
                      </InputLabel>
                      <Select
                        value={filterStatus}
                        label={intl.formatMessage({ id: 'filter-status' })}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>
                            <FormattedMessage id="all" />
                          </em>
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
                      label={intl.formatMessage({ id: 'start-date-from' })}
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
                      label={intl.formatMessage({ id: 'start-date-until' })}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={filterStartDateTo}
                      onChange={(e) => setFilterStartDateTo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" size="small" onClick={applyAdvancedFilter} fullWidth>
                        <FormattedMessage id="apply-filter" />
                      </Button>
                      <Button variant="outlined" size="small" onClick={resetAdvancedFilter} fullWidth>
                        <FormattedMessage id="reset-filter" />
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Grid>
        </Grid>

        {/* ─── Tabs ─── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabSelected} onChange={(_, val) => switchTab(tabKeys[val])} variant="scrollable" scrollButtons="auto">
            {isAdmin && <Tab label={tabLabel('semua', `🏥 ${intl.formatMessage({ id: 'all-active' })}`)} id="tab-0" />}
            <Tab label={tabLabel('rawat-jalan', intl.formatMessage({ id: 'outpatient' }))} id={`tab-${isAdmin ? 1 : 0}`} />
            <Tab label={tabLabel('rawat-inap', intl.formatMessage({ id: 'inpatient' }))} id={`tab-${isAdmin ? 2 : 1}`} />
            <Tab label={tabLabel('finished', intl.formatMessage({ id: 'finished' }))} id={`tab-${isAdmin ? 3 : 2}`} />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          {tabKeys.map((key, idx) => (
            <TabPanel key={key} value={tabSelected} index={idx} name="transaction-list">
              {renderContent()}
            </TabPanel>
          ))}
        </Box>
      </MainCard>

      {/* ─── Modals ─── */}
      {formTransactionConfig.isOpen && (
        <FormTransaction
          open={formTransactionConfig.isOpen}
          id={formTransactionConfig.id}
          queueId={formTransactionConfig.queueId}
          type="pet-clinic"
          defaultTypeOfCare={
            !formTransactionConfig.id ? (tabQueryParam === 'rawat-jalan' ? 1 : tabQueryParam === 'rawat-inap' ? 2 : undefined) : undefined
          }
          onClose={(e) => {
            setFormTransactionConfig({ isOpen: false, id: null, queueId: null });
            if (e) setParams((_p) => ({ ..._p }));
          }}
        />
      )}

      {detailTransactionConfig.isOpen && (
        <TransactionPetClinicDetail
          open={detailTransactionConfig.isOpen}
          data={detailTransactionConfig.data}
          onClose={async (action) => {
            const { id, locationId } = detailTransactionConfig.data;
            if (action === 'edit') setFormTransactionConfig({ isOpen: true, id: +id });
            else if (['accept-patient', 'cancel-patient'].includes(action)) setParams((_p) => ({ ..._p }));
            else if (action === 'delete') {
              setSelectedRow([id]);
              setDialog(true);
            } else if (action === 'reassign') {
              const l = await getDoctorStaffByLocationList(+locationId);
              setReassignDialog({ isOpen: true, data: { listDoctor: l, transactionId: id } });
            } else if (action === 'check-pet-condition') setCheckConditionPetDialog({ isOpen: true, data: { transactionId: id } });
            else if (action === 'service-and-recipe') setServiceAndRecipeDialog({ isOpen: true, data: { transactionId: id, locationId } });
            else if (action === 'papan-kerja-harian') setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: id } });
            else if (action === 'prepayment') setPrepaymentDialog({ isOpen: true, data: { transactionId: id } });
            else if (action === 'additional-treatment') setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: id } });
            else if (action === 'treatment-plan') setTreatmentDialog({ isOpen: true, data: { transactionId: id, locationId } });
            else if (action === 'policy-agreement') setPolicyAgreementDialog({ isOpen: true, data: { transactionId: id } });
            else if (action === 'initiate-checkout') {
              try {
                await initiateCheckoutPetClinic({ transactionId: id });
                dispatch(snackbarSuccess(intl.formatMessage({ id: 'initiate-checkout-success' })));
                setParams((_p) => ({ ..._p }));
              } catch (err) {
                dispatch(snackbarError(createMessageBackend(err)));
              }
            } else if (action === 'payment')
              setPaymentDialog({
                isOpen: true,
                data: { transactionId: id, locationId, isInpatient: detailTransactionConfig.data.typeOfCare === 2 }
              });
            setDetailTransactionConfig({ isOpen: false, data: { id: null, locationId: null } });
          }}
        />
      )}

      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={onConfirmDelete}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      <ConfirmationC
        open={acceptRejectDialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-this-patient" />}
        onClose={(r) => onConfirmAcceptReject(r, 'accept')}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      <FormReject
        open={acceptRejectDialog.reject}
        title={<FormattedMessage id="confirm-and-please-fill-in-the-reasons-for-cancel-this-patient" />}
        onSubmit={(r) => onConfirmAcceptReject(r, 'reject')}
        onClose={() => setAcceptRejectDialog({ accept: false, reject: false, transactionId: null })}
      />

      {reassignDialog.isOpen && (
        <ReassignModalC
          open={reassignDialog.isOpen}
          data={reassignDialog.data}
          onClose={(r) => {
            if (r) setParams((_p) => ({ ..._p }));
            setReassignDialog({ isOpen: false, data: { listDoctor: [], transactionId: null } });
          }}
        />
      )}
      {checkConditionPetDialog.isOpen && (
        <CheckPetConditionPetClinic
          open={checkConditionPetDialog.isOpen}
          data={checkConditionPetDialog.data}
          onClose={(r) => {
            if (r) setParams((_p) => ({ ..._p }));
            setCheckConditionPetDialog({ isOpen: false, data: {} });
          }}
        />
      )}
      {serviceAndRecipeDialog.isOpen && (
        <ServiceAndRecipe
          open={serviceAndRecipeDialog.isOpen}
          data={serviceAndRecipeDialog.data}
          onClose={(r) => {
            if (r) setParams((_p) => ({ ..._p }));
            setServiceAndRecipeDialog({ isOpen: false, data: {} });
          }}
        />
      )}
      {papanKerjaHarianDialog.isOpen && (
        <PapanKerjaHarianPetClinic
          open={papanKerjaHarianDialog.isOpen}
          data={papanKerjaHarianDialog.data}
          onClose={(r) => {
            if (r) setParams((_p) => ({ ..._p }));
            setPapanKerjaHarianDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}
      {prepaymentDialog.isOpen && (
        <PrepaymentPetClinic
          open={prepaymentDialog.isOpen}
          data={prepaymentDialog.data}
          onClose={() => setPrepaymentDialog({ isOpen: false, data: { transactionId: null } })}
        />
      )}
      {additionalTreatmentDialog.isOpen && (
        <AdditionalTreatmentPetClinic
          open={additionalTreatmentDialog.isOpen}
          data={additionalTreatmentDialog.data}
          onClose={() => setAdditionalTreatmentDialog({ isOpen: false, data: { transactionId: null } })}
        />
      )}
      {treatmentDialog.isOpen && (
        <TreatmentPetClinic
          open={treatmentDialog.isOpen}
          data={treatmentDialog.data}
          onClose={(r) => {
            if (r) setParams((_p) => ({ ..._p }));
            setTreatmentDialog({ isOpen: false, data: { transactionId: null, locationId: null } });
          }}
        />
      )}
      {policyAgreementDialog.isOpen && (
        <PolicyAgreementPetClinic
          open={policyAgreementDialog.isOpen}
          data={policyAgreementDialog.data}
          onClose={(r) => {
            if (r) setParams((_p) => ({ ..._p }));
            setPolicyAgreementDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}
      {paymentDialog.isOpen && (
        <Payment
          open={paymentDialog.isOpen}
          data={paymentDialog.data}
          onClose={(r) => {
            if (r) setParams((_p) => ({ ..._p }));
            setPaymentDialog({ isOpen: false, data: {} });
          }}
        />
      )}
    </>
  );
};

export default TransactionPetClinic;
