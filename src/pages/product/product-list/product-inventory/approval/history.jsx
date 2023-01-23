import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, useMediaQuery, Autocomplete, TextField, Button } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { getProductInventoryApprovalHistory, getProductInventoryApprovalHistoryExport } from '../../service';
import { FormattedMessage } from 'react-intl';
import { EyeOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

// import { LocalizationProvider } from '@mui/x-date-pickers-pro';
// import { DesktopDateRangePicker } from '@mui/x-date-pickers-pro/DesktopDateRangePicker';
// import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';

import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import ProductInventoryApprovalDetail from './request/detail';
import ScrollX from 'components/ScrollX';

let paramHistoryList = {};

const History = (props) => {
  const [historyData, setHistoryData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [openModalDetail, setOpenModalDetail] = useState({ isOpen: false, id: '' });
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  // const [selectedFilterDateRange] = useState([]);

  const dispatch = useDispatch();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="requirement" />,
        accessor: 'requirementName'
      },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="applicant" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      // {
      //   Header: 'Status',
      //   accessor: 'isApprovedOffice',
      //   Cell: (data) => {
      //     switch (+data.value) {
      //       case 0:
      //         return <Chip color="warning" label="Waiting for Appoval" size="small" variant="light" />;
      //       case 1:
      //         return <Chip color="success" label="Accept" size="small" variant="light" />;
      //       case 2:
      //         return <Chip color="error" label="Reject" size="small" variant="light" />;
      //     }
      //   }
      // },
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
              <IconButton size="large" color="info" onClick={() => onClickDetail(data.row.original)}>
                <EyeOutlined />
              </IconButton>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const onClickDetail = async (rowData) => {
    setOpenModalDetail({ isOpen: true, id: +rowData.id });
  };

  const onOrderingChange = (event) => {
    paramHistoryList.orderValue = event.order;
    paramHistoryList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramHistoryList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramHistoryList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramHistoryList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramHistoryList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  // const onFilterDateRange = (selected) => {
  //   console.log('selected', selected);
  // };

  const clearParamFetchData = () => {
    paramHistoryList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      fromDate: '',
      toDate: ''
    };
    setKeywordSearch('');
  };

  const fetchData = async () => {
    const resp = await getProductInventoryApprovalHistory(paramHistoryList);
    setHistoryData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  };

  const onExport = async () => {
    await getProductInventoryApprovalHistoryExport(paramHistoryList)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {/* <LocalizationProvider dateAdapter={AdapterDayjs} localeText={{ start: 'Desktop start', end: 'Desktop end' }}>
                <DesktopDateRangePicker
                  value={selectedFilterDateRange}
                  onChange={onFilterDateRange}
                  renderInput={(startProps, endProps) => (
                    <Fragment>
                      <TextField {...startProps} />
                      <Box sx={{ mx: 2 }}> to </Box>
                      <TextField {...endProps} />
                    </Fragment>
                  )}
                />
              </LocalizationProvider> */}
            </Stack>
            <Button variant="contained" startIcon={<VerticalAlignTopOutlined />} onClick={onExport} color="success">
              <FormattedMessage id="export" />
            </Button>
          </Stack>

          <ReactTable
            columns={columns}
            data={historyData.data}
            totalPagination={historyData.totalPagination}
            setPageNumber={paramHistoryList.goToPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
      <ProductInventoryApprovalDetail
        open={openModalDetail.isOpen}
        id={openModalDetail.id}
        parentProcedure="history"
        onClose={(e) => setOpenModalDetail({ isOpen: !e, id: '' })}
      />
    </>
  );
};

History.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any)
};

export default History;
