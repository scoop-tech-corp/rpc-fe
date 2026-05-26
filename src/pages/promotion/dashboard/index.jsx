import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  useMediaQuery
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import { getLocationList } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';
import { getPromotionDashboard } from './services';
import dayjs from 'dayjs';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
import { ReactTable } from 'components/third-party/ReactTable';
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

export default function PromotionDashboard() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { formatMessage } = useIntl();
  const intl = useIntl();
  const totalPagination = 0;

  const [barChartData, setBarChartData] = useState({ series: [], categories: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], series: [] });
  const [chartAnalyticData, setChartAnalyticData] = useState({
    promoSold: { ...CONSTANT_CARD_ANALYTIC_DATA },
    promoSoldQuantity: { ...CONSTANT_CARD_ANALYTIC_DATA },
    promoSoldValue: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });
  const [tableTopUsedPromotion, setTableTopUsedPromotion] = useState([]);

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [filterType, setFilterType] = useState('date-range');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const filterParamsRef = useRef(buildFilterParams(DEFAULT_FILTER));

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="promotion" />,
        accessor: 'promotionName',
        Cell: (data) => {
          const onClickDetail = () => {};
          return <Link onClick={() => onClickDetail()}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="total" />,
        accessor: 'promotions',
        Cell: (data) => formatThousandSeparator(data?.value || 0)
      }
    ],
    []
  );

  const fetchData = async (params) => {
    const response = await getPromotionDashboard(params);
    setTableTopUsedPromotion(response.data.mostPopular);
    setBarChartData({
      series: response.data.charts.series,
      categories: response.data.charts.categories
    });
    setPieChartData({
      labels: response.data.promotionsByCategory.labels,
      series: response.data.promotionsByCategory.series
    });
    setChartAnalyticData({
      promoSold: response.data.promotions,
      promoSoldQuantity: response.data.promotionsQty,
      promoSoldValue: response.data.promotionsValue
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
      <HeaderPageCustom title={'Promotion Dashboard'} />

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
                <InputLabel htmlFor="promotion-dashboard-filter-type">
                  <FormattedMessage id="period" />
                </InputLabel>
                <Select
                  id="promotion-dashboard-filter-type"
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
              title={formatMessage({ id: 'promo-sold' })}
              count={formatThousandSeparator(chartAnalyticData.promoSold.total)}
              isLoss={Boolean(chartAnalyticData.promoSold.isLoss)}
              percentage={chartAnalyticData.promoSold.percentage}
              color={chartAnalyticData.promoSold.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'promo-sold-quantity' })}
              count={formatThousandSeparator(chartAnalyticData.promoSoldQuantity.total)}
              isLoss={Boolean(chartAnalyticData.promoSoldQuantity.isLoss)}
              percentage={chartAnalyticData.promoSoldQuantity.percentage}
              color={chartAnalyticData.promoSoldQuantity.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'promo-sold-value' })}
              count={formatThousandSeparator(chartAnalyticData.promoSoldValue.total)}
              isLoss={Boolean(chartAnalyticData.promoSoldValue.isLoss)}
              percentage={chartAnalyticData.promoSoldValue.percentage}
              color={chartAnalyticData.promoSoldValue.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="promo-sales-rp" />}>
          <ApexColumnChart categoriesProps={barChartData.categories} seriesProps={barChartData.series} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="promo-by-category" />} content={false}>
          <ApexPieChart labelsProps={pieChartData.labels} seriesProps={pieChartData.series} height={450} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="top-used-promotion-rp" />}>
          <ReactTable columns={columns} data={tableTopUsedPromotion} totalPagination={totalPagination || 0} colSpanPagination={14} />
        </MainCard>
      </Box>
    </>
  );
}
