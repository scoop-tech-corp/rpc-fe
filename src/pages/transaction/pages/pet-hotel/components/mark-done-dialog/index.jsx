import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slide,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const KONDISI_FESES_OPTIONS = [
  { value: 'normal', label: 'Normal (Berbentuk/Padat)' },
  { value: 'lembek', label: 'Lembek' },
  { value: 'cair', label: 'Cair/Diare' },
  { value: 'konstipasi', label: 'Konstipasi/Keras' },
  { value: 'ada_darah', label: 'Ada Darah' }
];

const TEMUAN_OPTIONS = [
  { value: 'pipis', label: 'Ada Pipis (Urin)' },
  { value: 'pup', label: 'Ada Pup (Feses)' },
  { value: 'bersih', label: 'Kotak Pasir Bersih/Kosong' }
];

const MarkDoneDialog = ({ open, row, onSubmit, onClose }) => {
  const [formValue, setFormValue] = useState({
    statusAktivitas: 'berhasil',
    temuan: [],
    kondisiFeses: 'normal',
    catatan: '',
    foto: null
  });

  const onChangeTemuan = (value) => {
    setFormValue((prev) => {
      const exists = prev.temuan.includes(value);
      return {
        ...prev,
        temuan: exists ? prev.temuan.filter((t) => t !== value) : [...prev.temuan, value]
      };
    });
  };

  const onChangeFoto = (e) => {
    const file = e.target.files?.[0] || null;
    setFormValue((prev) => ({ ...prev, foto: file }));
  };

  const handleSubmit = () => {
    onSubmit({ ...formValue, id: row?.id });
  };

  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography fontWeight="bold">
          Log Perawatan Kucing: {row?.cageNo} ({row?.petName})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tugas: {row?.activity}
        </Typography>
      </DialogTitle>
      <DialogContent dividers={false}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl>
            <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary' }}>1. Status Aktivitas</FormLabel>
            <RadioGroup
              value={formValue.statusAktivitas}
              onChange={(e) => setFormValue((prev) => ({ ...prev, statusAktivitas: e.target.value }))}
            >
              <FormControlLabel value="berhasil" control={<Radio />} label="Berhasil Dibersihkan" />
              <FormControlLabel value="dilewati" control={<Radio />} label="Dilewati (Skipped)" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary' }}>2. Temuan di Kotak Pasir (Wajib Centang)</FormLabel>
            <FormGroup>
              {TEMUAN_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  control={<Checkbox checked={formValue.temuan.includes(opt.value)} onChange={() => onChangeTemuan(opt.value)} />}
                  label={opt.label}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>3. Kondisi Feses Kucing</FormLabel>
            <Select
              value={formValue.kondisiFeses}
              onChange={(e) => setFormValue((prev) => ({ ...prev, kondisiFeses: e.target.value }))}
              size="small"
            >
              {KONDISI_FESES_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>4. Catatan Perilaku / Nafsu Makan</FormLabel>
            <TextField
              multiline
              rows={3}
              value={formValue.catatan}
              onChange={(e) => setFormValue((prev) => ({ ...prev, catatan: e.target.value }))}
              placeholder="Catatan kondisi dan perilaku hewan..."
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>5. Ambil Foto Bukti (Opsional)</FormLabel>
            <Button variant="outlined" component="label" size="small" sx={{ width: 'fit-content' }}>
              {formValue.foto ? formValue.foto.name : 'Ambil Kamera / Upload Foto'}
              <input hidden accept="image/*" type="file" onChange={onChangeFoto} />
            </Button>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Batal
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Simpan Data ke Sistem
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MarkDoneDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func
};

export default MarkDoneDialog;
