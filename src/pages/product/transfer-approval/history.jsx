import { Autocomplete, Button, Chip, Stack, TextField, useMediaQuery, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { FormattedMessage, useIntl } from 'react-intl';
import { exportHistoryTransferProduct, getDetailTransferProduct, getTransferProduct } from './service';
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
  const [isOpenDetail, setIsOpenDetail] = useState({ isOpen: false, data: null });
  const [locationType, setLocationType] = useState('');

  const { user } = useAuth();
  const dispatch = useDispatch();
  const intl = useIntl();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  // const actionColumn =
  //   user.role === 'administrator' || user.role === 'office'
  //     ? [
  //         {
  //           Header: <FormattedMessage id="action" />,
  //           accessor: 'action',
  //           isNotSorting: true,
  //           style: { textAlign: 'center' },
  //           Cell: () => {
  //             // data
  //             // const getId = data.row.original.id;

  //             return (
  //               <Stack spacing={0.1} direction={'row'} justifyContent="center">
  //                 <IconButton size="large" color="info" onClick={() => setIsOpenDetail(true)}>
  //                   <EyeOutlined />
  //                 </IconButton>
  //               </Stack>
  //             );
  //           }
  //         }
  //       ]
  //     : [];

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="no-transfer" />, accessor: 'transferNumber' },
      { Header: <FormattedMessage id="transfer-name" />, accessor: 'transferName' },
      { Header: <FormattedMessage id="from" />, accessor: 'from' },
      { Header: <FormattedMessage id="to" />, accessor: 'to' },
      { Header: <FormattedMessage id="product-type" />, accessor: 'productType' },
      { Header: <FormattedMessage id="product-name" />, accessor: 'productName' },
      { Header: <FormattedMessage id="total-item" />, accessor: 'totalItem' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 2:
              return <Chip color="error" label={<FormattedMessage id="reject" />} size="small" variant="light" />;
            case 3:
              return <Chip color="success" label={<FormattedMessage id="received" />} size="small" variant="light" />;
            case 0:
              return '-';
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        style: { textAlign: 'center' },
        Cell: (data) => {
          const getId = data.row.original.id;

          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              <IconButton size="large" color="info" onClick={() => onClickDetail(getId)}>
                <EyeOutlined />
              </IconButton>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onLocationType = (event) => {
    setLocationType(event.target.value);
    paramHistoryTransferProductList.locationType = event.target.value;
    fetchData();
  };

  const onClickDetail = async (id) => {
    const resp = await getDetailTransferProduct(id);
    setIsOpenDetail({ isOpen: true, data: resp.data });
  };

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
    paramHistoryTransferProductList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      locationType: '',
      type: 'history'
    };
    setKeywordSearch('');
  };

  async function fetchData() {
    const resp = await getTransferProduct(paramHistoryTransferProductList);
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
              {(user.role === 'administrator' || user.role === 'office') && (
                <>
                  <FormControl sx={{ m: 1, minWidth: 200 }}>
                    <InputLabel>{<FormattedMessage id="select-location-type" />}</InputLabel>
                    <Select id="location-type" name="location-type" value={locationType} onChange={onLocationType}>
                      <MenuItem value="">
                        <em>{<FormattedMessage id="select-location-type" />}</em>
                      </MenuItem>
                      <MenuItem value={'from'}>
                        <FormattedMessage id="from" />
                      </MenuItem>
                      <MenuItem value={'to'}>
                        <FormattedMessage id="to" />
                      </MenuItem>
                    </Select>
                  </FormControl>
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
                </>
              )}
            </Stack>

            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
              <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
                <RefreshIcon />
              </IconButton>
              {(user.role === 'administrator' || user.role === 'office') && (
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
              )}
            </Stack>
          </Stack>
          <ReactTable
            columns={columns}
            data={historyTransferProductData.data}
            totalPagination={historyTransferProductData.totalPagination}
            setPageNumber={paramHistoryTransferProductList.goToPage}
            colSpanPagination={11}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>

      {isOpenDetail.isOpen && (
        <DetailTransferProduct
          open={isOpenDetail.isOpen}
          data={isOpenDetail.data}
          onClose={(e) => setIsOpenDetail({ isOpen: !e, data: null })}
        />
      )}
    </>
  );
};

HistoryTransferProduct.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any)
};

export default HistoryTransferProduct;
