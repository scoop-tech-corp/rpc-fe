import { Grid, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// ── Compact currency formatter ───────────────────────────────────────────────
const formatCompact = (val) => {
  const n = Number(val ?? 0);
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(2) + 'M';
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(2) + 'jt';
  if (n >= 1_000) return 'Rp ' + (n / 1_000).toFixed(1) + 'rb';
  return 'Rp ' + n.toLocaleString('id-ID');
};

// ── Service-type breakdown tooltip content ───────────────────────────────────
const ServiceBreakdown = ({ byService }) => (
  <Stack spacing={0.5} sx={{ minWidth: 220 }}>
    {(byService ?? []).map((s) => (
      <Stack key={s.serviceType} direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="caption" color="text.secondary">
          {s.serviceType}
        </Typography>
        <Typography variant="caption" fontWeight={600}>
          {s.count} txn &nbsp;·&nbsp; {formatCompact(s.revenue)}
        </Typography>
      </Stack>
    ))}
  </Stack>
);

// ── Single mini-widget card ──────────────────────────────────────────────────
const MiniCard = ({ icon: Icon, iconColor, label, value, subValue, tooltip, byService }) => {
  const card = (
    <MainCard contentSX={{ p: 2 }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Icon sx={{ color: iconColor, fontSize: 32, mt: 0.25 }} />
        <Stack spacing={0.25}>
          <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            {value}
          </Typography>
          {subValue && (
            <Typography variant="caption" color="text.disabled">
              {subValue}
            </Typography>
          )}
        </Stack>
      </Stack>
    </MainCard>
  );

  if (tooltip || byService) {
    return (
      <Tooltip title={byService ? <ServiceBreakdown byService={byService} /> : tooltip} arrow placement="bottom-start">
        <span style={{ display: 'block' }}>{card}</span>
      </Tooltip>
    );
  }

  return card;
};

// ── Loading skeleton row ─────────────────────────────────────────────────────
const SkeletonCard = () => (
  <MainCard contentSX={{ p: 2 }}>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Skeleton variant="circular" width={32} height={32} />
      <Stack spacing={0.5} flex={1}>
        <Skeleton variant="text" width="60%" height={14} />
        <Skeleton variant="text" width="80%" height={22} />
      </Stack>
    </Stack>
  </MainCard>
);

// ── Main component ───────────────────────────────────────────────────────────
const SummaryWidgets = ({ data, loading }) => {
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
    totalTransactions = 0,
    totalRevenue = 0,
    totalPaid = 0,
    totalOutstanding = 0,
    countPaid = 0,
    countPartial = 0,
    countUnpaid = 0,
    countCancelled = 0,
    byService = []
  } = data ?? {};

  const widgets = [
    {
      icon: ReceiptIcon,
      iconColor: '#1976d2',
      label: 'Total Transaksi',
      value: totalTransactions.toLocaleString('id-ID'),
      subValue: `${countPaid} lunas · ${countPartial} cicilan · ${countUnpaid} belum`,
      byService
    },
    {
      icon: AccountBalanceWalletIcon,
      iconColor: '#7b1fa2',
      label: 'Total Nilai',
      value: formatCompact(totalRevenue),
      subValue: 'Semua transaksi',
      byService
    },
    {
      icon: CheckCircleOutlineIcon,
      iconColor: '#2e7d32',
      label: 'Terbayar',
      value: formatCompact(totalPaid),
      subValue: `${countPaid} transaksi lunas`
    },
    {
      icon: ErrorOutlineIcon,
      iconColor: '#c62828',
      label: 'Belum Lunas',
      value: formatCompact(totalOutstanding),
      subValue: `${countUnpaid + countPartial} transaksi pending`
    },
    {
      icon: PendingActionsIcon,
      iconColor: '#e65100',
      label: 'Cicilan / Partial',
      value: countPartial.toLocaleString('id-ID'),
      subValue: 'Bayar sebagian'
    },
    {
      icon: CancelOutlinedIcon,
      iconColor: '#757575',
      label: 'Dibatalkan',
      value: countCancelled.toLocaleString('id-ID'),
      subValue: 'Transaksi batal'
    }
  ];

  return (
    <Grid container spacing={2} sx={{ px: 3, pt: 3 }}>
      {widgets.map((w) => (
        <Grid item xs={6} sm={4} md={2} key={w.label}>
          <MiniCard {...w} />
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryWidgets;
