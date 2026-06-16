import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  Box,
  IconButton
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { snackbarSuccess, snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getPaymentDetail, getPaymentMethods, addPayment } from '../service';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const formatRp = (val) => 'Rp ' + Number(val ?? 0).toLocaleString('id-ID');

const StatusChip = ({ value }) => {
  const map = { paid: 'success', partial: 'warning', unpaid: 'error', cancelled: 'default' };
  const label = { paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid', cancelled: 'Cancelled' };
  return <Chip color={map[value] ?? 'default'} label={label[value] ?? value} size="small" variant="light" />;
};

const PaymentDialog = ({ open, row, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  const [methods, setMethods] = useState([]);

  // Form tambah bayar
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ amountPaid: '', paymentMethodId: null, nextPayment: '' });
  const [formError, setFormError] = useState('');

  const canAddPayment = detail && ['unpaid', 'partial'].includes(detail.status);

  const loadDetail = useCallback(async () => {
    if (!row) return;
    setLoading(true);
    setDetail(null);
    setPayments([]);
    setShowForm(false);
    setFormData({ amountPaid: '', paymentMethodId: null, nextPayment: '' });
    setFormError('');
    try {
      const resp = await getPaymentDetail(row.invoiceNumber, row.serviceType);
      setDetail(resp.data.invoice);
      setPayments(resp.data.payments || []);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoading(false);
    }
  }, [row, dispatch]);

  useEffect(() => {
    if (open && row) {
      loadDetail();
      getPaymentMethods()
        .then((r) => setMethods(r.data.map((m) => ({ label: m.name, value: m.id }))))
        .catch(() => {});
    }
  }, [open, row, loadDetail]);

  const handleAddPayment = async () => {
    setFormError('');

    if (!formData.amountPaid || Number(formData.amountPaid) <= 0) {
      setFormError('Jumlah bayar harus lebih dari 0.');
      return;
    }
    if (!formData.paymentMethodId) {
      setFormError('Pilih metode pembayaran.');
      return;
    }

    const remaining = detail?.remaining ?? 0;
    const isPartialPayment = Number(formData.amountPaid) < remaining;

    if (isPartialPayment && !formData.nextPayment) {
      setFormError('Isi tanggal jatuh tempo berikutnya karena pembayaran belum lunas.');
      return;
    }

    setSaving(true);
    try {
      const resp = await addPayment({
        invoiceNumber: row.invoiceNumber,
        serviceType: row.serviceType,
        amountPaid: Number(formData.amountPaid),
        paymentMethodId: formData.paymentMethodId.value,
        nextPayment: isPartialPayment ? formData.nextPayment : null
      });

      dispatch(snackbarSuccess(resp.data.message));
      setShowForm(false);
      await loadDetail();
      onSuccess?.();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Detail Invoice &mdash; {row?.invoiceNumber ?? ''}</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        )}

        {!loading && detail && (
          <Stack spacing={2.5}>
            {/* ── Ringkasan Invoice ── */}
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {detail.customerName}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Cabang
                  </Typography>
                  <Typography variant="body2">{detail.locationName}</Typography>
                </Stack>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Total Tagihan
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatRp(detail.total)}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Terbayar
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    {formatRp(detail.paidAmount)}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Sisa Tagihan
                  </Typography>
                  <Typography variant="body2" color={detail.remaining > 0 ? 'error.main' : 'text.primary'} fontWeight={700}>
                    {formatRp(detail.remaining)}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <StatusChip value={detail.status} />
                </Stack>
              </Stack>
            </Box>

            {/* ── Riwayat Pembayaran ── */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                <FormattedMessage id="payment-history" defaultMessage="Riwayat Pembayaran" />
              </Typography>

              {payments.length === 0 ? (
                <Alert severity="info">Belum ada riwayat pembayaran.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Nota</TableCell>
                      <TableCell>Metode</TableCell>
                      <TableCell align="right">Jumlah Bayar</TableCell>
                      <TableCell>Jatuh Tempo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Dicatat Oleh</TableCell>
                      <TableCell>Tgl Catat</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell sx={{ fontSize: 11 }}>{p.notaNumber ?? '-'}</TableCell>
                        <TableCell>{p.paymentMethod}</TableCell>
                        <TableCell align="right">{formatRp(p.amountPaid)}</TableCell>
                        <TableCell>{p.nextPayment ?? '-'}</TableCell>
                        <TableCell>
                          {p.isPayed ? (
                            <Chip color="success" label="Confirmed" size="small" variant="light" />
                          ) : (
                            <Chip color="warning" label="Pending" size="small" variant="light" />
                          )}
                        </TableCell>
                        <TableCell>{p.createdBy}</TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{p.createdAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>

            {/* ── Form Tambah Bayar (hanya unpaid / partial) ── */}
            {canAddPayment && (
              <>
                <Divider />
                {!showForm ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => setShowForm(true)}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    <FormattedMessage id="add-payment" defaultMessage="Tambah Pembayaran" />
                  </Button>
                ) : (
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      <FormattedMessage id="add-payment" defaultMessage="Tambah Pembayaran" />
                    </Typography>

                    {formError && <Alert severity="error">{formError}</Alert>}

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      <TextField
                        label="Jumlah Bayar (Rp)"
                        type="number"
                        size="small"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData((f) => ({ ...f, amountPaid: e.target.value }))}
                        inputProps={{ min: 1, max: detail.remaining }}
                        sx={{ width: 200 }}
                        helperText={`Maks: ${formatRp(detail.remaining)}`}
                      />
                      <Autocomplete
                        options={methods}
                        value={formData.paymentMethodId}
                        onChange={(_, v) => setFormData((f) => ({ ...f, paymentMethodId: v }))}
                        isOptionEqualToValue={(o, v) => o.value === v?.value}
                        renderInput={(params) => <TextField {...params} label="Metode Pembayaran" size="small" />}
                        sx={{ width: 200 }}
                      />
                      <TextField
                        label="Jatuh Tempo Berikutnya"
                        type="date"
                        size="small"
                        value={formData.nextPayment}
                        onChange={(e) => setFormData((f) => ({ ...f, nextPayment: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 200 }}
                        helperText="Isi jika belum lunas"
                      />
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddPayment}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={14} /> : null}
                      >
                        {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="inherit"
                        onClick={() => {
                          setShowForm(false);
                          setFormError('');
                        }}
                      >
                        Batal
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          <FormattedMessage id="close" defaultMessage="Tutup" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
