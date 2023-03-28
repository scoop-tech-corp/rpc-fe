import { Autocomplete, Button, Chip, Stack, TextField, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
// import { useDispatch } from 'react-redux';
// import { snackbarError } from 'store/reducers/snackbar';
// import { createMessageBackend } from 'service/service-global';
import { FormattedMessage, useIntl } from 'react-intl';
import { getTransferProduct } from './service';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';
import useAuth from 'hooks/useAuth';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DetailTransferProduct from './detail';

let paramTransferProductList = {};

const TransferProduct = (props) => {
  const [transferProductData, setTransferProductData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [isOpenDetail, setIsOpenDetail] = useState(false);

  const { user } = useAuth();
  // const dispatch = useDispatch();
  const intl = useIntl();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="product-name" />, accessor: 'productName' },
      { Header: <FormattedMessage id="category" />, accessor: 'categoryName' },
      { Header: <FormattedMessage id="from" />, accessor: 'from' },
      { Header: <FormattedMessage id="to" />, accessor: 'to' },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="warning" label={<FormattedMessage id="waiting-for-approval" />} size="small" variant="light" />;
            case 1:
              return <Chip color="success" label="Accept" size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="received-by" />, accessor: 'receivedBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        style: { textAlign: 'center' },
        Cell: (data) => {
          // const getId = data.row.original.id;

          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              {user.role === 'administrator' || user.role === 'office' ? (
                <>
                  <IconButton size="large" color="primary" onClick={() => onClickApproval(data.row.original)}>
                    <CheckCircleOutlined />
                  </IconButton>
                  <IconButton size="large" color="error" onClick={() => onClickReject(data.row.original)}>
                    <CloseCircleOutlined />
                  </IconButton>
                  <IconButton size="large" color="info" onClick={() => setIsOpenDetail(true)}>
                    <EyeOutlined />
                  </IconButton>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={acceptProduct}>
                  <FormattedMessage id="accept-product" />
                </Button>
              )}
            </Stack>
          );
        }
      }
    ],
    [user.role]
  );

  const onClickApproval = () => {};
  const onClickReject = () => {};
  const acceptProduct = () => {};

  const onOrderingChange = (event) => {
    paramTransferProductList.orderValue = event.order;
    paramTransferProductList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramTransferProductList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramTransferProductList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramTransferProductList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramTransferProductList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const clearParamFetchData = () => {
    paramTransferProductList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  async function fetchData() {
    const resp = await getTransferProduct(paramTransferProductList);
    setTransferProductData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <ScrollX>
        <Stack spacing={3}>
          <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ pt: 1 }}>
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
                options={props.filterLocationList || []}
                value={selectedFilterLocation}
                sx={{ width: 300 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onFilterLocation(value)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
              />
            </Stack>
            <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
              <RefreshIcon />
            </IconButton>
          </Stack>
          <ReactTable
            columns={columns}
            data={transferProductData.data}
            totalPagination={transferProductData.totalPagination}
            setPageNumber={paramTransferProductList.goToPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>

      {isOpenDetail && <DetailTransferProduct open={isOpenDetail} onClose={(e) => setIsOpenDetail(!e)} />}
    </>
  );
};

TransferProduct.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any)
};

export default TransferProduct;
