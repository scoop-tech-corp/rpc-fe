import { useEffect, useState, useMemo } from 'react';
import { getServiceDashboard } from './service';
import { FormattedMessage } from 'react-intl';
import { Stack, Grid } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';

import MainCard from 'components/MainCard';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
import AnalyticEcommerce from 'components/dashboard/card';

const CONSTANT_CARD_ANALYTIC_DATA = { isLoss: 0, percentage: 0, total: '0' };
const ServiceDashboard = () => {
  const [chartData, setChartData] = useState({ series: [], categories: [], bookingByCategory: {} });
  const [cardAnalyticData, setCardAnalyticData] = useState({
    bookings: { ...CONSTANT_CARD_ANALYTIC_DATA },
    bookingsQty: { ...CONSTANT_CARD_ANALYTIC_DATA },
    bookingsValue: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });
  const [tableMostPopular, setTableMostPopular] = useState([]);

  const columnMostPopular = useMemo(
    () => [
      { Header: <FormattedMessage id="service" />, accessor: 'serviceName', isNotSorting: true },
      { Header: <FormattedMessage id="bookings" />, accessor: 'bookings', isNotSorting: true }
    ],
    []
  );

  useEffect(() => {
    async function fetchData() {
      // You can await here
      const response = await await getServiceDashboard();
      console.log('getResp dashboard service', response.data);
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
    }
    fetchData();
  }, []);

  return (
    <>
      <HeaderCustom title={'Service Dashboard'} isBreadcrumb={false} />
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
