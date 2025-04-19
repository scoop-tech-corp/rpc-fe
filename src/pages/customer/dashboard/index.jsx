import { Box, Grid } from '@mui/material';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import ApexAreaChart from 'components/dashboard/area';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import { getCustomerDashboard } from './services';

const CONSTANT_CARD_ANALYTIC_DATA = { isLoss: 0, percentage: 0, total: '0' };
export default function CustomerDashboard() {
  const { formatMessage } = useIntl();
  const [barChartData, setBarChartData] = useState({
    series: [],
    categories: []
  });
  const [areaChartData, setAreaChartData] = useState({
    labels: [],
    series: []
  });
  const [chartAnalyticData, setChartAnalyticData] = useState({
    newCustomer: { ...CONSTANT_CARD_ANALYTIC_DATA },
    feedback: { ...CONSTANT_CARD_ANALYTIC_DATA },
    supportRequested: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });

  const areaChart = {
    series: [
      {
        name: 'Previous',
        data: [20, 40, 60, 80, 100, 120, 40, 60, 80, 100, 120, 200]
      },
      {
        name: 'Current',
        date: [10, 30, 50, 70, 90, 110, 30, 50, 70, 90, 110, 130]
      }
    ],
    categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  };

  // const areaChart = useMemo(() => {
  //   return {
  //     series: [
  //       {
  //         name: 'Previous',
  //         data: [200, 400, 600, 800, 1000, 1200, 400, 600, 800, 1000, 1200, 2000]
  //       },
  //       {
  //         name: 'Current',
  //         date: [300, 500, 700, 900, 1100, 1300, 500, 700, 900, 1100, 1300, 3000]
  //       }
  //     ],
  //     categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  //   };
  // }, []);

  const barChart = useMemo(() => {
    return {
      series: [
        {
          name: 'Previous',
          data: [20, 40, 60, 80, 100, 120, 40, 60, 80, 100, 120, 200]
        },
        {
          name: 'Current',
          data: [30, 50, 70, 90, 110, 20, 50, 70, 90, 110, 110, 180]
        }
      ],
      categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const response = await getCustomerDashboard();
      setBarChartData(response.data.chartsCustomerGrowth);
      setAreaChartData(response.data.chartsTotalCustomer);

      setChartAnalyticData({
        newCustomer: response.data.newCustomer,
        feedback: response.data.feedback,
        supportRequested: response.data.supportRequested
      });
    }
    fetchData();
  }, []);

  return (
    <>
      <HeaderPageCustom title={'Customer Dashboard'} />

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
        <MainCard title={<FormattedMessage id="customer-growth" />}>
          <ApexColumnChart categoriesProps={barChartData.categories} seriesProps={barChartData.series} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="total-customer" />}>
          <ApexAreaChart categoriesProps={areaChartData.categories} seriesProps={areaChartData.series} />
        </MainCard>
      </Box>
    </>
  );
}
