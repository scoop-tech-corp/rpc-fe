import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  useMediaQuery
} from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import {
  getDashboardUpbookingClinic,
  getDashboardUpbookingHotel,
  getDashboardUpbookingSalon,
  getDashboardUpbookingBreeding
} from '../service';
import dayjs from 'dayjs';

import TabPanel from 'components/TabPanelC';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import SearchIcon from '@mui/icons-material/Search';

const buildFilterParams = ({ selectedLocation, filterType, startDate, endDate, selectedMonth }) => {
  const params = {
    branchesId: selectedLocation.map((l) => l.value),
    dateRange: filterType === 'monthly' ? 'month' : 'dateRange'
  };
  if (filterType === 'monthly') {
    params.month = selectedMonth.month() + 1;
    params.year = selectedMonth.year();
  } else {
    params.dateFrom = startDate ? startDate.format('YYYY-MM-DD') : undefined;
    params.dateTo = endDate ? endDate.format('YYYY-MM-DD') : undefined;
  }
  return params;
};

const DEFAULT_FILTER = {
  selectedLocation: [],
  filterType: 'date-range',
  startDate: dayjs().startOf('month'),
  endDate: dayjs(),
  selectedMonth: dayjs()
};

const DashboardUpcomingBooking = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [tabSelected, setTabSelected] = useState(0);
  const [clinicData, setClinicData] = useState({ data: [], totalPagination: 0 });
  const [hotelData, setHotelData] = useState({ data: [], totalPagination: 0 });
  const [salonData, setSalonData] = useState({ data: [], totalPagination: 0 });
  const [breedingData, setBreedingData] = useState({ data: [], totalPagination: 0 });

  const [clinicPagination, setClinicPagination] = useState({ rowPerPage: 10, goToPage: 1 });
  const [hotelPagination, setHotelPagination] = useState({ rowPerPage: 10, goToPage: 1 });
  const [salonPagination, setSalonPagination] = useState({ rowPerPage: 10, goToPage: 1 });
  const [breedingPagination, setBreedingPagination] = useState({ rowPerPage: 10, goToPage: 1 });

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const filterParamsRef = useRef(buildFilterParams(DEFAULT_FILTER));

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="booking-time" />, accessor: 'bookingTime', isNotSorting: true },
      { Header: <FormattedMessage id="location" />, accessor: 'location', isNotSorting: true },
      { Header: <FormattedMessage id="customer" />, accessor: 'customer', isNotSorting: true },
      { Header: <FormattedMessage id="service-name" />, accessor: 'serviceName', isNotSorting: true },
      { Header: <FormattedMessage id="staff" />, accessor: 'staff', isNotSorting: true },
      { Header: <FormattedMessage id="status" />, accessor: 'status', isNotSorting: true },
      { Header: <FormattedMessage id="booking-note" />, accessor: 'bookingNote', isNotSorting: true }
    ],
    []
  );

  const doFetch = async (fetcher, pagination, setter) => {
    await fetcher({ ...pagination, ...filterParamsRef.current })
      .then((resp) => setter({ data: resp.data.data, totalPagination: resp.data.totalPagination }))
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const fetchAll = () => {
    doFetch(getDashboardUpbookingClinic, clinicPagination, setClinicData);
    doFetch(getDashboardUpbookingHotel, hotelPagination, setHotelData);
    doFetch(getDashboardUpbookingSalon, salonPagination, setSalonData);
    doFetch(getDashboardUpbookingBreeding, breedingPagination, setBreedingData);
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => {
    filterParamsRef.current = buildFilterParams({ selectedLocation, filterType, startDate, endDate, selectedMonth });
    setClinicPagination({ rowPerPage: 10, goToPage: 1 });
    setHotelPagination({ rowPerPage: 10, goToPage: 1 });
    setSalonPagination({ rowPerPage: 10, goToPage: 1 });
    setBreedingPagination({ rowPerPage: 10, goToPage: 1 });
    fetchAll();
  };

  const onGotoPageChange = (event, procedure) => {
    if (procedure === 'clinic') {
      const next = { ...clinicPagination, goToPage: event };
      setClinicPagination(next);
      doFetch(getDashboardUpbookingClinic, next, setClinicData);
    } else if (procedure === 'hotel') {
      const next = { ...hotelPagination, goToPage: event };
      setHotelPagination(next);
      doFetch(getDashboardUpbookingHotel, next, setHotelData);
    } else if (procedure === 'salon') {
      const next = { ...salonPagination, goToPage: event };
      setSalonPagination(next);
      doFetch(getDashboardUpbookingSalon, next, setSalonData);
    } else if (procedure === 'breeding') {
      const next = { ...breedingPagination, goToPage: event };
      setBreedingPagination(next);
      doFetch(getDashboardUpbookingBreeding, next, setBreedingData);
    }
  };

  const onPageSizeChange = (event, procedure) => {
    if (procedure === 'clinic') {
      const next = { ...clinicPagination, rowPerPage: event, goToPage: 1 };
      setClinicPagination(next);
      doFetch(getDashboardUpbookingClinic, next, setClinicData);
    } else if (procedure === 'hotel') {
      const next = { ...hotelPagination, rowPerPage: event, goToPage: 1 };
      setHotelPagination(next);
      doFetch(getDashboardUpbookingHotel, next, setHotelData);
    } else if (procedure === 'salon') {
      const next = { ...salonPagination, rowPerPage: event, goToPage: 1 };
      setSalonPagination(next);
      doFetch(getDashboardUpbookingSalon, next, setSalonData);
    } else if (procedure === 'breeding') {
      const next = { ...breedingPagination, rowPerPage: event, goToPage: 1 };
      setBreedingPagination(next);
      doFetch(getDashboardUpbookingBreeding, next, setBreedingData);
    }
  };

  return (
    <MainCard content={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={tabSelected}
          onChange={(_, value) => setTabSelected(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="dashboard upcoming booking tab"
        >
          <Tab label={'Pet Clinic'} id="dashboard-upcoming-booking-tab-0" aria-controls="dashboard-upcoming-booking-tabpanel-0" />
          <Tab label={'Pet Hotel'} id="dashboard-upcoming-booking-tab-1" aria-controls="dashboard-upcoming-booking-tabpanel-1" />
          <Tab label={'Pet Salon'} id="dashboard-upcoming-booking-tab-2" aria-controls="dashboard-upcoming-booking-tabpanel-2" />
          <Tab label={'Breeding'} id="dashboard-upcoming-booking-tab-3" aria-controls="dashboard-upcoming-booking-tabpanel-3" />
        </Tabs>
      </Box>

      <ScrollX>
        <Stack spacing={3}>
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ p: 3, pb: 0 }}
          >
            <Stack
              spacing={1}
              direction={matchDownSM ? 'column' : 'row'}
              alignItems="flex-end"
              style={{ width: matchDownSM ? '100%' : '' }}
            >
              <Autocomplete
                multiple
                limitTags={1}
                options={locationList}
                value={selectedLocation}
                sx={{ width: 220 }}
                isOptionEqualToValue={(option, val) => option.value === val.value}
                onChange={(_, selected) => setSelectedLocation(selected)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-branch" />} />}
              />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel htmlFor="upbooking-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="upbooking-filter-type"
                  value={filterType}
                  label={intl.formatMessage({ id: 'period' })}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="date-range">
                    <FormattedMessage id="date-range" />
                  </MenuItem>
                  <MenuItem value="monthly">
                    <FormattedMessage id="monthly" />
                  </MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {filterType === 'date-range' ? (
                  <>
                    <DesktopDatePicker
                      label={<FormattedMessage id="start-date" />}
                      inputFormat="DD/MM/YYYY"
                      value={startDate}
                      onChange={(val) => setStartDate(val)}
                      renderInput={(params) => <TextField {...params} sx={{ width: 170 }} />}
                    />
                    <DesktopDatePicker
                      label={<FormattedMessage id="end-date" />}
                      inputFormat="DD/MM/YYYY"
                      value={endDate}
                      minDate={startDate}
                      onChange={(val) => setEndDate(val)}
                      renderInput={(params) => <TextField {...params} sx={{ width: 170 }} />}
                    />
                  </>
                ) : (
                  <DesktopDatePicker
                    label={<FormattedMessage id="monthly" />}
                    views={['year', 'month']}
                    inputFormat="MM/YYYY"
                    value={selectedMonth}
                    onChange={(val) => setSelectedMonth(val)}
                    renderInput={(params) => <TextField {...params} sx={{ width: 170 }} />}
                  />
                )}
              </LocalizationProvider>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={onApplyFilter}>
                <FormattedMessage id="search" />
              </Button>
            </Stack>
          </Stack>

          <Box>
            <TabPanel value={tabSelected} index={0} name="dashboard-upcoming-booking">
              <ScrollX>
                <ReactTable
                  columns={columns}
                  data={clinicData.data}
                  totalPagination={clinicData.totalPagination}
                  onGotoPage={(event) => onGotoPageChange(event, 'clinic')}
                  onPageSize={(event) => onPageSizeChange(event, 'clinic')}
                  colSpanPagination={7}
                />
              </ScrollX>
            </TabPanel>
            <TabPanel value={tabSelected} index={1} name="dashboard-upcoming-booking">
              <ScrollX>
                <ReactTable
                  columns={columns}
                  data={hotelData.data}
                  totalPagination={hotelData.totalPagination}
                  onGotoPage={(event) => onGotoPageChange(event, 'hotel')}
                  onPageSize={(event) => onPageSizeChange(event, 'hotel')}
                  colSpanPagination={7}
                />
              </ScrollX>
            </TabPanel>
            <TabPanel value={tabSelected} index={2} name="dashboard-upcoming-booking">
              <ScrollX>
                <ReactTable
                  columns={columns}
                  data={salonData.data}
                  totalPagination={salonData.totalPagination}
                  onGotoPage={(event) => onGotoPageChange(event, 'salon')}
                  onPageSize={(event) => onPageSizeChange(event, 'salon')}
                  colSpanPagination={7}
                />
              </ScrollX>
            </TabPanel>
            <TabPanel value={tabSelected} index={3} name="dashboard-upcoming-booking">
              <ScrollX>
                <ReactTable
                  columns={columns}
                  data={breedingData.data}
                  totalPagination={breedingData.totalPagination}
                  onGotoPage={(event) => onGotoPageChange(event, 'breeding')}
                  onPageSize={(event) => onPageSizeChange(event, 'breeding')}
                  colSpanPagination={7}
                />
              </ScrollX>
            </TabPanel>
          </Box>
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

export default DashboardUpcomingBooking;
