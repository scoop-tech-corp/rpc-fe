import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError } from 'store/reducers/snackbar';

// ── Constants ────────────────────────────────────────────────────────────────

const TEMUAN_LABEL = {
  pipis: 'Ada Pipis (Urin)',
  pup: 'Ada Pup (Feses)',
  bersih: 'Kotak Pasir Bersih/Kosong'
};

const KONDISI_LABEL = {
  normal: 'Normal (Padat)',
  lembek: 'Lembek',
  cair: 'Cair/Diare',
  konstipasi: 'Konstipasi/Keras',
  ada_darah: 'Ada Darah'
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Kelompokkan array rows berdasarkan scheduledDate */
const groupByDate = (rows) => {
  const map = {};
  rows.forEach((row) => {
    const key = row.scheduledDate || 'Tanpa Tanggal';
    if (!map[key]) map[key] = [];
    map[key].push(row);
  });
  return Object.entries(map); // [ [date, rows[]], ... ]
};

/**
 * Cek apakah aktivitas selesai > 10 menit setelah jadwal.
 * scheduledDate: "05/06/2026" | time: "07:00:00" | completedAt: "05/06/2026 23:54"
 */
const isLate = (row) => {
  if (!row.isDone || row.statusAktivitas !== 'berhasil') return false;
  if (!row.completedAt || !row.time || !row.scheduledDate) return false;

  const [sDay, sMonth, sYear] = row.scheduledDate.split('/');
  const timeStr = row.time.substring(0, 5); // "07:00"
  const scheduled = new Date(`${sYear}-${sMonth}-${sDay}T${timeStr}:00`);

  const [datePart, timePart] = row.completedAt.split(' ');
  const [cDay, cMonth, cYear] = datePart.split('/');
  const completed = new Date(`${cYear}-${cMonth}-${cDay}T${timePart}:00`);

  return (completed - scheduled) / (1000 * 60) > 10;
};

/** Hitung progress satu kelompok hari */
const dayProgress = (rows) => ({
  total: rows.length,
  done: rows.filter((r) => r.isDone && r.statusAktivitas === 'berhasil').length,
  skipped: rows.filter((r) => r.isDone && r.statusAktivitas === 'dilewati').length,
  pending: rows.filter((r) => !r.isDone).length
});

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusChip = ({ status, late = false }) => {
  if (!status) return <Chip label="Belum" size="small" variant="outlined" color="default" />;
  if (status === 'berhasil') {
    return late ? (
      <Chip label="Selesai (Terlambat)" size="small" color="warning" icon={<CheckCircleIcon />} />
    ) : (
      <Chip label="Selesai" size="small" color="success" icon={<CheckCircleIcon />} />
    );
  }
  return <Chip label="Dilewati" size="small" color="warning" icon={<RemoveCircleOutlineIcon />} />;
};
StatusChip.propTypes = { status: PropTypes.string, late: PropTypes.bool };

const ActivityRow = ({ row }) => {
  const late = isLate(row);
  const isWarning = !row.isDone ? false : row.statusAktivitas !== 'berhasil' || late;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        mb: 1
      }}
    >
      {/* Header aktivitas */}
      <Box
        sx={{
          px: 2,
          py: 0.75,
          bgcolor: !row.isDone ? 'grey.100' : isWarning ? 'warning.lighter' : 'success.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight="bold">
            {row.time} — {row.activity}
          </Typography>
        </Stack>
        <StatusChip status={row.isDone ? row.statusAktivitas : null} late={late} />
      </Box>

      {/* Detail — hanya jika sudah dikerjakan */}
      {row.isDone ? (
        <Box sx={{ px: 2, py: 1 }}>
          <Table size="small">
            <TableBody>
              {/* PIC shift — selalu tampil, terutama saat dilewati */}
              <TableRow>
                <TableCell sx={{ width: 150, color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AssignmentIndIcon sx={{ fontSize: 13 }} />
                    <span>PIC Shift</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  {Array.isArray(row.assignedStaff) && row.assignedStaff.length > 0 ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {row.assignedStaff.map((name) => (
                        <Tooltip
                          key={name}
                          title={row.statusAktivitas === 'dilewati' ? 'Seharusnya dikerjakan oleh petugas ini' : 'Petugas shift'}
                          arrow
                        >
                          <Chip
                            label={name}
                            size="small"
                            color={row.statusAktivitas === 'dilewati' ? 'warning' : 'default'}
                            variant={row.statusAktivitas === 'dilewati' ? 'filled' : 'outlined'}
                            icon={<AssignmentIndIcon />}
                          />
                        </Tooltip>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      Tidak ada data absensi shift ini
                    </Typography>
                  )}
                </TableCell>
              </TableRow>

              {Array.isArray(row.temuan) && row.temuan.length > 0 && (
                <TableRow>
                  <TableCell sx={{ width: 150, color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Temuan Kotak Pasir</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {row.temuan.map((t) => (
                        <Chip key={t} label={TEMUAN_LABEL[t] ?? t} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              )}

              {row.kondisiFeses && (
                <TableRow>
                  <TableCell sx={{ width: 150, color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Kondisi Feses</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>{KONDISI_LABEL[row.kondisiFeses] ?? row.kondisiFeses}</TableCell>
                </TableRow>
              )}

              {row.catatan && (
                <TableRow>
                  <TableCell sx={{ width: 150, color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Catatan</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>{row.catatan}</TableCell>
                </TableRow>
              )}

              {row.fotoUrl && (
                <TableRow>
                  <TableCell sx={{ width: 150, color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Foto Bukti</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>
                    <Link href={row.fotoUrl} target="_blank" rel="noopener">
                      Lihat Foto
                    </Link>
                  </TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell sx={{ width: 150, color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Dicatat Oleh</TableCell>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  {row.completedBy || '-'}{' '}
                  {row.completedAt && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      ({row.completedAt})
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Box sx={{ px: 2, py: 0.75 }}>
          <Typography variant="caption" color="text.disabled">
            Belum dikerjakan
          </Typography>
        </Box>
      )}
    </Box>
  );
};
ActivityRow.propTypes = { row: PropTypes.object.isRequired };

// ── Main Component ────────────────────────────────────────────────────────────

const LogPerawatanTab = ({ transactionId, fetcher, emptyLabel }) => {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  // Accordion yang terbuka default: hari pertama
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    fetcher(transactionId)
      .then((resp) => {
        const data = resp?.data ?? [];
        setRows(data);
        // Buka accordion hari pertama secara default
        if (data.length > 0) {
          setExpanded(data[0].scheduledDate || 'Tanpa Tanggal');
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        {emptyLabel || 'Belum ada data log perawatan.'}
      </Alert>
    );
  }

  const grouped = groupByDate(rows);

  // Summary keseluruhan
  const total = rows.length;
  const totalDone = rows.filter((r) => r.isDone && r.statusAktivitas === 'berhasil' && !isLate(r)).length;
  const totalLate = rows.filter((r) => r.isDone && r.statusAktivitas === 'berhasil' && isLate(r)).length;
  const totalSkipped = rows.filter((r) => r.isDone && r.statusAktivitas === 'dilewati').length;
  const totalPending = rows.filter((r) => !r.isDone).length;

  return (
    <Stack spacing={1.5} sx={{ mt: 1 }}>
      {/* Summary bar keseluruhan */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          px: 2,
          py: 1,
          bgcolor: 'grey.50',
          borderRadius: 1,
          flexWrap: 'wrap'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total tugas: <strong>{total}</strong>
        </Typography>
        <Typography variant="caption" color="success.main">
          ✓ Selesai: <strong>{totalDone}</strong>
        </Typography>
        {totalLate > 0 && (
          <Typography variant="caption" color="warning.main">
            ⏱ Terlambat: <strong>{totalLate}</strong>
          </Typography>
        )}
        <Typography variant="caption" color="warning.main">
          ⊘ Dilewati: <strong>{totalSkipped}</strong>
        </Typography>
        <Typography variant="caption" color="text.disabled">
          ○ Belum: <strong>{totalPending}</strong>
        </Typography>
      </Box>

      {/* Accordion per hari */}
      {grouped.map(([date, dayRows], idx) => {
        const prog = dayProgress(dayRows);
        const allDone = prog.pending === 0;
        const isExpanded = expanded === date;

        return (
          <Accordion
            key={date}
            expanded={isExpanded}
            onChange={() => setExpanded(isExpanded ? null : date)}
            disableGutters
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={2} alignItems="center" width="100%">
                {/* Nomor hari & tanggal */}
                <Box
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: allDone ? 'success.main' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" color="white" fontWeight="bold">
                    H{idx + 1}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Hari ke-{idx + 1} — {date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {prog.done}/{prog.total} selesai
                    {prog.skipped > 0 && ` · ${prog.skipped} dilewati`}
                    {prog.pending > 0 && ` · ${prog.pending} belum`}
                  </Typography>
                </Box>

                {/* Badge status hari */}
                {allDone ? (
                  <Chip label="Lengkap" size="small" color="success" />
                ) : prog.pending === prog.total ? (
                  <Chip label="Belum Mulai" size="small" color="default" variant="outlined" />
                ) : (
                  <Chip label="Sebagian" size="small" color="warning" variant="outlined" />
                )}
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
              {dayRows.map((row) => (
                <ActivityRow key={row.id} row={row} />
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
};

LogPerawatanTab.propTypes = {
  transactionId: PropTypes.number,
  fetcher: PropTypes.func.isRequired,
  emptyLabel: PropTypes.string
};

export default LogPerawatanTab;
