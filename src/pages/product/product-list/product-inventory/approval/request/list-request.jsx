import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Autocomplete, Stack, TextField, useMediaQuery, Button } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { getProductInventoryApproval, getProductInventoryApprovalExport } from 'pages/product/product-list/service';
import { FormattedMessage } from 'react-intl';
import { EyeOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';

let paramRequestProductList = {};

const ListRequest = (props) => {
  const [requestProductData, setRequestProductData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);

  const dispatch = useDispatch();
  const { user } = useAuth();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const columnAdmin = [
    { Header: <FormattedMessage id="approved-by-(office)" />, accessor: 'officeApprovedBy' },
    { Header: <FormattedMessage id="approved-at-(office)" />, accessor: 'officeApprovedAt' }
  ];

  const columnDefault = [
    {
      Header: <FormattedMessage id="requirement" />,
      accessor: 'requirementName'
    },
    { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
    { Header: <FormattedMessage id="applicant" />, accessor: 'createdBy' },
    { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    // {
    //   Header: 'Status',
    //   accessor: 'isApprovedOffice',
    //   Cell: (data) => {
    //     switch (+data.value) {
    //       case 0:
    //         return <Chip color="warning" label="Menunggu" size="small" variant="light" />;
    //       case 1:
    //         return <Chip color="success" label="Accept" size="small" variant="light" />;
    //     }
    //   }
    // },
  ];

  const columnDynamic = user.role === 'administrator' ? columnAdmin : [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(
    () => [
      ...columnDefault,
      ...columnDynamic,
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        style: {
          textAlign: 'center'
        },
        Cell: (data) => {
          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              {/* <IconButton size="large" color="primary" onClick={() => onClickApproval(data.row.original)}>
          <CheckCircleOutlined />
        </IconButton>
        <IconButton size="large" color="error" onClick={() => onClickReject(data.row.original)}>
          <CloseCircleOutlined />
        </IconButton> */}
              <IconButton size="large" color="info" onClick={() => props.onClickDetail(data.row.original)}>
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

  const onOrderingChange = (event) => {
    paramRequestProductList.orderValue = event.order;
    paramRequestProductList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramRequestProductList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramRequestProductList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramRequestProductList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramRequestProductList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const clearParamFetchData = () => {
    paramRequestProductList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  async function fetchData() {
    const resp = await getProductInventoryApproval(paramRequestProductList);
    setRequestProductData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const onExport = async () => {
    await getProductInventoryApprovalExport(paramRequestProductList)
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

  const initList = () => {
    clearParamFetchData();
    fetchData();
  };

  useEffect(() => {
    initList();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.isInitList) {
      initList();
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isInitList]);

  return (
    <>
      <ScrollX>
        <Stack spacing={3}>
          <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ pt: 1 }}>
            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
              <GlobalFilter
                placeHolder={'Search...'}
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
                renderInput={(params) => <TextField {...params} label="Filter location" />}
              />
            </Stack>
            <Button variant="contained" startIcon={<VerticalAlignTopOutlined />} onClick={onExport} color="success">
              <FormattedMessage id="export" />
            </Button>
          </Stack>
          <ReactTable
            columns={columns}
            data={requestProductData.data}
            totalPagination={requestProductData.totalPagination}
            setPageNumber={paramRequestProductList.goToPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </>
  );
};

ListRequest.propTypes = {
  onClickDetail: PropTypes.func,
  isInitList: PropTypes.bool,
  filterLocationList: PropTypes.arrayOf(PropTypes.any)
};

export default ListRequest;
