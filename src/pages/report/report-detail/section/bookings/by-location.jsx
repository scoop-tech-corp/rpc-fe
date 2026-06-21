import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo, useEffect, useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, CircularProgress, MenuItem, Select, Stack, Typography } from '@mui/material';
import { getReportBookingByLocation } from 'pages/report/service';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const CHART_COLORS = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800'];

export default function BookingByLocation() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - i);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getReportBookingByLocation({ year });
        setReportData(res?.data?.data || []);
      } catch (e) {
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [year]);

  // Render chart whenever reportData changes
  useEffect(() => {
    if (loading || reportData.length === 0) return;

    const series = reportData.map((loc) => ({
      name: loc.locationName,
      data: loc.months.map((m) => m.booking)
    }));

    const options = {
      series,
      chart: {
        height: 350,
        type: 'line',
        dropShadow: { enabled: true, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2 },
        toolbar: { show: false }
      },
      colors: CHART_COLORS,
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      grid: { borderColor: '#e7e7e7', row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } },
      markers: { size: 4 },
      xaxis: {
        categories: MONTH_LABELS,
        title: { text: 'Bulan' }
      },
      yaxis: {
        title: { text: 'Jumlah Booking' },
        min: 0
      },
      legend: { position: 'top', horizontalAlign: 'right' },
      tooltip: { y: { formatter: (val) => `${val} booking` } }
    };

    // Destroy old chart if any
    if (chartRef.current && chartRef.current._chart) {
      chartRef.current._chart.destroy();
    }

    if (window.ApexCharts) {
      const el = document.querySelector('#booking-location-chart');
      if (el) {
        const chart = new window.ApexCharts(el, options);
        chart.render();
        if (chartRef.current) chartRef.current._chart = chart;
      }
    }

    const chartRefCurrent = chartRef.current;
    const chartInstance = chartRefCurrent?._chart ?? null;
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      if (chartRefCurrent) chartRefCurrent._chart = null;
    };
  }, [reportData, loading]);

  // Table: one row per location with total booking & total value
  const tableData = useMemo(() => {
    if (!reportData.length) return [];
    const rows = reportData.map((loc) => ({
      location: loc.locationName,
      bookings: loc.totalBooking,
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(loc.totalValue)
    }));
    const totalBooking = reportData.reduce((s, l) => s + l.totalBooking, 0);
    const totalValue = reportData.reduce((s, l) => s + l.totalValue, 0);
    rows.push({
      location: <strong>Total</strong>,
      bookings: <strong>{totalBooking}</strong>,
      value: (
        <strong>
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue)}
        </strong>
      )
    });
    return rows;
  }, [reportData]);

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="location" />, accessor: 'location' },
      { Header: <FormattedMessage id="bookings" />, accessor: 'bookings' },
      { Header: <FormattedMessage id="value-rp" />, accessor: 'value' }
    ],
    []
  );

  return (
    <Box>
      {/* Year selector */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="body2">
          <FormattedMessage id="year" defaultMessage="Tahun" />:
        </Typography>
        <Select size="small" value={year} onChange={(e) => setYear(e.target.value)}>
          {yearOptions.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <div ref={chartRef} id="booking-location-chart" style={{ marginBottom: 24 }} />
          <ReactTable columns={columns} data={tableData} />
        </>
      )}
    </Box>
  );
}
