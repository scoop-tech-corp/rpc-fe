import { useEffect, useRef, useState } from 'react';
import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getLocationList } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';
import { getFinanceDashboard } from './services';
import dayjs from 'dayjs';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
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

const CONSTANT_CARD_ANALYTIC_DATA = { isLoss: 0, percentage: 0, amount: '0' };

export default function FinanceDashboard() {
  const { formatMessage } = useIntl();
  const intl = useIntl();

  const [barChartData, setBarChartData] = useState({ series: [], categories: [] });
  const [pieChartSalesByItemData, setPieChartSalesByItemData] = useState({ labels: [], series: [] });
  const [pieChartSalesByLocationData, setPieChartSalesByLocationData] = useState({ labels: [], series: [] });
  const [pieChartSalesByReportGroupData, setPieChartSalesByReportGroupData] = useState({ labels: [], series: [] });
  const [chartAnalyticData, setChartAnalyticData] = useState({
    noSales: { ...CONSTANT_CARD_ANALYTIC_DATA },
    totalSalesValue: { ...CONSTANT_CARD_ANALYTIC_DATA },
    averageSalesValue: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const filterParamsRef = useRef(buildFilterParams(DEFAULT_FILTER));

  const fetchData = async (params) => {
    const response = await getFinanceDashboard(params);

    setBarChartData({
      series: response.data.charts.series,
      categories: response.data.charts.categories
    });
    setPieChartSalesByItemData({
      labels: response.data.salesByItemType.labels,
      series: response.data.salesByItemType.series
    });
    setPieChartSalesByLocationData({
      labels: response.data.salesByLocation.labels,
      series: response.data.salesByLocation.series
    });
    setPieChartSalesByReportGroupData({
      labels: response.data.salesByReportingGroup.labels,
      series: response.data.salesByReportingGroup.series
    });
    setChartAnalyticData({
      noSales: response.data.numberSales,
      totalSalesValue: response.data.totalSalesValue,
      averageSalesValue: response.data.averageSalesValue
    });
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
      <HeaderPageCustom title={'Finance Dashboard'} />

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
                <InputLabel htmlFor="finance-dashboard-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="finance-dashboard-filter-type"
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

      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'no-sales' })}
              count={formatThousandSeparator(chartAnalyticData.noSales.amount)}
              isLoss={Boolean(chartAnalyticData.noSales?.isLoss)}
              percentage={chartAnalyticData.noSales?.percentage}
              color={chartAnalyticData.noSales?.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'total-sales-value' })}
              count={formatThousandSeparator(chartAnalyticData?.totalSalesValue?.amount)}
              isLoss={Boolean(chartAnalyticData.totalSalesValue?.isLoss)}
              percentage={chartAnalyticData.totalSalesValue?.percentage}
              color={chartAnalyticData.totalSalesValue?.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'average-sales-value' })}
              count={formatThousandSeparator(chartAnalyticData?.averageSalesValue?.amount)}
              isLoss={Boolean(chartAnalyticData.averageSalesValue?.isLoss)}
              percentage={chartAnalyticData.averageSalesValue?.percentage}
              color={chartAnalyticData.averageSalesValue?.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="sales-value-rp" />}>
          <ApexColumnChart categoriesProps={barChartData.categories} seriesProps={barChartData.series} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="sales-by-item" />} content={false}>
          <ApexPieChart labelsProps={pieChartSalesByItemData.labels} seriesProps={pieChartSalesByItemData.series} height={450} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="sales-by-location" />} content={false}>
          <ApexPieChart labelsProps={pieChartSalesByLocationData.labels} seriesProps={pieChartSalesByLocationData.series} height={450} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="sales-by-reporting-group" />} content={false}>
          <ApexPieChart
            labelsProps={pieChartSalesByReportGroupData.labels}
            seriesProps={pieChartSalesByReportGroupData.series}
            height={450}
          />
        </MainCard>
      </Box>
    </>
  );
}
