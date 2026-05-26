import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, useMediaQuery } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { getDashboardRecentActivity } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

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

const DEFAULT_PAGINATION = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };

const DEFAULT_FILTER = {
  selectedLocation: [],
  filterType: 'date-range',
  startDate: dayjs().startOf('month'),
  endDate: dayjs(),
  selectedMonth: dayjs()
};

const DashboardRecentActivity = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [recentActivityData, setRecentActivityData] = useState({ data: [], totalPagination: 0 });
  const [pagination, setPagination] = useState({ ...DEFAULT_PAGINATION });

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const filterParamsRef = useRef(buildFilterParams(DEFAULT_FILTER));

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="date" />, accessor: 'date', isNotSorting: true },
      { Header: <FormattedMessage id="staff" />, accessor: 'staff', isNotSorting: true },
      { Header: <FormattedMessage id="module" />, accessor: 'module', isNotSorting: true },
      { Header: <FormattedMessage id="event" />, accessor: 'event', isNotSorting: true },
      { Header: <FormattedMessage id="details" />, accessor: 'detail', isNotSorting: true }
    ],
    []
  );

  const fetchData = async (paginationOverride) => {
    const payload = { ...(paginationOverride ?? pagination), ...filterParamsRef.current };
    await getDashboardRecentActivity(payload)
      .then((resp) => {
        setRecentActivityData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    fetchData({ ...DEFAULT_PAGINATION });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => {
    filterParamsRef.current = buildFilterParams({ selectedLocation, filterType, startDate, endDate, selectedMonth });
    const resetPagination = { ...DEFAULT_PAGINATION };
    setPagination(resetPagination);
    fetchData(resetPagination);
  };

  const onGotoPageChange = (event) => {
    const next = { ...pagination, goToPage: event };
    setPagination(next);
    fetchData(next);
  };

  const onPageSizeChange = (event) => {
    const next = { ...pagination, rowPerPage: event, goToPage: 1 };
    setPagination(next);
    fetchData(next);
  };

  return (
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
                <InputLabel htmlFor="activity-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="activity-filter-type"
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
            <ReactTable
              columns={columns}
              data={recentActivityData.data}
              totalPagination={recentActivityData.totalPagination}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Box>
        </Stack>
      </ScrollX>
    </MainCard>
  );
};

export default DashboardRecentActivity;
