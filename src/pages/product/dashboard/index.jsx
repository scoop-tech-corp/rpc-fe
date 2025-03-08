import { useMemo, useState } from 'react';
import { Grid, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import AnalyticEcommerce from 'components/dashboard/card';
import MainCard from 'components/MainCard';
import ApexColumnChart from 'components/dashboard/column';
import { ReactTable } from 'components/third-party/ReactTable';
import ApexPieChart from 'components/dashboard/pie';

const ProductDashboard = () => {
  const [data] = useState({
    productSold: { total: '442000', isLoss: false, percentage: 59.3 },
    productSoldQty: { total: '442000', isLoss: false, percentage: 59.3 },
    productSoldValue: { total: '442000', isLoss: false, percentage: 59.3 },
    barProductSales: {
      categories: ['8', '7', '6', '5', '4', '3', '2', '1', '28', '27'],
      series: [
        {
          name: 'Previous',
          data: [10, 10, 10, 10, 30, 20, 15, 20, 18, 29]
        },
        {
          name: 'Current',
          data: [20, 40, 20, 10, 80, 30, 15, 20, 18, 29]
        }
      ]
    },
    topSellers: [
      { id: 1, productName: 'Erline Booster 20Ml', total: 46550000 },
      { id: 2, productName: 'Biodin inj (1ml)', total: 15650000 }
    ],
    pieSalesByCategory: {
      labels: ['Layanan Kesehatan Hewan', 'Pet Salon', 'Rawat Inap Zona', 'Vaksinasi'],
      series: [150, 40, 60, 70]
    },
    listed: { total: '442000', isLoss: false, percentage: 59.3 },
    lowStock: { total: '442000', isLoss: false, percentage: 59.3 },
    noStock: { total: '442000', isLoss: false, percentage: 59.3 }
  });

  const columnTopSellers = useMemo(
    () => [
      { Header: <FormattedMessage id="product" />, accessor: 'productName', isNotSorting: true },
      { Header: <FormattedMessage id="total" />, accessor: 'total', isNotSorting: true }
    ],
    []
  );

  return (
    <>
      <HeaderPageCustom title={'Product Dashboard'} />
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="product-sold" />}
            count={data?.productSold.total}
            isLoss={Boolean(data?.productSold.isLoss)}
            percentage={Number(data?.productSold.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="product-sold-quantity" />}
            count={data?.productSoldQty.total}
            isLoss={Boolean(data?.productSoldQty.isLoss)}
            percentage={Number(data?.productSoldQty.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="product-sold-value" />}
            count={data?.productSoldValue.total}
            isLoss={Boolean(data?.productSoldValue.isLoss)}
            percentage={Number(data?.productSoldValue.percentage)}
          />
        </Grid>
        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="product-sales-rp" />}>
            <ApexColumnChart categoriesProps={data.barProductSales.categories} seriesProps={data.barProductSales.series} />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MainCard title={<FormattedMessage id="most-popular" />} content={false}>
            <Stack spacing={3}>
              <Stack sx={{ p: 3 }}>
                <ReactTable columns={columnTopSellers} data={data?.topSellers || []} />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <MainCard title={<FormattedMessage id="sales-by-category" />} content={false}>
            <ApexPieChart labelsProps={data.pieSalesByCategory.labels} seriesProps={data.pieSalesByCategory.series} />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="listed" />}
            count={data?.listed.total}
            isLoss={Boolean(data?.listed.isLoss)}
            percentage={Number(data?.listed.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="low-stock" />}
            count={data?.lowStock.total}
            isLoss={Boolean(data?.lowStock.isLoss)}
            percentage={Number(data?.lowStock.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title={<FormattedMessage id="no-stock" />}
            count={data?.noStock.total}
            isLoss={Boolean(data?.noStock.isLoss)}
            percentage={Number(data?.noStock.percentage)}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ProductDashboard;
