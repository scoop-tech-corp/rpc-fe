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
