import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Grid, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { addBreedingPapanKerja, getBreedingPapanKerja, markBreedingPapanKerjaDone } from '../../service';

const STATUS_AKTIVITAS_OPTIONS = ['normal', 'perlu perhatian', 'darurat'];

const PapanKerjaHarianBreeding = ({ open, data, onClose }) => {
  const { transactionId } = data;
  const dispatch = useDispatch();

  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [markForm, setMarkForm] = useState({ id: null, statusAktivitas: 'normal', temuan: '', catatan: '' });
  const [newTask, setNewTask] = useState({ activity: '', scheduledDate: '', time: '' });
  const [addingTask, setAddingTask] = useState(false);

  const fetchData = async () => {
    try {
      const resp = await getBreedingPapanKerja(transactionId);
      setTasks(resp.data ?? []);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkDone = async (task) => {
    if (markForm.id !== task.id) {
      setMarkForm({ id: task.id, statusAktivitas: 'normal', temuan: '', catatan: '' });
      return;
    }
    setLoadingId(task.id);
    try {
      await markBreedingPapanKerjaDone(markForm);
      dispatch(snackbarSuccess('Aktivitas ditandai selesai.'));
      setMarkForm({ id: null, statusAktivitas: 'normal', temuan: '', catatan: '' });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.activity || !newTask.scheduledDate) {
      dispatch(snackbarError('Nama aktivitas dan tanggal wajib diisi.'));
      return;
    }
    setAddingTask(true);
    try {
      await addBreedingPapanKerja({ transactionId, ...newTask });
      dispatch(snackbarSuccess('Aktivitas berhasil ditambahkan.'));
      setNewTask({ activity: '', scheduledDate: '', time: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setAddingTask(false);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.isDone);
  const doneTasks = tasks.filter((t) => t.isDone);

  return (
    <ModalC
      title="Papan Kerja Harian — Proses Pacak"
      open={open}
      onCancel={() => onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="md"
    >
      <Stack spacing={2}>
        <Alert severity="info">
          {pendingTasks.length} aktivitas belum selesai &bull; {doneTasks.length} selesai
        </Alert>

        {/* ── Pending tasks ── */}
        {pendingTasks.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" py={1}>
            Tidak ada aktivitas yang pending.
          </Typography>
        )}

        {pendingTasks.map((task) => (
          <Box key={task.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
              <Stack spacing={0.5} flex={1}>
                <Typography variant="body2" fontWeight={600}>
                  {task.activity}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.scheduledDate} {task.time ? `| ${task.time}` : ''}
                </Typography>
              </Stack>
              <Tooltip title="Tandai Selesai">
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<RadioButtonUncheckedIcon />}
                  onClick={() => handleMarkDone(task)}
                >
                  Selesai
                </Button>
              </Tooltip>
            </Stack>

            {/* Expanded mark-done form */}
            {markForm.id === task.id && (
              <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight={600} display="block" mb={1}>
                  Laporan Aktivitas
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Status Aktivitas"
                      size="small"
                      fullWidth
                      value={markForm.statusAktivitas}
                      onChange={(e) => setMarkForm((f) => ({ ...f, statusAktivitas: e.target.value }))}
                    >
                      {STATUS_AKTIVITAS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Temuan"
                      size="small"
                      fullWidth
                      value={markForm.temuan}
                      onChange={(e) => setMarkForm((f) => ({ ...f, temuan: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Catatan"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={markForm.catatan}
                      onChange={(e) => setMarkForm((f) => ({ ...f, catatan: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handleMarkDone(task)}
                        disabled={loadingId === task.id}
                        startIcon={loadingId === task.id ? <CircularProgress size={14} /> : <CheckCircleIcon />}
                      >
                        Konfirmasi Selesai
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setMarkForm({ id: null, statusAktivitas: 'normal', temuan: '', catatan: '' })}
                      >
                        Batal
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        ))}

        {/* ── Done tasks (collapsed) ── */}
        {doneTasks.length > 0 && (
          <>
            <Divider />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Selesai ({doneTasks.length})
            </Typography>
            {doneTasks.map((task) => (
              <Box key={task.id} sx={{ p: 1.5, bgcolor: 'success.lighter', borderRadius: 1, opacity: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {task.activity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.scheduledDate} &bull; Selesai oleh: {task.completedByName ?? '-'}
                    </Typography>
                  </Box>
                  {task.statusAktivitas && (
                    <Chip
                      label={task.statusAktivitas}
                      size="small"
                      color={
                        task.statusAktivitas === 'darurat' ? 'error' : task.statusAktivitas === 'perlu perhatian' ? 'warning' : 'default'
                      }
                    />
                  )}
                </Stack>
              </Box>
            ))}
          </>
        )}

        {/* ── Add new task form ── */}
        <Divider />
        {showAddForm ? (
          <Box sx={{ p: 1.5, border: '1px dashed', borderColor: 'primary.main', borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={1.5}>
              Tambah Aktivitas Baru
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nama Aktivitas"
                  size="small"
                  fullWidth
                  value={newTask.activity}
                  onChange={(e) => setNewTask((f) => ({ ...f, activity: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Tanggal"
                  size="small"
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={newTask.scheduledDate}
                  onChange={(e) => setNewTask((f) => ({ ...f, scheduledDate: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Jam"
                  size="small"
                  fullWidth
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={newTask.time}
                  onChange={(e) => setNewTask((f) => ({ ...f, time: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddTask}
                    disabled={addingTask}
                    startIcon={addingTask ? <CircularProgress size={14} /> : <AddIcon />}
                  >
                    Tambah
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => setShowAddForm(false)}>
                    Batal
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setShowAddForm(true)}>
            Tambah Aktivitas
          </Button>
        )}
      </Stack>
    </ModalC>
  );
};

PapanKerjaHarianBreeding.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.shape({ transactionId: PropTypes.number }),
  onClose: PropTypes.func
};

export default PapanKerjaHarianBreeding;
