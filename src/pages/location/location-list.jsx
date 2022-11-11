import { useEffect, useMemo, useState } from 'react';
import axios from 'utils/axios';
import { useTheme } from '@mui/material/styles';

import { Chip, Stack, useMediaQuery, Button, Link } from '@mui/material';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import HeaderCustom from 'components/@extended/HeaderPageCustom';

let paramLocationList = {};

const LocationList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getLocationData, setLocationData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => original.codeLocation);
            setSelectedRow(selectRows);
          }, [header.selectedFlatRows]);

          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true
      },
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'locationName',
        Cell: (data) => {
          const getCode = data.row.original.codeLocation;
          return <Link href={`/location/location-list/${getCode}`}>{data.value}</Link>;
        }
      },
      { Header: 'Address', accessor: 'addressName' },
      { Header: 'City', accessor: 'cityName' },
      { Header: 'Phone', accessor: 'phoneNumber' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (data.value.toLowerCase()) {
            case 'active':
              return <Chip color="success" label="Active" size="small" variant="light" />;
            default:
              return <Chip color="error" label="Not Active" size="small" variant="light" />;
          }
        }
      }
    ],
    []
  );

  const onOrderingChange = (event) => {
    paramLocationList.orderValue = event.order;
    paramLocationList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramLocationList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramLocationList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramLocationList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/location/location-list/add', { replace: true });
  };

  const onDeleteLocation = async () => {
    console.log('selectedRow', selectedRow);
    const resp = await axios.delete('location', {
      data: { codeLocation: selectedRow }
    });

    if (resp.status === 200 && resp.data.result === 'success') {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Success Delete location',
          variant: 'alert',
          alert: { color: 'success' },
          duration: 2000,
          close: true
        })
      );
      clearParamFetchData();
      fetchData();
    }
  };

  const onExport = async () => {
    const resp = await axios.get('exportlocation', {
      responseType: 'blob'
    });
    console.log('resp export', resp);
    // console.log('resp.headers content-disposition', resp.headers['content-disposition']);

    let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
    let downloadUrl = URL.createObjectURL(blob);
    let a = document.createElement('a');

    a.href = downloadUrl;
    a.download = 'location';
    document.body.appendChild(a);
    a.click();
  };

  async function fetchData() {
    const resp = await axios.get('location', {
      params: {
        rowPerPage: paramLocationList.rowPerPage,
        goToPage: paramLocationList.goToPage,
        orderValue: paramLocationList.orderValue,
        orderColumn: paramLocationList.orderColumn,
        search: paramLocationList.keyword
      }
    });

    setLocationData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramLocationList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <HeaderCustom
        title={<FormattedMessage id="location-list" />}
        isBreadcrumb={true}
        // action={
        //   <>
        //     <Button variant="text" startIcon={<VerticalAlignTopOutlined />} onClick={onExport} color="success">
        //       <FormattedMessage id="export" />
        //     </Button>
        //     <Button variant="text" startIcon={<PlusOutlined />} onClick={onClickAdd}>
        //       <FormattedMessage id="add-location" />
        //     </Button>
        //   </>
        // }
      />
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
              <GlobalFilter placeHolder={'Search...'} globalFilter={keywordSearch} setGlobalFilter={onSearch} size="small" />

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'}>
                <Button variant="contained" startIcon={<VerticalAlignTopOutlined />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="add-location" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getLocationData.data}
              totalPagination={getLocationData.totalPagination}
              setPageNumber={paramLocationList.goToPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>

          {selectedRow.length > 0 && (
            <Stack
              // direction={matchDownSM ? 'column' : 'row'}
              style={{ marginBottom: '20px' }}
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={onDeleteLocation}>
                <FormattedMessage id="delete" />
              </Button>
            </Stack>
          )}
        </ScrollX>
      </MainCard>
    </>
  );
};

export default LocationList;
