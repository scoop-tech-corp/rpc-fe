import { Box, Grid } from '@mui/material';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexColumnChart from 'components/dashboard/column';
import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesNetIncome({ data, filter, setFilter }) {
  const tablesData = data?.table.data || [];
  const totalPagination = data?.table.totalPagination;
  const totalRevenue = data?.totalRevenue.total || 0;
  const totalExpenses = data?.totalExpenses.total || 0;
  const netIncome = data?.netIncome.total || 0;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="period" />,
        accessor: 'period'
      },
      {
        Header: <FormattedMessage id="revenue" />,
        accessor: 'revenueAmount',
        Cell: (data) => formatThousandSeparator(data?.value || 0)
      },
      {
        Header: <FormattedMessage id="expenses" />,
        accessor: 'expensesAmount',
        Cell: (data) => formatThousandSeparator(data?.value || 0)
      },
      {
        Header: <FormattedMessage id="net-income" />,
        accessor: 'netIncome',
        Cell: (data) => <div style={{ color: data.value < 0 ? 'red' : 'limegreen' }}>{formatThousandSeparator(data.value)}</div>
      }
    ],
    []
  );

  const revenueExpensesData = {
    series: data?.chartsRevenueAndExpenses.series || [],
    categories: data?.chartsRevenueAndExpenses.categories || []
  };

  const netIncomeData = {
    series: data?.chartsNetIncome.series || [],
    categories: data?.chartsNetIncome.categories || []
  };

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        period: 'Jan',
        revenueAmount: 2_299_755_907.95,
        expensesAmount: 20_778_500.0,
        netIncome: 2_278_977_407.95
      },
      {
        period: 'Feb',
        revenueAmount: 2_737_031_819.7,
        expensesAmount: 58_152_596.0,
        netIncome: 2_678_879_223.7
      },
      {
        period: 'Mar',
        revenueAmount: 3_271_008_567.0,
        expensesAmount: 84_560_306.0,
        netIncome: 3_186_448_261.0
      },
      {
        period: 'Apr',
        revenueAmount: 3_148_391_525.15,
        expensesAmount: 83_965_880.0,
        netIncome: 3_064_425_645.15
      },
      {
        period: 'May',
        revenueAmount: 1_498_196_588.5,
        expensesAmount: 13_430_987.0,
        netIncome: 1_484_765_607.5
      }
    ],
    []
  );

  return (
    <div>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce title={<FormattedMessage id="revenue-rp" />} count={formatThousandSeparator(totalRevenue || '0')} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce title={<FormattedMessage id="expenses-rp" />} count={formatThousandSeparator(totalExpenses || '0')} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce title={<FormattedMessage id="net-income-rp" />} count={formatThousandSeparator(netIncome || '0')} />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ margin: 2 }}>
        <MainCard title={<FormattedMessage id="revenue-expenses-rp" />}>
          <ApexColumnChart categoriesProps={revenueExpensesData.categories} seriesProps={revenueExpensesData.series} />
        </MainCard>
      </Box>

      <Box sx={{ margin: 2 }}>
        <MainCard title={<FormattedMessage id="net-income-rp" />} content={false}>
          <ApexColumnChart categoriesProps={netIncomeData.categories} seriesProps={netIncomeData.series} />
        </MainCard>
      </Box>

      <Box sx={{ margin: 2 }}>
        <ReactTable
          columns={columns}
          data={[
            ...tablesData,
            {
              period: 'TOTAL',
              revenueAmount: formatThousandSeparator(totalRevenue),
              expensesAmount: formatThousandSeparator(totalExpenses),
              netIncome: formatThousandSeparator(netIncome)
            }
          ]}
          totalPagination={totalPagination || 0}
          colSpanPagination={14}
          setPageNumber={filter.goToPage}
          onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
          setPageRow={filter.rowPerPage}
          onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event }))}
          onOrder={(event) => {
            setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
          }}
        />
      </Box>
    </div>
  );
}
