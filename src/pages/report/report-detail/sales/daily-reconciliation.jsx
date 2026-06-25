import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stack
} from '@mui/material';
import { DollarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SwapOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

const ReactApexChart = lazy(() => import('react-apexcharts'));

// ── Constants ─────────────────────────────────────────────────────────────────
const CHANNEL_COLORS = {
  'Pet Clinic': '#4361EE',
  'Pet Hotel': '#3A86FF',
  'Pet Salon': '#FB5607',
  Breeding: '#8338EC',
  'Pet Shop': '#06D6A0'
};

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n ?? 0);

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub, color }) {
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
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
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

// ── Stacked Bar Chart ─────────────────────────────────────────────────────────
function DailyChart({ chart }) {
  if (!chart?.categories?.length) return null;

  const options = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
    colors: ['#06D6A0', '#EF4444'],
    xaxis: {
      categories: chart.categories,
      labels: { style: { fontSize: '10px' }, rotate: -45 }
    },
    yaxis: {
      labels: { formatter: (v) => `Rp ${fmt(v)}`, style: { fontSize: '10px' } }
    },
    tooltip: { y: { formatter: (v) => `Rp ${fmt(v)}` } },
    legend: { position: 'top', fontSize: '12px' },
    grid: { borderColor: '#f0f0f0' },
    dataLabels: { enabled: false }
  };

  const series = [...(chart.seriesPaid || []), ...(chart.seriesOutstand || [])];

  return (
    <Suspense fallback={<CircularProgress size={24} />}>
      <ReactApexChart type="bar" series={series} options={options} height={280} />
    </Suspense>
  );
}
DailyChart.propTypes = { chart: PropTypes.object };

// ── % Paid Badge ──────────────────────────────────────────────────────────────
function PctBadge({ pct }) {
  const color = pct >= 100 ? '#06D6A0' : pct >= 80 ? '#F59E0B' : '#EF4444';
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: color + '20',
        color,
        fontWeight: 700,
        fontSize: 11
      }}
    >
      {pct.toFixed(1)}%
    </Box>
  );
}
PctBadge.propTypes = { pct: PropTypes.number };

// ── Channel Summary Table ─────────────────────────────────────────────────────
function ChannelSummaryTable({ channelSummary, totals }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#1F4E79', color: '#fff', fontWeight: 700, fontSize: 12 } }}>
            <TableCell align="center" sx={{ width: 40 }}>
              No
            </TableCell>
            <TableCell>
              <FormattedMessage id="channel" />
            </TableCell>
            <TableCell align="center">
              <FormattedMessage id="total-tx" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="gross-revenue" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="total-paid" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="outstanding" />
            </TableCell>
            <TableCell align="center">
              <FormattedMessage id="percent-paid" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {channelSummary && channelSummary.length > 0 ? (
            channelSummary.map((r, idx) => (
              <TableRow key={r.channel} sx={{ '&:nth-of-type(even)': { bgcolor: '#EFF3FA' } }}>
                <TableCell align="center" sx={{ fontSize: 12 }}>
                  {idx + 1}
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CHANNEL_COLORS[r.channel] ?? '#aaa', flexShrink: 0 }} />
                    <span>{r.channel}</span>
                  </Stack>
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 12 }}>
                  {r.txCount}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: 12 }}>
                  Rp {fmt(r.grossRevenue)}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: 12, color: '#06D6A0', fontWeight: 600 }}>
                  Rp {fmt(r.totalPaid)}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: 12, color: r.outstanding > 0 ? '#EF4444' : 'inherit' }}>
                  {r.outstanding > 0 ? `Rp ${fmt(r.outstanding)}` : '-'}
                </TableCell>
                <TableCell align="center">
                  <PctBadge pct={r.percentPaid} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                <FormattedMessage id="no-data" />
              </TableCell>
            </TableRow>
          )}

          {channelSummary && channelSummary.length > 0 && totals && (
            <TableRow sx={{ bgcolor: '#1F4E79' }}>
              <TableCell colSpan={2} sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                <FormattedMessage id="total" />
              </TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                {totals.totalTransactions}
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                Rp {fmt(totals.totalGross)}
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                Rp {fmt(totals.totalPaid)}
              </TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                {totals.totalOutstanding > 0 ? `Rp ${fmt(totals.totalOutstanding)}` : '-'}
              </TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                {(totals.percentPaid ?? 0).toFixed(1)}%
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
ChannelSummaryTable.propTypes = { channelSummary: PropTypes.array, totals: PropTypes.object };

// ── Daily Detail Table ────────────────────────────────────────────────────────
function DailyDetailTable({ dailyRows }) {
  if (!dailyRows || dailyRows.length === 0) return null;

  let rowNum = 0;
  return (
    <ScrollX>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow
              sx={{ '& .MuiTableCell-root': { bgcolor: '#1F4E79', color: '#fff', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' } }}
            >
              <TableCell align="center" sx={{ width: 40 }}>
                No
              </TableCell>
              <TableCell>
                <FormattedMessage id="date" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="channel" />
              </TableCell>
              <TableCell align="center">
                <FormattedMessage id="total-tx" />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage id="gross-revenue" />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage id="total-paid" />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage id="outstanding" />
              </TableCell>
              <TableCell align="center">
                <FormattedMessage id="percent-paid" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dailyRows.map((r, idx) => {
              const isSubtotal = r.isSubtotal;
              if (!isSubtotal) rowNum++;
              const bg = isSubtotal ? '#D9EAD3' : rowNum % 2 === 0 ? '#EFF3FA' : '#FFFFFF';

              return (
                <TableRow key={idx} sx={{ bgcolor: bg }}>
                  <TableCell align="center" sx={{ fontSize: 12 }}>
                    {isSubtotal ? '' : rowNum}
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: isSubtotal ? 11 : 12, fontWeight: isSubtotal ? 700 : 400, color: isSubtotal ? '#1a5e38' : 'inherit' }}
                  >
                    {r.date}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {!isSubtotal && r.channel && (
                      <Stack direction="row" alignItems="center" spacing={0.8}>
                        <Box
                          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CHANNEL_COLORS[r.channel] ?? '#aaa', flexShrink: 0 }}
                        />
                        <span>{r.channel}</span>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 12, fontWeight: isSubtotal ? 700 : 400 }}>
                    {r.txCount}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: isSubtotal ? 700 : 400 }}>
                    Rp {fmt(r.grossRevenue)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: isSubtotal ? 700 : 400, color: '#06D6A0' }}>
                    Rp {fmt(r.totalPaid)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: 12, fontWeight: isSubtotal ? 700 : 400, color: r.outstanding > 0 ? '#EF4444' : 'inherit' }}
                  >
                    {r.outstanding > 0 ? `Rp ${fmt(r.outstanding)}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <PctBadge pct={r.percentPaid} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </ScrollX>
  );
}
DailyDetailTable.propTypes = { dailyRows: PropTypes.array };

// ── Main Component ────────────────────────────────────────────────────────────
export default function SalesDailyReconciliation({ data }) {
  const intl = useIntl();

  const totals = data?.totals ?? {};
  const chart = data?.chart ?? {};
  const channelSummary = data?.channelSummary ?? [];
  const dailyRows = data?.dailyRows ?? [];

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<DollarOutlined />}
            label={intl.formatMessage({ id: 'gross-revenue' })}
            value={`Rp ${fmt(totals.totalGross)}`}
            sub={`${totals.totalTransactions ?? 0} transaksi`}
            color="#4361EE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<CheckCircleOutlined />}
            label={intl.formatMessage({ id: 'total-paid' })}
            value={`Rp ${fmt(totals.totalPaid)}`}
            color="#06D6A0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<ExclamationCircleOutlined />}
            label={intl.formatMessage({ id: 'outstanding' })}
            value={`Rp ${fmt(totals.totalOutstanding)}`}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<SwapOutlined />}
            label={intl.formatMessage({ id: 'percent-paid' })}
            value={`${(totals.percentPaid ?? 0).toFixed(1)}%`}
            sub={intl.formatMessage({ id: 'lunas-rate' })}
            color="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Chart */}
      {chart?.categories?.length > 0 && (
        <MainCard sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={1.5}>
            <FormattedMessage id="daily-paid-vs-outstanding" />
          </Typography>
          <DailyChart chart={chart} />
        </MainCard>
      )}

      {/* Channel Summary */}
      <MainCard sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          <FormattedMessage id="recap-by-channel" />
        </Typography>
        <ChannelSummaryTable channelSummary={channelSummary} totals={totals} />
      </MainCard>

      {/* Daily Detail */}
      <MainCard>
        <Typography variant="h6" fontWeight={700} mb={2}>
          <FormattedMessage id="daily-detail" />
        </Typography>
        {dailyRows.length > 0 ? (
          <DailyDetailTable dailyRows={dailyRows} />
        ) : (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <FormattedMessage id="no-data" />
          </Box>
        )}
      </MainCard>
    </Box>
  );
}

SalesDailyReconciliation.propTypes = {
  data: PropTypes.object
};
