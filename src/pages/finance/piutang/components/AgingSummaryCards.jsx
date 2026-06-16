import { Grid, Skeleton, Stack, Typography, Box } from '@mui/material';
import MainCard from 'components/MainCard';

const formatCompact = (val) => {
  const n = Number(val ?? 0);
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(2) + 'M';
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(2) + 'jt';
  if (n >= 1_000) return 'Rp ' + (n / 1_000).toFixed(1) + 'rb';
  return 'Rp ' + n.toLocaleString('id-ID');
};

// ── Colour scheme per aging bucket ──────────────────────────────────────────
const BUCKET_CONFIG = {
  current: { label: 'Belum Jatuh Tempo', barColor: '#2e7d32', labelColor: '#2e7d32' },
  '1-30': { label: '1 – 30 Hari', barColor: '#f9a825', labelColor: '#f57f17' },
  '31-60': { label: '31 – 60 Hari', barColor: '#ef6c00', labelColor: '#e65100' },
  '61-90': { label: '61 – 90 Hari', barColor: '#c62828', labelColor: '#b71c1c' },
  '>90': { label: '> 90 Hari', barColor: '#4a148c', labelColor: '#4a148c' }
};

// ── Single aging card ────────────────────────────────────────────────────────
const AgingCard = ({ bucketKey, amount, count, active, onClick }) => {
  const cfg = BUCKET_CONFIG[bucketKey];
  return (
    <MainCard
      contentSX={{ p: 0, '&:last-child': { pb: 0 } }}
      sx={{
        cursor: 'pointer',
        border: active ? `2px solid ${cfg.barColor}` : '1px solid',
        borderColor: active ? cfg.barColor : 'divider',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: 3 }
      }}
      onClick={onClick}
    >
      {/* coloured top bar */}
      <Box sx={{ height: 4, bgcolor: cfg.barColor, borderRadius: '4px 4px 0 0' }} />
      <Stack spacing={0.25} sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
          {cfg.label}
        </Typography>
        <Typography variant="h5" fontWeight={700} color={cfg.labelColor} lineHeight={1.2}>
          {formatCompact(amount)}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {count} invoice
        </Typography>
      </Stack>
    </MainCard>
  );
};

// ── Total outstanding card ───────────────────────────────────────────────────
const TotalCard = ({ totalOutstanding, totalCount }) => (
  <MainCard contentSX={{ p: 0, '&:last-child': { pb: 0 } }}>
    <Box sx={{ height: 4, bgcolor: '#1565c0', borderRadius: '4px 4px 0 0' }} />
    <Stack spacing={0.25} sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
        Total Piutang
      </Typography>
      <Typography variant="h5" fontWeight={700} color="#1565c0" lineHeight={1.2}>
        {formatCompact(totalOutstanding)}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {totalCount} invoice aktif
      </Typography>
    </Stack>
  </MainCard>
);

// ── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <MainCard contentSX={{ p: 0, '&:last-child': { pb: 0 } }}>
    <Skeleton variant="rectangular" height={4} />
    <Stack spacing={0.5} sx={{ p: 2 }}>
      <Skeleton variant="text" width="60%" height={14} />
      <Skeleton variant="text" width="80%" height={24} />
      <Skeleton variant="text" width="40%" height={12} />
    </Stack>
  </MainCard>
);

// ── Main component ───────────────────────────────────────────────────────────
const AgingSummaryCards = ({ data, loading, activeFilter, onBucketClick }) => {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ px: 3, pt: 3 }}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <SkeletonCard />
          </Grid>
        ))}
      </Grid>
    );
  }

  const {
    totalCount = 0,
    totalOutstanding = 0,
    current = { amount: 0, count: 0 },
    days1_30 = { amount: 0, count: 0 },
    days31_60 = { amount: 0, count: 0 },
    days61_90 = { amount: 0, count: 0 },
    days90plus = { amount: 0, count: 0 }
  } = data ?? {};

  const buckets = [
    { key: 'current', data: current },
    { key: '1-30', data: days1_30 },
    { key: '31-60', data: days31_60 },
    { key: '61-90', data: days61_90 },
    { key: '>90', data: days90plus }
  ];

  return (
    <Grid container spacing={2} sx={{ px: 3, pt: 3 }}>
      {/* Total card */}
      <Grid item xs={6} sm={4} md={2}>
        <TotalCard totalOutstanding={totalOutstanding} totalCount={totalCount} />
      </Grid>

      {/* Aging bucket cards */}
      {buckets.map(({ key, data: d }) => (
        <Grid item xs={6} sm={4} md={2} key={key}>
          <AgingCard
            bucketKey={key}
            amount={d.amount}
            count={d.count}
            active={activeFilter === key}
            onClick={() => onBucketClick(activeFilter === key ? '' : key)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default AgingSummaryCards;
