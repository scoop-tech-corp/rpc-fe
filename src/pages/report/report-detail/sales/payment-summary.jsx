import { Box, Grid } from '@mui/material';
import AnalyticEcommerce from 'components/dashboard/card';
import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesPaymentSummary({ data, filter, setFilter }) {
  const pieChart = useMemo(() => {
    return {
      series: data?.chartsDiscountValueByStaff.series || [],
      labels: data?.chartsDiscountValueByStaff.labels || []
    };
  }, [data]);

  const tablesData = data?.table.data || [];
  const totalPagination = data?.table.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="method" />,
        accessor: 'method'
      },
      {
        Header: <FormattedMessage id="total" />,
        accessor: 'totalAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="refund" />,
        accessor: 'refundAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="net" />,
        accessor: 'netAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    []
  );

  useEffect(() => {
    const options = {
      series: pieChart.series,
      chart: {
        type: 'donut',
        width: 750,
        height: 750
      },
      labels: pieChart.labels, // Set reasons as labels for better representation,
      title: {
        text: 'Payments By Method (Rp)', // Menambahkan judul
        align: 'left', // Posisi kiri (tetap di atas, perlu CSS untuk pindah ke samping)
        offsetX: 20,
        margin: 20,
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };

    const chart = new ApexCharts(document.querySelector('#pieChart'), options);
    chart.render();

    // Cleanup function
    return () => {
      chart.destroy();
    };
  }, [pieChart]);

  return (
    <div>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={3} sx={{ marginBottom: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Total Payments (Rp)"
              count={formatThousandSeparator(data?.totalPayments.total || '0')}
              isLoss={Boolean(data?.totalPayments.isLoss)}
              percentage={Number(data?.totalPayments.percentage)}
              color={data?.totalPayments.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Item Discounted (Rp)"
              count={formatThousandSeparator(data?.totalRefunds.total || '0')}
              isLoss={Boolean(data?.totalRefunds.isLoss)}
              percentage={Number(data?.totalRefunds.percentage)}
              color={data?.totalRefunds.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Item Discounted (Rp)"
              count={formatThousandSeparator(data?.netPayments.total || '0')}
              isLoss={Boolean(data?.netPayments.isLoss)}
              percentage={Number(data?.netPayments.percentage)}
              color={data?.netPayments.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      <div id="pieChart" style={{ marginBottom: 20 }} />

      <ReactTable
        columns={columns}
        data={tablesData}
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
    </div>
  );
}
