import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, CircularProgress, Typography } from '@mui/material';

const STATUS_COLORS = {
  Menunggu: '#FEB019',
  Diterima: '#00E396',
  Ditolak: '#FF4560',
  Dibatalkan: '#775DD0'
};

const fmt = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

export default function BookingByStatus({ data, loading }) {
  const chartRef = useRef(null);

  // data shape: { data: [{ status, total, value }] }
  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  // Render / update donut chart whenever rows change
  useEffect(() => {
    if (!rows.length) return;

    const labels = rows.map((r) => r.status);
    const series = rows.map((r) => r.total);
    const colors = labels.map((l) => STATUS_COLORS[l] || '#008FFB');

    const options = {
      series,
      chart: { type: 'donut', height: 380 },
      labels,
      colors,
      dataLabels: {
        formatter: (val, opts) => {
          const count = opts.w.globals.series[opts.seriesIndex];
          return `${count} (${val.toFixed(1)}%)`;
        }
      },
      legend: { position: 'bottom' },
      tooltip: { y: { formatter: (val) => `${val} booking` } },
      responsive: [{ breakpoint: 480, options: { chart: { width: 280 }, legend: { position: 'bottom' } } }]
    };

    // Destroy old chart first
    if (chartRef.current?._chart) {
      chartRef.current._chart.destroy();
      chartRef.current._chart = null;
    }

    const el = document.querySelector('#booking-status-chart');
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

    const dataRows = rows.map((r) => ({
      saleStatus: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: STATUS_COLORS[r.status] || '#ccc', flexShrink: 0 }} />
          {r.status}
        </Box>
      ),
      bookings: r.total,
      value: fmt(r.value)
    }));

    const totalCount = rows.reduce((s, r) => s + r.total, 0);
    const totalValue = rows.reduce((s, r) => s + r.value, 0);

    dataRows.push({
      saleStatus: <strong>Total</strong>,
      bookings: <strong>{totalCount}</strong>,
      value: <strong>{fmt(totalValue)}</strong>
    });

    return dataRows;
  }, [rows]);

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="sale-status" />, accessor: 'saleStatus' },
      { Header: <FormattedMessage id="bookings" />, accessor: 'bookings' },
      { Header: <FormattedMessage id="value-rp" />, accessor: 'value' }
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
          <FormattedMessage id="no-data" defaultMessage="Tidak ada data" />
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Donut chart */}
      <Box display="flex" justifyContent="center" mb={3}>
        <div ref={chartRef} id="booking-status-chart" style={{ width: 420, height: 380 }} />
      </Box>

      {/* Table */}
      <ReactTable columns={columns} data={tableData} />
    </Box>
  );
}
