/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Autocomplete, Button, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import ConfirmationC from 'components/ConfirmationC';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  createMessageBackend,
  getCustomerGroupList,
  getLocationList,
  processDownloadExcel,
  processDownloadPDF
} from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { formatThousandSeparator } from 'utils/func';
import { GlobalFilter } from 'utils/react-table';
import { deleteSallarySliptList, exportSallarySlipt, generateSallarySlipt, getSallarySliptList } from './service';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import VisibilityIcon from '@mui/icons-material/Visibility';

let paramSallarySliptList = {};

const SallarySliptList = () => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getSallarySliptListData, setSallarySliptListData] = useState({ data: [], totalPagination: 0, allowGenerateInvoice: false });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [dialog, setDialog] = useState(false);
  const { user } = useAuth();

  const onGenerateSalarySlipt = async (id) => {
    await generateSallarySlipt({ id })
      .then(processDownloadPDF)
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
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        style: { textAlign: 'center' },
        isNotSorting: true,
        Cell: (data) => {
          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              {getSallarySliptListData.allowGenerateInvoice && (
                <Tooltip title={<FormattedMessage id="print" />} arrow>
                  <IconButton size="small" onClick={() => onGenerateSalarySlipt(data.row.original.id)}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={<FormattedMessage id="detail" />} arrow>
                <IconButton
                  size="small"
                  onClick={() => {
                    navigate(`/staff/sallary-slipt/detail/${data.row.original.id}`);
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>

              {['Finance', 'Komisaris', 'President Director'].includes(user?.jobName || '') && (
                <>
                  <Tooltip title={<FormattedMessage id="edit" />} arrow>
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => {
                        navigate(`/staff/sallary-slipt/edit/${data.row.original.id}`);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={<FormattedMessage id="delete" />} arrow>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setDialog({ isOpen: true, id: data.row.original.id });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          );
        }
      },
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name'
      },
      {
        Header: <FormattedMessage id="payroll-date" />,
        accessor: 'payrollDate'
      },
      {
        Header: <FormattedMessage id="branch" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="basic-income" />,
        accessor: 'basicIncome',
        Cell: (data) => `Rp ${formatThousandSeparator(data.value)}`
      },
      {
        Header: <FormattedMessage id="annual-increase-incentive" />,
        accessor: 'annualIncrementIncentive',
        Cell: (data) => `Rp ${formatThousandSeparator(data.value)}`
      },
      {
        Header: <FormattedMessage id="absent" />,
        accessor: 'absentDays'
      },
      {
        Header: <FormattedMessage id="late" />,
        accessor: 'lateDays'
      },
      {
        Header: <FormattedMessage id="total-income" />,
        accessor: 'totalIncome',
        Cell: (data) => `Rp ${formatThousandSeparator(data.value)}`
      },
      {
        Header: <FormattedMessage id="total-reduction" />,
        accessor: 'totalDeduction',
        Cell: (data) => `Rp ${formatThousandSeparator(data.value)}`
      },
      {
        Header: <FormattedMessage id="net-income" />,
        accessor: 'netPay',
        Cell: (data) => `Rp ${formatThousandSeparator(data.value)}`
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getSallarySliptListData]
  );

  const onOrderingChange = (event) => {
    paramSallarySliptList.orderValue = event.order;
    paramSallarySliptList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramSallarySliptList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramSallarySliptList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramSallarySliptList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterDateRange = (selectedDate) => {
    paramSallarySliptList.dateRange = selectedDate;
    setSelectedDateRange(selectedDate);
    fetchData();
  };

  const onSearch = (event) => {
    paramSallarySliptList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/staff/sallary-slipt/add', { replace: true });
  };

  const onExport = async () => {
    await exportSallarySlipt(paramSallarySliptList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const fetchData = async () => {
    await getSallarySliptList(paramSallarySliptList)
      .then((resp) => {
        setSallarySliptListData({
          data: resp.data.data,
          totalPagination: resp.data.totalPagination,
          allowGenerateInvoice: resp.data.allowGenerateInvoice
        });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const clearParamFetchData = () => {
    paramSallarySliptList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      customerGroupId: []
    };
  };

  const getDropdownData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    const data = await getLocationList();

    setFacilityLocationList(data);

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteSallarySliptList(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Customer'));
            clearParamFetchData();
            fetchData();
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

  const onRefresh = () => fetchData();

  useEffect(() => {
    getDropdownData();
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="sallary-slipt" />} isBreadcrumb={true} />
      <MainCard content={false}>
        <Stack spacing={3}>
          {['Finance', 'Komisaris', 'President Director'].includes(user?.jobName || '') && (
            <Stack
              direction={matchDownMD ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Stack spacing={1} direction={matchDownMD ? 'column' : 'row'} style={{ width: matchDownMD ? '100%' : '' }}>
                <GlobalFilter
                  placeHolder={intl.formatMessage({ id: 'search' })}
                  globalFilter={keywordSearch}
                  setGlobalFilter={onSearch}
                  style={{ height: '41.3px' }}
                />
                <DateRangePicker onChange={(value) => onFilterDateRange(value)} value={selectedDateRange} format="dd/MM/yyy" />
                <Autocomplete
                  id="filterLocation"
                  multiple
                  limitTags={1}
                  options={facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 350 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />

                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>
              <Stack spacing={1} direction={matchDownMD ? 'column' : 'row'} style={{ width: matchDownMD ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>

                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>

                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
          )}
          <ScrollX>
            <ReactTable
              columns={columns}
              data={getSallarySliptListData.data}
              totalPagination={getSallarySliptListData.totalPagination}
              setPageNumber={paramSallarySliptList.goToPage}
              setPageRow={paramSallarySliptList.rowPerPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
              colSpanPagination={columns.length}
            />
          </ScrollX>
        </Stack>
      </MainCard>
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

export default SallarySliptList;
