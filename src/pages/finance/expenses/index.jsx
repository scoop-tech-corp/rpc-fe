import { FormattedMessage, useIntl } from 'react-intl';
import { TabList } from './service';
import { Button, Stack, Box, Tab, Tabs, Autocomplete, TextField, Grid, Chip, Typography, CircularProgress } from '@mui/material';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { useEffect, useMemo, useState } from 'react';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { CONSTANT_ADMINISTRATOR } from 'constant/role';
import { useSearchParams } from 'react-router-dom';
import {
  getFinanceExpensesIndex,
  exportFinanceExpenses,
  deleteFinanceExpense,
  getFinanceExpenseDetail,
  approvalFinanceExpense
} from './service';

import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import DownloadIcon from '@mui/icons-material/Download';
import ScrollX from 'components/ScrollX';
import TabPanel from 'components/TabPanelC';
import useGetList from 'hooks/useGetList';
import useAuth from 'hooks/useAuth';
import RefreshIcon from '@mui/icons-material/Refresh';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';
import { DeleteFilled } from '@ant-design/icons';
import ConfirmationC from 'components/ConfirmationC';
import FormExpense from './components/form-expense';
import ViewExpense from './components/view-expense';

const STATUS_COLOR = {
  paid: 'success',
  approved: 'success',
  unpaid: 'warning',
  pending: 'warning',
  overdue: 'error',
  rejected: 'error'
};

const FinanceExpenses = () => {
  const { user } = useAuth();
  const intl = useIntl();
  const dispatch = useDispatch();
  let [searchParams, setSearchParams] = useSearchParams();
  const tabQueryParam = searchParams.get('tab') || 'pending';

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getFinanceExpensesIndex,
    { status: tabQueryParam, locationId: [], dateFrom: '', dateTo: '' },
    'search'
  );

  const [tabSelected, setTabSelected] = useState(0);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [filterLocationList, setFilterLocationList] = useState([]);
  const [filterDateRange, setFilterDateRange] = useState([null, null]);
  const [formExpenseOpen, setFormExpenseOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetailData, setViewDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [dialogApprove, setDialogApprove] = useState({ isOpen: false, id: null });
  const [dialogReject, setDialogReject] = useState({ isOpen: false, id: null });

  const getDataDropdown = async () => {
    const getLocation = await getLocationList();
    setFilterLocationList(getLocation);
  };

  useEffect(() => {
    setSearchParams({ tab: tabQueryParam });
    setTabSelected(TabList[tabQueryParam]);
    getDataDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExport = async () => {
    await exportFinanceExpenses(params)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onRefresh = () => {
    setFilterLocation([]);
    setFilterDateRange([null, null]);
    setParams((prev) => ({ ...prev, locationId: [], dateFrom: '', dateTo: '' }));
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteFinanceExpense(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Expense'));
            setParams((prev) => ({ ...prev }));
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

  const onApprove = async (val) => {
    if (val) {
      await approvalFinanceExpense({ id: dialogApprove.id, statusApproval: 'Approved' })
        .then((resp) => {
          if (resp.status === 200) {
            setDialogApprove({ isOpen: false, id: null });
            dispatch(snackbarSuccess('Success Approve Expense'));
            setParams((prev) => ({ ...prev }));
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialogApprove({ isOpen: false, id: null });
    }
  };

  const onReject = async () => {
    await approvalFinanceExpense({ id: dialogReject.id, statusApproval: 'Rejected' })
      .then((resp) => {
        if (resp.status === 200) {
          setDialogReject({ isOpen: false, id: null });
          dispatch(snackbarSuccess('Success Reject Expense'));
          setParams((prev) => ({ ...prev }));
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const columns = useMemo(
    () => [
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
        style: {
          width: '10px'
        }
      },
      {
        Header: 'No Ref.',
        accessor: 'referenceNo',
        Cell: (data) => {
          return (
            <Typography
              sx={{
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5
              }}
              onClick={async () => {
                setLoadingDetail(true);
                try {
                  const resp = await getFinanceExpenseDetail(data.row.original.id);
                  const detail = resp.data?.data || resp.data?.detail || resp.data;
                  setViewDetailData(detail);
                  setViewModalOpen(true);
                } catch (err) {
                  dispatch(snackbarError(createMessageBackend(err)));
                } finally {
                  setLoadingDetail(false);
                }
              }}
            >
              {loadingDetail ? <CircularProgress size={16} /> : null}
              {data.value}
            </Typography>
          );
        }
      },
      { Header: 'Tanggal', accessor: 'transactionDate' },
      { Header: 'Category', accessor: 'categoryName' },
      { Header: 'Vendor', accessor: 'vendorName' },
      { Header: 'Cabang', accessor: 'locationName' },
      {
        Header: 'Total Amount',
        accessor: 'totalAmount',
        Cell: (data) => {
          return <span style={{ textAlign: 'right', display: 'block' }}>{data.value ? formatThousandSeparator(data.value) : '-'}</span>;
        }
      },
      {
        Header: 'Status',
        accessor: 'paymentStatusName',
        Cell: (data) => {
          const status = (data.value || '').toLowerCase();
          const color = STATUS_COLOR[status] || 'default';
          return <Chip label={data.value} color={color} size="small" variant="outlined" />;
        }
      },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: 'Approved By',
        accessor: 'approvedBy',
        Cell: (data) => {
          return data.value || '-';
        }
      },
      {
        Header: 'Approved At',
        accessor: 'approvalDate',
        Cell: (data) => {
          return data.value || '-';
        }
      },
      ...(tabQueryParam === 'pending'
        ? [
            {
              Header: 'Action',
              accessor: 'action',
              isNotSorting: true,
              style: { width: '210px' },
              Cell: (data) => {
                const getId = data.row.original.id;
                return (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => setDialogApprove({ isOpen: true, id: getId })}
                      sx={{ mr: 1 }}
                    >
                      <FormattedMessage id="approve" />
                    </Button>
                    <Button variant="contained" color="error" size="small" onClick={() => setDialogReject({ isOpen: true, id: getId })}>
                      <FormattedMessage id="reject" />
                    </Button>
                  </>
                );
              }
            }
          ]
        : [])
    ],
    [dispatch, loadingDetail, tabQueryParam]
  );

  const renderContent = () => {
    return (
      <Stack spacing={3}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={list || []}
            totalPagination={totalPagination}
            setPageNumber={params.goToPage}
            setPageRow={params.rowPerPage}
            onGotoPage={goToPage}
            onOrder={orderingChange}
            onPageSize={changeLimit}
            colSpanPagination={12}
          />
        </ScrollX>
      </Stack>
    );
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id={'expense'} />} isBreadcrumb={true} />
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
                    renderInput={(params) => <TextField {...params} label={<FormattedMessage id={'location'} />} />}
                  />
                </Grid>
              )}
              <Grid item sm={12} xs={12} md={6}>
                <DateRangePicker
                  onChange={(value) => {
                    setFilterDateRange(value);
                    setParams((prev) => ({
                      ...prev,
                      dateFrom: value && value[0] ? dayjs(value[0]).format('YYYY-MM-DD') : '',
                      dateTo: value && value[1] ? dayjs(value[1]).format('YYYY-MM-DD') : ''
                    }));
                  }}
                  value={filterDateRange}
                  format="dd/MM/yyy"
                  className={'fullWidth'}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Stack direction={'row'} justifyContent="flex-end" alignItems="center" spacing={1}>
              {selectedRow.length > 0 && (
                <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                  <FormattedMessage id="delete" />
                </Button>
              )}
              <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRefresh} color="secondary">
                Refresh
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setFormExpenseOpen(true)}>
                <FormattedMessage id="add" />
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => {
              const tabs = ['pending', 'approved', 'rejected'];
              setSearchParams({ tab: tabs[value] });
              setTabSelected(value);
              setParams((prevParams) => ({ ...prevParams, status: tabs[value] }));
            }}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="finance expenses tab"
          >
            <Tab label="Pending" id="finance-expenses-tab-0" aria-controls="finance-expenses-tabpanel-0" />
            <Tab label="Approved" id="finance-expenses-tab-1" aria-controls="finance-expenses-tabpanel-1" />
            <Tab label="Rejected" id="finance-expenses-tab-2" aria-controls="finance-expenses-tabpanel-2" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="finance-expenses">
            {renderContent()}
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="finance-expenses">
            {renderContent()}
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="finance-expenses">
            {renderContent()}
          </TabPanel>
        </Box>
      </MainCard>

      <FormExpense
        open={formExpenseOpen}
        onClose={(refresh) => {
          setFormExpenseOpen(false);
          if (refresh) setParams((prev) => ({ ...prev }));
        }}
      />
      <ViewExpense
        open={viewModalOpen}
        data={viewDetailData}
        onClose={() => {
          setViewModalOpen(false);
          setViewDetailData(null);
        }}
      />
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      <ConfirmationC
        open={dialogApprove.isOpen}
        title={<FormattedMessage id="approve" />}
        content="Are you sure you want to approve this expense?"
        onClose={(response) => onApprove(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      <ConfirmationC
        open={dialogReject.isOpen}
        title={<FormattedMessage id="reject" />}
        content="Are you sure you want to reject this expense?"
        onClose={(response) => {
          if (response) {
            onReject();
          } else {
            setDialogReject({ isOpen: false, id: null });
          }
        }}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

export default FinanceExpenses;
