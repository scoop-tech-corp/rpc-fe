import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getLocationList } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';
import { getTransactionDashboard } from './services';
import dayjs from 'dayjs';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import ApexAreaChart from 'components/dashboard/area';
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

const EMPTY_CARD = { total: '0', percentage: 0, isLoss: 0 };

export default function TransactionDashboard() {
  const { formatMessage } = useIntl();
  const intl = useIntl();

  const [cards, setCards] = useState({
    totalTransaksi: { ...EMPTY_CARD },
    totalRevenue: { ...EMPTY_CARD },
    transaksiSelesai: { ...EMPTY_CARD },
    customerBaru: { ...EMPTY_CARD }
  });
  const [volumeChart, setVolumeChart] = useState({ series: [], categories: [] });
  const [revenueChart, setRevenueChart] = useState({ series: [], categories: [] });
  const [layananChart, setLayananChart] = useState({ labels: [], series: [] });
  const [cabangChart, setCabangChart] = useState({ series: [], categories: [] });

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
    const res = await getTransactionDashboard(params);
    const d = res.data;
    setCards({
      totalTransaksi: d.totalTransaksi,
      totalRevenue: d.totalRevenue,
      transaksiSelesai: d.transaksiSelesai,
      customerBaru: d.customerBaru
    });
    setVolumeChart(d.chartsVolume);
    setRevenueChart(d.chartsRevenue);
    setLayananChart(d.chartsLayanan);
    setCabangChart(d.chartsCabang);
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
      <HeaderPageCustom title={'Transaction Dashboard'} />

      {/* Filter */}
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
                <InputLabel htmlFor="transaction-dashboard-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="transaction-dashboard-filter-type"
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

      {/* Analytic Cards */}
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'total-transaction' })}
              count={formatThousandSeparator(cards.totalTransaksi.total)}
              isLoss={Boolean(cards.totalTransaksi.isLoss)}
              percentage={Number(cards.totalTransaksi.percentage)}
              color={cards.totalTransaksi.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'total-revenue' })}
              count={`Rp ${cards.totalRevenue.total}`}
              isLoss={Boolean(cards.totalRevenue.isLoss)}
              percentage={Number(cards.totalRevenue.percentage)}
              color={cards.totalRevenue.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'completed-transaction' })}
              count={formatThousandSeparator(cards.transaksiSelesai.total)}
              isLoss={Boolean(cards.transaksiSelesai.isLoss)}
              percentage={Number(cards.transaksiSelesai.percentage)}
              color={cards.transaksiSelesai.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'new-customer' })}
              count={formatThousandSeparator(cards.customerBaru.total)}
              isLoss={Boolean(cards.customerBaru.isLoss)}
              percentage={Number(cards.customerBaru.percentage)}
              color={cards.customerBaru.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Chart: Volume Transaksi */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={`${formatMessage({ id: 'transaction-volume' })}${chartPeriodLabel ? ` — ${chartPeriodLabel}` : ''}`}>
          <ApexColumnChart categoriesProps={volumeChart.categories} seriesProps={volumeChart.series} />
        </MainCard>
      </Box>

      {/* Chart: Distribusi per Layanan */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={formatMessage({ id: 'transaction-by-service' })}>
          <ApexPieChart labelsProps={layananChart.labels} seriesProps={layananChart.series} height={350} />
        </MainCard>
      </Box>

      {/* Chart: Tren Revenue */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={`${formatMessage({ id: 'revenue-trend' })}${chartPeriodLabel ? ` — ${chartPeriodLabel}` : ''}`}>
          <ApexAreaChart categoriesProps={revenueChart.categories} seriesProps={revenueChart.series} />
        </MainCard>
      </Box>

      {/* Chart: Transaksi per Cabang */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={formatMessage({ id: 'transaction-by-branch' })}>
          <ApexColumnChart categoriesProps={cabangChart.categories} seriesProps={cabangChart.series} />
        </MainCard>
      </Box>
    </>
  );
}
