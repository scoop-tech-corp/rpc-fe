import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { snackbarSuccess, snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { lookupInvoice, getPaymentMethods, createRefund } from '../service';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

const formatRp = (val) => 'Rp ' + Number(val ?? 0).toLocaleString('id-ID');

const serviceTypeOptions = [
  { label: 'Pet Clinic', value: 'Pet Clinic' },
  { label: 'Pet Hotel', value: 'Pet Hotel' },
  { label: 'Pet Salon', value: 'Pet Salon' },
  { label: 'Breeding', value: 'Breeding' },
  { label: 'Pet Shop', value: 'Pet Shop' }
];

const RefundDialog = ({ open, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  // step 1 — invoice search
  const [invoiceInput, setInvoiceInput] = useState('');
  const [serviceTypeInput, setServiceTypeInput] = useState(null);
  const [looking, setLooking] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [lookupError, setLookupError] = useState('');

  // step 2 — refund form
  const [methods, setMethods] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: null,
    reason: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getPaymentMethods()
        .then((r) => setMethods(r.data.map((m) => ({ label: m.name, value: m.id }))))
        .catch(() => {});
    }
  }, [open]);

  const handleReset = () => {
    setInvoiceInput('');
    setServiceTypeInput(null);
    setInvoiceData(null);
    setLookupError('');
    setFormData({ amount: '', paymentMethodId: null, reason: '', notes: '' });
    setFormError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleLookup = async () => {
    if (!invoiceInput.trim()) {
      setLookupError('Masukkan nomor invoice.');
      return;
    }
    if (!serviceTypeInput) {
      setLookupError('Pilih jenis layanan.');
      return;
    }
    setLookupError('');
    setInvoiceData(null);
    setLooking(true);
    try {
      const resp = await lookupInvoice(invoiceInput.trim(), serviceTypeInput.value);
      setInvoiceData(resp.data);
      if (resp.data.maxRefund <= 0) {
        setLookupError('Invoice ini sudah direfund penuh atau tidak ada pembayaran yang bisa dikembalikan.');
      }
    } catch (err) {
      setLookupError(err?.response?.data?.message ?? 'Invoice tidak ditemukan.');
    } finally {
      setLooking(false);
    }
  };

  const handleSubmit = async () => {
    setFormError('');

    const amount = Number(formData.amount);
    if (!amount || amount <= 0) {
      setFormError('Jumlah refund harus lebih dari 0.');
      return;
    }
    if (invoiceData && amount > invoiceData.maxRefund) {
      setFormError(`Jumlah refund melebihi maksimal (${formatRp(invoiceData.maxRefund)}).`);
      return;
    }
    if (!formData.paymentMethodId) {
      setFormError('Pilih metode refund.');
      return;
    }
    if (!formData.reason.trim()) {
      setFormError('Alasan refund wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const resp = await createRefund({
        invoiceNumber: invoiceInput.trim(),
        serviceType: serviceTypeInput.value,
        transactionId: invoiceData.transactionId,
        customerId: invoiceData.customerId,
        locationId: invoiceData.locationId,
        paymentMethodId: formData.paymentMethodId.value,
        amount,
        reason: formData.reason.trim(),
        notes: formData.notes.trim() || null
      });
      dispatch(snackbarSuccess(resp.data.message));
      onSuccess?.();
      handleClose();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setSaving(false);
    }
  };

  const canRefund = invoiceData && invoiceData.maxRefund > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Catat Refund Baru</Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* ── Step 1: Cari Invoice ── */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={600}>
              1. Cari Invoice
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Autocomplete
                options={serviceTypeOptions}
                value={serviceTypeInput}
                onChange={(_, v) => {
                  setServiceTypeInput(v);
                  setInvoiceData(null);
                  setLookupError('');
                }}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                renderInput={(params) => <TextField {...params} label="Jenis Layanan" size="small" />}
                sx={{ width: 170 }}
              />
              <TextField
                label="No. Invoice"
                size="small"
                value={invoiceInput}
                onChange={(e) => {
                  setInvoiceInput(e.target.value);
                  setInvoiceData(null);
                  setLookupError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                sx={{ flex: 1, minWidth: 160 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleLookup}
                disabled={looking}
                startIcon={looking ? <CircularProgress size={14} /> : <SearchIcon />}
                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
              >
                Cari
              </Button>
            </Stack>
            {lookupError && (
              <Alert severity="error" sx={{ py: 0.5 }}>
                {lookupError}
              </Alert>
            )}
          </Stack>

          {/* ── Invoice Summary ── */}
          {invoiceData && (
            <>
              <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Customer
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {invoiceData.customerName}
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Cabang
                    </Typography>
                    <Typography variant="body2">{invoiceData.locationName}</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Total Dibayar
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {formatRp(invoiceData.paidAmount)}
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Sudah Direfund
                    </Typography>
                    <Typography variant="body2" color="warning.main" fontWeight={600}>
                      {formatRp(invoiceData.alreadyRefunded)}
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Maks. Refund
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color={invoiceData.maxRefund > 0 ? 'error.main' : 'text.disabled'}>
                      {formatRp(invoiceData.maxRefund)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* ── Step 2: Form Refund ── */}
              {canRefund && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      2. Detail Refund
                    </Typography>

                    {formError && (
                      <Alert severity="error" sx={{ py: 0.5 }}>
                        {formError}
                      </Alert>
                    )}

                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                      <TextField
                        label={`Jumlah Refund (maks. ${formatRp(invoiceData.maxRefund)})`}
                        type="number"
                        size="small"
                        value={formData.amount}
                        onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
                        inputProps={{ min: 1, max: invoiceData.maxRefund }}
                        sx={{ flex: 1, minWidth: 200 }}
                      />
                      <Autocomplete
                        options={methods}
                        value={formData.paymentMethodId}
                        onChange={(_, v) => setFormData((f) => ({ ...f, paymentMethodId: v }))}
                        isOptionEqualToValue={(o, v) => o.value === v?.value}
                        renderInput={(params) => <TextField {...params} label="Metode Refund" size="small" />}
                        sx={{ flex: 1, minWidth: 180 }}
                      />
                    </Stack>

                    <TextField
                      label="Alasan Refund *"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.reason}
                      onChange={(e) => setFormData((f) => ({ ...f, reason: e.target.value }))}
                      inputProps={{ maxLength: 500 }}
                    />
                    <TextField
                      label="Catatan Tambahan"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                      inputProps={{ maxLength: 1000 }}
                    />

                    {/* Preview chip */}
                    {Number(formData.amount) > 0 && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Refund:
                        </Typography>
                        <Chip color="error" label={formatRp(Number(formData.amount))} size="small" variant="light" />
                        {formData.paymentMethodId && (
                          <Chip label={`via ${formData.paymentMethodId.label}`} size="small" variant="outlined" />
                        )}
                      </Stack>
                    )}
                  </Stack>
                </>
              )}

              {!canRefund && <Alert severity="warning">Invoice ini tidak memiliki sisa yang bisa direfund.</Alert>}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="inherit" size="small">
          Tutup
        </Button>
        {canRefund && (
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} /> : null}
          >
            {saving ? 'Menyimpan...' : 'Simpan Refund'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;
