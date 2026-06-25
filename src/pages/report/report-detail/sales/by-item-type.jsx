import { Box, Chip, Grid, Typography } from '@mui/material';
import { useMemo, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

// ── colour palette per item type ─────────────────────────────────────────────
const TYPE_COLORS = {
  'Pet Clinic': '#4361EE',
  'Pet Hotel': '#3A86FF',
  'Pet Salon': '#FB5607',
  Breeding: '#8338EC',
  'Pet Shop': '#06D6A0'
};

const defaultColor = '#AAAAAA';

// ── tiny horizontal bar ───────────────────────────────────────────────────────
function HBar({ share, color }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#f0f0f0', overflow: 'hidden' }}>
        <Box sx={{ width: `${share}%`, height: '100%', bgcolor: color, borderRadius: 5, transition: 'width 0.6s ease' }} />
      </Box>
      <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
        {share}%
      </Typography>
    </Box>
  );
}

// ── ApexCharts horizontal bar ─────────────────────────────────────────────────
function ItemTypeChart({ rows, chartTitle }) {
  useEffect(() => {
    if (!rows || rows.length === 0) return;

    const categories = rows.map((r) => r.itemType);
    const values = rows.map((r) => r.grossRevenue);
    const colors = rows.map((r) => TYPE_COLORS[r.itemType] || defaultColor);

    const options = {
      series: [{ name: chartTitle, data: values }],
      chart: {
        type: 'bar',
        height: Math.max(240, rows.length * 56),
        toolbar: { show: false },
        fontFamily: 'inherit'
      },
      plotOptions: {
        bar: { horizontal: true, distributed: true, borderRadius: 4, dataLabels: { position: 'top' } }
      },
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val) => 'Rp ' + val.toLocaleString('id-ID'),
        offsetX: 8,
        style: { fontSize: '11px', colors: ['#333'] }
      },
      xaxis: {
        categories,
        labels: { formatter: (val) => 'Rp ' + Number(val).toLocaleString('id-ID') }
      },
      yaxis: { labels: { style: { fontSize: '13px' } } },
      tooltip: { y: { formatter: (val) => 'Rp ' + val.toLocaleString('id-ID') } },
      legend: { show: false },
      grid: { xaxis: { lines: { show: true } } }
    };

    const el = document.querySelector('#chart-by-item-type');
    if (el) el.innerHTML = '';

    import('apexcharts').then(({ default: ApexCharts }) => {
      const chart = new ApexCharts(el, options);
      chart.render();
    });
  }, [rows, chartTitle]);

  return <div id="chart-by-item-type" />;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SalesByItemType({ data }) {
  const intl = useIntl();
  const rows = useMemo(() => data?.rows || [], [data]);
  const totals = useMemo(() => data?.totals || {}, [data]);

  const labelTransaction = intl.formatMessage({ id: 'transaction' });
  const labelNoData = intl.formatMessage({ id: 'no-data-found' });
  const labelGrossRevenue = intl.formatMessage({ id: 'gross-revenue' });
  const labelChartTitle = intl.formatMessage({ id: 'gross-revenue-per-item-type' });

  const tableHeaders = [
    'No',
    intl.formatMessage({ id: 'item-type' }),
    intl.formatMessage({ id: 'total-transaction' }),
    intl.formatMessage({ id: 'gross-revenue' }),
    intl.formatMessage({ id: 'share-percent' }),
    intl.formatMessage({ id: 'avg-per-transaction' })
  ];

  const cards = useMemo(() => rows.map((r) => ({ ...r, color: TYPE_COLORS[r.itemType] || defaultColor })), [rows]);

  return (
    <Box sx={{ mt: 1 }}>
      {/* ── Summary cards ─────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={item.itemType}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: `2px solid ${item.color}22`,
                bgcolor: `${item.color}0D`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  {item.itemType}
                </Typography>
                <Chip label={`${item.sharePercent}%`} size="small" sx={{ bgcolor: item.color, color: '#fff', fontSize: 11, height: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color={item.color} sx={{ mb: 0.5 }}>
                Rp {formatThousandSeparator(item.grossRevenue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.totalTransactions} {labelTransaction}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <HBar share={item.sharePercent} color={item.color} />
              </Box>
            </Box>
          </Grid>
        ))}

        {/* Total card */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '2px solid #003366',
              bgcolor: '#003366',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2" fontWeight={600} color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>
              <FormattedMessage id="total" />
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#fff" sx={{ mb: 0.5 }}>
              Rp {formatThousandSeparator(totals.grossRevenue || 0)}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              {totals.totalTransactions || 0} {labelTransaction}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* ── Bar chart ─────────────────────────────────────────────── */}
      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa', mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {labelChartTitle}
        </Typography>
        {rows.length > 0 ? (
          <ItemTypeChart rows={rows} chartTitle={labelGrossRevenue} />
        ) : (
          <Typography color="text.secondary">{labelNoData}</Typography>
        )}
      </Box>

      {/* ── Detail table ───────────────────────────────────────────── */}
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#003366', color: '#fff' }}>
              {tableHeaders.map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', textAlign: i >= 2 ? 'right' : 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.itemType} style={{ background: idx % 2 === 0 ? '#f5f7ff' : '#fff' }}>
                <td style={{ padding: '9px 14px', color: '#666' }}>{idx + 1}</td>
                <td style={{ padding: '9px 14px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: TYPE_COLORS[r.itemType] || defaultColor,
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontWeight: 600 }}>{r.itemType}</span>
                  </Box>
                </td>
                <td style={{ padding: '9px 14px', textAlign: 'right' }}>{r.totalTransactions.toLocaleString('id-ID')}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 600, color: TYPE_COLORS[r.itemType] || '#333' }}>
                  Rp {formatThousandSeparator(r.grossRevenue)}
                </td>
                <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Box sx={{ width: 40, height: 6, borderRadius: 3, bgcolor: '#e0e0e0', overflow: 'hidden' }}>
                      <Box sx={{ width: `${r.sharePercent}%`, height: '100%', bgcolor: TYPE_COLORS[r.itemType] || defaultColor }} />
                    </Box>
                    {r.sharePercent}%
                  </Box>
                </td>
                <td style={{ padding: '9px 14px', textAlign: 'right' }}>Rp {formatThousandSeparator(r.avgPerTransaction)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#1F4E79', color: '#fff', fontWeight: 700 }}>
              <td colSpan={2} style={{ padding: '10px 14px' }}>
                <FormattedMessage id="total" />
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right' }}>{(totals.totalTransactions || 0).toLocaleString('id-ID')}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right' }}>Rp {formatThousandSeparator(totals.grossRevenue || 0)}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right' }}>100.00%</td>
              <td style={{ padding: '10px 14px', textAlign: 'right' }}>Rp {formatThousandSeparator(totals.avgPerTransaction || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </Box>
    </Box>
  );
}
