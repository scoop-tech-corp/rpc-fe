import { Box, Grid } from '@mui/material';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesDiscountSummary({ data, filter, setFilter }) {
  const pieChart = useMemo(() => {
    return {
      series: data?.chartsDiscountValueByStaff.series || [],
      labels: data?.chartsDiscountValueByStaff.labels || []
    };
  }, [data]);

  const barChart = useMemo(() => {
    return {
      series: data?.charts.series || [],
      categories: data?.charts.categories || []
    };
  }, [data]);

  return (
    <div>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Total Discount"
              count={formatThousandSeparator(data?.totalDiscount.total || '0')}
              isLoss={Boolean(data?.totalDiscount.isLoss)}
              percentage={Number(data?.totalDiscount.percentage)}
              color={data?.totalDiscount.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Item Discounted (Rp)"
              count={formatThousandSeparator(data?.itemsDicounted.total || '0')}
              isLoss={Boolean(data?.itemsDicounted.isLoss)}
              percentage={Number(data?.itemsDicounted.percentage)}
              color={data?.itemsDicounted.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Sales Discounted (Rp)"
              count={formatThousandSeparator(data?.salesDiscounted.total || '0')}
              isLoss={Boolean(data?.salesDiscounted.isLoss)}
              percentage={Number(data?.salesDiscounted.percentage)}
              color={data?.salesDiscounted.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ margin: 2 }}>
        <MainCard title={<FormattedMessage id="discount-value-rp" />}>
          <ApexColumnChart categoriesProps={barChart.categories} seriesProps={barChart.series} />
        </MainCard>
      </Box>

      <Box sx={{ margin: 2 }}>
        <MainCard title={<FormattedMessage id="discount-value-by-staff-rp" />} content={false}>
          <ApexPieChart labelsProps={pieChart.labels} seriesProps={pieChart.series} />
        </MainCard>
      </Box>
    </div>
  );
}
