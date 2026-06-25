import { useState } from 'react';
import { Alert, Box, Button, Chip, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { updateCage } from '../../service';
import PropTypes from 'prop-types';

const TYPE_OPTIONS = ['hotel', 'breeding', 'salon', 'general'];
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL'];
const typeLabel = { hotel: 'Hotel', breeding: 'Breeding', salon: 'Salon', general: 'General' };
const condLabel = { baik: 'Baik', perlu_perhatian: 'Perlu Perhatian', tidak_layak: 'Tidak Layak' };
const condColor = { baik: 'success', perlu_perhatian: 'warning', tidak_layak: 'error' };

export default function TabInfo({ cage, isAdminOrManager, onRefresh }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({});

  const openEdit = () => {
    setForm({
      id: cage.id,
      cageName: cage.cageName,
      type: cage.type,
      size: cage.size ?? '',
      status: String(cage.status),
      conditionStatus: cage.conditionStatus,
      capacity: cage.capacity,
      amount: cage.amount,
      notes: cage.notes ?? ''
    });
    setEditing(true);
  };

  const f = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async () => {
    setSubmitting(true);
    await updateCage(form)
      .then(() => {
        dispatch(snackbarSuccess('Kandang berhasil diupdate'));
        setEditing(false);
        onRefresh();
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  if (!cage) return null;

  return (
    <Stack spacing={3}>
      {/* Occupancy banner */}
      {cage.isOccupied && (
        <Alert severity="warning">
          Kandang sedang <strong>terisi</strong> oleh <strong>{cage.occupantPet}</strong>
          {cage.occupantCustomer && (
            <>
              {' '}
              — pemilik: <strong>{cage.occupantCustomer}</strong>
            </>
          )}
          {cage.occupantType && <> ({cage.occupantType})</>}
        </Alert>
      )}

      {!editing ? (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Informasi Kandang
            </Typography>
            {isAdminOrManager && (
              <Button startIcon={<EditOutlined />} variant="outlined" size="small" onClick={openEdit}>
                Edit
              </Button>
            )}
          </Stack>
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {[
              ['Nama Kandang', cage.cageName],
              ['Lokasi', cage.locationName],
              ['Tipe', typeLabel[cage.type] ?? cage.type],
              ['Ukuran', cage.size || '-'],
              ['Kapasitas', cage.capacity],
              ['Jumlah Unit', cage.amount],
              [
                'Status',
                <Chip
                  key="status"
                  size="small"
                  label={+cage.status === 1 ? 'Aktif' : 'Nonaktif'}
                  color={+cage.status === 1 ? 'success' : 'default'}
                />
              ],
              ['Kondisi', <Chip key="cond" size="small" label={condLabel[cage.conditionStatus]} color={condColor[cage.conditionStatus]} />],
              ['Catatan', cage.notes || '-']
            ].map(([label, val]) => (
              <Box key={label}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3 }}>
                  {val}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <Stack spacing={2.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            Edit Informasi Kandang
          </Typography>
          <Divider />

          <TextField
            label="Nama Kandang *"
            size="small"
            value={form.cageName}
            onChange={(e) => f('cageName', e.target.value)}
            inputProps={{ maxLength: 100 }}
          />

          <Stack direction="row" spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipe *</InputLabel>
              <Select label="Tipe *" value={form.type} onChange={(e) => f('type', e.target.value)}>
                {TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {typeLabel[t]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Ukuran</InputLabel>
              <Select label="Ukuran" value={form.size} onChange={(e) => f('size', e.target.value)}>
                <MenuItem value="">
                  <em>Tidak dipilih</em>
                </MenuItem>
                {SIZE_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status *</InputLabel>
              <Select label="Status *" value={form.status} onChange={(e) => f('status', e.target.value)}>
                <MenuItem value="1">Aktif</MenuItem>
                <MenuItem value="0">Nonaktif</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Kondisi</InputLabel>
              <Select label="Kondisi" value={form.conditionStatus} onChange={(e) => f('conditionStatus', e.target.value)}>
                <MenuItem value="baik">Baik</MenuItem>
                <MenuItem value="perlu_perhatian">Perlu Perhatian</MenuItem>
                <MenuItem value="tidak_layak">Tidak Layak</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Kapasitas *"
              size="small"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={form.capacity}
              onChange={(e) => f('capacity', e.target.value)}
            />
            <TextField
              label="Jumlah Unit *"
              size="small"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={form.amount}
              onChange={(e) => f('amount', e.target.value)}
            />
          </Stack>

          <TextField
            label="Catatan"
            size="small"
            multiline
            rows={2}
            inputProps={{ maxLength: 300 }}
            value={form.notes}
            onChange={(e) => f('notes', e.target.value)}
          />

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button variant="contained" onClick={onSubmit} disabled={submitting || !form.cageName}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

TabInfo.propTypes = {
  cage: PropTypes.object,
  isAdminOrManager: PropTypes.bool,
  onRefresh: PropTypes.func
};
