import { useEffect, useMemo, useState } from 'react';
import axios from 'utils/axios';
import { useTheme } from '@mui/material/styles';

import { Stack, useMediaQuery, Button, Link, Autocomplete, TextField } from '@mui/material';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { FormattedMessage } from 'react-intl';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import { SetupConfigSnackbar } from 'components/@extended/Snackbar';
import { breakdownMessageBackend, getLocationList } from 'service/service-global';

let paramFacilityList = {};

const FacilityList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getFacilityData, setFacilityData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState(null);

  const snackbarSuccess = (message) => openSnackbar(SetupConfigSnackbar(true, { color: 'success', severity: 'success' }, message, 1500));
  const snackbarError = (message) => openSnackbar(SetupConfigSnackbar(true, { color: 'error', severity: 'error' }, message, 3000));

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => original.locationId);
            setSelectedRow(selectRows);
          }, [header.selectedFlatRows]);

          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName',
        Cell: (data) => {
          const getId = data.row.original.locationId;
          const getName = data.row.original.locationName;
          const getFacilityVariation = +data.row.original.facilityVariation;

          if (getFacilityVariation) return <Link href={`/location/facilities/${getId}`}>{data.value}</Link>;
          else return getName;
        }
      },
      { Header: <FormattedMessage id="usage-capacity" />, accessor: 'capacityUsage' },
      { Header: <FormattedMessage id="facility-variant" />, accessor: 'facilityVariation' },
      { Header: <FormattedMessage id="amount-unit" />, accessor: 'unitTotal' }
    ],
    []
  );

  const onOrderingChange = (event) => {
    paramFacilityList.orderValue = event.order;

    let setOrderColumn = '';
    switch (event.column) {
      case 'locationName':
        setOrderColumn = 'location.locationName';
        break;
      case 'capacityUsage':
        setOrderColumn = 'facility_unit.capacity';
        break;
      case 'facilityVariation':
        setOrderColumn = 'facility.locationId';
        break;
      case 'unitTotal':
        setOrderColumn = 'facility_unit.unitName';
        break;
    }

    paramFacilityList.orderColumn = setOrderColumn;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramFacilityList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramFacilityList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (e, val) => {
    const getValue = val ? val.value : null;
    paramFacilityList.search = getValue;
    setFilterLocation(facilityLocationList.find((dt) => dt.value === getValue) || null);
    fetchData();
  };

  const onClickAdd = () => {
    navigate('/location/facilities/add', { replace: true });
  };

  const onDeleteFacility = async () => {
    await axios
      .delete('facility', {
        data: { locationId: selectedRow }
      })
      .then((resp) => {
        if (resp.status === 200 && resp.data.result === 'success') {
          dispatch(snackbarSuccess('Success Delete facility'));
          initList();
        }
      })
      .catch((err) => {
        const message = breakdownMessageBackend(err.errors);
        dispatch(snackbarError(message));
      });
  };

  const onExport = async () => {
    const resp = await axios.get('facilityexport', {
      responseType: 'blob'
    });

    let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
    let downloadUrl = URL.createObjectURL(blob);
    let a = document.createElement('a');

    a.href = downloadUrl;
    a.download = 'facility';
    document.body.appendChild(a);
    a.click();
  };

  async function fetchData() {
    const getResp = await axios.get('facility', {
      params: {
        rowPerPage: paramFacilityList.rowPerPage,
        goToPage: paramFacilityList.goToPage,
        orderValue: paramFacilityList.orderValue,
        orderColumn: paramFacilityList.orderColumn,
        search: paramFacilityList.search
      }
    });

    setFacilityData({ data: getResp.data.data, totalPagination: getResp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramFacilityList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', search: '' };
    setFilterLocation(null);
  };

  const getDataFacilityLocation = async () => {
    const data = await getLocationList();
    setFacilityLocationList(data);
  };

  const initList = () => {
    getDataFacilityLocation();
    clearParamFetchData();
    fetchData();
  };

  useEffect(() => {
    initList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="facilities" />} isBreadcrumb={true} />
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
              <Autocomplete
                id="filterLocation"
                options={facilityLocationList}
                value={selectedFilterLocation}
                sx={{ width: 300 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(event, value) => onFilterLocation(event, value)}
                renderInput={(params) => <TextField {...params} label="Filter location" />}
              />
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'}>
                <Button variant="contained" startIcon={<VerticalAlignTopOutlined />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="add-facility" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getFacilityData.data}
              totalPagination={getFacilityData.totalPagination}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>

          {selectedRow.length > 0 && (
            <Stack style={{ marginBottom: '20px' }} justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ p: 3, pb: 0 }}>
              <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={onDeleteFacility}>
                <FormattedMessage id="delete" />
              </Button>
            </Stack>
          )}
        </ScrollX>
      </MainCard>
    </>
  );
};

export default FacilityList;
