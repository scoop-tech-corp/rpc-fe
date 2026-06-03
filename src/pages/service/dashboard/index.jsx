import { Autocomplete, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getServiceDashboard } from './service';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getLocationList } from 'service/service-global';
import { ReactTable } from 'components/third-party/ReactTable';
import dayjs from 'dayjs';

import MainCard from 'components/MainCard';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
import AnalyticEcommerce from 'components/dashboard/card';
import SearchIcon from '@mui/icons-material/Search';

const buildFilterParams = ({ selectedLocation, filterType, startDate, endDate, selectedMonth }) => {
  const params = {
    branchesId: selectedLocation.map((l) => l.value),
    dateRange: filterType === 'monthly' ? 'month' : 'dateRange',
    chartGroupBy: 'date'
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

const CONSTANT_CARD_ANALYTIC_DATA = { isLoss: 0, percentage: 0, total: '0' };

const ServiceDashboard = () => {
  const intl = useIntl();

  const [chartData, setChartData] = useState({ series: [], categories: [], bookingByCategory: {} });
  const [cardAnalyticData, setCardAnalyticData] = useState({
    bookings: { ...CONSTANT_CARD_ANALYTIC_DATA },
    bookingsQty: { ...CONSTANT_CARD_ANALYTIC_DATA },
    bookingsValue: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });
  const [tableMostPopular, setTableMostPopular] = useState([]);

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const filterParamsRef = useRef(buildFilterParams(DEFAULT_FILTER));

  const columnMostPopular = useMemo(
    () => [
      { Header: <FormattedMessage id="service" />, accessor: 'serviceName', isNotSorting: true },
      { Header: <FormattedMessage id="bookings" />, accessor: 'bookings', isNotSorting: true }
    ],
    []
  );

  const fetchData = async (params) => {
    const response = await getServiceDashboard(params);
    setChartData(() => ({
      series: response.data.charts.series,
      categories: response.data.charts.categories,
      bookingByCategory: response.data.bookingsByCategory
    }));
    setCardAnalyticData(() => ({
      bookings: response.data.bookings,
      bookingsQty: response.data.bookingsQty,
      bookingsValue: response.data.bookingsValue
    }));
    setTableMostPopular(response.data.mostPopular);
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    fetchData(filterParamsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => {
    filterParamsRef.current = buildFilterParams({ selectedLocation, filterType, startDate, endDate, selectedMonth });
    fetchData(filterParamsRef.current);
  };

  return (
    <>
      <HeaderCustom title={'Service Dashboard'} isBreadcrumb={false} />

      <MainCard content={false} sx={{ mb: 2.5 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} alignItems="flex-end" sx={{ p: 3 }}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Autocomplete
                fullWidth
                multiple
                limitTags={1}
                options={locationList}
                value={selectedLocation}
                isOptionEqualToValue={(option, val) => option.value === val.value}
                onChange={(_, selected) => setSelectedLocation(selected)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-branch" />} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl fullWidth>
                <InputLabel htmlFor="service-dashboard-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="service-dashboard-filter-type"
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
            </Grid>
            {filterType === 'date-range' ? (
              <>
                <Grid item xs={6} sm={6} md={2} lg={2}>
                  <DesktopDatePicker
                    label={<FormattedMessage id="start-date" />}
                    inputFormat="DD/MM/YYYY"
                    value={startDate}
                    onChange={(val) => setStartDate(val)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={2} lg={2}>
                  <DesktopDatePicker
                    label={<FormattedMessage id="end-date" />}
                    inputFormat="DD/MM/YYYY"
                    value={endDate}
                    minDate={startDate}
                    onChange={(val) => setEndDate(val)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    sx={{ width: '100%' }}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12} sm={6} md={3} lg={3}>
                <DesktopDatePicker
                  label={<FormattedMessage id="monthly" />}
                  views={['year', 'month']}
                  inputFormat="MM/YYYY"
                  value={selectedMonth}
                  onChange={(val) => setSelectedMonth(val)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  sx={{ width: '100%' }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm="auto">
              <Button variant="contained" startIcon={<SearchIcon />} onClick={onApplyFilter} fullWidth>
                <FormattedMessage id="search" />
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </MainCard>

      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="bookings" />}
            count={cardAnalyticData.bookings.total}
            percentage={Number(cardAnalyticData.bookings.percentage)}
            isLoss={Boolean(cardAnalyticData.bookings.isLoss)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="bookings-qty" />}
            count={cardAnalyticData.bookingsQty.total}
            percentage={Number(cardAnalyticData.bookingsQty.percentage)}
            isLoss={Boolean(cardAnalyticData.bookingsQty.isLoss)}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="booking-value-rp" />}
            count={cardAnalyticData.bookingsValue.total}
            percentage={Number(cardAnalyticData.bookingsValue.percentage)}
            isLoss={Boolean(cardAnalyticData.bookingsValue.isLoss)}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid item xs={12} md={6} lg={6} sx={{ marginBottom: 3 }}>
        <MainCard title="Bookings">
          <ApexColumnChart categoriesProps={chartData.categories} seriesProps={chartData.series} />
        </MainCard>
      </Grid>

      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard title={<FormattedMessage id="most-popular" />} content={false}>
            <Stack spacing={3}>
              <Stack sx={{ p: 3 }}>
                <ReactTable columns={columnMostPopular} data={tableMostPopular || []} />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <MainCard title={<FormattedMessage id="bookings-by-category" />} content={false}>
            <ApexPieChart labelsProps={chartData.bookingByCategory.labels} seriesProps={chartData.bookingByCategory.series} />
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default ServiceDashboard;
