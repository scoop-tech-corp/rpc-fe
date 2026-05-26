import { Autocomplete, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { getDashboardOverView } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

import AnalyticEcommerce from 'components/dashboard/card';
import ApexPieChart from 'components/dashboard/pie';
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

const DashboardOverview = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [dashboardOverview, setDashboardOverview] = useState({
    bookings: {},
    totalSaleValue: {},
    newCustomer: {},
    rebookRate: {},
    customerRetention: {},
    avgSaleValue: {},
    chartsBookingCategory: {},
    chartsReportingGroup: {}
  });

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const fetchData = async (params) => {
    await getDashboardOverView(params)
      .then((resp) => {
        const { bookings, totalSaleValue, newCustomer, rebookRate, avgSaleValue, customerRetention, chartsBookingCategory, chartsReportingGroup } =
          resp.data;
        setDashboardOverview((prev) => ({
          ...prev,
          bookings,
          totalSaleValue,
          newCustomer,
          rebookRate,
          avgSaleValue,
          customerRetention,
          chartsBookingCategory,
          chartsReportingGroup
        }));
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    fetchData(buildFilterParams({ selectedLocation: [], filterType: 'date-range', startDate: dayjs().startOf('month'), endDate: dayjs(), selectedMonth: dayjs() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => {
    fetchData(buildFilterParams({ selectedLocation, filterType, startDate, endDate, selectedMonth }));
  };

  return (
    <>
      <MainCard content={false} sx={{ mb: 2.5 }}>
        <ScrollX>
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ p: 3 }}
          >
            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} alignItems="flex-end" style={{ width: matchDownSM ? '100%' : '' }}>
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
                <InputLabel htmlFor="overview-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="overview-filter-type"
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
        </ScrollX>
      </MainCard>

      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Bookings"
            count={dashboardOverview?.bookings.total}
            isLoss={Boolean(dashboardOverview?.bookings.isLoss)}
            percentage={Number(dashboardOverview?.bookings.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Total sales value (Rp)"
            count={dashboardOverview?.totalSaleValue.total}
            isLoss={Boolean(dashboardOverview?.totalSaleValue.isLoss)}
            color="success"
            percentage={Number(dashboardOverview?.totalSaleValue.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="New Customers"
            count={dashboardOverview?.newCustomer.total}
            isLoss={Boolean(dashboardOverview?.newCustomer.isLoss)}
            color="warning"
            percentage={Number(dashboardOverview?.newCustomer.percentage)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <MainCard title="Booking By Category" content={false} sx={{ height: '100%' }}>
            <ApexPieChart
              labelsProps={dashboardOverview.chartsBookingCategory.labels}
              seriesProps={dashboardOverview.chartsBookingCategory.series}
            />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <MainCard title="Sales by reporting group (Rp)" content={false} sx={{ height: '100%' }}>
            <ApexPieChart
              labelsProps={dashboardOverview.chartsReportingGroup.labels}
              seriesProps={dashboardOverview.chartsReportingGroup.series}
            />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Rebook Rate"
            count={dashboardOverview?.rebookRate.total}
            isLoss={Boolean(dashboardOverview?.rebookRate.isLoss)}
            percentage={Number(dashboardOverview?.rebookRate.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Customer Retention"
            count={dashboardOverview?.customerRetention.total}
            isLoss={Boolean(dashboardOverview?.customerRetention.isLoss)}
            percentage={Number(dashboardOverview?.customerRetention.percentage)}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Average Sale Value (Rp)"
            count={dashboardOverview?.avgSaleValue.total}
            isLoss={Boolean(dashboardOverview?.avgSaleValue.isLoss)}
            percentage={Number(dashboardOverview?.avgSaleValue.percentage)}
            color="warning"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardOverview;
