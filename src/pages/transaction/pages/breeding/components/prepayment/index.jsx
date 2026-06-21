import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend, processDownloadExcel } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { addBreedingPrepayment, deleteBreedingPrepayment, getBreedingPrepayments, printBreedingPrepaymentReceipt } from '../../service';

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

const PrepaymentBreeding = ({ open, data, onClose }) => {
  const { transactionId } = data;
  const dispatch = useDispatch();

  const [list, setList] = useState([]);
  const [totalPrepaid, setTotalPrepaid] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ paymentMethodId: '', amount: '', catatan: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const resp = await getBreedingPrepayments(transactionId);
      setList(resp.data.prepayments ?? []);
      setTotalPrepaid(resp.data.totalPrepaid ?? 0);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const resp = await import('utils/axios').then(({ default: axios }) => axios.get('transaction/breeding/payment-methods'));
      setPaymentMethods(resp.data ?? []);
    } catch (_) {
      // fallback silent
    }
  };

  useEffect(() => {
    fetchData();
    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!form.paymentMethodId || !form.amount) {
      dispatch(snackbarError('Metode pembayaran dan nominal wajib diisi.'));
      return;
    }
    setLoading(true);
    try {
      await addBreedingPrepayment({ transactionId, ...form });
      dispatch(snackbarSuccess('DP berhasil disimpan.'));
      setForm({ paymentMethodId: '', amount: '', catatan: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBreedingPrepayment(id);
      dispatch(snackbarSuccess('DP dihapus.'));
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const handlePrint = async (id) => {
    try {
      const resp = await printBreedingPrepaymentReceipt(id);
      processDownloadExcel(resp);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  return (
    <ModalC
      title="Kelola DP / Prepayment Breeding"
      open={open}
      onCancel={() => onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="sm"
    >
      <Stack spacing={2}>
        {/* Summary */}
        <Alert severity="info">
          Total DP yang sudah dibayar: <strong>Rp {fmt(totalPrepaid)}</strong>
        </Alert>

        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No Nota</TableCell>
                <TableCell>Metode</TableCell>
                <TableCell align="right">Nominal</TableCell>
                <TableCell>Catatan</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="caption" color="text.secondary">
                      Belum ada DP
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nota_number}</TableCell>
                    <TableCell>{p.paymentMethodName ?? '-'}</TableCell>
                    <TableCell align="right">Rp {fmt(p.amount)}</TableCell>
                    <TableCell>{p.catatan || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Print kwitansi">
                        <IconButton size="small" color="primary" onClick={() => handlePrint(p.id)}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus">
                        <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Form tambah DP */}
        {showForm ? (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={1.5}>
              Tambah DP Baru
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                select
                label="Metode Pembayaran"
                size="small"
                value={form.paymentMethodId}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethodId: e.target.value }))}
                fullWidth
              >
                {paymentMethods.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Nominal DP (Rp)"
                size="small"
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Catatan"
                size="small"
                value={form.catatan}
                onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
                fullWidth
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAdd}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={14} />}
                >
                  Simpan DP
                </Button>
                <Button variant="outlined" size="small" onClick={() => setShowForm(false)}>
                  Batal
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Box>
            <Divider sx={{ mb: 1 }} />
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
              Tambah DP
            </Button>
          </Box>
        )}
      </Stack>
    </ModalC>
  );
};

PrepaymentBreeding.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.shape({ transactionId: PropTypes.number }),
  onClose: PropTypes.func
};

export default PrepaymentBreeding;
