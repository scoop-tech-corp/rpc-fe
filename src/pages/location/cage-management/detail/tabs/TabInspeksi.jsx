import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputLabel
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getInspections, storeInspection } from '../../service';
import PropTypes from 'prop-types';

const COND_OPTIONS = ['baik', 'perlu_perhatian', 'tidak_layak'];
const condLabel = { baik: 'Baik', perlu_perhatian: 'Perlu Perhatian', tidak_layak: 'Tidak Layak' };
const condColor = { baik: 'success', perlu_perhatian: 'warning', tidak_layak: 'error' };

const defaultForm = {
  conditionResult: 'baik',
  findings: '',
  recommendation: '',
  createMaintenance: false,
  maintenanceTitle: ''
};

export default function TabInspeksi({ cageId, canInspect }) {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(() => {
    getInspections({ cageId, dateFrom, dateTo, rowPerPage: 20, goToPage: 1 })
      .then((res) => setRows(res?.data?.data ?? []))
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  }, [cageId, dateFrom, dateTo, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const f = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async () => {
    setSubmitting(true);
    await storeInspection({
      cageId,
      conditionResult: form.conditionResult,
      findings: form.findings,
      recommendation: form.recommendation,
      createMaintenance: form.createMaintenance ? 1 : 0,
      maintenanceTitle: form.maintenanceTitle
    })
      .then(() => {
        dispatch(snackbarSuccess('Inspeksi berhasil disimpan'));
        setForm(defaultForm);
        setShowForm(false);
        load();
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  return (
    <Stack spacing={3}>
      {/* Form Inspeksi */}
      {canInspect && (
        <Box>
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Tutup Form' : 'Tambah Inspeksi'}
          </Button>

          {showForm && (
            <Stack spacing={2} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2">Form Inspeksi Kandang</Typography>

              <Stack spacing={1}>
                <InputLabel required>Hasil Kondisi</InputLabel>
                <Select size="small" value={form.conditionResult} onChange={(e) => f('conditionResult', e.target.value)}>
                  {COND_OPTIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      <Chip size="small" label={condLabel[o]} color={condColor[o]} sx={{ mr: 1 }} />
                      {condLabel[o]}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <TextField
                multiline
                rows={3}
                size="small"
                label="Temuan"
                value={form.findings}
                onChange={(e) => f('findings', e.target.value)}
              />

              <TextField
                multiline
                rows={2}
                size="small"
                label="Rekomendasi Tindakan"
                value={form.recommendation}
                onChange={(e) => f('recommendation', e.target.value)}
              />

              <FormControlLabel
                control={<Switch checked={form.createMaintenance} onChange={(e) => f('createMaintenance', e.target.checked)} />}
                label="Buat Maintenance Request otomatis"
              />

              {form.createMaintenance && (
                <TextField
                  size="small"
                  label="Judul Maintenance"
                  required
                  value={form.maintenanceTitle}
                  onChange={(e) => f('maintenanceTitle', e.target.value)}
                />
              )}

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setShowForm(false)}>
                  Batal
                </Button>
                <Button variant="contained" onClick={onSubmit} disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Inspeksi'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      )}

      <Divider />

      {/* Filter tanggal */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="subtitle2">Riwayat Inspeksi</Typography>
        <TextField
          type="date"
          size="small"
          label="Dari"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          sx={{ width: 160 }}
        />
        <TextField
          type="date"
          size="small"
          label="Sampai"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          sx={{ width: 160 }}
        />
        <Button size="small" variant="outlined" onClick={load}>
          Cari
        </Button>
      </Stack>

      {/* Tabel riwayat */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tanggal</TableCell>
              <TableCell>Hasil Kondisi</TableCell>
              <TableCell>Temuan</TableCell>
              <TableCell>Rekomendasi</TableCell>
              <TableCell>Diperiksa Oleh</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" variant="body2">
                    Belum ada riwayat inspeksi
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.inspectedAt}</TableCell>
                  <TableCell>
                    <Chip size="small" label={condLabel[row.conditionResult]} color={condColor[row.conditionResult]} />
                  </TableCell>
                  <TableCell>{row.findings || '-'}</TableCell>
                  <TableCell>{row.recommendation || '-'}</TableCell>
                  <TableCell>{row.inspectedBy}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

TabInspeksi.propTypes = { cageId: PropTypes.number, canInspect: PropTypes.bool };
