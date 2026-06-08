import { CheckOutlined, CloseOutlined, DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Autocomplete, Box, Button, Grid, Link, Stack, Tab, Tabs, TextField, Tooltip } from '@mui/material'; // useMediaQuery
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
  CONSTANT_STAFF,
  JOB_HELPER,
  JOB_KASIR,
  JOB_PARAMEDIS,
  JOB_VETNURSE,
  JOB_DOKTER,
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
import { acceptTransactionPetHotel, deleteTransactionPetHotel, exportTransactionPetHotel, getTransactionPetHotelIndex } from './service';
import Payment from './components/payment';
import PapanKerjaHarian from './components/papan-kerja-harian';
import PapanKerjaVetnurse from './components/papan-kerja-vetnurse';
import AdditionalTreatment from './components/additional-treatment';
import ExtendStay from './components/extend-stay';
import Prepayment from './components/prepayment';
import CheckOut from './components/checkout';
import PolicyAgreement from './components/policy-agreement';
import { initiateCheckOut } from './service';

const TransactionPetHotel = () => {
  const { user } = useAuth();
  let [searchParams, setSearchParams] = useSearchParams();
  const tabQueryParam = useMemo(() => {
    return searchParams.get('tab') || 'ongoing';
  }, [searchParams]);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getTransactionPetHotelIndex,
    { status: tabQueryParam, locationId: [], customerGroupId: [] },
    'search'
  );

  const intl = useIntl();
  const dispatch = useDispatch();

  const [formTransactionConfig, setFormTransactionConfig] = useState({ isOpen: false, id: null });
  const [detailTransactionConfig, setDetailTransactionConfig] = useState({ isOpen: false, data: { id: null } });
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [filterLocationList, setFilterLocationList] = useState([]);

  const [selectedFilterCustomerGroup, setFilterCustomerGroup] = useState([]);
  const [filterCustomerGroupList, setFilterCustomerGroupList] = useState([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const columnCustomerGroup = () => {
    return user?.role === CONSTANT_ADMINISTRATOR ? [{ Header: <FormattedMessage id="customer-group" />, accessor: 'customerGroup' }] : [];
  };

  // Kolom action disembunyikan di tab finished untuk non-admin
  const showActionColumn = !(tabQueryParam === 'finished' && user?.role !== CONSTANT_ADMINISTRATOR);

  const columns = useMemo(
    () => [
      ...(showActionColumn ? [{
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        style: { textAlign: 'center' },
        isNotSorting: true,
        Cell: (data) => {
          const statusRow = data.row.original.status;
          const isPetCheckRow = +data.row.original.isPetCheck;
          const transactionIdRow = +data.row.original.id;
          const locationIdRow = +data.row.original.locationId;
          const isTreatmentRow = +data.row.original.isTreatment;

          const doReassign = async () => {
            const getLocations = await getDoctorStaffByLocationList(+data.row.original.locationId);
            setReassignDialog({ isOpen: true, data: { listDoctor: getLocations, transactionId: +data.row.original.id } });
          };

          const isFinished = ['selesai', 'batal'].includes(statusRow?.toLowerCase());

          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              {/* Edit — kasir ke atas, kecuali status selesai/batal/proses check-out untuk kasir */}
              {(isAdminOrManager(user?.role) || (user?.jobName === JOB_KASIR && statusRow?.toLowerCase() !== 'proses check-out')) && !isFinished && (
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

              {/* Accept / Cancel Patient — menunggu dokter, dokter/admin/manager saja (bukan kasir) */}
              {(isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) &&
                statusRow?.toLowerCase() === 'menunggu dokter' && (
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

              {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && statusRow?.toLowerCase() === 'ditolak dokter' && (
                <Tooltip title={<FormattedMessage id="reassign" />} arrow>
                  <IconButton size="large" color="success" onClick={doReassign}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}

              {Boolean(isPetCheckRow) && statusRow?.toLowerCase() === 'cek kondisi pet' && (
                <Tooltip title={<FormattedMessage id="check-pet-condition" />} arrow>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={() => {
                      setCheckConditionPetDialog({ isOpen: true, data: { transactionId: transactionIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {Boolean(isTreatmentRow) && statusRow?.toLowerCase() === 'pet check-in' && (isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER) && (
                <Tooltip title={<FormattedMessage id="treatment" />} arrow>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={() => {
                      setTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'dalam perawatan' &&
                (isAdminOrManager(user?.role) || [JOB_HELPER, JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName)) && (
                <Tooltip title={<FormattedMessage id="papan-kerja-harian" />} arrow>
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => {
                      setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: transactionIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'dalam perawatan' &&
                (isAdminOrManager(user?.role) || [JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName)) && (
                <Tooltip title={<FormattedMessage id="papan-kerja-vetnurse" />} arrow>
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => {
                      setPapanKerjaVetnurseDialog({ isOpen: true, data: { transactionId: transactionIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'menunggu persetujuan policy' &&
                (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                <Tooltip title={<FormattedMessage id="policy-agreement-owner" />} arrow>
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => {
                      setPolicyAgreementDialog({ isOpen: true, data: { transactionId: transactionIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'dalam perawatan' &&
                (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                <Tooltip title={<FormattedMessage id="bayar-dp" />} arrow>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={() => {
                      setPrepaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'dalam perawatan' &&
                (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                <Tooltip title={<FormattedMessage id="extend-stay" />} arrow>
                  <IconButton
                    size="large"
                    color="info"
                    onClick={() => {
                      setExtendStayDialog({ isOpen: true, data: { transactionId: transactionIdRow, currentEndDate: data.row.original.endDate } });
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'dalam perawatan' &&
                (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                <Tooltip title={<FormattedMessage id="additional-treatment" />} arrow>
                  <IconButton
                    size="large"
                    color="secondary"
                    onClick={() => {
                      setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: transactionIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'dalam perawatan' &&
                (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
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
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'proses check-out' &&
                (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                <Tooltip title={<FormattedMessage id="process-checkout-payment" />} arrow>
                  <IconButton
                    size="large"
                    color="success"
                    onClick={() => {
                      setCheckoutDialog({ isOpen: true, data: { transactionId: transactionIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {statusRow?.toLowerCase() === 'menunggu konfirmasi pembayaran' &&
                (isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && (
                <Tooltip title={<FormattedMessage id="confirm-payment" />} arrow>
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => {
                      setPaymentDialog({ isOpen: true, data: { transactionId: transactionIdRow, locationId: locationIdRow } });
                    }}
                  >
                    <ChecklistIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* Delete — admin, selesai atau batal */}
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
      }] : []),
      {
        Header: <FormattedMessage id="registration-no" />,
        accessor: 'registrationNo',
        Cell: (data) => {
          const getId = data.row.original.id;
          const getLocationId = data.row.original.locationId;
          const getEndDate = data.row.original.endDate;

          return (
            <Link
              onClick={() => {
                setDetailTransactionConfig({ isOpen: true, data: { id: getId, locationId: getLocationId, endDate: getEndDate } });
              }}
            >
              {data.value}
            </Link>
          );
        }
      },
      {
        Header: <FormattedMessage id="customer-name" />,
        accessor: 'firstName'
      },
      ...columnCustomerGroup(),
      { Header: <FormattedMessage id="start-date" />, accessor: 'startDate' },
      { Header: <FormattedMessage id="end-date" />, accessor: 'endDate' },
      { Header: 'Status', accessor: 'status' },
      { Header: 'PIC Dokter', accessor: 'picDoctor' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showActionColumn]
  );

  const renderContent = () => {
    return (
      <>
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
      </>
    );
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id={`transaction-pet-hotel`} />} isBreadcrumb={true} />
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
                        setParams((prevParams) => ({ ...prevParams, locationId: selected.map((dt) => dt.value) }));
                      }}
                      renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
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
                        setParams((prevParams) => ({ ...prevParams, customerGroupId: selected.map((dt) => dt.value) }));
                      }}
                      renderInput={(params) => <TextField {...params} label={<FormattedMessage id="customer-group" />} />}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Stack spacing={1}>
              <Stack direction={'row'} justifyContent="flex-end" alignItems="center" spacing={1}>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                {(isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR) && tabQueryParam === 'ongoing' && (
                  <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                    <FormattedMessage id="transaction" />
                  </Button>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => {
              const tabs = ['ongoing', 'finished'];
              setSearchParams({ tab: tabs[value] });

              setTabSelected(value);
              setSelectedRow([]);
              setParams((prevParams) => ({ ...prevParams, status: tabs[value] }));
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
            } else if (action === 'reassign') {
              const listDoctor = await getDoctorStaffByLocationList(+detailTransactionConfig.data.locationId);
              setReassignDialog({ isOpen: true, data: { listDoctor, transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'check-pet-condition') {
              setCheckConditionPetDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'treatment') {
              setTreatmentDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id, locationId: detailTransactionConfig.data.locationId } });
            } else if (action === 'papan-kerja-harian') {
              setPapanKerjaHarianDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'papan-kerja-vetnurse') {
              setPapanKerjaVetnurseDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'additional-treatment') {
              setAdditionalTreatmentDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id } });
            } else if (action === 'extend-stay') {
              setExtendStayDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id, currentEndDate: detailTransactionConfig.data.endDate } });
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
              setPaymentDialog({ isOpen: true, data: { transactionId: detailTransactionConfig.data.id, locationId: detailTransactionConfig.data.locationId } });
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
              // Hanya Kasir / Admin / Manager yang lanjut ke PolicyAgreement
              // Dokter cukup selesai setelah submit treatment
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
