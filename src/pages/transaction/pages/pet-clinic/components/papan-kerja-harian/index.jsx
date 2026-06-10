import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import { JOB_DOKTER, JOB_PARAMEDIS, JOB_VETNURSE, isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getPapanKerjaHarianPetClinic, markPapanKerjaHarianPetClinicDone } from '../../service.jsx';

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const STATUS_COLOR = {
  pending: 'default',
  done: 'success',
  skip: 'warning'
};

const STATUS_LABEL = {
  pending: 'Belum',
  done: 'Selesai',
  skip: 'Dilewati'
};

const PapanKerjaHarianPetClinic = (props) => {
  const { data } = props;
  const { user } = useAuth();
  const canMarkDone = isAdminOrManager(user?.role) || [JOB_DOKTER, JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName);

  const [rows, setRows] = useState([]);
  const [viewMode, setViewMode] = useState('today');
  const [markingRow, setMarkingRow] = useState(null);
  const [markNote, setMarkNote] = useState('');
  const dispatch = useDispatch();

  const today = todayStr();

  const fetchData = async () => {
    await getPapanKerjaHarianPetClinic(data.transactionId)
      .then((resp) => { if (resp?.data) setRows(resp.data); })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMarkDone = async (row) => {
    await markPapanKerjaHarianPetClinicDone({ id: row.id, note: markNote })
      .then((resp) => {
        if (resp?.status === 200) {
          dispatch(snackbarSuccess('Aktivitas berhasil ditandai selesai'));
          setMarkingRow(null);
          setMarkNote('');
          fetchData();
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
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

  return (
    <ModalC
      title="PAPAN KERJA HARIAN — RAWAT INAP"
      open={props.open}
      onCancel={() => props.onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="xl"
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <FilterListIcon fontSize="small" color="action" />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={viewMode}
          onChange={(_, val) => { if (val) setViewMode(val); }}
        >
          <ToggleButton value="today">
            Hari Ini ({today})
          </ToggleButton>
          <ToggleButton value="all">
            Semua Hari ({allDates.length} hari)
          </ToggleButton>
        </ToggleButtonGroup>

        {viewMode === 'today' && !hasTodayData && (
          <Typography variant="caption" color="text.secondary">
            Tidak ada jadwal untuk hari ini
          </Typography>
        )}
      </Stack>

      {grouped.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Tidak ada data untuk ditampilkan
          </Typography>
        </Box>
      ) : (
        grouped.map(([date, dateRows]) => (
          <Box key={date} mb={3}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}
              sx={{ px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 1 }}
            >
              {date}
            </Typography>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold', whiteSpace: 'nowrap' } }}>
                    <TableCell>Jam</TableCell>
                    <TableCell>Aktivitas</TableCell>
                    <TableCell>Detail Instruksi</TableCell>
                    <TableCell>Nama Pet</TableCell>
                    <TableCell>PIC</TableCell>
                    <TableCell>Catatan Selesai</TableCell>
                    <TableCell align="center">Status</TableCell>
                    {canMarkDone && <TableCell align="center">Aksi</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dateRows.map((row) => (
                    <>
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.scheduledTime || '-'}</TableCell>
                        <TableCell>{row.activityName}</TableCell>
                        <TableCell>{row.instruction || '-'}</TableCell>
                        <TableCell>{row.petName || '-'}</TableCell>
                        <TableCell>{row.picName || '-'}</TableCell>
                        <TableCell>{row.completionNote || '-'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={STATUS_LABEL[row.status] || row.status}
                            size="small"
                            color={STATUS_COLOR[row.status] || 'default'}
                          />
                        </TableCell>
                        {canMarkDone && (
                          <TableCell align="center">
                            {row.status === 'pending' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                                onClick={() => { setMarkingRow(row); setMarkNote(''); }}
                              >
                                Selesai
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Inline note input saat mark done */}
                      {markingRow?.id === row.id && (
                        <TableRow key={`${row.id}-mark`}>
                          <TableCell colSpan={canMarkDone ? 8 : 7} sx={{ bgcolor: 'success.lighter', px: 3, py: 1.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <TextField
                                size="small"
                                label="Catatan penyelesaian (opsional)"
                                value={markNote}
                                onChange={(e) => setMarkNote(e.target.value)}
                                sx={{ flex: 1 }}
                              />
                              <Button size="small" variant="contained" color="success" onClick={() => onMarkDone(row)}>
                                Konfirmasi
                              </Button>
                              <Button size="small" variant="outlined" onClick={() => setMarkingRow(null)}>
                                Batal
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
    </ModalC>
  );
};

PapanKerjaHarianPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default PapanKerjaHarianPetClinic;
