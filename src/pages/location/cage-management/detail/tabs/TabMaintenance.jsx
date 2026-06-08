import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, Divider, MenuItem, Select,
  Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, InputLabel
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getMaintenances, storeMaintenance, updateMaintenance } from '../../service';
import PropTypes from 'prop-types';

const STATUS_COLOR = { pending: 'warning', in_progress: 'info', selesai: 'success' };
const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', selesai: 'Selesai' };

const defaultForm = { title: '', description: '', estimatedDone: '' };

export default function TabMaintenance({ cageId, isAdminOrManager }) {
  const dispatch = useDispatch();
  const [rows, setRows]         = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    getMaintenances({ cageId, rowPerPage: 20, goToPage: 1 })
      .then((res) => setRows(res?.data?.data ?? []))
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => { load(); }, [cageId]);

  const f = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async () => {
    setSubmitting(true);
    await storeMaintenance({ cageId, ...form })
      .then(() => {
        dispatch(snackbarSuccess('Maintenance request berhasil dibuat'));
        setForm(defaultForm);
        setShowForm(false);
        load();
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  const onUpdateStatus = async (row, newStatus) => {
    setUpdatingId(row.id);
    await updateMaintenance({ id: row.id, status: newStatus })
      .then(() => {
        dispatch(snackbarSuccess('Status berhasil diupdate'));
        load();
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setUpdatingId(null));
  };

  return (
    <Stack spacing={3}>
      {/* Form tambah maintenance */}
      {isAdminOrManager && (
        <Box>
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Tutup Form' : 'Buat Maintenance Request'}
          </Button>

          {showForm && (
            <Stack spacing={2} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2">Form Maintenance Request</Typography>

              <TextField size="small" label="Judul" required
                value={form.title} onChange={(e) => f('title', e.target.value)} />

              <TextField multiline rows={3} size="small" label="Deskripsi Kerusakan"
                value={form.description} onChange={(e) => f('description', e.target.value)} />

              <TextField type="date" size="small" label="Estimasi Selesai"
                InputLabelProps={{ shrink: true }}
                value={form.estimatedDone} onChange={(e) => f('estimatedDone', e.target.value)}
                sx={{ width: 200 }} />

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setShowForm(false)}>Batal</Button>
                <Button variant="contained" onClick={onSubmit} disabled={submitting || !form.title}>
                  {submitting ? 'Menyimpan...' : 'Buat Request'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      )}

      <Divider />

      <Typography variant="subtitle2">Riwayat Maintenance</Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Judul</TableCell>
              <TableCell>Deskripsi</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Estimasi Selesai</TableCell>
              <TableCell>Dilaporkan Oleh</TableCell>
              {isAdminOrManager && <TableCell>Aksi</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdminOrManager ? 6 : 5} align="center">
                  <Typography color="text.secondary" variant="body2">Belum ada maintenance</Typography>
                </TableCell>
              </TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.description || '-'}</TableCell>
                <TableCell>
                  <Chip size="small" label={STATUS_LABEL[row.status]} color={STATUS_COLOR[row.status]} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.estimatedDone || '-'}</TableCell>
                <TableCell>{row.reportedBy}</TableCell>
                {isAdminOrManager && (
                  <TableCell>
                    {row.status !== 'selesai' && (
                      <Select
                        size="small"
                        value={row.status}
                        disabled={updatingId === row.id}
                        onChange={(e) => onUpdateStatus(row, e.target.value)}
                        sx={{ minWidth: 130 }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="selesai">Selesai</MenuItem>
                      </Select>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

TabMaintenance.propTypes = { cageId: PropTypes.number, isAdminOrManager: PropTypes.bool };
