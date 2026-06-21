import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, CircularProgress, Typography } from '@mui/material';

const CHART_COLORS = ['#FF4560', '#FEB019', '#775DD0', '#008FFB', '#00E396', '#FF66C4', '#3F51B5', '#546E7A', '#D4526E', '#13D8AA'];

export default function BookingByCancelationReason({ data, loading }) {
  const chartRef = useRef(null);

  // data shape: { data: [{ reason, total }], grandTotal }
  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  useEffect(() => {
    if (!rows.length) return;

    const labels = rows.map((r) => r.reason);
    const series = rows.map((r) => r.total);

    const options = {
      series,
      chart: { type: 'donut', height: 420 },
      labels,
      colors: CHART_COLORS,
      dataLabels: {
        formatter: (val, opts) => {
          const count = opts.w.globals.series[opts.seriesIndex];
          return `${count} (${val.toFixed(1)}%)`;
        }
      },
      legend: { position: 'bottom', fontSize: '13px' },
      tooltip: { y: { formatter: (val) => `${val} pembatalan` } },
      responsive: [{ breakpoint: 480, options: { chart: { width: 280 }, legend: { position: 'bottom' } } }]
    };

    if (chartRef.current?._chart) {
      chartRef.current._chart.destroy();
      chartRef.current._chart = null;
    }

    const el = document.querySelector('#booking-cancel-reason-chart');
    if (el && window.ApexCharts) {
      const chart = new window.ApexCharts(el, options);
      chart.render();
      if (chartRef.current) chartRef.current._chart = chart;
    }

    const chartRefCurrent = chartRef.current;
    const chartInstance = chartRefCurrent?._chart ?? null;
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      if (chartRefCurrent) chartRefCurrent._chart = null;
    };
  }, [rows]);

  const tableData = useMemo(() => {
    if (!rows.length) return [];

    const dataRows = rows.map((r, i) => ({
      reason: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: CHART_COLORS[i % CHART_COLORS.length],
              flexShrink: 0
            }}
          />
          {r.reason}
        </Box>
      ),
      cancelliations: r.total
    }));

    const grandTotal = rows.reduce((s, r) => s + r.total, 0);
    dataRows.push({
      reason: <strong>Total</strong>,
      cancelliations: <strong>{grandTotal}</strong>
    });

    return dataRows;
  }, [rows]);

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="reason" />, accessor: 'reason' },
      { Header: <FormattedMessage id="cancelliations" />, accessor: 'cancelliations' }
    ],
    []
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <Typography color="text.secondary">
          <FormattedMessage id="no-data" defaultMessage="Tidak ada data pembatalan" />
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="center" mb={3}>
        <div ref={chartRef} id="booking-cancel-reason-chart" style={{ width: 500, height: 420 }} />
      </Box>
      <ReactTable columns={columns} data={tableData} />
    </Box>
  );
}
