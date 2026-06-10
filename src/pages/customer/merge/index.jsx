import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { getCustomerList } from '../service';
import { getMergePreview, executeMerge, getMergeHistory, exportMergeHistory } from './service';

import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ConfirmationC from 'components/ConfirmationC';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';

import MergeIcon from '@mui/icons-material/MergeType';
import PersonIcon from '@mui/icons-material/Person';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PetsIcon from '@mui/icons-material/Pets';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

// STEPS are built inside the component so intl is available

// ── Helper: format nama lengkap ───────────────────────────────────────────────
const fullName = (c) =>
  [c?.firstName, c?.middleName, c?.lastName].filter(Boolean).join(' ') || c?.customerName || '-';

// ── Customer Info Card ────────────────────────────────────────────────────────
const CustomerInfoCard = ({ customer, label, color, counts }) => {
  const intl = useIntl();
  if (!customer) return null;
  return (
    <Box
      sx={{
        border: `2px solid`,
        borderColor: `${color}.main`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header info */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <PersonIcon color={color} fontSize="small" />
          <Typography variant="subtitle1" fontWeight="bold" color={`${color}.main`}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="h6" fontWeight="bold">{fullName(customer)}</Typography>
        {customer.memberNo && (
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="card-number" />: {customer.memberNo}</Typography>
        )}
        {customer.customerGroupName && (
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="customer-group" />: {customer.customerGroupName}</Typography>
        )}
        {customer.locationName && (
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="location" />: {customer.locationName}</Typography>
        )}
        {customer.phoneNumber && (
          <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
            <PhoneIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{customer.phoneNumber}</Typography>
          </Stack>
        )}
        {customer.email && (
          <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
            <EmailIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{customer.email}</Typography>
          </Stack>
        )}
      </Box>

      {/* Relation counts — menyatu di bawah card */}
      {counts && (
        <Box sx={{ bgcolor: `${color}.lighter`, px: 2, py: 1, borderTop: `1px solid`, borderColor: `${color}.light` }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<PetsIcon />} label={`${counts.pets} ${intl.formatMessage({ id: 'pet-animal' })}`} size="small" color={color === 'error' ? 'error' : 'success'} variant="filled" />
            <Chip icon={<ReceiptLongIcon />} label={`${counts.transactions} ${intl.formatMessage({ id: 'transaction' })}`} size="small" variant="outlined" />
            <Chip icon={<PhoneIcon />} label={`${counts.telephones} ${intl.formatMessage({ id: 'phone-number' })}`} size="small" variant="outlined" />
            <Chip icon={<EmailIcon />} label={`${counts.emails} Email`} size="small" variant="outlined" />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// ── Riwayat Merge Tab ─────────────────────────────────────────────────────────
const MergeHistoryTab = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const [rows, setRows]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [locationList, setLocationList] = useState([]);

  const [dateFrom, setDateFrom]     = useState(null);
  const [dateTo, setDateTo]         = useState(null);
  const [locationId, setLocationId] = useState('');

  const rowPerPage = 10;

  useEffect(() => {
    getLocationList().then(setLocationList);
  }, []);

  const loadHistory = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = {
        rowPerPage,
        goToPage: pg,
        dateFrom:   dateFrom ? dayjs(dateFrom).format('YYYY-MM-DD') : undefined,
        dateTo:     dateTo   ? dayjs(dateTo).format('YYYY-MM-DD')   : undefined,
        locationId: locationId || undefined,
      };
      const resp = await getMergeHistory(params);
      setRows(resp.data.data || []);
      setTotal(resp.data.totalPagination || 0);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, locationId, dispatch]);

  useEffect(() => {
    loadHistory(1);
    setPage(1);
  }, [dateFrom, dateTo, locationId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        dateFrom:   dateFrom ? dayjs(dateFrom).format('YYYY-MM-DD') : undefined,
        dateTo:     dateTo   ? dayjs(dateTo).format('YYYY-MM-DD')   : undefined,
        locationId: locationId || undefined,
      };
      const resp = await exportMergeHistory(params);
      const url  = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `riwayat-merge-customer-${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setExporting(false);
    }
  };

  const parseRelations = (json) => {
    try {
      const obj = typeof json === 'string' ? JSON.parse(json) : json;
      if (!obj || !Object.keys(obj).length) return '-';
      const labelMap = {
        pets:                  intl.formatMessage({ id: 'pet-animal' }),
        telephones:            intl.formatMessage({ id: 'phone-number' }),
        emails:                'Email',
        addresses:             intl.formatMessage({ id: 'address' }),
        transactionPetClinics: 'Klinik',
        transactionPetHotels:  'Hotel',
        transactionPetShop:    'Petshop',
        transactionPetSalons:  'Salon',
        transactionBreedings:  intl.formatMessage({ id: 'breeding' }),
        transactions:          intl.formatMessage({ id: 'transaction' }),
        bookings:              intl.formatMessage({ id: 'booking' }),
        deliveryOrders:        'Delivery',
        queues:                'Antrian',
        reminders:             'Reminder',
      };
      return Object.entries(obj)
        .map(([k, v]) => `${labelMap[k] || k}: ${v}`)
        .join(' · ');
    } catch { return '-'; }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
      <Grid container spacing={2}>
        {/* Filter bar */}
        <Grid item xs={12} sm={3}>
          <DesktopDatePicker
            label={intl.formatMessage({ id: 'from-date' })}
            value={dateFrom}
            onChange={setDateFrom}
            inputFormat="DD/MM/YYYY"
            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <DesktopDatePicker
            label={intl.formatMessage({ id: 'to-date' })}
            value={dateTo}
            onChange={setDateTo}
            inputFormat="DD/MM/YYYY"
            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel><FormattedMessage id="location" /></InputLabel>
            <Select
              value={locationId}
              label={intl.formatMessage({ id: 'location' })}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <MenuItem value=""><em><FormattedMessage id="all-location" /></em></MenuItem>
              {locationList.map((loc) => (
                <MenuItem key={loc.value} value={loc.value}>{loc.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => { setDateFrom(null); setDateTo(null); setLocationId(''); }}
          >
            <FormattedMessage id="reset" />
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            startIcon={exporting ? <CircularProgress size={14} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExport}
            disabled={exporting}
          >
            <FormattedMessage id="export-excel" />
          </Button>
        </Grid>

        {/* Tabel */}
        <Grid item xs={12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell width={40}><strong>No.</strong></TableCell>
                    <TableCell><strong><FormattedMessage id="customer-source" /></strong></TableCell>
                    <TableCell><strong><FormattedMessage id="customer-target" /></strong></TableCell>
                    <TableCell><strong><FormattedMessage id="location" /></strong></TableCell>
                    <TableCell><strong><FormattedMessage id="transferred-relations" /></strong></TableCell>
                    <TableCell><strong><FormattedMessage id="performed-by" /></strong></TableCell>
                    <TableCell><strong><FormattedMessage id="merge-date" /></strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        <FormattedMessage id="no-merge-history" />
                      </TableCell>
                    </TableRow>
                  ) : rows.map((row, idx) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page - 1) * rowPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error.main" fontWeight="medium">
                          {row.sourceCustomerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                          {row.targetCustomerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.locationName || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {parseRelations(row.transferredRelations)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.performedBy || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.created_at ? dayjs(row.created_at).format('DD/MM/YYYY HH:mm') : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {total > rowPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(total / rowPerPage)}
                    page={page}
                    color="primary"
                    onChange={(_, val) => { setPage(val); loadHistory(val); }}
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CustomerMerge = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const STEPS = [
    intl.formatMessage({ id: 'step-select-customer' }),
    intl.formatMessage({ id: 'step-preview-confirm' }),
    intl.formatMessage({ id: 'step-done' }),
  ];

  const [activeTab, setActiveTab]   = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Step 0: pilih customer
  const [sourceOptions, setSourceOptions] = useState([]);
  const [targetOptions, setTargetOptions] = useState([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const [sourceCustomer, setSourceCustomer] = useState(null);
  const [targetCustomer, setTargetCustomer] = useState(null);

  // Step 1: preview
  const [preview, setPreview] = useState(null);
  const [fieldOverrides, setFieldOverrides] = useState({}); // { field: 'source' | 'target' }

  // Step 2: result
  const [mergeResult, setMergeResult] = useState(null);

  // ── Search customer untuk autocomplete ────────────────────────────────────
  const searchCustomer = async (keyword, setOptions, setLoadingFn) => {
    if (!keyword || keyword.length < 2) return;
    setLoadingFn(true);
    try {
      const resp = await getCustomerList({ rowPerPage: 20, goToPage: 1, keyword });
      setOptions(resp?.data?.data || []);
    } catch {
      setOptions([]);
    } finally {
      setLoadingFn(false);
    }
  };

  // ── Step 0 → 1: Load preview ───────────────────────────────────────────────
  const handleLoadPreview = async () => {
    if (!sourceCustomer || !targetCustomer) return;
    setLoading(true);
    try {
      const resp = await getMergePreview(sourceCustomer.id, targetCustomer.id);
      const data = resp.data;
      setPreview(data);

      // Set default fieldOverrides dari rekomendasi backend
      const defaults = {};
      (data.fieldComparison || []).forEach((f) => {
        defaults[f.field] = f.recommended;
      });
      setFieldOverrides(defaults);

      setActiveStep(1);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1 → Execute merge ─────────────────────────────────────────────────
  const handleExecute = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const resp = await executeMerge({
        sourceId: sourceCustomer.id,
        targetId: targetCustomer.id,
        fieldOverrides
      });
      setMergeResult(resp.data);
      setActiveStep(2);
      dispatch(snackbarSuccess('Merge customer berhasil!'));
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setActiveStep(0);
    setSourceCustomer(null);
    setTargetCustomer(null);
    setPreview(null);
    setFieldOverrides({});
    setMergeResult(null);
  };

  // ── Render steps ───────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary">
          <FormattedMessage
            id="merge-field-hint"
            defaultMessage="Choose which field to take from. All pets, transactions, and history from Source will be automatically moved to Target."
          />
        </Typography>
      </Grid>

      {/* Customer Sumber */}
      <Grid item xs={12} md={5}>
        <Typography variant="subtitle2" gutterBottom color="error.main">
          ❌ <FormattedMessage id="source-will-be-deactivated" />
        </Typography>
        <Autocomplete
          options={sourceOptions}
          getOptionLabel={(o) => `${fullName(o)}${o.memberNo ? ` (${o.memberNo})` : ''}${o.phoneNumber ? ` · ${o.phoneNumber}` : ''}${o.location ? ` — ${o.location}` : ''}`}
          loading={sourceLoading}
          value={sourceCustomer}
          onChange={(_, val) => setSourceCustomer(val)}
          onInputChange={(_, val) => searchCustomer(val, setSourceOptions, setSourceLoading)}
          filterOptions={(x) => x}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={intl.formatMessage({ id: 'search-by-name-or-card' })}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {sourceLoading && <CircularProgress size={18} />}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
        {sourceCustomer && (
          <Box mt={2}>
            <CustomerInfoCard customer={sourceCustomer} label={intl.formatMessage({ id: 'source-duplicate' })} color="error" />
          </Box>
        )}
      </Grid>

      {/* Ikon panah di tengah */}
      <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CompareArrowsIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
      </Grid>

      {/* Customer Target */}
      <Grid item xs={12} md={5}>
        <Typography variant="subtitle2" gutterBottom color="success.main">
          ✅ <FormattedMessage id="target-will-be-kept" />
        </Typography>
        <Autocomplete
          options={targetOptions}
          getOptionLabel={(o) => `${fullName(o)}${o.memberNo ? ` (${o.memberNo})` : ''}${o.phoneNumber ? ` · ${o.phoneNumber}` : ''}${o.location ? ` — ${o.location}` : ''}`}
          loading={targetLoading}
          value={targetCustomer}
          onChange={(_, val) => setTargetCustomer(val)}
          onInputChange={(_, val) => searchCustomer(val, setTargetOptions, setTargetLoading)}
          filterOptions={(x) => x}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={intl.formatMessage({ id: 'search-by-name-or-card' })}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {targetLoading && <CircularProgress size={18} />}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
        {targetCustomer && (
          <Box mt={2}>
            <CustomerInfoCard customer={targetCustomer} label={intl.formatMessage({ id: 'target-master' })} color="success" />
          </Box>
        )}
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CompareArrowsIcon />}
            onClick={handleLoadPreview}
            disabled={!sourceCustomer || !targetCustomer || loading || sourceCustomer?.id === targetCustomer?.id}
          >
            <FormattedMessage id="view-merge-preview" />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );

  const renderStep1 = () => {
    if (!preview) return null;
    const { source, target, fieldComparison, sourceCounts, targetCounts } = preview;

    return (
      <Grid container spacing={3}>
        {/* Header: info kedua customer */}
        <Grid item xs={12} md={6}>
          <CustomerInfoCard customer={source} label={intl.formatMessage({ id: 'source-will-be-deactivated' })} color="error" counts={sourceCounts} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomerInfoCard customer={target} label={intl.formatMessage({ id: 'target-master' })} color="success" counts={targetCounts} />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Tabel pilihan field profil */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <FormattedMessage id="select-profile-field" />
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            <FormattedMessage id="merge-field-hint" />
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell><strong><FormattedMessage id="field" /></strong></TableCell>
                <TableCell><strong><FormattedMessage id="source-value" /></strong></TableCell>
                <TableCell><strong><FormattedMessage id="target-value" /></strong></TableCell>
                <TableCell align="center"><strong><FormattedMessage id="choice" /></strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldComparison.map((row) => {
                const choice = fieldOverrides[row.field] || row.recommended;
                const hasSource = row.sourceValue !== null && row.sourceValue !== '';
                const hasTarget = row.targetValue !== null && row.targetValue !== '';
                if (!hasSource && !hasTarget) return null; // skip jika keduanya kosong
                const srcLabel = row.sourceDisplay ?? row.sourceValue;
                const tgtLabel = row.targetDisplay ?? row.targetValue;
                return (
                  <TableRow key={row.field} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{row.label}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={choice === 'source' ? 'error.main' : 'text.secondary'}
                        fontWeight={choice === 'source' ? 'bold' : 'normal'}
                      >
                        {srcLabel || <em style={{ color: '#aaa' }}><FormattedMessage id="empty" /></em>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={choice === 'target' ? 'success.main' : 'text.secondary'}
                        fontWeight={choice === 'target' ? 'bold' : 'normal'}
                      >
                        {tgtLabel || <em style={{ color: '#aaa' }}><FormattedMessage id="empty" /></em>}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant={choice === 'source' ? 'contained' : 'outlined'}
                          color="error"
                          disabled={!hasSource}
                          onClick={() => setFieldOverrides((prev) => ({ ...prev, [row.field]: 'source' }))}
                          sx={{ minWidth: 70 }}
                        >
                          <FormattedMessage id="source" />
                        </Button>
                        <Button
                          size="small"
                          variant={choice === 'target' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => setFieldOverrides((prev) => ({ ...prev, [row.field]: 'target' }))}
                          sx={{ minWidth: 70 }}
                        >
                          <FormattedMessage id="target-master" />
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Grid>

        {/* Informasi yang akan otomatis dipindah */}
        <Grid item xs={12}>
          <Box sx={{ bgcolor: 'info.lighter', borderRadius: 2, p: 2 }}>
            <Typography variant="subtitle2" color="info.main" gutterBottom>
              ℹ️ <FormattedMessage id="merge-auto-transfer-info" />
            </Typography>
            <Typography variant="body2">
              ✅ <strong><FormattedMessage id="pet-animal" /></strong> ({sourceCounts.pets}) &nbsp;|&nbsp;
              ✅ <strong><FormattedMessage id="transaction-history" /></strong> ({sourceCounts.transactions}) &nbsp;|&nbsp;
              ✅ <strong><FormattedMessage id="phone-number" /></strong> &nbsp;|&nbsp;
              ✅ <strong>Email</strong> &nbsp;|&nbsp;
              ✅ <strong><FormattedMessage id="address" /></strong> &nbsp;|&nbsp;
              ✅ <strong>Reminder</strong>
            </Typography>
            <Typography variant="body2" mt={1} color="warning.main">
              ⚠️ <FormattedMessage id="customer-source" /> (<strong>{fullName(source)}</strong>) <FormattedMessage id="source-will-be-deactivated" defaultMessage="will be deactivated" />.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider />
          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button variant="outlined" size="large" onClick={() => setActiveStep(0)}>
              ← <FormattedMessage id="back" />
            </Button>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<MergeIcon />}
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
            >
              <FormattedMessage id="execute-merge" />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  const renderStep2 = () => {
    if (!mergeResult) return null;
    const { transferredRelations, targetCustomerId } = mergeResult;

    const relationLabels = {
      telephones:            intl.formatMessage({ id: 'phone-number' }),
      emails:                'Email',
      addresses:             intl.formatMessage({ id: 'address' }),
      messengers:            'Messenger',
      pets:                  intl.formatMessage({ id: 'pets' }),
      reminders:             'Reminder',
      transactionPetClinics: `${intl.formatMessage({ id: 'transaction' })} Pet Clinic`,
      transactionPetHotels:  `${intl.formatMessage({ id: 'transaction' })} Pet Hotel`,
      transactionPetShop:    `${intl.formatMessage({ id: 'transaction' })} Petshop`,
      transactionPetSalons:  `${intl.formatMessage({ id: 'transaction' })} Salon`,
      transactionBreedings:  `${intl.formatMessage({ id: 'transaction' })} ${intl.formatMessage({ id: 'breeding' })}`,
      transactions:          intl.formatMessage({ id: 'transaction' }),
      bookings:              intl.formatMessage({ id: 'booking' }),
      deliveryOrders:        'Delivery Order',
      queues:                'Antrian',
    };

    return (
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              <FormattedMessage id="merge-success" />
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              <FormattedMessage id="customer-source" /> → <FormattedMessage id="customer-target" /> (ID: {targetCustomerId})
            </Typography>
          </Box>

          <MainCard title={intl.formatMessage({ id: 'merge-summary' })}>
            {Object.keys(transferredRelations).length === 0 ? (
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="no-transferred-relations" /></Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong><FormattedMessage id="data-type" /></strong></TableCell>
                    <TableCell align="right"><strong><FormattedMessage id="amount" /></strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(transferredRelations).map(([key, count]) => (
                    <TableRow key={key} hover>
                      <TableCell>{relationLabels[key] || key}</TableCell>
                      <TableCell align="right">
                        <Chip label={count} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </MainCard>

          <Stack direction="row" justifyContent="center" mt={3} spacing={2}>
            <Button variant="outlined" onClick={handleReset}>
              <FormattedMessage id="merge-another-customer" />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="customer-merge" defaultMessage="Merge Customer" />} isBreadcrumb />

      <MainCard>
        {/* Tabs navigasi */}
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<MergeIcon fontSize="small" />} iconPosition="start" label={intl.formatMessage({ id: 'customer-merge' })} />
          <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label={intl.formatMessage({ id: 'merge-history' })} />
        </Tabs>

        {/* Tab 0: Merge flow */}
        {activeTab === 0 && (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {activeStep === 0 && renderStep0()}
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
          </>
        )}

        {/* Tab 1: Riwayat */}
        {activeTab === 1 && <MergeHistoryTab />}
      </MainCard>

      {/* Konfirmasi dialog */}
      <ConfirmationC
        open={confirmOpen}
        title={intl.formatMessage({ id: 'merge-confirm-title' })}
        content={
          <Typography>
            <strong>{fullName(preview?.source)}</strong> → <strong>{fullName(preview?.target)}</strong>.<br />
            <br />
            <FormattedMessage id="source-will-be-deactivated" /> — <FormattedMessage id="no-transferred-relations" defaultMessage="This action cannot be undone." />
          </Typography>
        }
        onClose={(isOk) => {
          if (isOk) handleExecute();
          else setConfirmOpen(false);
        }}
        btnTrueText={intl.formatMessage({ id: 'yes-merge-now' })}
        btnFalseText={intl.formatMessage({ id: 'cancel' })}
      />
    </>
  );
};

export default CustomerMerge;
