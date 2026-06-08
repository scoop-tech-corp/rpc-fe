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
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import { JOB_HELPER, JOB_PARAMEDIS, JOB_VETNURSE, isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getPapanKerjaHarian, markPapanKerjaHarianDone } from '../../service';
import MarkDoneDialog from '../mark-done-dialog';

/** Format tanggal lokal → dd/mm/yyyy */
const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const PapanKerjaHarian = (props) => {
  const { data } = props;
  const { user } = useAuth();
  const canMarkDone = isAdminOrManager(user?.role) || [JOB_HELPER, JOB_VETNURSE, JOB_PARAMEDIS].includes(user?.jobName);

  const [rows, setRows] = useState([]);
  const [markDoneDialog, setMarkDoneDialog] = useState({ open: false, row: null });
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'all'
  const dispatch = useDispatch();

  const today = todayStr();

  const fetchData = async () => {
    await getPapanKerjaHarian(data.transactionId)
      .then((resp) => { if (resp?.data) setRows(resp.data); })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMarkDone = async (formValue) => {
    await markPapanKerjaHarianDone(formValue)
      .then((resp) => {
        if (resp?.status === 200) {
          dispatch(snackbarSuccess('Aktivitas berhasil ditandai selesai'));
          setMarkDoneDialog({ open: false, row: null });
          fetchData();
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  // Filter & group by scheduledDate
  const filtered = useMemo(() => {
    if (viewMode === 'today') return rows.filter((r) => r.scheduledDate === today);
    return rows;
  }, [rows, viewMode, today]);

  // Kelompokkan per tanggal: [ [date, rows[]], ... ]
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
    <>
      <ModalC
        title="PAPAN KERJA HARIAN"
        open={props.open}
        onCancel={() => props.onClose(false)}
        isModalAction={false}
        fullWidth
        maxWidth="xl"
      >
        {/* Filter bar */}
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

          {/* Info jika hari ini tidak ada data */}
          {viewMode === 'today' && !hasTodayData && (
            <Typography variant="caption" color="text.secondary">
              Tidak ada jadwal untuk hari ini
            </Typography>
          )}
        </Stack>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', whiteSpace: 'nowrap' } }}>
                <TableCell>Tanggal</TableCell>
                <TableCell>No. Kandang</TableCell>
                <TableCell>Nama Hewan</TableCell>
                <TableCell>Jam</TableCell>
                <TableCell>Aktivitas</TableCell>
                <TableCell>Detail Instruksi</TableCell>
                <TableCell>PIC Shift</TableCell>
                <TableCell align="center">Aksi / Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grouped.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {viewMode === 'today' ? 'Tidak ada jadwal untuk hari ini' : 'Tidak ada data'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                grouped.map(([date, dayRows], gIdx) => (
                  <>
                    {/* Separator hari */}
                    <TableRow key={`sep-${date}`} sx={{ bgcolor: 'primary.lighter' }}>
                      <TableCell colSpan={8} sx={{ py: 0.75, fontWeight: 'bold' }}>
                        📅 {date}
                        {date === today && (
                          <Chip label="Hari Ini" size="small" color="primary" sx={{ ml: 1 }} />
                        )}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({dayRows.filter((r) => r.isDone).length}/{dayRows.length} selesai)
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {/* Baris aktivitas */}
                    {dayRows.map((row) => (
                      <TableRow key={row.id} sx={{ verticalAlign: 'top' }}>
                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                          {gIdx === 0 || viewMode === 'all' ? '' : row.scheduledDate}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cageNo}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" fontWeight="bold">{row.petName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.petBreed} ({row.petWeight ?? '-'} Kg)
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.time}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.activity}</TableCell>
                        <TableCell>
                          <Stack spacing={0.25}>
                            {(row.instructions || []).map((inst, i) => (
                              <Typography key={i} variant="body2">&bull; {inst}</Typography>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {Array.isArray(row.assignedStaff) && row.assignedStaff.length > 0 ? (
                            <Stack spacing={0.25}>
                              {row.assignedStaff.map((name) => (
                                <Typography key={name} variant="caption">{name}</Typography>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.disabled">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          {row.isDone ? (
                            <Box>
                              <Chip
                                icon={<CheckCircleOutlineIcon />}
                                label={`Selesai (${row.completedAt})`}
                                color={row.statusAktivitas === 'berhasil' ? 'success' : 'warning'}
                                size="small"
                              />
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                Oleh: {row.completedBy}
                              </Typography>
                            </Box>
                          ) : canMarkDone ? (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setMarkDoneDialog({ open: true, row })}
                            >
                              🔘 Centang Selesai
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.disabled">Belum selesai</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ModalC>

      <MarkDoneDialog
        open={markDoneDialog.open}
        row={markDoneDialog.row}
        onSubmit={onMarkDone}
        onClose={() => setMarkDoneDialog({ open: false, row: null })}
      />
    </>
  );
};

PapanKerjaHarian.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default PapanKerjaHarian;
