import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
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
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { addBreedingAdditionalTreatment, deleteBreedingAdditionalTreatment, getBreedingAdditionalTreatments } from '../../service';

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

const AdditionalTreatmentBreeding = ({ open, data, onClose }) => {
  const { transactionId } = data;
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'service', itemName: '', quantity: 1, price: '', catatan: '' });

  const fetchData = async () => {
    try {
      const resp = await getBreedingAdditionalTreatments(transactionId);
      setItems(resp.data.items ?? []);
      setSubtotal(resp.data.subtotal ?? 0);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!form.itemName || !form.price) {
      dispatch(snackbarError('Nama item dan harga wajib diisi.'));
      return;
    }
    setLoading(true);
    try {
      await addBreedingAdditionalTreatment({ transactionId, ...form });
      dispatch(snackbarSuccess('Tindakan tambahan berhasil disimpan.'));
      setForm({ type: 'service', itemName: '', quantity: 1, price: '', catatan: '' });
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
      await deleteBreedingAdditionalTreatment(id);
      dispatch(snackbarSuccess('Tindakan tambahan dihapus.'));
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  return (
    <ModalC
      title="Tindakan Tambahan Selama Proses Pacak"
      open={open}
      onCancel={() => onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="sm"
    >
      <Stack spacing={2}>
        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tipe</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Harga</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Hapus</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="caption" color="text.secondary">
                      Belum ada tindakan tambahan
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                        {item.type}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">Rp {fmt(item.price)}</TableCell>
                    <TableCell align="right">Rp {fmt(item.quantity * item.price)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Hapus">
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {items.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="body2" fontWeight={700}>
                      Subtotal
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}>
                      Rp {fmt(subtotal)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Form tambah */}
        {showForm ? (
          <Box sx={{ p: 1.5, border: '1px dashed', borderColor: 'primary.main', borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={1.5}>
              Tambah Tindakan
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                select
                label="Tipe"
                size="small"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                fullWidth
              >
                <MenuItem value="service">Layanan / Tindakan</MenuItem>
                <MenuItem value="product">Produk</MenuItem>
              </TextField>
              <TextField
                label="Nama Item"
                size="small"
                value={form.itemName}
                onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
                fullWidth
              />
              <Stack direction="row" spacing={1.5}>
                <TextField
                  label="Qty"
                  size="small"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Harga Satuan (Rp)"
                  size="small"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  fullWidth
                />
              </Stack>
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
                  startIcon={loading ? <CircularProgress size={14} /> : <AddIcon />}
                >
                  Simpan
                </Button>
                <Button variant="outlined" size="small" onClick={() => setShowForm(false)}>
                  Batal
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <>
            <Divider />
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
              Tambah Tindakan
            </Button>
          </>
        )}
      </Stack>
    </ModalC>
  );
};

AdditionalTreatmentBreeding.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.shape({ transactionId: PropTypes.number }),
  onClose: PropTypes.func
};

export default AdditionalTreatmentBreeding;
