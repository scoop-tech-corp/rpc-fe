import { Autocomplete, Button, Chip, Stack, TextField, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { FormattedMessage, useIntl } from 'react-intl';
import { exportHistoryTransferProduct, getHistoryTransferProduct } from './service';
import { EyeOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';
import useAuth from 'hooks/useAuth';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import DetailTransferProduct from './detail';

let paramHistoryTransferProductList = {};

const HistoryTransferProduct = (props) => {
  const [historyTransferProductData, setHistoryTransferProductData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [isOpenDetail, setIsOpenDetail] = useState(false);

  const { user } = useAuth();
  const dispatch = useDispatch();
  const intl = useIntl();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const actionColumn =
    user.role === 'administrator' || user.role === 'office'
      ? [
          {
            Header: <FormattedMessage id="action" />,
            accessor: 'action',
            isNotSorting: true,
            style: { textAlign: 'center' },
            Cell: () => {
              // data
              // const getId = data.row.original.id;

              return (
                <Stack spacing={0.1} direction={'row'} justifyContent="center">
                  <IconButton size="large" color="info" onClick={() => setIsOpenDetail(true)}>
                    <EyeOutlined />
                  </IconButton>
                </Stack>
              );
            }
          }
        ]
      : [];

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
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      { Header: <FormattedMessage id="approved-by" />, accessor: 'approvedBy' },
      { Header: <FormattedMessage id="approved-at" />, accessor: 'approvedAt' },
      ...actionColumn
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramHistoryTransferProductList.orderValue = event.order;
    paramHistoryTransferProductList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramHistoryTransferProductList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramHistoryTransferProductList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramHistoryTransferProductList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramHistoryTransferProductList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const clearParamFetchData = () => {
    paramHistoryTransferProductList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  async function fetchData() {
    const resp = await getHistoryTransferProduct(paramHistoryTransferProductList);
    setHistoryTransferProductData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const onExport = async () => {
    await exportHistoryTransferProduct(paramHistoryTransferProductList)
      .then((resp) => {
        let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
        let downloadUrl = URL.createObjectURL(blob);
        let a = document.createElement('a');
        const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

        a.href = downloadUrl;
        a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
        document.body.appendChild(a);
        a.click();
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

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
            data={historyTransferProductData.data}
            totalPagination={historyTransferProductData.totalPagination}
            setPageNumber={paramHistoryTransferProductList.goToPage}
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

HistoryTransferProduct.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any)
};

export default HistoryTransferProduct;
