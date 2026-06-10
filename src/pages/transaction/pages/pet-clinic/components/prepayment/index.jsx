import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getPaymentMethodList, processDownloadPDF } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getPrepaymentsPetClinic, addPrepaymentPetClinic, getPrepaymentReceiptPetClinic } from '../../service.jsx';
import { AttachFile, DeleteOutline, Print } from '@mui/icons-material';

const PrepaymentPetClinic = (props) => {
  const { data } = props;
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [totalPrepaid, setTotalPrepaid] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  const [form, setForm] = useState({
    paymentMethodId: '',
    amount: '',
    catatan: '',
    proof: null,
    proofName: ''
  });

  const fetchRows = async () => {
    await getPrepaymentsPetClinic(data.transactionId)
      .then((resp) => {
        if (resp?.data) {
          setRows(resp.data.list || []);
          setTotalPrepaid(resp.data.totalPrepaid || 0);
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => {
    fetchRows();
    getPaymentMethodList()
      .then((list) => { if (list?.length) setPaymentMethods(list); })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((f) => ({ ...f, proof: file, proofName: file.name }));
  };

  const onRemoveFile = () => {
    setForm((f) => ({ ...f, proof: null, proofName: '' }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const onSubmit = async () => {
    if (!form.paymentMethodId || !form.amount) return;
    setSubmitting(true);
    await addPrepaymentPetClinic({
      transactionId: data.transactionId,
      paymentMethodId: form.paymentMethodId,
      amount: form.amount,
      catatan: form.catatan,
      proof: form.proof
    })
      .then((resp) => {
        if (resp?.status === 201 || resp?.status === 200) {
          dispatch(snackbarSuccess('Pembayaran awal berhasil dicatat'));
          setForm({ paymentMethodId: '', amount: '', catatan: '', proof: null, proofName: '' });
          if (fileRef.current) fileRef.current.value = '';
          fetchRows();
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  const printReceipt = async (row) => {
    setPrintingId(row.id);
    try {
      const resp = await getPrepaymentReceiptPetClinic(row.id);
      processDownloadPDF(resp, `TandaTerima_DP_${row.id}`);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setPrintingId(null);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <ModalC
      title="Pembayaran Awal / DP"
      open={props.open}
      onCancel={() => props.onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="md"
    >
      <Stack spacing={2.5}>
        <Box sx={{ p: 1.5, bgcolor: 'primary.lighter', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Total sudah dibayar (DP)</Typography>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            {formatCurrency(totalPrepaid)}
          </Typography>
        </Box>

        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>
            Catat Pembayaran Baru
          </Typography>

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Metode Pembayaran"
                value={form.paymentMethodId}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethodId: e.target.value }))}
                size="small"
                sx={{ minWidth: 180 }}
              >
                {paymentMethods.map((pm) => (
                  <MenuItem key={pm.value} value={pm.value}>{pm.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Jumlah (Rp)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                size="small"
                inputProps={{ min: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>
                }}
                sx={{ flex: 1 }}
              />
            </Stack>

            <TextField
              label="Catatan (opsional)"
              value={form.catatan}
              onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
              size="small"
              multiline
              rows={2}
              fullWidth
            />

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<AttachFile fontSize="small" />}
                onClick={() => fileRef.current?.click()}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Upload Bukti Bayar
              </Button>

              {form.proofName ? (
                <Stack direction="row" alignItems="center" spacing={0.5}
                  sx={{ px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 1, maxWidth: 220 }}
                >
                  <Typography variant="caption" noWrap sx={{ flex: 1, color: 'text.secondary' }}>
                    {form.proofName}
                  </Typography>
                  <IconButton size="small" onClick={onRemoveFile} sx={{ p: 0.25 }}>
                    <DeleteOutline fontSize="small" color="error" />
                  </IconButton>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.disabled" fontStyle="italic">
                  Belum ada file dipilih
                </Typography>
              )}

              <Box sx={{ ml: 'auto' }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={onSubmit}
                  disabled={!form.paymentMethodId || !form.amount || submitting}
                  sx={{ minWidth: 110 }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan DP'}
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">Riwayat Pembayaran Awal</Typography>
          <Typography variant="caption" color="text.secondary">{rows.length} transaksi</Typography>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', whiteSpace: 'nowrap' } }}>
                <TableCell>Tanggal</TableCell>
                <TableCell>Metode</TableCell>
                <TableCell align="right">Jumlah</TableCell>
                <TableCell>Catatan</TableCell>
                <TableCell>Bukti</TableCell>
                <TableCell>Dicatat Oleh</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.recordedAt}</TableCell>
                  <TableCell>
                    <Chip label={row.paymentMethod || '-'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main', whiteSpace: 'nowrap' }}>
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 120 }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.catatan || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.proofPath ? (
                      <Link href={row.proofPath} target="_blank" rel="noopener" underline="hover">
                        {row.proofOriginalName || 'Lihat'}
                      </Link>
                    ) : (
                      <Typography variant="caption" color="text.disabled">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>{row.recordedBy}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Cetak Tanda Terima DP">
                      <span>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => printReceipt(row)}
                          disabled={printingId === row.id}
                        >
                          <Print fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Belum ada pembayaran awal
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </ModalC>
  );
};

PrepaymentPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default PrepaymentPetClinic;
