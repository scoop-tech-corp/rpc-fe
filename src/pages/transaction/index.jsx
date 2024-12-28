import { FormattedMessage, useIntl } from 'react-intl';
import { deleteTransaction, exportTransaction, getCategoryTransactionList, getTransactionDetail, getTransactionIndex } from './service';
import { Button, Stack, Box, Tab, Tabs, Autocomplete, TextField, Grid, Link } from '@mui/material'; // useMediaQuery
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { GlobalFilter } from 'utils/react-table';
import { useEffect, useMemo, useState } from 'react';
import { createMessageBackend, getCustomerGroupList, getLocationList, processDownloadExcel } from 'service/service-global';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import DownloadIcon from '@mui/icons-material/Download';
import ScrollX from 'components/ScrollX';
import FormTransaction from './form-transaction';
import TabPanel from 'components/TabPanelC';
import ConfirmationC from 'components/ConfirmationC';
import useGetList from 'hooks/useGetList';
import useAuth from 'hooks/useAuth';

const Transaction = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getTransactionIndex,
    { status: 'ongoing', locationId: [], customerGroupId: [], serviceCategories: [] },
    'search'
  );

  const [formTransactionConfig, setFormTransactionConfig] = useState({ isOpen: false, data: null });
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [filterLocationList, setFilterLocationList] = useState([]);

  const [selectedFilterCustomerGroup, setFilterCustomerGroup] = useState([]);
  const [filterCustomerGroupList, setFilterCustomerGroupList] = useState([]);

  const [selectedFilterServiceCategory, setFilterServiceCategory] = useState([]);
  const [filterServiceCategoryList, setFilterServiceCategoryList] = useState([]);
  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState(false);

  const onClickAdd = () => {
    setFormTransactionConfig((prevState) => ({ ...prevState, isOpen: true, data: null }));
  };

  const onConfirm = async (value) => {
    if (value) {
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
    } else {
      setDialog(false);
    }
  };

  const onExport = async () => {
    await exportTransaction(params)
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
    const getCateTransaction = await getCategoryTransactionList();

    setFilterLocationList(getLocation);
    setFilterCustomerGroupList(getCustomerGroup);
    setFilterServiceCategoryList(getCateTransaction);

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getDataDropdown();
  }, []);

  const columnCheckbox = () => {
    return user?.role === 'administrator'
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
    return user?.role === 'administrator' ? [{ Header: <FormattedMessage id="customer-group" />, accessor: 'customerGroup' }] : [];
  };

  const columns = useMemo(
    () => [
      ...columnCheckbox(),
      {
        Header: <FormattedMessage id="registration-no" />,
        accessor: 'registrationNo',
        Cell: (data) => {
          const getId = data.row.original.id;

          return (
            <Link
              onClick={async () => {
                const resp = await getTransactionDetail(getId);
                setFormTransactionConfig((prevState) => ({ ...prevState, isOpen: true, data: resp.data }));
              }}
            >
              {data.value}
            </Link>
          );
        }
      },
      { Header: <FormattedMessage id="customer-name" />, accessor: 'firstName' },
      ...columnCustomerGroup(),
      { Header: <FormattedMessage id="service-category" />, accessor: 'serviceCategory' },
      { Header: <FormattedMessage id="start-date" />, accessor: 'startDate' },
      { Header: <FormattedMessage id="end-date" />, accessor: 'endDate' },
      { Header: 'Status', accessor: 'status' },
      { Header: 'PIC Dokter', accessor: 'picDoctor' },
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
              colSpanPagination={11}
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
      <HeaderPageCustom title={<FormattedMessage id="transaction" />} isBreadcrumb={true} />
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
              {user?.role === 'administrator' && (
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
                  <Grid item sm={12} xs={12} md={6}>
                    <Autocomplete
                      id="filterServiceCategory"
                      multiple
                      limitTags={1}
                      options={filterServiceCategoryList}
                      value={selectedFilterServiceCategory}
                      className={'fullWidth'}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, selected) => {
                        setFilterServiceCategory(selected);
                        setParams((prevParams) => ({ ...prevParams, serviceCategories: selected.map((dt) => dt.value) }));
                      }}
                      renderInput={(params) => <TextField {...params} label={<FormattedMessage id="service-category" />} />}
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
                {user?.role === 'administrator' && (
                  <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                    <FormattedMessage id="transaction" />
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => {
              const tabs = ['ongoing', 'finished'];

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
          data={formTransactionConfig.data}
          onClose={(e) => {
            setFormTransactionConfig({ isOpen: false, data: null });
            if (e) setParams((_params) => ({ ..._params }));
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
    </>
  );
};

export default Transaction;
