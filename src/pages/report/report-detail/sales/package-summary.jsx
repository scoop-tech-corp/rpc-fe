import { Box, Chip, Collapse, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

// ── Status badge ───────────────────────────────────────────────────────────────
const STATUS_MAP = {
  1: { label: 'Active', bg: '#06D6A0', color: '#fff' },
  0: { label: 'Inactive', bg: '#e0e0e0', color: '#555' }
};

// ── Channel badge colours ──────────────────────────────────────────────────────
const CHANNEL_COLORS = {
  Clinic: '#4361EE',
  Hotel: '#3A86FF',
  Salon: '#FB5607',
  Breeding: '#8338EC'
};

// ── Mini progress bar ──────────────────────────────────────────────────────────
function UsageBar({ rate, color = '#4361EE' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#f0f0f0', overflow: 'hidden', minWidth: 60 }}>
        <Box
          sx={{
            width: `${Math.min(rate, 100)}%`,
            height: '100%',
            bgcolor: rate >= 80 ? '#FB5607' : color,
            borderRadius: 4,
            transition: 'width 0.5s'
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{ minWidth: 44, textAlign: 'right', color: rate >= 80 ? '#FB5607' : 'inherit', fontWeight: rate >= 80 ? 700 : 400 }}
      >
        {rate}%
      </Typography>
    </Box>
  );
}

// ── ApexChart ─────────────────────────────────────────────────────────────────
function PackageChart({ chart, mode }) {
  useEffect(() => {
    if (!chart) return;
    const seriesData = mode === 'revenue' ? chart.seriesRevenue : chart.seriesRedeemed;
    if (!seriesData?.[0]?.data?.length) return;

    const el = document.querySelector('#chart-package-summary');
    if (el) el.innerHTML = '';

    const options = {
      series: seriesData,
      chart: { type: 'bar', height: Math.max(220, chart.categories.length * 48), toolbar: { show: false }, fontFamily: 'inherit' },
      plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, dataLabels: { position: 'top' } } },
      colors: ['#4361EE', '#3A86FF', '#FB5607', '#8338EC', '#06D6A0', '#FFB703', '#E63946', '#2DC653', '#FF6B6B', '#118AB2'],
      dataLabels: {
        enabled: true,
        formatter: mode === 'revenue' ? (v) => 'Rp ' + v.toLocaleString('id-ID') : (v) => v + 'x',
        offsetX: 6,
        style: { fontSize: '10px', colors: ['#333'] }
      },
      xaxis: {
        categories: chart.categories,
        labels: { formatter: mode === 'revenue' ? (v) => 'Rp ' + Number(v).toLocaleString('id-ID') : (v) => v + 'x' }
      },
      yaxis: { labels: { style: { fontSize: '12px' }, maxWidth: 200 } },
      tooltip: { y: { formatter: mode === 'revenue' ? (v) => 'Rp ' + v.toLocaleString('id-ID') : (v) => v + ' kali' } },
      legend: { show: false },
      grid: { xaxis: { lines: { show: true } } }
    };

    import('apexcharts').then(({ default: ApexCharts }) => {
      new ApexCharts(el, options).render();
    });
  }, [chart, mode]);

  return <div id="chart-package-summary" />;
}

// ── Expandable row ────────────────────────────────────────────────────────────
function PackageRow({ row, idx }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_MAP[row.status] || STATUS_MAP[0];

  return (
    <>
      <tr style={{ background: idx % 2 === 0 ? '#f5f7ff' : '#fff', cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <td style={{ padding: '9px 10px', color: '#666', textAlign: 'center' }}>
          <IconButton size="small" sx={{ p: 0.2 }}>
            {open ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
          </IconButton>
        </td>
        <td style={{ padding: '9px 10px', color: '#666', textAlign: 'center' }}>{idx + 1}</td>
        <td style={{ padding: '9px 10px', fontWeight: 600, maxWidth: 200 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {row.packageName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.period}
          </Typography>
        </td>
        <td style={{ padding: '9px 10px', textAlign: 'center' }}>
          <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontSize: 11, height: 20 }} />
        </td>
        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600 }}>Rp {formatThousandSeparator(row.packagePrice)}</td>
        <td style={{ padding: '9px 10px', textAlign: 'center' }}>{row.quotaMax.toLocaleString('id-ID')}</td>
        <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 600, color: '#003366' }}>
          {row.redeemed.toLocaleString('id-ID')}
        </td>
        <td style={{ padding: '9px 10px', minWidth: 140 }}>
          <UsageBar value={row.redeemed} max={row.quotaMax} rate={row.usageRate} />
        </td>
        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#4361EE' }}>
          Rp {formatThousandSeparator(row.totalRevenue)}
        </td>
        <td style={{ padding: '9px 10px' }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {row.channels.map((ch) => (
              <Chip
                key={ch}
                label={ch}
                size="small"
                sx={{ bgcolor: CHANNEL_COLORS[ch] || '#aaa', color: '#fff', fontSize: 10, height: 18 }}
              />
            ))}
          </Box>
        </td>
      </tr>

      {/* ── Expanded detail ─── */}
      <tr>
        <td colSpan={10} style={{ padding: 0, background: '#EEF2FF', borderBottom: '2px solid #dce3ff' }}>
          <Collapse in={open} timeout="auto">
            <Box sx={{ p: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {/* Bundle contents */}
              <Box sx={{ minWidth: 220 }}>
                <Typography variant="caption" fontWeight={700} color="#003366" sx={{ mb: 0.5, display: 'block' }}>
                  <FormattedMessage id="package-contents" defaultMessage="Isi Paket" />
                </Typography>
                <Typography variant="body2" color="text.secondary" style={{ whiteSpace: 'pre-line' }}>
                  {row.bundleContents || '-'}
                </Typography>
              </Box>

              {/* Channel breakdown */}
              {Object.keys(row.channelDetail).length > 0 && (
                <Box sx={{ minWidth: 240 }}>
                  <Typography variant="caption" fontWeight={700} color="#003366" sx={{ mb: 0.5, display: 'block' }}>
                    <FormattedMessage id="channel-breakdown" defaultMessage="Rincian per Channel" />
                  </Typography>
                  {Object.entries(row.channelDetail).map(([ch, d]) => (
                    <Box key={ch} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.3 }}>
                      <Chip
                        label={ch}
                        size="small"
                        sx={{ bgcolor: CHANNEL_COLORS[ch] || '#aaa', color: '#fff', fontSize: 10, height: 18 }}
                      />
                      <Typography variant="caption">
                        {d.redeemed}x &nbsp;·&nbsp; Rp {formatThousandSeparator(d.revenue)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Quota info */}
              <Box sx={{ minWidth: 180 }}>
                <Typography variant="caption" fontWeight={700} color="#003366" sx={{ mb: 0.5, display: 'block' }}>
                  <FormattedMessage id="quota-info" defaultMessage="Info Kuota" />
                </Typography>
                <Typography variant="caption" display="block">
                  <FormattedMessage id="max-per-customer" defaultMessage="Maks per Customer" />: {row.maxPerCustomer}x
                </Typography>
                <Typography variant="caption" display="block">
                  <FormattedMessage id="remaining-quota" defaultMessage="Sisa Kuota" />: {row.remaining.toLocaleString('id-ID')}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </td>
      </tr>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SalesPackageSummary({ data, filter, setFilter }) {
  const intl = useIntl();
  const [chartMode, setChartMode] = useState('revenue');

  const rows = data?.rows || [];
  const totals = useMemo(() => data?.totals || {}, [data]);
  const chart = data?.chart || null;

  const summaryCards = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'total-packages', defaultMessage: 'Total Paket' }),
        value: totals.totalPackages || 0,
        unit: '',
        color: '#003366',
        isRp: false
      },
      {
        label: intl.formatMessage({ id: 'active-packages', defaultMessage: 'Paket Aktif' }),
        value: totals.activePackages || 0,
        unit: '',
        color: '#06D6A0',
        isRp: false
      },
      {
        label: intl.formatMessage({ id: 'total-redeemed', defaultMessage: 'Total Redemption' }),
        value: totals.totalRedeemed || 0,
        unit: 'x',
        color: '#4361EE',
        isRp: false
      },
      {
        label: intl.formatMessage({ id: 'total-revenue', defaultMessage: 'Total Revenue' }),
        value: totals.totalRevenue || 0,
        unit: '',
        color: '#8338EC',
        isRp: true
      }
    ],
    [totals, intl]
  );

  const tableHeaders = [
    '',
    'No',
    intl.formatMessage({ id: 'package-name', defaultMessage: 'Nama Paket' }),
    'Status',
    intl.formatMessage({ id: 'package-price', defaultMessage: 'Harga Paket (Rp)' }),
    intl.formatMessage({ id: 'max-quota', defaultMessage: 'Kuota Max' }),
    intl.formatMessage({ id: 'redeemed', defaultMessage: 'Terealisasi' }),
    intl.formatMessage({ id: 'usage-rate', defaultMessage: 'Usage Rate (%)' }),
    intl.formatMessage({ id: 'total-revenue', defaultMessage: 'Total Revenue (Rp)' }),
    intl.formatMessage({ id: 'channel', defaultMessage: 'Channel' })
  ];

  return (
    <Box sx={{ mt: 1 }}>
      {/* ── Filter Status ────────────────────────────────────────── */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" fontWeight={600}>
          <FormattedMessage id="package-status" defaultMessage="Status Paket" />:
        </Typography>
        <Select
          size="small"
          value={filter?.packageStatus || ''}
          onChange={(e) => setFilter((f) => ({ ...f, packageStatus: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">
            <FormattedMessage id="all" defaultMessage="Semua" />
          </MenuItem>
          <MenuItem value="active">
            <FormattedMessage id="active" defaultMessage="Aktif" />
          </MenuItem>
          <MenuItem value="inactive">
            <FormattedMessage id="inactive" defaultMessage="Tidak Aktif" />
          </MenuItem>
        </Select>
      </Box>

      {/* ── Summary Cards ───────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Box sx={{ p: 2, borderRadius: 2, border: `2px solid ${card.color}22`, bgcolor: `${card.color}0D`, height: '100%' }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                {card.label}
              </Typography>
              <Typography variant="h5" fontWeight={700} color={card.color}>
                {card.isRp ? `Rp ${formatThousandSeparator(card.value)}` : `${card.value.toLocaleString('id-ID')}${card.unit}`}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ── Chart ───────────────────────────────────────────────── */}
      {rows.length > 0 && (
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="top-packages" defaultMessage="Top Paket (maks 10)" />
            </Typography>
            <Select size="small" value={chartMode} onChange={(e) => setChartMode(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="revenue">
                <FormattedMessage id="total-revenue" defaultMessage="Total Revenue" />
              </MenuItem>
              <MenuItem value="redeemed">
                <FormattedMessage id="total-redeemed" defaultMessage="Total Redemption" />
              </MenuItem>
            </Select>
          </Box>
          <PackageChart chart={chart} mode={chartMode} />
        </Box>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          <FormattedMessage id="no-data-found" />
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#003366', color: '#fff' }}>
                {tableHeaders.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '10px 10px',
                      textAlign: i >= 4 ? 'right' : i <= 1 ? 'center' : 'left',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <PackageRow key={r.bundleId} row={r} idx={idx} />
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#1F4E79', color: '#fff', fontWeight: 700 }}>
                <td colSpan={4} style={{ padding: '10px 10px' }}>
                  <FormattedMessage id="total" />
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right' }}>—</td>
                <td style={{ padding: '10px 10px', textAlign: 'center' }}>—</td>
                <td style={{ padding: '10px 10px', textAlign: 'center' }}>{(totals.totalRedeemed || 0).toLocaleString('id-ID')}x</td>
                <td style={{ padding: '10px 10px', textAlign: 'right' }}>—</td>
                <td style={{ padding: '10px 10px', textAlign: 'right' }}>Rp {formatThousandSeparator(totals.totalRevenue || 0)}</td>
                <td style={{ padding: '10px 10px' }}>—</td>
              </tr>
            </tfoot>
          </table>
        </Box>
      )}
    </Box>
  );
}
