import { useEffect, useMemo, useState } from 'react';
import axios from 'utils/axios';
import { useTheme } from '@mui/material/styles';
import { Chip, Stack, useMediaQuery, Button, Link } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { exportLocation, getLocation } from './detail/service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import ConfirmationC from 'components/ConfirmationC';
import DownloadIcon from '@mui/icons-material/Download';

let paramLocationList = {};

const LocationList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [getLocationData, setLocationData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);

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
        disableSortBy: true,
        style: {
          width: '10px'
        }
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

  const onConfirm = async (value) => {
    if (value) {
      await axios
        .delete('location', {
          data: { codeLocation: selectedRow }
        })
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            clearParamFetchData();
            fetchData();
          }
        });
    } else {
      setDialog(false);
    }
  };

  const onExport = async () => {
    await exportLocation().then((resp) => {
      let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
      let downloadUrl = URL.createObjectURL(blob);
      let a = document.createElement('a');
      // const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

      a.href = downloadUrl;
      // a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
      a.download = 'Location-list';
      document.body.appendChild(a);
      a.click();
    });
  };

  async function fetchData() {
    const resp = await getLocation(paramLocationList);
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
      <HeaderCustom title={<FormattedMessage id="location-list" />} isBreadcrumb={true} />
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
                  style={{ height: '36.5px' }}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
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
              setPageRow={paramLocationList.rowPerPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
        </ScrollX>
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

export default LocationList;
