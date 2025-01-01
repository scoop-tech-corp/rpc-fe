import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack } from '@mui/system';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { exportStaffRekap, getAbsentPresentList, getAbsentStaffList, getStaffRekapDetail, getStaffRekapList } from './service';
import { Autocomplete, Button, Link, TextField, useMediaQuery } from '@mui/material';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { snackbarError } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import useAuth from 'hooks/useAuth';
import StaffRekapDetail from './detail';

let paramStaffRekapList = {};

const StaffRekap = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isSpecialRole = ['administrator', 'office'];

  const [openDetail, setOpenDetail] = useState({ isOpen: false, data: null });
  const [staffRekapData, setStaffRekapData] = useState({ data: [], totalPagination: 0 });
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [ddLocationList, setDdLocationList] = useState([]);
  const [selectedFilterStaff, setFilterStaff] = useState([]);
  const [ddAbsentStaffList, setDdAbsentStaffList] = useState([]);
  const [selectedFilterPresent, setFilterPresent] = useState([]);
  const [ddAbsentPresentList, setDdAbsentPresentList] = useState([]);

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          const onDetail = async () => {
            const getResp = await getStaffRekapDetail(+data.row.original.id);
            setOpenDetail({ isOpen: true, data: getResp.data });
          };

          return (
            <Link href="#" onClick={onDetail}>
              {data.value}
            </Link>
          );
        }
      },
      { Header: <FormattedMessage id="job" />, accessor: 'jobName' },
      { Header: <FormattedMessage id="shift" />, accessor: 'shift' },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: (data) => {
          return <span style={{ color: data.value.toLowerCase() === 'terlambat' ? '#ff4d4f' : '#52c41a' }}>{data.value}</span>;
        }
      },
      { Header: <FormattedMessage id="day" />, accessor: 'day' },
      { Header: <FormattedMessage id="attendance-time" />, accessor: 'presentTime' },
      { Header: <FormattedMessage id="homecoming-time" />, accessor: 'homeTime' },
      { Header: <FormattedMessage id="duration" />, accessor: 'duration' },
      { Header: <FormattedMessage id="attendance-status" />, accessor: 'presentStatus' },
      { Header: <FormattedMessage id="homecoming-status" />, accessor: 'homeStatus' },
      { Header: <FormattedMessage id="attendance-location" />, accessor: 'presentLocation' },
      { Header: <FormattedMessage id="homecoming-location" />, accessor: 'homeLocation' }
    ],
    []
  );

  const onExport = async () => {
    await exportStaffRekap(paramStaffRekapList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onOrderingChange = (event) => {
    paramStaffRekapList.orderValue = event.order;
    paramStaffRekapList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramStaffRekapList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramStaffRekapList.rowPerPage = event;
    fetchData();
  };

  const onFilterDateRange = (selectedDate) => {
    paramStaffRekapList.dateFrom = '';
    paramStaffRekapList.dateTo = '';

    if (selectedDate?.length) {
      paramStaffRekapList.dateFrom = selectedDate[0];
      paramStaffRekapList.dateTo = selectedDate[1];
    }

    setSelectedDateRange(selectedDate);
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramStaffRekapList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterStaff = (selected) => {
    paramStaffRekapList.staff = selected.map((dt) => dt.value);
    setFilterStaff(selected);
    fetchData();
  };

  const onFilterPresentStatus = (selected) => {
    paramStaffRekapList.statusPresent = selected.map((dt) => dt.value);
    setFilterPresent(selected);
    fetchData();
  };

  const clearParamFetchData = () => {
    paramStaffRekapList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      dateFrom: '',
      dateTo: '',
      locationId: [],
      staff: [],
      statusPresent: []
    };
  };

  const fetchData = async () => {
    await getStaffRekapList(paramStaffRekapList)
      .then((resp) => {
        setStaffRekapData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const getDataDropdown = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getLoc = await getLocationList();
      const getAbsentStaff = await getAbsentStaffList();
      const getPresentStaff = await getAbsentPresentList();

      setDdLocationList(getLoc);
      setDdAbsentStaffList(getAbsentStaff);
      setDdAbsentPresentList(getPresentStaff);
      resolve(true);
    });
  };

  const getInitData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);
    clearParamFetchData();

    await getDataDropdown();
    await fetchData();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
                <DateRangePicker onChange={(value) => onFilterDateRange(value)} value={selectedDateRange} format="dd/MM/yyy" />
                {isSpecialRole.includes(user?.role) && (
                  <>
                    <Autocomplete
                      id="filterLocation"
                      multiple
                      limitTags={1}
                      options={ddLocationList}
                      value={selectedFilterLocation}
                      sx={{ width: 225 }}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onFilterLocation(value)}
                      renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                    />
                    <Autocomplete
                      id="filterAbsentStaff"
                      multiple
                      limitTags={1}
                      options={ddAbsentStaffList}
                      value={selectedFilterStaff}
                      sx={{ width: 225 }}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onFilterStaff(value)}
                      renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-staff" />} />}
                    />
                  </>
                )}
                <Autocomplete
                  id="filterAbsentPresent"
                  multiple
                  limitTags={1}
                  options={ddAbsentPresentList}
                  value={selectedFilterPresent}
                  sx={{ width: 225 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterPresentStatus(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-present-status" />} />}
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
              data={staffRekapData.data}
              totalPagination={staffRekapData.totalPagination}
              setPageNumber={paramStaffRekapList.goToPage}
              setPageRow={paramStaffRekapList.rowPerPage}
              colSpanPagination={11}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
        </ScrollX>
      </MainCard>
      <StaffRekapDetail open={openDetail.isOpen} data={openDetail.data} onClose={(e) => setOpenDetail({ isOpen: !e, data: null })} />
    </>
  );
};

export default StaffRekap;
