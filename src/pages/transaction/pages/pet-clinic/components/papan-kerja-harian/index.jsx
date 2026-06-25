import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ImageIcon from '@mui/icons-material/Image';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import { JOB_DOKTER, JOB_PARAMEDIS, JOB_VETNURSE, isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getPapanKerjaHarianPetClinic, markPapanKerjaHarianPetClinicDone } from '../../service.jsx';
import MarkDoneDialog from '../mark-done-dialog/index.jsx';

// Hari ini dalam format DD/MM/YYYY (sama seperti scheduledDate dari backend)
const todayDisplayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const KONDISI_LABEL = {
  baik: '✅ Baik / Stabil',
  perlu_perhatian: '⚠️ Perlu Perhatian',
  kritis: '🔴 Kritis'
};
const NAFSU_LABEL = {
  normal: 'Normal',
  sedikit: 'Sedikit / Kurang',
  tidak_makan: 'Tidak Mau Makan'
};
const FESES_LABEL = {
  normal: 'Normal',
  diare: 'Diare / Cair',
  konstipasi: 'Konstipasi',
  tidak_bab: 'Tidak BAB'
};
const URIN_LABEL = {
  normal: 'Normal',
  tidak_bak: 'Tidak BAK'
};

const ClinicalDetailRow = ({ row, colSpan }) => {
  const [open, setOpen] = useState(false);
  const hasClinical = row.isDone && (row.kondisiUmum || row.nafsuMakan || row.outputFeses || row.outputUrin || row.catatan || row.fotoUrl);
  if (!hasClinical) return null;

  return (
    <>
      <TableRow sx={{ bgcolor: 'grey.50' }}>
        <TableCell colSpan={colSpan} sx={{ py: 0.5, pl: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Log Klinis Vetnurse
            </Typography>
            <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0.25 }}>
              {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ pt: 0, pb: open ? 1.5 : 0, px: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 4, py: 1.5, bgcolor: '#f9fbe7', borderBottom: '1px solid #e0e0e0' }}>
              <Grid container spacing={2}>
                {row.kondisiUmum && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Kondisi Umum
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {KONDISI_LABEL[row.kondisiUmum] ?? row.kondisiUmum}
                    </Typography>
                  </Grid>
                )}
                {row.nafsuMakan && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Nafsu Makan
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {NAFSU_LABEL[row.nafsuMakan] ?? row.nafsuMakan}
                    </Typography>
                  </Grid>
                )}
                {row.outputFeses && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Output BAB
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {FESES_LABEL[row.outputFeses] ?? row.outputFeses}
                    </Typography>
                  </Grid>
                )}
                {row.outputUrin && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Output BAK
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {URIN_LABEL[row.outputUrin] ?? row.outputUrin}
                    </Typography>
                  </Grid>
                )}
                {row.obatDiberikan !== undefined && row.obatDiberikan !== null && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Obat Diberikan
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {row.obatDiberikan ? '✅ Ya' : 'Tidak'}
                    </Typography>
                  </Grid>
                )}
                {row.catatanObat && (
                  <Grid item xs={12} sm={9}>
                    <Typography variant="caption" color="text.secondary">
                      Detail Obat / Tindakan
                    </Typography>
                    <Typography variant="body2">{row.catatanObat}</Typography>
                  </Grid>
                )}
                {row.catatan && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Catatan Klinis
                    </Typography>
                    <Typography variant="body2">{row.catatan}</Typography>
                  </Grid>
                )}
                {row.fotoUrl && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Foto Bukti
                    </Typography>
                    <Box mt={0.5}>
                      <Tooltip title={<FormattedMessage id="open-photo" />}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ImageIcon />}
                          onClick={() => window.open(row.fotoUrl, '_blank')}
                        >
                          Lihat Foto
                        </Button>
                      </Tooltip>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

ClinicalDetailRow.propTypes = {
  row: PropTypes.object,
  colSpan: PropTypes.number
};

// ─────────────────────────────────────────────────────────────────────
const PapanKerjaHarianPetClinic = (props) => {
  const { data } = props;
  const { user } = useAuth();
  const canMarkDone = isAdminOrManager(user?.role) || [JOB_DOKTER, JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName);

  const [rows, setRows] = useState([]);
  const [viewMode, setViewMode] = useState('today');
  const [markDoneOpen, setMarkDoneOpen] = useState(false);
  const [markingRow, setMarkingRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const today = todayDisplayStr();

  const fetchData = async () => {
    await getPapanKerjaHarianPetClinic(data.transactionId)
      .then((resp) => {
        if (resp?.data) setRows(resp.data);
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkDoneClick = (row) => {
    setMarkingRow(row);
    setMarkDoneOpen(true);
  };

  const handleMarkDoneSubmit = async (payload) => {
    setSubmitting(true);
    await markPapanKerjaHarianPetClinicDone(payload)
      .then((resp) => {
        if (resp?.status === 200) {
          dispatch(snackbarSuccess('Log perawatan berhasil disimpan'));
          setMarkDoneOpen(false);
          setMarkingRow(null);
          fetchData();
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  const handleMarkDoneClose = () => {
    setMarkDoneOpen(false);
    setMarkingRow(null);
  };

  const filtered = useMemo(() => {
    if (viewMode === 'today') return rows.filter((r) => r.scheduledDate === today);
    return rows;
  }, [rows, viewMode, today]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const key = r.scheduledDate || 'Tanpa Tanggal';
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.entries(map);
  }, [filtered]);

  const allDates = [...new Set(rows.map((r) => r.scheduledDate).filter(Boolean))];
  const hasTodayData = rows.some((r) => r.scheduledDate === today);

  // Hitung ringkasan status
  const summary = useMemo(
    () => ({
      total: filtered.length,
      done: filtered.filter((r) => r.isDone).length,
      pending: filtered.filter((r) => !r.isDone).length
    }),
    [filtered]
  );

  const colCount = canMarkDone ? 7 : 6;

  return (
    <>
      <ModalC
        title={<FormattedMessage id="papan-kerja-harian-rawat-inap" />}
        open={props.open}
        onCancel={() => props.onClose(false)}
        isModalAction={false}
        fullWidth
        maxWidth="xl"
      >
        {/* Header: filter + ringkasan */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" mb={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <FilterListIcon fontSize="small" color="action" />
            <ToggleButtonGroup
              size="small"
              exclusive
              value={viewMode}
              onChange={(_, val) => {
                if (val) setViewMode(val);
              }}
            >
              <ToggleButton value="today">Hari Ini ({today})</ToggleButton>
              <ToggleButton value="all">Semua Hari ({allDates.length} hari)</ToggleButton>
            </ToggleButtonGroup>
            {viewMode === 'today' && !hasTodayData && (
              <Typography variant="caption" color="text.secondary">
                Tidak ada jadwal hari ini
              </Typography>
            )}
          </Stack>

          {filtered.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Chip size="small" label={`Total: ${summary.total}`} variant="outlined" />
              <Chip size="small" label={`Selesai: ${summary.done}`} color="success" variant="outlined" />
              <Chip size="small" label={`Belum: ${summary.pending}`} color="default" variant="outlined" />
            </Stack>
          )}
        </Stack>

        {grouped.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Tidak ada data untuk ditampilkan
            </Typography>
          </Box>
        ) : (
          grouped.map(([date, dateRows]) => {
            const doneDateCount = dateRows.filter((r) => r.isDone).length;
            return (
              <Box key={date} mb={3}>
                {/* Date header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 2, py: 1, bgcolor: 'primary.lighter', borderRadius: 1, mb: 1 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                    📅 {date === 'Tanpa Tanggal' ? date : `Tanggal ${date}`}
                  </Typography>
                  <Typography variant="caption" color="primary.dark">
                    {doneDateCount}/{dateRows.length} aktivitas selesai
                  </Typography>
                </Stack>

                <TableContainer>
                  <Table size="small" sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold', whiteSpace: 'nowrap', bgcolor: 'grey.50' } }}>
                        <TableCell>Jam</TableCell>
                        <TableCell>🐾 Pet</TableCell>
                        <TableCell>Aktivitas</TableCell>
                        <TableCell>Instruksi / Catatan</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell>Dikerjakan Oleh</TableCell>
                        {canMarkDone && <TableCell align="center">Aksi</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dateRows.map((row) => (
                        <>
                          <TableRow key={row.id} hover sx={{ opacity: row.isDone ? 0.85 : 1 }}>
                            {/* Jam */}
                            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'medium', color: 'text.secondary' }}>
                              {row.time && row.time !== '-' ? row.time : '—'}
                            </TableCell>

                            {/* Pet info */}
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {row.petName || '-'}
                              </Typography>
                              {row.petBreed && (
                                <Typography variant="caption" color="text.secondary">
                                  {row.petBreed}
                                </Typography>
                              )}
                            </TableCell>

                            {/* Aktivitas */}
                            <TableCell>
                              <Typography variant="body2">{row.activity || '-'}</Typography>
                            </TableCell>

                            {/* Instruksi */}
                            <TableCell sx={{ maxWidth: 260 }}>
                              {Array.isArray(row.instructions) && row.instructions.length > 0 ? (
                                row.instructions.map((ins, i) => (
                                  <Typography key={i} variant="caption" display="block" color="text.secondary">
                                    • {ins}
                                  </Typography>
                                ))
                              ) : (
                                <Typography variant="caption" color="text.disabled">
                                  —
                                </Typography>
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell align="center">
                              {row.isDone ? (
                                <Chip
                                  label={row.statusAktivitas === 'dilewati' ? '⏭️ Dilewati' : '✅ Selesai'}
                                  size="small"
                                  color={row.statusAktivitas === 'dilewati' ? 'warning' : 'success'}
                                />
                              ) : (
                                <Chip label="Belum Dikerjakan" size="small" color="default" />
                              )}
                            </TableCell>

                            {/* Dikerjakan oleh */}
                            <TableCell>
                              {row.isDone ? (
                                <Stack spacing={0}>
                                  <Typography variant="body2">{row.completedBy || '-'}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {row.completedAt || ''}
                                  </Typography>
                                </Stack>
                              ) : (
                                <Typography variant="caption" color="text.disabled">
                                  —
                                </Typography>
                              )}
                            </TableCell>

                            {/* Aksi */}
                            {canMarkDone && (
                              <TableCell align="center">
                                {!row.isDone ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                                    onClick={() => handleMarkDoneClick(row)}
                                  >
                                    Kerjakan
                                  </Button>
                                ) : (
                                  <Typography variant="caption" color="text.disabled">
                                    —
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                          </TableRow>

                          {/* Expandable clinical detail bawah row */}
                          <ClinicalDetailRow key={`${row.id}-detail`} row={row} colSpan={colCount} />
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ mt: 1 }} />
              </Box>
            );
          })
        )}
      </ModalC>

      {/* MarkDone Dialog */}
      <MarkDoneDialog
        open={markDoneOpen}
        row={markingRow}
        onSubmit={handleMarkDoneSubmit}
        onClose={handleMarkDoneClose}
        submitting={submitting}
      />
    </>
  );
};

PapanKerjaHarianPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default PapanKerjaHarianPetClinic;
