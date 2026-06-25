import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getPoliciesForBreeding, savePolicyAgreementBreeding } from '../../service';

// ─── Simple inline signature canvas ──────────────────────────────────────────
const SignatureCanvas = ({ onSignature }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const startDraw = (e) => {
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    isDrawing.current = false;
    const data = canvasRef.current.toDataURL('image/png');
    onSignature(data);
  };

  const clear = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onSignature('');
  };

  return (
    <Box>
      <Box
        sx={{ border: '1px dashed #ccc', borderRadius: 1, background: '#fafafa', display: 'inline-block', cursor: 'crosshair' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      >
        <canvas ref={canvasRef} width={340} height={120} />
      </Box>
      <Box mt={0.5}>
        <Button size="small" variant="outlined" color="inherit" onClick={clear}>
          Hapus Tanda Tangan
        </Button>
      </Box>
    </Box>
  );
};

SignatureCanvas.propTypes = { onSignature: PropTypes.func };

// ─── Main Component ───────────────────────────────────────────────────────────
const PolicyAgreementBreeding = ({ open, data, onClose }) => {
  const { transactionId } = data;
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState({});
  const [signerName, setSignerName] = useState('');
  const [signatureData, setSignatureData] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await getPoliciesForBreeding();
        const list = resp.data ?? [];
        setPolicies(list);
        // default: semua dipilih
        const init = {};
        list.forEach((p) => (init[p.id] = true));
        setSelected(init);
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async () => {
    if (!signerName.trim()) {
      dispatch(snackbarError('Nama penanda tangan wajib diisi.'));
      return;
    }
    if (!signatureData) {
      dispatch(snackbarError('Tanda tangan wajib dibuat.'));
      return;
    }
    const chosenPolicies = policies.filter((p) => selected[p.id]);
    if (chosenPolicies.length === 0) {
      dispatch(snackbarError('Minimal satu policy harus dipilih.'));
      return;
    }

    setLoading(true);
    try {
      await savePolicyAgreementBreeding({
        transactionId,
        signerName,
        signatureData,
        policies: chosenPolicies.map(({ id, title, version }) => ({ id, title, version }))
      });
      dispatch(snackbarSuccess('Policy agreement berhasil disimpan — proses pacak dimulai!'));
      onClose(true);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalC
      title="Persetujuan Policy Breeding"
      open={open}
      onOk={handleSubmit}
      onCancel={() => onClose(false)}
      okText={loading ? <CircularProgress size={18} /> : 'Simpan & Mulai Proses Pacak'}
      cancelText="Batal"
      fullWidth
      maxWidth="sm"
    >
      <Stack spacing={2}>
        <Alert severity="info" icon={<CheckCircleOutlineIcon />}>
          Owner harus menyetujui policy berikut sebelum proses breeding dimulai.
        </Alert>

        {policies.length > 0 ? (
          <FormGroup>
            {policies.map((p) => (
              <FormControlLabel
                key={p.id}
                control={<Checkbox checked={!!selected[p.id]} onChange={() => handleToggle(p.id)} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {p.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Versi: {p.version}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        ) : (
          <Typography color="text.secondary" variant="body2">
            Tidak ada policy aktif. Lanjutkan tanpa policy.
          </Typography>
        )}

        <Divider />

        <TextField
          label="Nama Penanda Tangan (Owner)"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          fullWidth
          required
          size="small"
        />

        <Box>
          <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
            Tanda Tangan Owner *
          </Typography>
          <SignatureCanvas onSignature={setSignatureData} />
        </Box>
      </Stack>
    </ModalC>
  );
};

PolicyAgreementBreeding.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.shape({ transactionId: PropTypes.number }),
  onClose: PropTypes.func
};

export default PolicyAgreementBreeding;
