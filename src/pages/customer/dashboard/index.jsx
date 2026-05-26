import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import { getLocationList } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';
import { getCustomerDashboard } from './services';
import dayjs from 'dayjs';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ApexAreaChart from 'components/dashboard/area';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
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

const buildChartPeriodLabel = ({ filterType, startDate, endDate, selectedMonth }) => {
  if (filterType === 'monthly') {
    return selectedMonth ? selectedMonth.format('MMMM YYYY') : '';
  }
  const from = startDate ? startDate.format('DD MMM YYYY') : '';
  const to = endDate ? endDate.format('DD MMM YYYY') : '';
  return from && to ? `${from} - ${to}` : '';
};

const DEFAULT_FILTER = {
  selectedLocation: [],
  filterType: 'date-range',
  startDate: dayjs().startOf('month'),
  endDate: dayjs(),
  selectedMonth: dayjs()
};

const CONSTANT_CARD_ANALYTIC_DATA = { isLoss: 0, percentage: 0, total: '0' };

export default function CustomerDashboard() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { formatMessage } = useIntl();
  const intl = useIntl();

  const [barChartData, setBarChartData] = useState({ series: [], categories: [] });
  const [areaChartData, setAreaChartData] = useState({ labels: [], series: [] });
  const [chartAnalyticData, setChartAnalyticData] = useState({
    newCustomer: { ...CONSTANT_CARD_ANALYTIC_DATA },
    feedback: { ...CONSTANT_CARD_ANALYTIC_DATA },
    supportRequested: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [chartPeriodLabel, setChartPeriodLabel] = useState(
    buildChartPeriodLabel({ filterType: 'date-range', startDate: dayjs().startOf('month'), endDate: dayjs(), selectedMonth: dayjs() })
  );

  const filterParamsRef = useRef(buildFilterParams(DEFAULT_FILTER));

  const fetchData = async (params) => {
    const response = await getCustomerDashboard(params);
    setBarChartData(response.data.chartsCustomerGrowth);
    setAreaChartData(response.data.chartsTotalCustomer);
    setChartAnalyticData({
      newCustomer: response.data.newCustomer,
      feedback: response.data.feedback,
      supportRequested: response.data.supportRequested
    });
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    fetchData(filterParamsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => {
    filterParamsRef.current = buildFilterParams({ selectedLocation, filterType, startDate, endDate, selectedMonth });
    setChartPeriodLabel(buildChartPeriodLabel({ filterType, startDate, endDate, selectedMonth }));
    fetchData(filterParamsRef.current);
  };

  return (
    <>
      <HeaderPageCustom title={'Customer Dashboard'} />

      <MainCard content={false} sx={{ mb: 2.5 }}>
        <ScrollX>
          <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 3 }}>
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
                <InputLabel htmlFor="customer-dashboard-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="customer-dashboard-filter-type"
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

      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'new-customer' })}
              count={formatThousandSeparator(chartAnalyticData.newCustomer.total)}
              isLoss={Boolean(chartAnalyticData.newCustomer.isLoss)}
              percentage={Number(chartAnalyticData.newCustomer.percentage)}
              color={chartAnalyticData.newCustomer.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'feedback' })}
              count={formatThousandSeparator(chartAnalyticData.feedback.total)}
              isLoss={Boolean(chartAnalyticData.feedback.isLoss)}
              percentage={Number(chartAnalyticData.feedback.percentage)}
              color={chartAnalyticData.feedback.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'support-requested' })}
              count={formatThousandSeparator(chartAnalyticData.supportRequested.total)}
              isLoss={Boolean(chartAnalyticData.supportRequested.isLoss)}
              percentage={Number(chartAnalyticData.supportRequested.percentage)}
              color={chartAnalyticData.supportRequested.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={`${formatMessage({ id: 'customer-growth' })}${chartPeriodLabel ? ` — ${chartPeriodLabel}` : ''}`}>
          <ApexColumnChart categoriesProps={barChartData.categories} seriesProps={barChartData.series} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={`${formatMessage({ id: 'total-customer' })}${chartPeriodLabel ? ` — ${chartPeriodLabel}` : ''}`}>
          <ApexAreaChart categoriesProps={areaChartData.categories} seriesProps={areaChartData.series} />
        </MainCard>
      </Box>
    </>
  );
}
