import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slide,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const KONDISI_UMUM_OPTIONS = [
  { value: 'baik', label: '✅ Baik / Stabil' },
  { value: 'perlu_perhatian', label: '⚠️ Perlu Perhatian' },
  { value: 'kritis', label: '🔴 Kritis' }
];

const NAFSU_MAKAN_OPTIONS = [
  { value: 'normal', label: 'Normal (Habis / Mau Makan)' },
  { value: 'sedikit', label: 'Sedikit / Kurang Nafsu' },
  { value: 'tidak_makan', label: 'Tidak Mau Makan' }
];

const OUTPUT_FESES_OPTIONS = [
  { value: 'normal', label: 'Normal (Berbentuk/Padat)' },
  { value: 'diare', label: 'Diare / Cair' },
  { value: 'konstipasi', label: 'Konstipasi / Keras' },
  { value: 'tidak_bab', label: 'Tidak BAB' }
];

const OUTPUT_URIN_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'tidak_bak', label: 'Tidak BAK' }
];

const DEFAULT_FORM = {
  statusAktivitas: 'terlaksana',
  kondisiUmum: 'baik',
  nafsuMakan: 'normal',
  outputFeses: 'normal',
  outputUrin: 'normal',
  obatDiberikan: false,
  catatanObat: '',
  catatan: '',
  foto: null
};

const MarkDoneDialog = ({ open, row, onSubmit, onClose, submitting }) => {
  const [formValue, setFormValue] = useState(DEFAULT_FORM);

  // Reset form tiap kali dialog dibuka untuk row baru
  useEffect(() => {
    if (open) setFormValue(DEFAULT_FORM);
  }, [open, row?.id]);

  const onChangeFoto = (e) => {
    const file = e.target.files?.[0] || null;
    setFormValue((prev) => ({ ...prev, foto: file }));
  };

  const handleSubmit = () => {
    onSubmit({ ...formValue, id: row?.id });
  };

  const isSkipped = formValue.statusAktivitas === 'dilewati';

  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography fontWeight="bold" fontSize={16}>
          Log Perawatan Harian Rawat Inap
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          🐾 {row?.petName} &nbsp;|&nbsp; Aktivitas: {row?.activity}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          {/* 1. Status aktivitas */}
          <FormControl>
            <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>1. Status Aktivitas</FormLabel>
            <RadioGroup
              row
              value={formValue.statusAktivitas}
              onChange={(e) => setFormValue((prev) => ({ ...prev, statusAktivitas: e.target.value }))}
            >
              <FormControlLabel value="terlaksana" control={<Radio color="success" />} label="✅ Terlaksana" />
              <FormControlLabel value="dilewati" control={<Radio color="warning" />} label="⏭️ Dilewati (Skip)" />
            </RadioGroup>
          </FormControl>

          {!isSkipped && (
            <>
              <Divider />

              {/* 2. Kondisi umum */}
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>2. Kondisi Umum Hewan</FormLabel>
                <Select
                  size="small"
                  value={formValue.kondisiUmum}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, kondisiUmum: e.target.value }))}
                >
                  {KONDISI_UMUM_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 3. Nafsu makan */}
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>3. Nafsu Makan</FormLabel>
                <Select
                  size="small"
                  value={formValue.nafsuMakan}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, nafsuMakan: e.target.value }))}
                >
                  {NAFSU_MAKAN_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 4. Output eliminasi */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>4a. Output BAB (Feses)</FormLabel>
                  <Select
                    size="small"
                    value={formValue.outputFeses}
                    onChange={(e) => setFormValue((prev) => ({ ...prev, outputFeses: e.target.value }))}
                  >
                    {OUTPUT_FESES_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>4b. Output BAK (Urin)</FormLabel>
                  <Select
                    size="small"
                    value={formValue.outputUrin}
                    onChange={(e) => setFormValue((prev) => ({ ...prev, outputUrin: e.target.value }))}
                  >
                    {OUTPUT_URIN_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* 5. Obat diberikan */}
              <FormControl>
                <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>5. Obat / Tindakan Medis</FormLabel>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Switch
                    checked={formValue.obatDiberikan}
                    onChange={(e) => setFormValue((prev) => ({ ...prev, obatDiberikan: e.target.checked }))}
                    color="success"
                  />
                  <Typography variant="body2">
                    {formValue.obatDiberikan ? '✅ Obat / tindakan telah diberikan' : 'Belum diberikan'}
                  </Typography>
                </Stack>
                {formValue.obatDiberikan && (
                  <TextField
                    size="small"
                    placeholder="Detail obat / tindakan yang diberikan..."
                    value={formValue.catatanObat}
                    onChange={(e) => setFormValue((prev) => ({ ...prev, catatanObat: e.target.value }))}
                    sx={{ mt: 1 }}
                    fullWidth
                  />
                )}
              </FormControl>

              {/* 6. Catatan klinis */}
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>6. Catatan Klinis / Perilaku</FormLabel>
                <TextField
                  multiline
                  rows={3}
                  size="small"
                  value={formValue.catatan}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, catatan: e.target.value }))}
                  placeholder="Catatan kondisi, perilaku, atau hal penting lainnya..."
                />
              </FormControl>

              {/* 7. Foto bukti */}
              <FormControl>
                <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>7. Foto Bukti Perawatan (Opsional)</FormLabel>
                <Button variant="outlined" component="label" size="small" sx={{ width: 'fit-content' }}>
                  {formValue.foto ? `📷 ${formValue.foto.name}` : '📷 Upload Foto'}
                  <input hidden accept="image/*" type="file" onChange={onChangeFoto} />
                </Button>
              </FormControl>
            </>
          )}

          {isSkipped && (
            <FormControl fullWidth>
              <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>Alasan Dilewati</FormLabel>
              <TextField
                multiline
                rows={2}
                size="small"
                value={formValue.catatan}
                onChange={(e) => setFormValue((prev) => ({ ...prev, catatan: e.target.value }))}
                placeholder="Tuliskan alasan aktivitas dilewati..."
              />
            </FormControl>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="error" onClick={onClose} disabled={submitting}>
          Batal
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {submitting ? 'Menyimpan...' : 'Simpan Log Perawatan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MarkDoneDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  submitting: PropTypes.bool
};

export default MarkDoneDialog;
