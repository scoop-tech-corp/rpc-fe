import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Button, Chip, Stack, TextField, useMediaQuery } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { FormattedMessage, useIntl } from 'react-intl';
import { createMessageBackend, processDownloadExcel } from 'service/service-global';
import { snackbarError } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { exportProductRestock, getProductRestock } from '../../service';

import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

let paramApprovalRestockHistoryList = {};
const ApprovalRestockHistory = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="id-number" />,
        accessor: 'numberId'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="supplier" />,
        accessor: 'supplierName'
      },
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'products'
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="warning" label={<FormattedMessage id="draft" />} size="small" variant="light" />;
            case 1:
              return <Chip color="info" label={<FormattedMessage id="waiting-for-approval" />} size="small" variant="light" />;
            case 2:
              return <Chip color="error" label={<FormattedMessage id="reject" />} size="small" variant="light" />;
            case 3:
              return <Chip color="success" label={<FormattedMessage id="approved" />} size="small" variant="light" />;
            case 4:
              return <Chip color="info" label={<FormattedMessage id="waiting-for-supplier" />} size="small" variant="light" />;
            case 5:
              return <Chip label={<FormattedMessage id="product-received" />} size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    []
  );

  const [productRestockData, setProductRestockData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedFilterSupplier, setFilterSupplier] = useState([]);

  const onOrderingChange = (event) => {
    paramApprovalRestockHistoryList.orderValue = event.order;
    paramApprovalRestockHistoryList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramApprovalRestockHistoryList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramApprovalRestockHistoryList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramApprovalRestockHistoryList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramApprovalRestockHistoryList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterSupplier = (selected) => {
    paramApprovalRestockHistoryList.supplierId = selected.map((dt) => dt.value);
    setFilterSupplier(selected);
    fetchData();
  };

  async function fetchData() {
    const resp = await getProductRestock(paramApprovalRestockHistoryList);
    setProductRestockData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramApprovalRestockHistoryList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      supplierId: [],
      type: 'history'
    };
    setKeywordSearch('');
  };

  const onExport = async () => {
    await exportProductRestock(paramApprovalRestockHistoryList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 3, pb: 0 }}>
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
            options={props.filterLocationList}
            value={selectedFilterLocation}
            sx={{ width: 280 }}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => onFilterLocation(value)}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
          />
          <Autocomplete
            id="filterSupplier"
            multiple
            limitTags={1}
            options={props.filterSupplierList}
            value={selectedFilterSupplier}
            sx={{ width: 280 }}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => onFilterSupplier(value)}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-supplier" />} />}
          />
        </Stack>

        <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
          <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
            <FormattedMessage id="export" />
          </Button>
        </Stack>
      </Stack>
      <ReactTable
        columns={columns}
        data={productRestockData.data}
        totalPagination={productRestockData.totalPagination}
        setPageNumber={paramApprovalRestockHistoryList.goToPage}
        setPageRow={paramApprovalRestockHistoryList.rowPerPage}
        colSpanPagination={10}
        onOrder={onOrderingChange}
        onGotoPage={onGotoPageChange}
        onPageSize={onPageSizeChange}
      />
    </Stack>
  );
};

ApprovalRestockHistory.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any),
  filterSupplierList: PropTypes.arrayOf(PropTypes.any)
};

export default ApprovalRestockHistory;
