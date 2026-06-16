import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaidIcon from '@mui/icons-material/Paid';
import PaymentsIcon from '@mui/icons-material/Payments';
import PetsIcon from '@mui/icons-material/Pets';
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
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import TabPanel from 'components/TabPanelC';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { CONSTANT_ADMINISTRATOR, CONSTANT_STAFF } from 'constant/role';
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
import { deleteTransactionBreeding, exportTransactionBreeding, getTransactionBreedingIndex, getTransactionBreedingStats } from './service';
import TreatmentBreeding from './components/treatment';
import Payment from './components/payment';

// ─── Status chip config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'menunggu dokter': { color: 'warning', label: 'Menunggu Dokter' },
  'ditolak dokter': { color: 'error', label: 'Ditolak Dokter' },
  'cek kondisi pet': { color: 'info', label: 'Cek Kondisi Pet' },
  'proses pacak': { color: 'primary', label: 'Proses Pacak' },
  'proses pembayaran': { color: 'warning', label: 'Proses Pembayaran' },
  selesai: { color: 'success', label: 'Selesai' },
  batal: { color: 'error', label: 'Batal' }
};

const StatusChip = ({ value }) => {
  const cfg = STATUS_CONFIG[(value || '').toLowerCase()];
  return <Chip label={cfg?.label ?? value} color={cfg?.color ?? 'default'} size="small" sx={{ fontWeight: 500, minWidth: 110 }} />;
};

// ─── Status options per tab untuk filter ─────────────────────────────────────
const STATUS_OPTIONS = {
  ongoing: ['Menunggu Dokter', 'Ditolak Dokter', 'Cek Kondisi Pet', 'Proses Pacak', 'Proses Pembayaran'],
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
  const [formTransactionConfig, setFormTransactionConfig] = useState({ isOpen: false, id: null });
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

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const resp = await getTransactionBreedingStats();
      if (resp?.data) setStats(resp.data);
    } catch (_) {
      /* silent */
    }
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
          const isPetCheckRow = +data.row.original.isPetCheck;
          const transactionIdRow = +data.row.original.id;
          const isTreatmentRow = +data.row.original.isTreatment;
          const locationIdRow = +data.row.original.locationId;

          const doReassign = async () => {
            const getLocations = await getDoctorStaffByLocationList(+data.row.original.locationId);
            setReassignDialog({ isOpen: true, data: { listDoctor: getLocations, transactionId: +data.row.original.id } });
          };

          return (
            <Stack spacing={0.1} direction="row" justifyContent="center">
              {/* ── Ditolak Dokter: Reassign ── */}
              {[CONSTANT_ADMINISTRATOR, CONSTANT_STAFF].includes(user?.role) && statusRow?.toLowerCase() === 'ditolak dokter' && (
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

              {/* ── Treatment (Proses Pacak) ── */}
              {Boolean(isTreatmentRow) && (
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

              {/* ── Proses Pembayaran: Payment ── */}
              {[CONSTANT_ADMINISTRATOR, CONSTANT_STAFF].includes(user?.role) && statusRow?.toLowerCase() === 'proses pembayaran' && (
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
      <HeaderPageCustom title={<FormattedMessage id="transaction-pacak" />} isBreadcrumb={true} />

      {/* ─── Mini Dashboard Stats ─── */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PetsIcon />} label="Pacak Aktif" value={stats?.aktif} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<FavoriteIcon />} label="Dalam Proses" value={stats?.dalamProses} color="secondary" />
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
          onClose={(e) => {
            setFormTransactionConfig({ isOpen: false, id: null });
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
    </>
  );
};

export default TransactionBreeding;
