import { Box, Grid } from '@mui/material';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/dashboard/card';
import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
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
        text: 'Discount value by staff (RP)', // Menambahkan judul
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

  useEffect(() => {
    // Create the chart options using dummyChartData
    const options = {
      series: barChart.series,
      chart: {
        height: 350,
        type: 'bar',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      colors: ['#77B6EA', '#545454'],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: '',
        align: 'left'
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: barChart.categories
      },
      yaxis: {
        title: {
          text: 'Discount Value (Rp)'
        }
        // min: 5,
        // max: 40
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center'
        // floating: true,
        // offsetY: -25,
        // offsetX: -5
      }
    };

    const chart = new ApexCharts(document.querySelector('#barChart'), options);
    chart.render();

    // Cleanup function
    return () => {
      chart.destroy();
    };
  }, [barChart]);

  return (
    <div>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={3} sx={{ marginBottom: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Total Discount"
              count={formatThousandSeparator(data?.totalDiscount.total || '0')}
              isLoss={Boolean(data?.totalDiscount.isLoss)}
              percentage={Number(data?.totalDiscount.percentage)}
              // color={data?.totalDiscount.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Item Discounted (Rp)"
              count={formatThousandSeparator(data?.itemsDicounted.total || '0')}
              isLoss={Boolean(data?.itemsDicounted.isLoss)}
              percentage={Number(data?.itemsDicounted.percentage)}
              // color={data?.totalDiscount.isLoss ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticEcommerce
              title="Item Discounted (Rp)"
              count={formatThousandSeparator(data?.salesDiscounted.total || '0')}
              isLoss={Boolean(data?.salesDiscounted.isLoss)}
              percentage={Number(data?.salesDiscounted.percentage)}
              // color={data?.totalDiscount.isLoss ? 'warning' : 'success'}
            />
          </Grid>
        </Grid>
      </Box>

      <div id="barChart" style={{ marginBottom: 20 }} />
      <div id="pieChart" style={{ marginBottom: 20 }} />
    </div>
  );
}
