import { Box, Grid } from '@mui/material';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import ApexPieChart from 'components/dashboard/pie';
import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function PromotionDashboard() {
  const { formatMessage } = useIntl();
  const tablesData = [];
  const totalPagination = 0;

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
        Header: <FormattedMessage id="product" />,
        accessor: 'product'
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
      product: 'Product 1',
      total: 4_200_000
    },
    {
      product: 'Product 2',
      total: 4_200_000
    },
    {
      product: 'Product 3',
      total: 4_200_000
    },
    {
      product: 'Product 4',
      total: 4_200_000
    },
    {
      product: 'Product 5',
      total: 4_200_000
    }
  ];

  return (
    <>
      <HeaderPageCustom title={'Promotion Dashboard'} />

      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'promo-sold' })}
              count={formatThousandSeparator(4_200_000)}
              isLoss={Boolean(true)}
              percentage={20}
              color={true ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'promo-sold-quantity' })}
              count={formatThousandSeparator(4_200_000)}
              isLoss={Boolean(false)}
              percentage={20}
              color={false ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title={formatMessage({ id: 'promo-sold-value' })}
              count={formatThousandSeparator(4_200_000)}
              isLoss={true}
              percentage={20}
              color={true ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="promo-sales-rp" />}>
          <ApexColumnChart categoriesProps={barChart.categories} seriesProps={barChart.series} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="promo-sales-rp" />} content={false}>
          <ApexPieChart labelsProps={pieChart.labels} seriesProps={pieChart.series} />
        </MainCard>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <MainCard title={<FormattedMessage id="top-sellers-rp" />}>
          <ReactTable
            columns={columns}
            data={dummyData}
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
