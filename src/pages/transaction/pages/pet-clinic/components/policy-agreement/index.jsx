import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DrawIcon from '@mui/icons-material/Draw';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getPoliciesForAgreementPetClinic, savePolicyAgreementPetClinic } from '../../service';

// ─── Simple Canvas Signature Pad ────────────────────────────────────────────
const SignaturePad = ({ onSignatureChange, cleared }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);

  useEffect(() => {
    if (cleared) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSignatureChange('');
      }
    }
  }, [cleared, onSignatureChange]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(lastPos.current.x, lastPos.current.y, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    onSignatureChange(canvas.toDataURL('image/png'));
  };

  return (
    <Box
      sx={{
        border: '1.5px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: '#fafafa',
        position: 'relative',
        cursor: 'crosshair',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        style={{ display: 'block', width: '100%', height: 160 }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}
      >
        Tanda tangan di sini
      </Typography>
    </Box>
  );
};

SignaturePad.propTypes = {
  onSignatureChange: PropTypes.func.isRequired,
  cleared: PropTypes.bool
};

// ─── Main Component ──────────────────────────────────────────────────────────
const PolicyAgreementPetClinic = (props) => {
  const { data } = props;
  const dispatch = useDispatch();

  const [allPolicies, setAllPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [cleared, setCleared] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPoliciesForAgreementPetClinic()
      .then((resp) => {
        if (resp?.data) setAllPolicies(resp.data);
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSignature = () => {
    setCleared(true);
    setSignatureData('');
    setTimeout(() => setCleared(false), 50);
  };

  const isValid = selectedPolicies.length > 0 && signerName.trim() && signatureData;

  const onSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const resp = await savePolicyAgreementPetClinic({
        transactionId: data.transactionId,
        signerName: signerName.trim(),
        signatureData,
        policies: selectedPolicies.map((p) => ({ id: p.id, title: p.title, version: p.version }))
      });
      if (resp?.status === 201 || resp?.status === 200) {
        dispatch(snackbarSuccess('Policy disetujui — pet resmi dalam perawatan'));
        props.onClose(true);
      }
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalC
      title={<FormattedMessage id="policy-agreement-inpatient-owner" />}
      open={props.open}
      onOk={onSubmit}
      okText={submitting ? 'Menyimpan...' : 'Simpan Persetujuan & Mulai Perawatan'}
      disabledOk={!isValid || submitting}
      onCancel={() => props.onClose(false)}
      fullWidth
      maxWidth="md"
    >
      <Stack spacing={3}>
        {/* Info */}
        <Alert severity="info" icon={<DrawIcon />}>
          Pilih policy yang berlaku, minta owner membaca isinya, kemudian owner menandatangani di kolom tanda tangan di bawah. Setelah
          disimpan, status akan berubah menjadi <strong>Dalam Perawatan</strong>.
        </Alert>

        {/* Step 1: Pilih policy */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            1. Pilih Policy yang Berlaku
          </Typography>
          <Autocomplete
            multiple
            options={allPolicies}
            getOptionLabel={(opt) => `${opt.title} (v${opt.version})`}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={selectedPolicies}
            onChange={(_, val) => setSelectedPolicies(val)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  key={option.id}
                  label={`${option.title} v${option.version}`}
                  size="small"
                  color="primary"
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Pilih policy..."
                error={selectedPolicies.length === 0}
                helperText={selectedPolicies.length === 0 ? 'Minimal satu policy harus dipilih' : ''}
              />
            )}
          />
        </Box>

        {/* Step 2: Tampilkan isi policy */}
        {selectedPolicies.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              2. Isi Policy (Dibaca oleh Owner)
            </Typography>
            {selectedPolicies.map((policy) => (
              <Accordion
                key={policy.id}
                expanded={expanded === policy.id}
                onChange={() => setExpanded(expanded === policy.id ? false : policy.id)}
                sx={{ mb: 1, border: '1px solid', borderColor: 'divider' }}
                disableGutters
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">{policy.title}</Typography>
                    <Chip label={`v${policy.version}`} size="small" variant="outlined" />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      maxHeight: 320,
                      overflowY: 'auto',
                      p: 1.5,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      fontSize: '13px',
                      lineHeight: 1.7,
                      '& *': { maxWidth: '100%' }
                    }}
                    dangerouslySetInnerHTML={{ __html: policy.raw_content }}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        <Divider />

        {/* Step 3: Nama + tanda tangan */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>
            3. Identitas & Tanda Tangan Owner
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nama Lengkap Owner"
                placeholder="Ketik nama sesuai identitas..."
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                size="small"
                required
                error={!signerName.trim()}
                helperText={!signerName.trim() ? 'Wajib diisi' : ''}
              />
            </Grid>
          </Grid>

          <Box mt={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Typography variant="body2" color="text.secondary">
                Tanda Tangan
                {signatureData && (
                  <Chip icon={<CheckCircleIcon />} label="Sudah ditandatangani" size="small" color="success" sx={{ ml: 1 }} />
                )}
              </Typography>
              <Button size="small" variant="outlined" color="error" onClick={clearSignature} disabled={!signatureData}>
                Hapus Tanda Tangan
              </Button>
            </Stack>
            <SignaturePad onSignatureChange={setSignatureData} cleared={cleared} />
          </Box>
        </Box>
      </Stack>
    </ModalC>
  );
};

PolicyAgreementPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default PolicyAgreementPetClinic;
