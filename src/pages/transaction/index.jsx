import { FormattedMessage, useIntl } from 'react-intl';
import {
  deletePetShopTransaction,
  deleteTransaction,
  exportPetShopTransaction,
  exportTransaction,
  getPetShopTransactionIndex,
  getTransactionIndex,
  TabList,
  TransactionType
} from './service';
import { Button, Stack, Box, Tab, Tabs, Autocomplete, TextField, Grid, Link, Tooltip } from '@mui/material'; // useMediaQuery
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { GlobalFilter } from 'utils/react-table';
import { useEffect, useMemo, useState } from 'react';
import {
  createMessageBackend,
  getCustomerGroupList,
  getDoctorStaffByLocationList,
  getLocationList,
  processDownloadExcel
} from 'service/service-global';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { CONSTANT_ADMINISTRATOR, CONSTANT_STAFF } from 'constant/role';
import { useNavigate, useNavigation, useSearchParams } from 'react-router-dom';

import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import DownloadIcon from '@mui/icons-material/Download';
import ScrollX from 'components/ScrollX';
import FormTransaction from './form-transaction';
import TabPanel from 'components/TabPanelC';
import ConfirmationC from 'components/ConfirmationC';
import useGetList from 'hooks/useGetList';
import useAuth from 'hooks/useAuth';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TransactionDetail from './detail';
import CheckPetCondition from './check-pet-condition';
import PropTypes from 'prop-types';
import ReassignModalC from './reassign';
import TransactionDetailPetShop from './pages/pet-shop/detail';

const Transaction = (props) => {
  const { type } = props;
  const { user } = useAuth();
  let [searchParams, setSearchParams] = useSearchParams();
  const tabQueryParam = useMemo(() => {
    if (type !== 'pet-shop') {
      return searchParams.get('tab') || 'ongoing';
    }
  }, [searchParams, type]);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    type === 'pet-shop' ? getPetShopTransactionIndex : getTransactionIndex,
    { status: tabQueryParam, locationId: [], customerGroupId: [], serviceCategories: [TransactionType[type]] },
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
  const [reassignDialog, setReassignDialog] = useState({ isOpen: false, data: { listDoctor: [], transactionId: null } });
  const [checkConditionPetDialog, setCheckConditionPetDialog] = useState({ isOpen: false, data: { transactionId: null } });
  const navigate = useNavigate();

  const onClickAdd = () => {
    setFormTransactionConfig((prevState) => ({ ...prevState, isOpen: true }));
  };

  const onClickCreatePetShopTransaction = () => {
    navigate('/transaction/pet-shop/create');
  };

  const onConfirm = async (value) => {
    if (value) {
      if (type === 'pet-shop') {
        await deletePetShopTransaction(selectedRow)
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
        await deleteTransaction(selectedRow)
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
      }
    } else {
      setDialog(false);
    }
  };

  const onExport = async () => {
    if (type === 'pet-shop') {
      await exportPetShopTransaction()
        .then(processDownloadExcel)
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      await exportTransaction(params)
        .then(processDownloadExcel)
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
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
    if (type !== 'pet-shop') {
      setSearchParams({ tab: tabQueryParam });
      setTabSelected(TabList[tabQueryParam]);
    }

    getDataDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return user?.role === CONSTANT_ADMINISTRATOR ? [{ Header: <FormattedMessage id="customer-group" />, accessor: 'customerGroup' }] : [];
  };

  const columnServiceCategory = () => {
    return !['pet-salon', 'pet-clinic', 'pet-shop'].includes(type)
      ? [{ Header: <FormattedMessage id="service-category" />, accessor: 'serviceCategory' }]
      : [];
  };

  const columnAction = () => {
    return !['pet-shop'].includes(type)
      ? [
          {
            Header: <FormattedMessage id="action" />,
            accessor: 'action',
            style: { textAlign: 'center' },
            isNotSorting: true,
            Cell: (data) => {
              const statusRow = data.row.original.status;
              const isPetCheckRow = +data.row.original.isPetCheck;
              const transactionIdRow = +data.row.original.id;

              const doReassign = async () => {
                const getLocations = await getDoctorStaffByLocationList(+data.row.original.locationId);
                setReassignDialog({ isOpen: true, data: { listDoctor: getLocations, transactionId: +data.row.original.id } });
              };

              return (
                <Stack spacing={0.1} direction={'row'} justifyContent="center">
                  {[CONSTANT_ADMINISTRATOR, CONSTANT_STAFF].includes(user?.role) && statusRow?.toLowerCase() === 'ditolak dokter' && (
                    <Tooltip title={'Reassign'} arrow>
                      <IconButton size="large" color="success" onClick={doReassign}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {Boolean(isPetCheckRow) && (
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
                </Stack>
              );
            }
          }
        ]
      : [];
  };

  const columnStartEndDate = () => {
    return !['pet-shop'].includes(type)
      ? [
          { Header: <FormattedMessage id="start-date" />, accessor: 'startDate' },
          { Header: <FormattedMessage id="end-date" />, accessor: 'endDate' }
        ]
      : [];
  };

  const columnStatus = () => {
    return !['pet-shop'].includes(type) ? [{ Header: 'Status', accessor: 'status' }] : [];
  };

  const columnPicDoctor = () => {
    return !['pet-shop'].includes(type) ? [{ Header: 'PIC Dokter', accessor: 'picDoctor' }] : [];
  };

  const columnBranch = () => {
    return ['pet-shop'].includes(type) ? [{ Header: <FormattedMessage id="branch" />, accessor: 'locationName' }] : [];
  };

  const columnTotalItem = () => {
    return ['pet-shop'].includes(type) ? [{ Header: <FormattedMessage id="total-item" />, accessor: 'totalItem' }] : [];
  };

  const columnTotalUsePromo = () => {
    return ['pet-shop'].includes(type) ? [{ Header: <FormattedMessage id="total-use-promo" />, accessor: 'totalUsePromo' }] : [];
  };

  const columnAmountTransaction = () => {
    return ['pet-shop'].includes(type) ? [{ Header: <FormattedMessage id="amount-transaction" />, accessor: 'totalAmount' }] : [];
  };

  const columnCustomerName = () => {
    return [{ Header: <FormattedMessage id="customer-name" />, accessor: ['pet-shop'].includes(type) ? 'customerName' : 'firstName' }];
  };

  const columns = useMemo(
    () => [
      ...columnCheckbox(),
      ...columnAction(),
      {
        Header: <FormattedMessage id="registration-no" />,
        accessor: 'registrationNo',
        Cell: (data) => {
          const getId = data.row.original.id;

          return (
            <Link
              onClick={() => {
                setDetailTransactionConfig({ isOpen: true, data: { id: getId } });
              }}
            >
              {data.value}
            </Link>
          );
        }
      },
      ...columnBranch(),
      ...columnCustomerName(),
      ...columnCustomerGroup(),
      ...columnTotalItem(),
      ...columnTotalUsePromo(),
      ...columnAmountTransaction(),
      ...columnServiceCategory(),
      ...columnStartEndDate(),
      ...columnStatus(),
      ...columnPicDoctor(),
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
      <HeaderPageCustom title={<FormattedMessage id={`transaction-${type}`} />} isBreadcrumb={true} />
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
                {(user?.role === CONSTANT_ADMINISTRATOR || user?.role === CONSTANT_STAFF) && tabQueryParam === 'ongoing' && (
                  <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                    <FormattedMessage id="transaction" />
                  </Button>
                )}
                {(user?.role === CONSTANT_ADMINISTRATOR || user?.role === CONSTANT_STAFF) && type === 'pet-shop' && (
                  <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickCreatePetShopTransaction}>
                    <FormattedMessage id="new" />
                  </Button>
                )}
              </Stack>
              {selectedRow.length > 0 && (
                <Stack direction={'row'} justifyContent="flex-end" alignItems="center" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<DeleteFilled />}
                    color="error"
                    onClick={() => setDialog(true)}
                    style={{ width: 100 }}
                  >
                    <FormattedMessage id="delete" />
                  </Button>
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Hide tab for pet shop */}
        {type !== 'pet-shop' && (
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
        )}
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
          id={formTransactionConfig.id}
          type={TransactionType[type]}
          onClose={(e) => {
            setFormTransactionConfig({ isOpen: false, id: null });
            if (e) setParams((_params) => ({ ..._params }));
          }}
        />
      )}

      {detailTransactionConfig.isOpen && type === 'pet-shop' ? (
        <TransactionDetailPetShop
          open={detailTransactionConfig.isOpen}
          data={detailTransactionConfig.data}
          onClose={async () => {
            setDetailTransactionConfig({ isOpen: false, data: { id: null } });
          }}
        />
      ) : detailTransactionConfig.isOpen ? (
        <TransactionDetail
          open={detailTransactionConfig.isOpen}
          data={detailTransactionConfig.data}
          onClose={async (action) => {
            if (action === 'edit') {
              setFormTransactionConfig({ isOpen: true, id: detailTransactionConfig.data.id });
            } else if (['accept-patient', 'cancel-patient'].includes(action)) {
              setParams((_params) => ({ ..._params }));
            }

            setDetailTransactionConfig({ isOpen: false, data: { id: null } });
          }}
        />
      ) : null}

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
    </>
  );
};

Transaction.propTypes = {
  type: PropTypes.string
};

export default Transaction;
