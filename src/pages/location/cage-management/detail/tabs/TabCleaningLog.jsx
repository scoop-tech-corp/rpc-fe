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
import { getCleaningLogs, storeCleaningLog } from '../../service';
import PropTypes from 'prop-types';

const CLEAN_OPTIONS = ['bersih', 'perlu_pembersihan_ulang', 'dilewati'];
const cleanLabel    = { bersih: 'Bersih', perlu_pembersihan_ulang: 'Perlu Pembersihan Ulang', dilewati: 'Dilewati' };
const cleanColor    = { bersih: 'success', perlu_pembersihan_ulang: 'warning', dilewati: 'default' };

const defaultForm = { cleaningStatus: 'bersih', catatan: '' };

export default function TabCleaningLog({ cageId, canLog }) {
  const dispatch = useDispatch();
  const [rows, setRows]         = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  const load = () => {
    getCleaningLogs({ cageId, dateFrom, dateTo, rowPerPage: 20, goToPage: 1 })
      .then((res) => setRows(res?.data?.data ?? []))
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => { load(); }, [cageId]);

  const f = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async () => {
    setSubmitting(true);
    await storeCleaningLog({ cageId, ...form })
      .then(() => {
        dispatch(snackbarSuccess('Cleaning log berhasil disimpan'));
        setForm(defaultForm);
        setShowForm(false);
        load();
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  return (
    <Stack spacing={3}>
      {/* Form log kebersihan */}
      {canLog && (
        <Box>
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Tutup Form' : 'Catat Kebersihan'}
          </Button>

          {showForm && (
            <Stack spacing={2} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2">Log Kebersihan Kandang</Typography>

              <Stack spacing={1}>
                <InputLabel required>Status Kebersihan</InputLabel>
                <Select size="small" value={form.cleaningStatus}
                  onChange={(e) => f('cleaningStatus', e.target.value)}>
                  {CLEAN_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      <Chip size="small" label={cleanLabel[o]} color={cleanColor[o]} sx={{ mr: 1 }} />
                      {cleanLabel[o]}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <TextField multiline rows={2} size="small" label="Catatan"
                value={form.catatan} onChange={(e) => f('catatan', e.target.value)} />

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setShowForm(false)}>Batal</Button>
                <Button variant="contained" onClick={onSubmit} disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Log'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      )}

      <Divider />

      {/* Filter tanggal */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="subtitle2">Riwayat Log Kebersihan</Typography>
        <TextField type="date" size="small" label="Dari" InputLabelProps={{ shrink: true }}
          value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} sx={{ width: 160 }} />
        <TextField type="date" size="small" label="Sampai" InputLabelProps={{ shrink: true }}
          value={dateTo} onChange={(e) => setDateTo(e.target.value)} sx={{ width: 160 }} />
        <Button size="small" variant="outlined" onClick={load}>Cari</Button>
      </Stack>

      {/* Tabel */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tanggal</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Catatan</TableCell>
              <TableCell>Dicatat Oleh</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" variant="body2">Belum ada log kebersihan</Typography>
                </TableCell>
              </TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cleanedAt}</TableCell>
                <TableCell>
                  <Chip size="small" label={cleanLabel[row.cleaningStatus]} color={cleanColor[row.cleaningStatus]} />
                </TableCell>
                <TableCell>{row.catatan || '-'}</TableCell>
                <TableCell>{row.cleanedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

TabCleaningLog.propTypes = { cageId: PropTypes.number, canLog: PropTypes.bool };
