import {
  Button,
  Stack,
  useMediaQuery,
  Link,
  Autocomplete,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, getStaffList } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { getLoanProductList, deleteLoanProduct } from './service';
import { useNavigate } from 'react-router';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' }
];

const STATUS_COLOR = {
  draft: 'warning',
  pending: 'secondary',
  approved: 'primary',
  active: 'info',
  returned: 'success',
  cancelled: 'error'
};

let paramLoanList = {};

const ProductLoan = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loanData, setLoanData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedFilterLocation, setSelectedFilterLocation] = useState([]);
  const [selectedFilterStaff, setSelectedFilterStaff] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);

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
        style: { width: '10px' }
      },
      {
        Header: <FormattedMessage id="loan-number" />,
        accessor: 'loanNumber',
        Cell: (data) => (
          <Link sx={{ cursor: 'pointer' }} onClick={() => navigate(`/product/loan/detail/${data.row.original.id}`)}>
            {data.value}
          </Link>
        )
      },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="staff" />, accessor: 'staffName' },
      { Header: <FormattedMessage id="event-name" />, accessor: 'eventName' },
      { Header: <FormattedMessage id="event-date" />, accessor: 'eventDate' },
      { Header: <FormattedMessage id="total-items" />, accessor: 'totalItems' },
      { Header: <FormattedMessage id="total-qty" />, accessor: 'totalLoanedQty' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          const color = STATUS_COLOR[data.value] ?? 'default';
          const label = data.value ? data.value.charAt(0).toUpperCase() + data.value.slice(1) : '-';
          return <Chip color={color} label={label} size="small" variant="light" />;
        }
      },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramLoanList.orderValue = event.order;
    paramLoanList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramLoanList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramLoanList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramLoanList.keyword = event;
    setKeywordSearch(event);
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramLoanList.locationId = selected.map((dt) => dt.value);
    setSelectedFilterLocation(selected);
    fetchData();
  };

  const onFilterStaff = (selected) => {
    paramLoanList.staffId = selected.map((dt) => dt.value);
    setSelectedFilterStaff(selected);
    fetchData();
  };

  const onFilterStatus = (value) => {
    paramLoanList.status = value;
    setSelectedStatus(value);
    fetchData();
  };

  const fetchData = async () => {
    await getLoanProductList(paramLoanList)
      .then((resp) => {
        const respData = resp.data;
        setLoanData({
          data: respData.data ?? (Array.isArray(respData) ? respData : []),
          totalPagination: respData.totalPagination ?? 0
        });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const clearParamFetchData = () => {
    paramLoanList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      staffId: [],
      status: '',
      startDate: '',
      endDate: ''
    };
    setKeywordSearch('');
    setSelectedFilterLocation([]);
    setSelectedFilterStaff([]);
    setSelectedStatus('');
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteLoanProduct(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            setDialog(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const [locs, staff] = await Promise.all([getLocationList(), getStaffList()]);
      setLocationList(locs);
      setStaffList(staff);
    };
    init();
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="loan" />} isBreadcrumb={true} />
      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            <Stack
              direction={matchDownSM ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <GlobalFilter
                  placeHolder={intl.formatMessage({ id: 'search' })}
                  globalFilter={keywordSearch}
                  setGlobalFilter={onSearch}
                  style={{ height: '41.3px' }}
                />
                <Autocomplete
                  id="filterLocation"
                  multiple
                  limitTags={1}
                  options={locationList}
                  value={selectedFilterLocation}
                  sx={{ width: 220 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
                <Autocomplete
                  id="filterStaff"
                  multiple
                  limitTags={1}
                  options={staffList}
                  value={selectedFilterStaff}
                  sx={{ width: 220 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterStaff(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="staff" />} />}
                />
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={selectedStatus} label="Status" onChange={(e) => onFilterStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={fetchData}>
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate('/product/loan/form')}>
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>

            <ReactTable
              columns={columns}
              data={loanData.data}
              totalPagination={loanData.totalPagination}
              setPageNumber={paramLoanList.goToPage}
              setPageRow={paramLoanList.rowPerPage}
              colSpanPagination={11}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
        </ScrollX>
      </MainCard>

      {dialog && (
        <ConfirmationC
          open={dialog}
          title={<FormattedMessage id="delete" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
          onClose={(response) => onConfirm(response)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}
    </>
  );
};

export default ProductLoan;
