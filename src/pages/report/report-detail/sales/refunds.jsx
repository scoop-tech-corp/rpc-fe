import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
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
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { RollbackOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

const ReactApexChart = lazy(() => import('react-apexcharts'));

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  0: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  1: { label: 'Approved', color: '#06D6A0', bg: '#D1FAE5' },
  2: { label: 'Rejected', color: '#EF4444', bg: '#FEE2E2' }
};

const CHANNEL_COLORS = {
  'Pet Clinic': '#4361EE',
  'Pet Hotel': '#3A86FF',
  'Pet Salon': '#FB5607',
  Breeding: '#8338EC',
  'Pet Shop': '#06D6A0'
};

const SERVICE_TYPES = ['Pet Clinic', 'Pet Hotel', 'Pet Salon', 'Breeding', 'Pet Shop'];

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

// ── Daily Stacked Bar Chart ───────────────────────────────────────────────────
function RefundChart({ chart }) {
  if (!chart?.categories?.length) return null;

  const series = [...(chart.seriesApproved || []), ...(chart.seriesPending || []), ...(chart.seriesRejected || [])];

  const options = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
    colors: ['#06D6A0', '#F59E0B', '#EF4444'],
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

  return (
    <Suspense fallback={<CircularProgress size={24} />}>
      <ReactApexChart type="bar" series={series} options={options} height={280} />
    </Suspense>
  );
}
RefundChart.propTypes = { chart: PropTypes.object };

// ── Channel Donut ─────────────────────────────────────────────────────────────
function ChannelDonut({ channelSummary }) {
  if (!channelSummary?.length) return null;
  const labels = channelSummary.map((c) => c.label);
  const values = channelSummary.map((c) => c.amount);
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
      <ReactApexChart type="donut" series={values} options={options} height={260} />
    </Suspense>
  );
}
ChannelDonut.propTypes = { channelSummary: PropTypes.array };

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: '-', color: '#aaa', bg: '#f5f5f5' };
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.3,
        borderRadius: 1,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 700
      }}
    >
      {cfg.label}
    </Box>
  );
}
StatusBadge.propTypes = { status: PropTypes.number };

// ── Channel Dot ───────────────────────────────────────────────────────────────
function ChannelDot({ channel }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.8}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CHANNEL_COLORS[channel] ?? '#aaa', flexShrink: 0 }} />
      <Typography variant="caption">{channel}</Typography>
    </Stack>
  );
}
ChannelDot.propTypes = { channel: PropTypes.string };

// ── Inline Filters ────────────────────────────────────────────────────────────
function InlineFilters({ serviceType, refundStatus, onFilterChange, intl }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel sx={{ fontSize: 12 }}>{intl.formatMessage({ id: 'channel' })}</InputLabel>
        <Select
          value={serviceType}
          label={intl.formatMessage({ id: 'channel' })}
          onChange={(e) => onFilterChange({ serviceType: e.target.value, goToPage: 1 })}
          sx={{ fontSize: 12 }}
        >
          <MenuItem value="">
            <em>{intl.formatMessage({ id: 'all' })}</em>
          </MenuItem>
          {SERVICE_TYPES.map((t) => (
            <MenuItem key={t} value={t} sx={{ fontSize: 12 }}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel sx={{ fontSize: 12 }}>{intl.formatMessage({ id: 'status' })}</InputLabel>
        <Select
          value={refundStatus}
          label={intl.formatMessage({ id: 'status' })}
          onChange={(e) => onFilterChange({ refundStatus: e.target.value, goToPage: 1 })}
          sx={{ fontSize: 12 }}
        >
          <MenuItem value="">
            <em>{intl.formatMessage({ id: 'all' })}</em>
          </MenuItem>
          <MenuItem value={0} sx={{ fontSize: 12 }}>
            Pending
          </MenuItem>
          <MenuItem value={1} sx={{ fontSize: 12 }}>
            Approved
          </MenuItem>
          <MenuItem value={2} sx={{ fontSize: 12 }}>
            Rejected
          </MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
InlineFilters.propTypes = {
  serviceType: PropTypes.string,
  refundStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onFilterChange: PropTypes.func,
  intl: PropTypes.object
};

// ── Data Table ────────────────────────────────────────────────────────────────
const COLUMNS = [
  { id: 'no', label: 'No', sortable: false, align: 'center', width: 44 },
  { id: 'refundNumber', label: 'refund-number', sortable: true, align: 'left' },
  { id: 'createdAt', label: 'date', sortable: true, align: 'center' },
  { id: 'customerName', label: 'customer-name', sortable: true, align: 'left' },
  { id: 'serviceType', label: 'channel', sortable: true, align: 'left' },
  { id: 'invoiceNumber', label: 'invoice-number', sortable: false, align: 'left' },
  { id: 'paymentMethod', label: 'payment-method', sortable: false, align: 'left' },
  { id: 'amount', label: 'refund-amount', sortable: true, align: 'right' },
  { id: 'reason', label: 'reason', sortable: false, align: 'left' },
  { id: 'status', label: 'status', sortable: true, align: 'center' },
  { id: 'approvedBy', label: 'approved-by', sortable: false, align: 'left' }
];

function RefundsTable({ rows, totals, orderColumn, orderValue, onSort, goToPage, rowPerPage, totalPagination, onPageChange }) {
  const intl = useIntl();
  const pages = rowPerPage > 0 ? Math.ceil(totalPagination / rowPerPage) : 1;
  const offset = (goToPage - 1) * rowPerPage;

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
                        active={orderColumn === col.id || orderColumn === `fr.${col.id}`}
                        direction={orderColumn === col.id || orderColumn === `fr.${col.id}` ? orderValue : 'desc'}
                        onClick={() =>
                          onSort(
                            col.id === 'createdAt'
                              ? 'fr.created_at'
                              : col.id === 'amount'
                              ? 'fr.amount'
                              : col.id === 'status'
                              ? 'fr.status'
                              : col.id === 'serviceType'
                              ? 'fr.serviceType'
                              : col.id
                          )
                        }
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
                rows.map((row, idx) => (
                  <TableRow key={row.id ?? idx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#EFF3FA' } }}>
                    <TableCell align="center" sx={{ fontSize: 12 }}>
                      {offset + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{row.refundNumber}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {row.createdAt}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{row.customerName}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      <ChannelDot channel={row.serviceType} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{row.invoiceNumber}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{row.paymentMethod}</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>
                      Rp {fmt(row.amount)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, maxWidth: 180 }}>
                      <Typography variant="caption" noWrap title={row.reason}>
                        {row.reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{row.approvedBy}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    <FormattedMessage id="no-data" />
                  </TableCell>
                </TableRow>
              )}

              {rows && rows.length > 0 && totals && (
                <TableRow sx={{ bgcolor: '#1F4E79' }}>
                  <TableCell colSpan={7} sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    <FormattedMessage id="total" /> ({totals.totalRefunds} <FormattedMessage id="refunds" />)
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                    Rp {fmt(totals.totalAmount)}
                  </TableCell>
                  <TableCell colSpan={3} />
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
RefundsTable.propTypes = {
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
export default function SalesRefunds({ data, onFilterChange }) {
  const intl = useIntl();

  const totals = data?.totals ?? {};
  const chart = data?.chart ?? {};
  const channelSummary = data?.channelSummary ?? [];
  const rows = data?.rows ?? [];
  const totalPagination = data?.totalPagination ?? 0;

  const handleSort = (col) => {
    const cur = data?.orderColumn;
    const dir = cur === col && data?.orderValue === 'desc' ? 'asc' : 'desc';
    onFilterChange && onFilterChange({ orderColumn: col, orderValue: dir });
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<RollbackOutlined />}
            label={intl.formatMessage({ id: 'total-refunds' })}
            value={(totals.totalRefunds ?? 0).toString()}
            color="#4361EE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<DollarOutlined />}
            label={intl.formatMessage({ id: 'total-refund-amount' })}
            value={`Rp ${fmt(totals.totalAmount)}`}
            color="#8338EC"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<ClockCircleOutlined />}
            label={intl.formatMessage({ id: 'pending-refunds' })}
            value={(totals.totalPending ?? 0).toString()}
            sub={`Rp ${fmt(totals.pendingAmount)}`}
            color="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<CheckCircleOutlined />}
            label={intl.formatMessage({ id: 'approved-refunds' })}
            value={(totals.totalApproved ?? 0).toString()}
            sub={`Rp ${fmt(totals.approvedAmount)}`}
            color="#06D6A0"
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={8}>
          <MainCard>
            <Typography variant="h6" fontWeight={700} mb={1.5}>
              <FormattedMessage id="daily-refund-trend" />
            </Typography>
            {chart?.categories?.length > 0 ? (
              <RefundChart chart={chart} />
            ) : (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                <FormattedMessage id="no-data" />
              </Box>
            )}
          </MainCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MainCard sx={{ height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={1.5}>
              <FormattedMessage id="refund-by-channel" />
            </Typography>
            {channelSummary.length > 0 ? (
              <>
                <ChannelDonut channelSummary={channelSummary} />
                <Stack spacing={0.5} mt={1}>
                  {channelSummary.map((c) => (
                    <Stack key={c.label} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CHANNEL_COLORS[c.label] ?? '#aaa' }} />
                        <Typography variant="caption">{c.label}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip label={c.count} size="small" sx={{ height: 18, fontSize: 10 }} />
                        <Typography variant="caption" fontWeight={700}>
                          Rp {fmt(c.amount)}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                <FormattedMessage id="no-data" />
              </Box>
            )}
          </MainCard>
        </Grid>
      </Grid>

      {/* Table */}
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="h6" fontWeight={700}>
            <FormattedMessage id="refund-detail" />
          </Typography>
          <InlineFilters
            serviceType={data?.serviceType ?? ''}
            refundStatus={data?.refundStatus !== undefined ? data.refundStatus : ''}
            onFilterChange={onFilterChange}
            intl={intl}
          />
        </Stack>

        <RefundsTable
          rows={rows}
          totals={totals}
          orderColumn={data?.orderColumn ?? 'fr.created_at'}
          orderValue={data?.orderValue ?? 'desc'}
          onSort={handleSort}
          goToPage={data?.goToPage ?? 1}
          rowPerPage={data?.rowPerPage ?? 10}
          totalPagination={totalPagination}
          onPageChange={(p) => onFilterChange && onFilterChange({ goToPage: p })}
        />
      </MainCard>
    </Box>
  );
}

SalesRefunds.propTypes = {
  data: PropTypes.object,
  onFilterChange: PropTypes.func
};
