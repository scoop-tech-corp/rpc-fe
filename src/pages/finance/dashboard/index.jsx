import { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import { getFinanceDashboard } from './services';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';

const CONSTANT_CARD_ANALYTIC_DATA = { isLoss: 0, percentage: 0, amount: '0' };
export default function PromotionDashboard() {
  const { formatMessage } = useIntl();
  const [barChartData, setBarChartData] = useState({
    series: [],
    categories: []
  });
  const [pieChartSalesByItemData, setPieChartSalesByItemData] = useState({
    labels: [],
    series: []
  });
  const [pieChartSalesByLocationData, setPieChartSalesByLocationData] = useState({
    labels: [],
    series: []
  });
  const [pieChartSalesByReportGroupData, setPieChartSalesByReportGroupData] = useState({
    labels: [],
    series: []
  });
  const [chartAnalyticData, setChartAnalyticData] = useState({
    noSales: { ...CONSTANT_CARD_ANALYTIC_DATA },
    totalSalesValue: { ...CONSTANT_CARD_ANALYTIC_DATA },
    averageSalesValue: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });

  useEffect(() => {
    async function fetchData() {
      const response = await getFinanceDashboard();
      console.log('response', response);

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
    }

    fetchData();
  }, []);

  return (
    <>
      <HeaderPageCustom title={'Finance Dashboard'} />

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
