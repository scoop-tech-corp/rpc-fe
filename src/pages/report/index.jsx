import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { LockOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useSearchParams } from 'react-router-dom';

import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';
import { list, tab } from './report.collection';

// ── Konfigurasi warna per kategori ─────────────────────────────────────────
const CATEGORY_META = {
  booking: { color: '#1890ff', bg: '#e6f4ff' },
  customer: { color: '#52c41a', bg: '#f6ffed' },
  deposit: { color: '#13c2c2', bg: '#e6fffb' },
  expenses: { color: '#fa8c16', bg: '#fff7e6' },
  products: { color: '#722ed1', bg: '#f9f0ff' },
  sales: { color: '#f5222d', bg: '#fff1f0' },
  staff: { color: '#2f54eb', bg: '#f0f5ff' }
};

// Mapping key kategori → items
const CATEGORY_ITEMS = {
  booking: list.bookings,
  customer: list.customers,
  deposit: list.deposit,
  expenses: list.expenses,
  products: list.products,
  sales: list.sales,
  staff: list.staff,
  service: list.service
};

// Urutan tampil di grid "All"
const ALL_CATEGORIES = ['booking', 'customer', 'deposit', 'expenses', 'products', 'sales', 'staff'];

// Tab yang terlihat — sembunyikan 'service' sampai ada konten
const VISIBLE_TABS = tab.filter((t) => !t.hidden);

// ── ReportItem ─────────────────────────────────────────────────────────────
// Satu baris laporan: bisa diklik, coming soon, atau terkunci
const ReportItem = ({ item, category, navigate, checkAccess }) => {
  const hasAccess = checkAccess(item, category);
  const isComingSoon = Boolean(item.comingSoon || !item.url);
  const isLocked = !isComingSoon && !hasAccess;
  const isClickable = !isComingSoon && Boolean(hasAccess);

  const handleClick = () => {
    if (!isClickable) return;
    navigate(`/report-detail?type=${category}&detail=${item.url}`, { replace: true });
  };

  return (
    <ListItem component="div" disablePadding divider>
      <ListItemButton
        onClick={handleClick}
        disabled={isComingSoon}
        sx={{
          gap: 1,
          cursor: isClickable ? 'pointer' : 'default',
          opacity: isComingSoon ? 0.5 : 1,
          '&.Mui-disabled': { opacity: 0.5 }
        }}
      >
        <ListItemIcon sx={{ minWidth: 26 }}>
          {isLocked ? (
            <Tooltip title="Anda tidak memiliki akses ke laporan ini" placement="top">
              <LockOutlined style={{ color: '#bfbfbf', fontSize: 13 }} />
            </Tooltip>
          ) : (
            <Box sx={{ color: isComingSoon ? 'text.disabled' : 'text.secondary', fontSize: 13, lineHeight: 1 }}>
              {item.icon || <UnorderedListOutlined />}
            </Box>
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color={isComingSoon ? 'text.disabled' : 'text.primary'}>
                {item.val}
              </Typography>
              {isComingSoon && (
                <Chip
                  label="Coming Soon"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 10, height: 18, borderColor: '#d9d9d9', color: '#8c8c8c', pointerEvents: 'none' }}
                />
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

// ── CategoryCard ───────────────────────────────────────────────────────────
// Card satu kategori di grid "All Reports"
const CategoryCard = ({ category, navigate, checkAccess, searchQuery }) => {
  const meta = CATEGORY_META[category] || { color: '#666', bg: '#f5f5f5' };

  const filteredItems = useMemo(() => {
    const items = CATEGORY_ITEMS[category] || [];
    return searchQuery.trim() ? items.filter((i) => i.val.toLowerCase().includes(searchQuery.toLowerCase())) : items;
  }, [category, searchQuery]);

  if (!filteredItems.length) return null;

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: `${meta.color}55` }}>
        {/* Header berwarna */}
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: meta.bg,
            borderBottom: `2px solid ${meta.color}`
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: meta.color }}>
            <FormattedMessage id={category} defaultMessage={category} />
          </Typography>
        </Box>

        {/* List item */}
        <CardContent sx={{ p: 0, flexGrow: 1, '&:last-child': { pb: 0 } }}>
          <List sx={{ py: 0 }}>
            {filteredItems.map((item) => (
              <ReportItem key={item.id} item={item} category={category} navigate={navigate} checkAccess={checkAccess} />
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>
  );
};

// ── ReportPage ─────────────────────────────────────────────────────────────
const ReportPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'all';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Indeks tab aktif — diturunkan langsung dari URL agar sinkron saat navigasi
  const tabSelectedIndex = useMemo(() => {
    const idx = VISIBLE_TABS.findIndex((t) => t.id === type);
    return idx >= 0 ? idx : 0;
  }, [type]);

  const onChangeTab = (_, value) => {
    setSearchParams({ type: VISIBLE_TABS[value].id });
    setSearchQuery('');
  };

  // Cek apakah user punya akses ke item ini
  const checkAccess = (item, title) => {
    if (!item.url) return false;
    const tempUrl = `report-detail?type=${title}&detail=${item.url}`;
    return user?.reportMenu?.items?.find((e) => e.url === tempUrl);
  };

  // ── Grid semua kategori (tab "All") ──────────────────────────────────────
  const renderAllGrid = () => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {ALL_CATEGORIES.map((key) => (
        <CategoryCard key={key} category={key} navigate={navigate} checkAccess={checkAccess} searchQuery={searchQuery} />
      ))}
    </Grid>
  );

  // ── List satu kategori (tab spesifik) ────────────────────────────────────
  const renderCategoryList = () => {
    const items = CATEGORY_ITEMS[type] || [];
    const filtered = searchQuery.trim() ? items.filter((i) => i.val.toLowerCase().includes(searchQuery.toLowerCase())) : items;

    return (
      <Box sx={{ mt: 2 }}>
        <MainCard contentSX={{ padding: 0 }} title={<FormattedMessage id={type} defaultMessage={type} />}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Tidak ada laporan yang cocok dengan pencarian Anda
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filtered.map((item) => (
                <ReportItem key={item.id} item={item} category={type} navigate={navigate} checkAccess={checkAccess} />
              ))}
            </List>
          )}
        </MainCard>
      </Box>
    );
  };

  return (
    <MainCard border={false} boxShadow>
      {/* ── Tab navigation ──────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs value={tabSelectedIndex} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="report category tabs">
          {VISIBLE_TABS.map((t, idx) => (
            <Tab key={t.id} label={<FormattedMessage id={t.val} />} id={`report-tab-${idx}`} aria-controls={`report-tabpanel-${idx}`} />
          ))}
        </Tabs>
      </Box>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined style={{ color: '#8c8c8c' }} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* ── Konten ──────────────────────────────────────────────────────── */}
      {type === 'all' ? renderAllGrid() : renderCategoryList()}
    </MainCard>
  );
};

export default ReportPage;
