import { useEffect, useMemo, useState } from 'react';
import { Grid, Link, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductDashboard } from './service';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import AnalyticEcommerce from 'components/dashboard/card';
import MainCard from 'components/MainCard';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';

const ProductDashboard = () => {
  const [data, setData] = useState({
    productSold: { total: '0', isLoss: false, percentage: 0 },
    productSoldQty: { total: '0', isLoss: false, percentage: 0 },
    productSoldValue: { total: '0', isLoss: false, percentage: 0 },
    barProductSales: { series: [], categories: [] },
    topSellers: [],
    pieSalesByCategory: { labels: [], series: [] },
    listed: { total: '442000', isLoss: false, percentage: 59.3 },
    lowStock: { total: '442000', isLoss: false, percentage: 59.3 },
    noStock: { total: '442000', isLoss: false, percentage: 59.3 }
  });

  const columnTopSellers = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'productName',
        isNotSorting: true,
        Cell: (data) => <Link>{data.value}</Link>
      },
      { Header: <FormattedMessage id="total" />, accessor: 'total', isNotSorting: true }
    ],
    []
  );

  useEffect(() => {
    // getProductDashboard
    const fetchData = async () => {
      const resp = await getProductDashboard();
      const { productSold, productSoldQty, productSoldValue, topSeller, salesByCategory, charts } = resp.data;

      setData((prevState) => {
        return {
          ...prevState,
          productSold: { isLoss: productSold.isLoss, percentage: productSold.percentage, total: productSold.total },
          productSoldQty: { isLoss: productSoldQty.isLoss, percentage: productSoldQty.percentage, total: productSoldQty.total },
          productSoldValue: { isLoss: productSoldValue.isLoss, percentage: productSoldValue.percentage, total: productSoldValue.total },
          pieSalesByCategory: { labels: salesByCategory.labels, series: salesByCategory.series },
          barProductSales: { categories: charts.categories, series: charts.series },
          topSellers: topSeller
        };
      });
    };

    fetchData();
  }, []);

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
          <MainCard title={<FormattedMessage id="top-sellers-rp" />} content={false}>
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
