import PropTypes from 'prop-types';
import { useState, lazy, Suspense } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Paper,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { UserOutlined, DollarOutlined, BarChartOutlined, TrophyOutlined, FilterOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

// Lazy load chart to avoid SSR issues
const ReactApexChart = lazy(() => import('react-apexcharts'));

// ── Constants ─────────────────────────────────────────────────────────────────
const CHANNEL_COLORS = {
  Clinic: '#4361EE',
  Hotel: '#3A86FF',
  Salon: '#FB5607',
  Breeding: '#8338EC',
  'Pet Shop': '#06D6A0'
};

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n ?? 0);

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub, color = '#4361EE' }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <Box sx={{ color, fontSize: 22 }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
SummaryCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  value: PropTypes.string,
  sub: PropTypes.string,
  color: PropTypes.string
};

// ── Top 10 Bar Chart ──────────────────────────────────────────────────────────
function Top10Chart({ chart, mode }) {
  const intl = useIntl();
  if (!chart?.categories?.length) return null;

  const isSpendMode = mode === 'spend';
  const series = isSpendMode ? chart.seriesSpend : chart.seriesTx;
  const categories = chart.categories;

  const options = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
    colors: ['#4361EE'],
    dataLabels: {
      enabled: true,
      formatter: isSpendMode ? (v) => `Rp ${fmt(v)}` : (v) => v,
      style: { fontSize: '10px', fontWeight: 600 }
    },
    xaxis: {
      categories,
      labels: {
        formatter: isSpendMode ? (v) => `Rp ${fmt(v)}` : (v) => v,
        style: { fontSize: '10px' }
      }
    },
    yaxis: { labels: { style: { fontSize: '11px' } } },
    tooltip: {
      y: { formatter: isSpendMode ? (v) => `Rp ${fmt(v)}` : (v) => `${v} ${intl.formatMessage({ id: 'transactions' })}` }
    },
    grid: { borderColor: '#f0f0f0' }
  };

  return (
    <Suspense fallback={<CircularProgress size={24} />}>
      <ReactApexChart type="bar" series={series} options={options} height={Math.max(200, categories.length * 38)} />
    </Suspense>
  );
}
Top10Chart.propTypes = { chart: PropTypes.object, mode: PropTypes.string };

// ── Donut Chart (by channel) ──────────────────────────────────────────────────
function ChannelDonut({ channelTotals }) {
  if (!channelTotals?.length) return null;
  const labels = channelTotals.map((c) => c.label);
  const values = channelTotals.map((c) => c.value);
  const colors = labels.map((l) => CHANNEL_COLORS[l] ?? '#aaa');

  const options = {
    chart: { type: 'donut', toolbar: { show: false } },
    labels,
    colors,
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { formatter: (v) => `${v.toFixed(1)}%` },
    tooltip: { y: { formatter: (v) => `Rp ${fmt(v)}` } },
    plotOptions: { pie: { donut: { size: '65%' } } }
  };

  return (
    <Suspense fallback={<CircularProgress size={24} />}>
      <ReactApexChart type="donut" series={values} options={options} height={280} />
    </Suspense>
  );
}
ChannelDonut.propTypes = { channelTotals: PropTypes.array };

// ── Data Table ────────────────────────────────────────────────────────────────
const COLUMNS = [
  { id: 'no', label: 'No', sortable: false, align: 'center', width: 48 },
  { id: 'customerName', label: 'customer-name', sortable: true, align: 'left' },
  { id: 'customerGroup', label: 'customer-group', sortable: false, align: 'left' },
  { id: 'totalTransactions', label: 'total-tx', sortable: true, align: 'center' },
  { id: 'clinicSpend', label: 'clinic', sortable: true, align: 'right' },
  { id: 'hotelSpend', label: 'hotel', sortable: true, align: 'right' },
  { id: 'salonSpend', label: 'salon', sortable: true, align: 'right' },
  { id: 'breedingSpend', label: 'breeding', sortable: true, align: 'right' },
  { id: 'petshopSpend', label: 'pet-shop', sortable: true, align: 'right' },
  { id: 'totalSpend', label: 'total-spend-rp', sortable: true, align: 'right' },
  { id: 'lastTransaction', label: 'last-transaction', sortable: true, align: 'center' }
];

function CustomerSpendTable({ rows, totals, orderColumn, orderValue, onSort, goToPage, rowPerPage, totalPagination, onPageChange }) {
  const intl = useIntl();
  const pages = rowPerPage > 0 ? Math.ceil(totalPagination / rowPerPage) : 1;

  return (
    <Box>
      <ScrollX>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow
                sx={{ '& .MuiTableCell-root': { bgcolor: '#1F4E79', color: '#fff', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' } }}
              >
                {COLUMNS.map((col) => (
                  <TableCell key={col.id} align={col.align} sx={{ width: col.width }}>
                    {col.sortable ? (
                      <TableSortLabel
                        active={orderColumn === col.id}
                        direction={orderColumn === col.id ? orderValue : 'desc'}
                        onClick={() => onSort(col.id)}
                        sx={{ color: '#fff !important', '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}
                      >
                        {intl.formatMessage({ id: col.label, defaultMessage: col.label })}
                      </TableSortLabel>
                    ) : (
                      intl.formatMessage({ id: col.label, defaultMessage: col.label })
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows && rows.length > 0 ? (
                rows.map((row, idx) => {
                  const offset = (goToPage - 1) * rowPerPage;
                  return (
                    <TableRow key={row.customerId ?? idx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#EFF3FA' } }}>
                      <TableCell align="center" sx={{ fontSize: 12 }}>
                        {offset + idx + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{row.customerName}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        <Chip label={row.customerGroup} size="small" sx={{ height: 20, fontSize: 11 }} />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 12 }}>
                        {row.totalTransactions}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {row.clinicSpend > 0 ? fmt(row.clinicSpend) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {row.hotelSpend > 0 ? fmt(row.hotelSpend) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {row.salonSpend > 0 ? fmt(row.salonSpend) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {row.breedingSpend > 0 ? fmt(row.breedingSpend) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {row.petshopSpend > 0 ? fmt(row.petshopSpend) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700, color: '#1F4E79' }}>
                        Rp {fmt(row.totalSpend)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 11, color: 'text.secondary' }}>
                        {row.lastTransaction}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    <FormattedMessage id="no-data" />
                  </TableCell>
                </TableRow>
              )}

              {/* Total row */}
              {rows && rows.length > 0 && totals && (
                <TableRow sx={{ bgcolor: '#1F4E79' }}>
                  <TableCell colSpan={3} sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    <FormattedMessage id="total" />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {totals.totalTransactions}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {fmt(totals.clinicSpend)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {fmt(totals.hotelSpend)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {fmt(totals.salonSpend)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {fmt(totals.breedingSpend)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    {fmt(totals.petshopSpend)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    Rp {fmt(totals.totalSpend)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ScrollX>

      {/* Pagination */}
      {pages > 1 && (
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} mt={1.5}>
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage({ id: 'page' })} {goToPage} / {pages} ({totalPagination} {intl.formatMessage({ id: 'data' })})
          </Typography>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .slice(Math.max(0, goToPage - 3), Math.min(pages, goToPage + 2))
            .map((p) => (
              <Box
                key={p}
                onClick={() => onPageChange(p)}
                sx={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: p === goToPage ? 700 : 400,
                  bgcolor: p === goToPage ? '#1F4E79' : 'transparent',
                  color: p === goToPage ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: p === goToPage ? '#1F4E79' : '#f0f0f0' }
                }}
              >
                {p}
              </Box>
            ))}
        </Stack>
      )}
    </Box>
  );
}
CustomerSpendTable.propTypes = {
  rows: PropTypes.array,
  totals: PropTypes.object,
  orderColumn: PropTypes.string,
  orderValue: PropTypes.string,
  onSort: PropTypes.func,
  goToPage: PropTypes.number,
  rowPerPage: PropTypes.number,
  totalPagination: PropTypes.number,
  onPageChange: PropTypes.func
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SalesCustomerSpend({ data, onFilterChange }) {
  const intl = useIntl();
  const [chartMode, setChartMode] = useState('spend');

  const rows = data?.rows ?? [];
  const totals = data?.totals ?? {};
  const chart = data?.chart ?? {};
  const channelTotals = data?.channelTotals ?? [];
  const totalPagination = data?.totalPagination ?? 0;

  const handleSort = (col) => {
    const currentOrder = data?.orderColumn === col && data?.orderValue === 'desc' ? 'asc' : 'desc';
    onFilterChange && onFilterChange({ orderColumn: col, orderValue: currentOrder });
  };

  const handlePage = (p) => {
    onFilterChange && onFilterChange({ goToPage: p });
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<UserOutlined />}
            label={intl.formatMessage({ id: 'total-customers' })}
            value={(totals.totalCustomers ?? 0).toString()}
            color="#4361EE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<DollarOutlined />}
            label={intl.formatMessage({ id: 'total-spending' })}
            value={`Rp ${fmt(totals.totalSpend)}`}
            color="#3A86FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<BarChartOutlined />}
            label={intl.formatMessage({ id: 'avg-per-customer' })}
            value={`Rp ${fmt(totals.avgSpend)}`}
            color="#FB5607"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<TrophyOutlined />}
            label={intl.formatMessage({ id: 'top-spender' })}
            value={totals.topSpender ? `Rp ${fmt(totals.topSpender.totalSpend)}` : '-'}
            sub={totals.topSpender?.customerName ?? '-'}
            color="#8338EC"
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2} mb={3}>
        {/* Top 10 bar */}
        <Grid item xs={12} md={7}>
          <MainCard>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="h6" fontWeight={700}>
                <FormattedMessage id="top-10-customers" />
              </Typography>
              <ToggleButtonGroup value={chartMode} exclusive onChange={(_, v) => v && setChartMode(v)} size="small">
                <ToggleButton value="spend" sx={{ px: 1.5, py: 0.3, fontSize: 11 }}>
                  <FormattedMessage id="by-spend" />
                </ToggleButton>
                <ToggleButton value="tx" sx={{ px: 1.5, py: 0.3, fontSize: 11 }}>
                  <FormattedMessage id="by-transactions" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Top10Chart chart={chart} mode={chartMode} />
          </MainCard>
        </Grid>

        {/* Donut channel */}
        <Grid item xs={12} md={5}>
          <MainCard sx={{ height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={1.5}>
              <FormattedMessage id="spending-by-channel" />
            </Typography>
            <ChannelDonut channelTotals={channelTotals} />

            {/* Channel legend with totals */}
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={0.5}>
              {channelTotals.map((c) => (
                <Stack key={c.label} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CHANNEL_COLORS[c.label] ?? '#aaa' }} />
                    <Typography variant="caption">{c.label}</Typography>
                  </Stack>
                  <Typography variant="caption" fontWeight={700}>
                    Rp {fmt(c.value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* Table */}
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            <FormattedMessage id="customer-detail" />
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterOutlined style={{ fontSize: 14, color: '#666' }} />
            <TextField
              size="small"
              type="number"
              placeholder={intl.formatMessage({ id: 'min-spend' })}
              defaultValue=""
              onBlur={(e) => onFilterChange && onFilterChange({ minSpend: e.target.value || 0, goToPage: 1 })}
              sx={{ width: 160 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="caption">Rp</Typography>
                  </InputAdornment>
                )
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {totalPagination} <FormattedMessage id="data" />
            </Typography>
          </Stack>
        </Stack>

        <CustomerSpendTable
          rows={rows}
          totals={totals}
          orderColumn={data?.orderColumn ?? 'totalSpend'}
          orderValue={data?.orderValue ?? 'desc'}
          onSort={handleSort}
          goToPage={data?.goToPage ?? 1}
          rowPerPage={data?.rowPerPage ?? 10}
          totalPagination={totalPagination}
          onPageChange={handlePage}
        />
      </MainCard>
    </Box>
  );
}

SalesCustomerSpend.propTypes = {
  data: PropTypes.object,
  onFilterChange: PropTypes.func
};
