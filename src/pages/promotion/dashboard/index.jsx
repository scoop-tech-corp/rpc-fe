import { Box, Grid, Link } from '@mui/material';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
import { ReactTable } from 'components/third-party/ReactTable';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import { getPromotionDashboard } from './services';

const CONSTANT_CARD_ANALYTIC_DATA = { isLoss: 0, percentage: 0, total: '0' };
export default function PromotionDashboard() {
  const { formatMessage } = useIntl();
  const totalPagination = 0;
  const [barChartData, setBarChartData] = useState({
    series: [],
    categories: []
  });
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    series: []
  });
  const [chartAnalyticData, setChartAnalyticData] = useState({
    promoSold: { ...CONSTANT_CARD_ANALYTIC_DATA },
    promoSoldQuantity: { ...CONSTANT_CARD_ANALYTIC_DATA },
    promoSoldValue: { ...CONSTANT_CARD_ANALYTIC_DATA }
  });
  const [tableTopUsedPromotion, setTableTopUsedPromotion] = useState([]);

  const pieChart = useMemo(() => {
    return {
      labels: ['Pencilled-in', 'Confirmed', 'Started'],
      series: [50, 25, 25]
    };
  }, []);

  const barChart = useMemo(() => {
    return {
      series: [
        {
          name: 'Previous',
          data: [2000000, 4000000, 6000000, 8000000, 10000000, 12000000, 4000000, 6000000, 8000000, 10000000, 12000000, 2000000, 6000000]
        },
        {
          name: 'Current',
          data: [3000000, 5000000, 7000000, 9000000, 11000000, 2000000, 5000000, 7000000, 9000000, 11000000, 3000000, 5000000, 9000000]
        }
      ],
      categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    };
  }, []);

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
        accessor: 'total',
        Cell: (data) => formatThousandSeparator(data?.value || 0)
      }
    ],
    []
  );

  const dummyData = [
    {
      promotionName: 'Product 1',
      promotions: 120
    },
    {
      promotionName: 'Product 2',
      promotions: 120
    },
    {
      promotionName: 'Product 3',
      promotions: 120
    },
    {
      promotionName: 'Product 4',
      promotions: 120
    },
    {
      promotionName: 'Product 5',
      promotions: 120
    }
  ];

  useEffect(() => {
    async function fetchData() {
      const response = await getPromotionDashboard();

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
    }

    fetchData();
  }, []);

  return (
    <>
      <HeaderPageCustom title={'Promotion Dashboard'} />

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
          <ReactTable
            columns={columns}
            data={tableTopUsedPromotion}
            totalPagination={totalPagination || 0}
            colSpanPagination={14}
            // setPageNumber={filter.goToPage}
            // onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
            // setPageRow={filter.rowPerPage}
            // onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event }))}
            // onOrder={(event) => {
            //   setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
            // }}
          />
        </MainCard>
      </Box>
    </>
  );
}
