import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getLocationList } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';
import { getStaffDashboard } from './services';
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

export default function StaffDashboard() {
  const { formatMessage } = useIntl();
  const intl = useIntl();

  const [cards, setCards] = useState({
    totalStaff: { ...EMPTY_CARD },
    staffBaru: { ...EMPTY_CARD },
    tingkatKehadiran: { ...EMPTY_CARD },
    rataRataJamKerja: { ...EMPTY_CARD }
  });
  const [kehadiranChart, setKehadiranChart] = useState({ series: [], categories: [] });
  const [pertumbuhanChart, setPertumbuhanChart] = useState({ series: [], categories: [] });
  const [cabangChart, setCabangChart] = useState({ labels: [], series: [] });
  const [performaChart, setPerformaChart] = useState({ series: [], categories: [] });

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
    const res = await getStaffDashboard(params);
    const d = res.data;
    setCards({
      totalStaff: d.totalStaff,
      staffBaru: d.staffBaru,
      tingkatKehadiran: d.tingkatKehadiran,
      rataRataJamKerja: d.rataRataJamKerja
    });
    setKehadiranChart(d.chartsKehadiran);
    setPertumbuhanChart(d.chartsPertumbuhanStaff);
    setCabangChart(d.chartsCabang);
    setPerformaChart(d.chartsPerforma);
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
      <HeaderPageCustom title={'Staff Dashboard'} />

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
                <InputLabel htmlFor="staff-dashboard-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="staff-dashboard-filter-type"
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
              title={formatMessage({ id: 'total-staff' })}
              count={formatThousandSeparator(cards.totalStaff.total)}
              isLoss={Boolean(cards.totalStaff.isLoss)}
              percentage={Number(cards.totalStaff.percentage)}
              color={cards.totalStaff.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'new-staff' })}
              count={formatThousandSeparator(cards.staffBaru.total)}
              isLoss={Boolean(cards.staffBaru.isLoss)}
              percentage={Number(cards.staffBaru.percentage)}
              color={cards.staffBaru.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'attendance-rate' })}
              count={`${cards.tingkatKehadiran.total}%`}
              isLoss={Boolean(cards.tingkatKehadiran.isLoss)}
              percentage={Number(cards.tingkatKehadiran.percentage)}
              color={cards.tingkatKehadiran.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'avg-working-hours' })}
              count={`${cards.rataRataJamKerja.total} hrs`}
              isLoss={Boolean(cards.rataRataJamKerja.isLoss)}
              percentage={Number(cards.rataRataJamKerja.percentage)}
              color={cards.rataRataJamKerja.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Chart: Kehadiran Harian */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={`${formatMessage({ id: 'daily-attendance' })}${chartPeriodLabel ? ` — ${chartPeriodLabel}` : ''}`}>
          <ApexColumnChart categoriesProps={kehadiranChart.categories} seriesProps={kehadiranChart.series} />
        </MainCard>
      </Box>

      {/* Chart: Distribusi per Cabang */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={formatMessage({ id: 'staff-by-branch' })}>
          <ApexPieChart labelsProps={cabangChart.labels} seriesProps={cabangChart.series} height={350} />
        </MainCard>
      </Box>

      {/* Chart: Pertumbuhan Staff */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={`${formatMessage({ id: 'staff-growth' })}${chartPeriodLabel ? ` — ${chartPeriodLabel}` : ''}`}>
          <ApexAreaChart categoriesProps={pertumbuhanChart.categories} seriesProps={pertumbuhanChart.series} />
        </MainCard>
      </Box>

      {/* Chart: Performa Staff */}
      <Box sx={{ mt: 2 }}>
        <MainCard title={`${formatMessage({ id: 'staff-performance' })}${chartPeriodLabel ? ` — ${chartPeriodLabel}` : ''}`}>
          <ApexColumnChart categoriesProps={performaChart.categories} seriesProps={performaChart.series} />
        </MainCard>
      </Box>
    </>
  );
}
