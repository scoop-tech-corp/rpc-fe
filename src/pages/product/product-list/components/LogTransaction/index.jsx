import { Autocomplete, Stack, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductLogTransaction, getProductTransaction } from '../../service';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
// import { getStaffList } from 'pages/staff/staff-list/service';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';

let paramProductLogList = {};

const ProductLogTransaction = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [logData, setLogData] = useState({ data: [], totalPagination: 0 });
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [selectedFilterStaff, setSelectedFilterStaff] = useState([]);
  const [listStaff] = useState([]); // setListStaff

  const [selectedFilterTransaction, setSelectedFilterTransaction] = useState(null);
  const [listTransaction, setListTransaction] = useState([]);

  const onFilterDateRange = (selectedDate) => {
    paramProductLogList.dateRange = selectedDate;
    setSelectedDateRange(selectedDate);
    fetchData();
  };
  const onFilterTransaction = (selected) => {
    paramProductLogList.transaction = selected ? selected.value : '';
    setSelectedFilterTransaction(selected ? selected : null);
    fetchData();
  };

  const onFilterStaff = () => {};

  const onResetFilter = () => {
    resetData();
    setSelectedDateRange([null, null]);
    setSelectedFilterStaff([]);
    setSelectedFilterTransaction(null);
  };

  const resetData = () => {
    clearParamFetchData();
    fetchData();
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="date" />,
        accessor: 'createdAt'
      },
      {
        Header: <FormattedMessage id="transaction" />,
        accessor: 'transaction'
      },
      {
        Header: <FormattedMessage id="remark" />,
        accessor: 'remark'
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity'
      },
      {
        Header: <FormattedMessage id="balance" />,
        accessor: 'balance'
      },
      {
        Header: <FormattedMessage id="staff" />,
        accessor: 'fullName'
      }
    ],
    []
  );

  const clearParamFetchData = () => {
    paramProductLogList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      productId: props.data.id,
      dateRange: null,
      staffId: [],
      transaction: '',
      productType: props.data.productType
    };
  };

  const onOrderingChange = (event) => {
    paramProductLogList.orderValue = event.order;
    paramProductLogList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductLogList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductLogList.rowPerPage = event;
    fetchData();
  };

  const fetchData = async () => {
    const getData = await getProductLogTransaction(paramProductLogList);
    setLogData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const getDropdownData = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // const getStaff = await getStaffList();
      const getTransaction = await getProductTransaction();
      setListTransaction(getTransaction);

      resolve(true);
    });
  };

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getDropdownData();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getData();
    resetData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }} alignItems="center">
              <DateRangePicker onChange={(value) => onFilterDateRange(value)} value={selectedDateRange} format="dd/MM/yyy" />
              <Autocomplete
                id="filterStaff"
                multiple
                options={listStaff}
                value={selectedFilterStaff}
                sx={{ width: 300 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onFilterStaff(value)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="staff" />} />}
              />
              <Autocomplete
                id="filterTransaction"
                options={listTransaction}
                value={selectedFilterTransaction}
                sx={{ width: 300 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onFilterTransaction(value)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="transaction" />} />}
              />
              <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={onResetFilter}>
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Stack>
          <ReactTable
            columns={columns}
            data={logData.data}
            totalPagination={logData.totalPagination}
            setPageNumber={paramProductLogList.goToPage}
            setPageRow={paramProductLogList.rowPerPage}
            colSpanPagination={8}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

ProductLogTransaction.propTypes = {
  data: PropTypes.object
};

export default ProductLogTransaction;
