import { CheckOutlined, CloseOutlined, DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Autocomplete,
  Box,
  Button,
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
  Tooltip
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
import {
  CONSTANT_ADMINISTRATOR,
  CONSTANT_MANAGER,
  JOB_DOKTER,
  JOB_KASIR,
  JOB_PARAMEDIS,
  JOB_VETNURSE,
  isAdminOrManager
} from 'constant/role';
import useAuth from 'hooks/useAuth';
import useGetList from 'hooks/useGetList';
import { useEffect, useMemo, useState } from 'react';
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
import { TabList } from '../../service';
import TransactionPetClinicDetail from './detail';
import FormTransaction from 'pages/transaction/form-transaction';
import ReassignModalC from 'pages/transaction/reassign';
import CheckPetConditionPetClinic from './components/check-pet-condition';
import ServiceAndRecipe from './components/service-recipe';
import Payment from './components/payment';
import PrepaymentPetClinic from './components/prepayment';
import AdditionalTreatmentPetClinic from './components/additional-treatment';
import PapanKerjaHarianPetClinic from './components/papan-kerja-harian';
import {
  TYPE_OF_CARE,
  getTransactionPetClinicIndex,
  deleteTransactionPetClinic,
  acceptTransactionPetClinic,
  exportTransactionPetClinic,
  initiateCheckoutPetClinic
} from './service.jsx';

const TransactionPetClinic = () => {
  const { user } = useAuth();
  let [searchParams, setSearchParams] = useSearchParams();
  const tabQueryParam = useMemo(() => searchParams.get('tab') || 'rawat-jalan', [searchParams]);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getTransactionPetClinicIndex,
    { status: tabQueryParam === 'finished' ? tabQueryParam : '', locationId: [], customerGroupId: [], typeOfCare: '1' },
    'search'
  );

  const intl = useIntl();
  const dispatch = useDispatch();

  const [formTransactionConfig, setFormTransactionConfig] = useState({ isOpen: false, id: null });
  const [detailTransactionConfig, setDetailTransactionConfig] = useState({ isOpen: false, data: { id: null, locationId: null } });
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [filterLocationList, setFilterLocationList] = useState([]);
  const [selectedFilterCustomerGroup, setFilterCustomerGroup] = useState([]);
  const [filterCustomerGroupList, setFilterCustomerGroupList] = useState([]);
  const [selectedFilterTypeOfCare, setFilterTypeOfCare] = useState('');

  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState(false);

  // Accept / Reject
  const [acceptRejectDialog, setAcceptRejectDialog] = useState({ accept: false, reject: false, transactionId: null });

  // Per-step modals
  const [reassignDialog, setReassignDialog] = useState({ isOpen: false, data: { listDoctor: [], transactionId: null } });
  const [checkConditionPetDialog, setCheckConditionPetDialog] = useState({ isOpen: false, data: {} });
  const [serviceAndRecipeDialog, setServiceAndRecipeDialog] = useState({ isOpen: false, data: {} });
  const [paymentDialog, setPaymentDialog] = useState({ isOpen: false, data: {} });

  // Rawat inap modals
  const [papanKerjaHarianDialog, setPapanKerjaHarianDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [prepaymentDialog, setPrepaymentDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const [additionalTreatmentDialog, setAdditionalTreatmentDialog] = useState({ isOpen: false, data: { transactionId: null } });

  // ─── Handlers ────────────────────────────────────────────────────────────

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
    } else {
      setDialog(false);
    }
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
    setTabSelected(TabList[tabQueryParam] ?? 0);
    getDataDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Column helpers ───────────────────────────────────────────────────────

  const columnCustomerGroup = () =>
    user?.role === CONSTANT_ADMINISTRATOR
      ? [{ Header: <FormattedMessage id="customer-group" />, accessor: 'customerGroup' }]
      : [];

  // Di tab finished, non-admin tidak perlu kolom action
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
                  <Stack spacing={0.1} direction={'row'} justifyContent="center">

                    {/* ── Edit: admin/manager/kasir, non-finished ── */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && !isFinished && (
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

                    {/* ── Accept / Reject: menunggu dokter ── */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) &&
                      statusRow === 'menunggu dokter' && (
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

                    {/* ── Reassign: ditolak dokter ── */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) &&
                      statusRow === 'ditolak dokter' && (
                      <Tooltip title={<FormattedMessage id="reassign" />} arrow>
                        <IconButton size="large" color="success" onClick={doReassign}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* ── Cek Kondisi Pet: dokter/admin/manager ── */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) &&
                      statusRow === 'cek kondisi pet' && (
                      <Tooltip title={<FormattedMessage id="check-pet-condition" />} arrow>
                        <IconButton
                          size="large"
                          color="success"
                          onClick={() => setCheckConditionPetDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                        >
                          <ChecklistIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* ── Input Service & Resep: dokter/admin/manager ── */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) &&
                      statusRow === 'input service dan obat' && (
                      <Tooltip title={<FormattedMessage id="service-and-recipe" />} arrow>
                        <IconButton
                          size="large"
                          color="success"
                          onClick={() =>
                            setServiceAndRecipeDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                          }
                        >
                          <ChecklistIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* ── Dalam Perawatan (rawat inap) ── */}
                    {statusRow === 'dalam perawatan' && (
                      <>
                        {/* Papan Kerja Harian: dokter/vetnurse/paramedis/admin/manager */}
                        {(isAdminOrManager(user?.role) || [JOB_DOKTER, JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName)) && (
                          <Tooltip title={<FormattedMessage id="papan-kerja-harian" />} arrow>
                            <IconButton
                              size="large"
                              color="warning"
                              onClick={() => setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <ChecklistIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Bayar DP: kasir/admin/manager */}
                        {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="bayar-dp" />} arrow>
                            <IconButton
                              size="large"
                              color="success"
                              onClick={() => setPrepaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <ChecklistIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Tindakan Tambahan: dokter/admin/manager */}
                        {(isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) && (
                          <Tooltip title={<FormattedMessage id="additional-treatment" />} arrow>
                            <IconButton
                              size="large"
                              color="secondary"
                              onClick={() => setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow } })}
                            >
                              <ChecklistIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Initiate Checkout → Proses Pembayaran: kasir/admin/manager */}
                        {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                          <Tooltip title={<FormattedMessage id="initiate-checkout" />} arrow>
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
                              <ChecklistIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}

                    {/* ── Proses Pembayaran: kasir/admin/manager ── */}
                    {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) &&
                      statusRow === 'proses pembayaran' && (
                      <Tooltip title={<FormattedMessage id="payment" />} arrow>
                        <IconButton
                          size="large"
                          color="success"
                          onClick={() =>
                            setPaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } })
                          }
                        >
                          <ChecklistIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* ── Delete: admin saja, status selesai/batal ── */}
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
          const locationId = data.row.original.locationId;

          return (
            <Link
              onClick={() => setDetailTransactionConfig({ isOpen: true, data: { id: getId, locationId } })}
            >
              {data.value}
            </Link>
          );
        }
      },
      { Header: <FormattedMessage id="customer-name" />, accessor: 'firstName' },
      ...columnCustomerGroup(),
      { Header: <FormattedMessage id="type-of-care" />, accessor: 'typeOfCare', Cell: (data) => TYPE_OF_CARE[+data.value] },
      { Header: <FormattedMessage id="start-date" />, accessor: 'startDate' },
      { Header: <FormattedMessage id="end-date" />, accessor: 'endDate' },
      { Header: 'Status', accessor: 'status' },
      { Header: 'PIC Dokter', accessor: 'picDoctor' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showActionColumn, user]
  );

  const renderContent = () => (
    <Stack spacing={3}>
      <ScrollX>
        <ReactTable
          columns={columns}
          data={list || []}
          colSpanPagination={12}
          totalPagination={totalPagination}
          setPageNumber={params.goToPage}
          setPageRow={params.rowPerPage}
          onGotoPage={goToPage}
          onOrder={orderingChange}
          onPageSize={changeLimit}
        />
      </ScrollX>
    </Stack>
  );

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id={'transaction-pet-clinic'} />} isBreadcrumb={true} />
      <MainCard content={true} boxShadow>
        <Grid container spacing={2} width={'100%'} marginBottom={'20px'}>
          <Grid item sm={12} xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item sm={12} xs={12} md={6}>
                <GlobalFilter
                  placeHolder={intl.formatMessage({ id: 'search' })}
                  globalFilter={keyword}
                  setGlobalFilter={changeKeyword}
                  className={'fullWidth'}
                  style={{ height: '41.3px' }}
                />
              </Grid>
              {user?.role === CONSTANT_ADMINISTRATOR && (
                <>
                  <Grid item sm={12} xs={12} md={6}>
                    <Autocomplete
                      id="filterLocation"
                      multiple
                      limitTags={1}
                      options={filterLocationList}
                      value={selectedFilterLocation}
                      className={'fullWidth'}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, selected) => {
                        setFilterLocation(selected);
                        setParams((prev) => ({ ...prev, locationId: selected.map((dt) => dt.value) }));
                      }}
                      renderInput={(p) => <TextField {...p} label={<FormattedMessage id="filter-location" />} />}
                    />
                  </Grid>
                  <Grid item sm={12} xs={12} md={6}>
                    <Autocomplete
                      id="filter-customer-group"
                      multiple
                      limitTags={1}
                      options={filterCustomerGroupList}
                      value={selectedFilterCustomerGroup}
                      className={'fullWidth'}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, selected) => {
                        setFilterCustomerGroup(selected);
                        setParams((prev) => ({ ...prev, customerGroupId: selected.map((dt) => dt.value) }));
                      }}
                      renderInput={(p) => <TextField {...p} label={<FormattedMessage id="customer-group" />} />}
                    />
                  </Grid>
                  {tabQueryParam === 'finished' && (
                    <Grid item sm={12} xs={12} md={6}>
                      <FormControl style={{ width: '100%' }}>
                        <InputLabel>
                          <FormattedMessage id="type-of-care" />
                        </InputLabel>
                        <Select
                          id="filter-type-of-care"
                          value={selectedFilterTypeOfCare}
                          onChange={(event) => {
                            setFilterTypeOfCare(event.target.value);
                            setParams((_p) => ({ ..._p, typeOfCare: event.target.value }));
                          }}
                        >
                          <MenuItem value="">
                            <em>
                              <FormattedMessage id="select-type" />
                            </em>
                          </MenuItem>
                          <MenuItem value={1}>
                            <FormattedMessage id="outpatient-care" />
                          </MenuItem>
                          <MenuItem value={2}>
                            <FormattedMessage id="inpatient-care" />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            <Stack direction={'row'} justifyContent="flex-end" alignItems="center" spacing={1}>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) &&
                (tabQueryParam === 'rawat-jalan' || tabQueryParam === 'rawat-inap') && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="transaction" />
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => {
              const tabs = ['rawat-jalan', 'rawat-inap', 'finished'];
              setSearchParams({ tab: tabs[value] });
              setTabSelected(value);
              setSelectedRow([]);
              setParams((prev) => {
                if (tabs[value] === 'finished') return { ...prev, status: tabs[value], typeOfCare: '' };
                const typeOfCare = tabs[value] === 'rawat-jalan' ? '1' : '2';
                return { ...prev, status: '', typeOfCare };
              });
            }}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="transaction list tab"
          >
            <Tab label={<FormattedMessage id="outpatient-care" />} id="tab-0" aria-controls="tabpanel-0" />
            <Tab label={<FormattedMessage id="inpatient-care" />} id="tab-1" aria-controls="tabpanel-1" />
            <Tab label={<FormattedMessage id="finished" />} id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="transaction-list">{renderContent()}</TabPanel>
          <TabPanel value={tabSelected} index={1} name="transaction-list">{renderContent()}</TabPanel>
          <TabPanel value={tabSelected} index={2} name="transaction-list">{renderContent()}</TabPanel>
        </Box>
      </MainCard>

      {/* ─── Form Transaksi Baru / Edit ─── */}
      {formTransactionConfig.isOpen && (
        <FormTransaction
          open={formTransactionConfig.isOpen}
          id={formTransactionConfig.id}
          type="pet-clinic"
          onClose={(e) => {
            setFormTransactionConfig({ isOpen: false, id: null });
            if (e) setParams((_p) => ({ ..._p }));
          }}
        />
      )}

      {/* ─── Detail Transaksi ─── */}
      {detailTransactionConfig.isOpen && (
        <TransactionPetClinicDetail
          open={detailTransactionConfig.isOpen}
          data={detailTransactionConfig.data}
          onClose={async (action) => {
            if (action === 'edit') {
              setFormTransactionConfig({ isOpen: true, id: +detailTransactionConfig.data.id });
            } else if (['accept-patient', 'cancel-patient'].includes(action)) {
              setParams((_p) => ({ ..._p }));
            } else if (action === 'delete') {
              setSelectedRow([detailTransactionConfig.data.id]);
              setDialog(true);
            } else if (action === 'reassign') {
              const listDoctor = await getDoctorStaffByLocationList(+detailTransactionConfig.data.locationId);
              setReassignDialog({ isOpen: true, data: { listDoctor, transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'check-pet-condition') {
              setCheckConditionPetDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'service-and-recipe') {
              setServiceAndRecipeDialog({
                isOpen: true,
                data: { transactionId: detailTransactionConfig.data.id, locationId: detailTransactionConfig.data.locationId }
              });
            } else if (action === 'papan-kerja-harian') {
              setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'prepayment') {
              setPrepaymentDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'additional-treatment') {
              setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'initiate-checkout') {
              try {
                await initiateCheckoutPetClinic({ transactionId: detailTransactionConfig.data.id });
                dispatch(snackbarSuccess(intl.formatMessage({ id: 'initiate-checkout-success' })));
                setParams((_p) => ({ ..._p }));
              } catch (err) {
                dispatch(snackbarError(createMessageBackend(err)));
              }
            } else if (action === 'payment') {
              setPaymentDialog({
                isOpen: true,
                data: { transactionId: detailTransactionConfig.data.id, locationId: detailTransactionConfig.data.locationId }
              });
            }
            setDetailTransactionConfig({ isOpen: false, data: { id: null, locationId: null } });
          }}
        />
      )}


      {/* ─── Konfirmasi Hapus ─── */}
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirmDelete(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      {/* ─── Accept Patient ─── */}
      <ConfirmationC
        open={acceptRejectDialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-this-patient" />}
        onClose={(response) => onConfirmAcceptReject(response, 'accept')}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      {/* ─── Reject Patient ─── */}
      <FormReject
        open={acceptRejectDialog.reject}
        title={<FormattedMessage id="confirm-and-please-fill-in-the-reasons-for-cancel-this-patient" />}
        onSubmit={(response) => onConfirmAcceptReject(response, 'reject')}
        onClose={() => setAcceptRejectDialog({ accept: false, reject: false, transactionId: null })}
      />

      {/* ─── Reassign ─── */}
      {reassignDialog.isOpen && (
        <ReassignModalC
          open={reassignDialog.isOpen}
          data={reassignDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_p) => ({ ..._p }));
            setReassignDialog({ isOpen: false, data: { listDoctor: [], transactionId: null } });
          }}
        />
      )}

      {/* ─── Cek Kondisi Pet ─── */}
      {checkConditionPetDialog.isOpen && (
        <CheckPetConditionPetClinic
          open={checkConditionPetDialog.isOpen}
          data={checkConditionPetDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_p) => ({ ..._p }));
            setCheckConditionPetDialog({ isOpen: false, data: {} });
          }}
        />
      )}

      {/* ─── Input Service & Resep ─── */}
      {serviceAndRecipeDialog.isOpen && (
        <ServiceAndRecipe
          open={serviceAndRecipeDialog.isOpen}
          data={serviceAndRecipeDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_p) => ({ ..._p }));
            setServiceAndRecipeDialog({ isOpen: false, data: {} });
          }}
        />
      )}

      {/* ─── Papan Kerja Harian (rawat inap) ─── */}
      {papanKerjaHarianDialog.isOpen && (
        <PapanKerjaHarianPetClinic
          open={papanKerjaHarianDialog.isOpen}
          data={papanKerjaHarianDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_p) => ({ ..._p }));
            setPapanKerjaHarianDialog({ isOpen: false, data: { transactionId: null } });
          }}
        />
      )}

      {/* ─── Bayar DP (rawat inap) ─── */}
      {prepaymentDialog.isOpen && (
        <PrepaymentPetClinic
          open={prepaymentDialog.isOpen}
          data={prepaymentDialog.data}
          onClose={() => setPrepaymentDialog({ isOpen: false, data: { transactionId: null } })}
        />
      )}

      {/* ─── Tindakan Tambahan (rawat inap) ─── */}
      {additionalTreatmentDialog.isOpen && (
        <AdditionalTreatmentPetClinic
          open={additionalTreatmentDialog.isOpen}
          data={additionalTreatmentDialog.data}
          onClose={() => setAdditionalTreatmentDialog({ isOpen: false, data: { transactionId: null } })}
        />
      )}

      {/* ─── Pembayaran ─── */}
      {paymentDialog.isOpen && (
        <Payment
          open={paymentDialog.isOpen}
          data={paymentDialog.data}
          onClose={(resp) => {
            if (resp) setParams((_p) => ({ ..._p }));
            setPaymentDialog({ isOpen: false, data: {} });
          }}
        />
      )}
    </>
  );
};

export default TransactionPetClinic;
