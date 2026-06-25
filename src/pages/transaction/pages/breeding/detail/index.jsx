import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import EventIcon from '@mui/icons-material/Event';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PetsIcon from '@mui/icons-material/Pets';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ConfirmationC from 'components/ConfirmationC';
import ModalC from 'components/ModalC';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';
import TabPanel from 'components/TabPanelC';
import { isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import LogActivityDetailTransaction from 'pages/transaction/detail/log-activity';
import LogPaymentDetailTransaction from 'pages/transaction/detail/log-payment';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import {
  confirmPaymentBreeding,
  getBreedingPapanKerja,
  getTransactionBreedingDetail,
  rejectPaymentBreeding,
  uploadPaymentProofBreeding
} from '../service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  'menunggu dokter': { color: 'warning' },
  'ditolak dokter': { color: 'error' },
  'cek kondisi pet': { color: 'info' },
  'pet diterima masuk breeding': { color: 'info' },
  'pet ditolak breeding': { color: 'error' },
  'pet dipindahkan ke pet clinic': { color: 'warning' },
  'menunggu persetujuan policy': { color: 'warning' },
  'proses pacak': { color: 'primary' },
  'proses check-out': { color: 'warning' },
  selesai: { color: 'success' },
  batal: { color: 'error' }
};

const calcDuration = (start, end) => {
  if (!start || !end) return null;
  const diff = Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : null;
};

const petAge = (year, month) => {
  const parts = [];
  if (year) parts.push(`${year} thn`);
  if (month) parts.push(`${month} bln`);
  return parts.join(' ') || '-';
};

// ── SectionCard ──────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.25 }, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">
        {title}
      </Typography>
    </Box>
    <Divider />
    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>{children}</Box>
  </Paper>
);
SectionCard.propTypes = { icon: PropTypes.node, title: PropTypes.string, children: PropTypes.node };

// ── InfoRow ───────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, fullWidth = false }) => (
  <Grid item xs={12} sm={fullWidth ? 12 : 6}>
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Stack>
  </Grid>
);
InfoRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fullWidth: PropTypes.bool
};

// ── Policy Agreement Tab ──────────────────────────────────────────────────────
const PolicyAgreementTab = ({ agreements }) => {
  const [sigDialog, setSigDialog] = useState(null);

  if (!agreements || agreements.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <GavelIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">Belum ada data persetujuan policy</Typography>
      </Box>
    );
  }

  const first = agreements[0];

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'success.lighter', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Telah disetujui oleh: {first.signerName || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ditandatangani pada: {first.signedAt || '-'} · Dicatat oleh: {first.recordedBy || '-'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {agreements.map((pa, idx) => (
        <Accordion key={pa.id} variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ width: '100%', pr: 1, gap: 0.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 100 }}>
                {idx + 1}. {pa.contractTitle}
              </Typography>
              <Chip
                label={`v${pa.contractVersion || '1'}`}
                size="small"
                variant="outlined"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              />
              {pa.hasSigned ? (
                <Tooltip title="Sudah ditandatangani">
                  <CheckCircleOutlineIcon color="success" fontSize="small" />
                </Tooltip>
              ) : null}
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {pa.rawContent ? (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                    Isi Policy:
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 220,
                      overflowY: 'auto',
                      p: 1.5,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      fontSize: 12,
                      lineHeight: 1.6
                    }}
                    dangerouslySetInnerHTML={{ __html: pa.rawContent }}
                  />
                </Box>
              ) : (
                <Typography variant="caption" color="text.disabled" fontStyle="italic">
                  Konten policy tidak tersedia
                </Typography>
              )}

              {pa.signatureData ? (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                    Tanda Tangan:
                  </Typography>
                  <Box
                    component="img"
                    src={pa.signatureData}
                    alt="Tanda Tangan"
                    onClick={() => setSigDialog({ title: pa.contractTitle, signatureData: pa.signatureData })}
                    sx={{
                      height: 80,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: '#fff',
                      cursor: 'zoom-in',
                      display: 'block'
                    }}
                  />
                  <Typography variant="caption" color="text.disabled">
                    Klik untuk perbesar
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.disabled" fontStyle="italic">
                  Tanda tangan tidak tersedia
                </Typography>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={!!sigDialog} onClose={() => setSigDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Tanda Tangan — {sigDialog?.title}
          <IconButton size="small" onClick={() => setSigDialog(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              bgcolor: '#fff',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box component="img" src={sigDialog?.signatureData} alt="Tanda Tangan" sx={{ maxWidth: '100%', maxHeight: 300 }} />
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
PolicyAgreementTab.propTypes = { agreements: PropTypes.array };

// ── Papan Kerja Tab (breeding-specific) ──────────────────────────────────────
const PapanKerjaBreedingTab = ({ transactionId }) => {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    getBreedingPapanKerja(transactionId)
      .then((resp) => {
        const data = resp?.data ?? [];
        setRows(data);
        if (data.length > 0) setExpanded(data[0].scheduledDate);
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
        Belum ada data papan kerja harian untuk transaksi ini.
      </Alert>
    );
  }

  // Grup berdasarkan scheduledDate
  const grouped = {};
  rows.forEach((r) => {
    const key = r.scheduledDate || 'Tanpa Tanggal';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });
  const groupedEntries = Object.entries(grouped);

  const totalDone = rows.filter((r) => r.isDone).length;

  return (
    <Stack spacing={1.5} sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          px: { xs: 1, sm: 2 },
          py: 1,
          bgcolor: 'grey.50',
          borderRadius: 1,
          flexWrap: 'wrap'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total tugas: <strong>{rows.length}</strong>
        </Typography>
        <Typography variant="caption" color="success.main">
          ✓ Selesai: <strong>{totalDone}</strong>
        </Typography>
        <Typography variant="caption" color="text.disabled">
          ○ Belum: <strong>{rows.length - totalDone}</strong>
        </Typography>
      </Box>

      {groupedEntries.map(([date, dayRows], idx) => {
        const isExpanded = expanded === date;
        const doneCnt = dayRows.filter((r) => r.isDone).length;

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
              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" width="100%">
                <Box
                  sx={{
                    minWidth: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: doneCnt === dayRows.length ? 'success.main' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" color="white" fontWeight="bold" sx={{ fontSize: { xs: 10, sm: 12 } }}>
                    H{idx + 1}
                  </Typography>
                </Box>
                <Box flex={1} minWidth={0}>
                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    Hari ke-{idx + 1} — {date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doneCnt}/{dayRows.length} selesai
                  </Typography>
                </Box>
                <Chip
                  label={doneCnt === dayRows.length ? 'Lengkap' : doneCnt === 0 ? 'Belum' : 'Sebagian'}
                  size="small"
                  color={doneCnt === dayRows.length ? 'success' : doneCnt === 0 ? 'default' : 'warning'}
                  variant={doneCnt === dayRows.length ? 'filled' : 'outlined'}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, flexShrink: 0 }}
                />
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, px: { xs: 1, sm: 2 } }}>
              {dayRows.map((row) => (
                <Box key={row.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', mb: 1 }}>
                  <Box
                    sx={{
                      px: { xs: 1.5, sm: 2 },
                      py: 0.75,
                      bgcolor: row.isDone ? 'success.lighter' : 'grey.100',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                      <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
                        {row.time ? row.time.substring(0, 5) : '—'} — {row.activity}
                      </Typography>
                    </Stack>
                    <Chip
                      label={row.isDone ? 'Selesai' : 'Belum'}
                      size="small"
                      color={row.isDone ? 'success' : 'default'}
                      variant={row.isDone ? 'filled' : 'outlined'}
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>

                  <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableBody>
                        {row.instructions && (
                          <TableRow>
                            <TableCell
                              sx={{ width: { xs: 80, sm: 130 }, color: 'text.secondary', border: 0, pl: 0, py: 0.5, whiteSpace: 'nowrap' }}
                            >
                              Instruksi
                            </TableCell>
                            <TableCell sx={{ border: 0, py: 0.5 }}>{row.instructions}</TableCell>
                          </TableRow>
                        )}
                        {row.isDone && row.statusAktivitas && (
                          <TableRow>
                            <TableCell
                              sx={{ width: { xs: 80, sm: 130 }, color: 'text.secondary', border: 0, pl: 0, py: 0.5, whiteSpace: 'nowrap' }}
                            >
                              Status
                            </TableCell>
                            <TableCell sx={{ border: 0, py: 0.5 }}>{row.statusAktivitas}</TableCell>
                          </TableRow>
                        )}
                        {row.isDone && row.temuan && (
                          <TableRow>
                            <TableCell
                              sx={{ width: { xs: 80, sm: 130 }, color: 'text.secondary', border: 0, pl: 0, py: 0.5, whiteSpace: 'nowrap' }}
                            >
                              Temuan
                            </TableCell>
                            <TableCell sx={{ border: 0, py: 0.5 }}>{row.temuan}</TableCell>
                          </TableRow>
                        )}
                        {row.isDone && row.catatan && (
                          <TableRow>
                            <TableCell
                              sx={{ width: { xs: 80, sm: 130 }, color: 'text.secondary', border: 0, pl: 0, py: 0.5, whiteSpace: 'nowrap' }}
                            >
                              Catatan
                            </TableCell>
                            <TableCell sx={{ border: 0, py: 0.5 }}>{row.catatan}</TableCell>
                          </TableRow>
                        )}
                        {row.isDone && (
                          <TableRow>
                            <TableCell
                              sx={{ width: { xs: 80, sm: 130 }, color: 'text.secondary', border: 0, pl: 0, py: 0.5, whiteSpace: 'nowrap' }}
                            >
                              Dicatat Oleh
                            </TableCell>
                            <TableCell sx={{ border: 0, py: 0.5 }}>
                              {row.completedByName || '-'}
                              {row.completedAt && (
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {' '}
                                  ({row.completedAt})
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
};
PapanKerjaBreedingTab.propTypes = { transactionId: PropTypes.number };

// ── Main Component ────────────────────────────────────────────────────────────
const TransactionDetail = (props) => {
  const { id } = props.data;
  const { user } = useAuth();
  const isAdminMgr = isAdminOrManager(user?.role);
  const [tabSelected, setTabSelected] = useState(0);
  const [data, setData] = useState({ detail: {}, log: [], paymentLogs: [], policyAgreements: [] });
  const [filterLog, setFilterLog] = useState({});
  const [filterLogPayment, setFilterLogPayment] = useState({});
  const [uploadProofDialog, setUploadProofDialog] = useState({ open: false, paymentId: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, paymentId: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, paymentId: null, note: '' });
  const [proofFile, setProofFile] = useState(null);
  const dispatch = useDispatch();

  const fetchData = async () => {
    try {
      const resp = await getTransactionBreedingDetail({ id, ...filterLog, ...filterLogPayment });
      const d = resp.data;
      setData({
        detail: d.detail || {},
        log: d.transactionLogs || [],
        paymentLogs: d.paymentLogs || [],
        policyAgreements: d.policyAgreements || []
      });
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLog, filterLogPayment]);

  const onUploadProof = async () => {
    if (!proofFile?.[0] && !proofFile) {
      dispatch(snackbarError('Pilih file bukti pembayaran'));
      return;
    }
    try {
      const file = Array.isArray(proofFile) ? proofFile[0] : proofFile;
      await uploadPaymentProofBreeding({ id: uploadProofDialog.paymentId, file });
      dispatch(snackbarSuccess('Bukti diunggah. Menunggu verifikasi Finance/Manager.'));
      setUploadProofDialog({ open: false, paymentId: null });
      setProofFile(null);
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onConfirmPayment = async (confirmed) => {
    if (!confirmed) {
      setConfirmDialog({ open: false, paymentId: null });
      return;
    }
    try {
      await confirmPaymentBreeding({ id: confirmDialog.paymentId });
      dispatch(snackbarSuccess('Pembayaran dikonfirmasi'));
      setConfirmDialog({ open: false, paymentId: null });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onRejectPayment = async () => {
    if (!rejectDialog.note.trim()) {
      dispatch(snackbarError('Catatan wajib diisi'));
      return;
    }
    try {
      await rejectPaymentBreeding({ id: rejectDialog.paymentId, note: rejectDialog.note });
      dispatch(snackbarSuccess('Bukti ditolak. Staff dapat upload ulang.'));
      setRejectDialog({ open: false, paymentId: null, note: '' });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-transaction" />}
        open={props.open}
        onCancel={() => props.onClose(false)}
        isModalAction={false}
        fullWidth
        maxWidth="lg"
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => setTabSelected(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="detail transaction tab"
          >
            <Tab label={<FormattedMessage id="details" />} id="dt-tab-0" aria-controls="dt-tabpanel-0" />
            <Tab label={<FormattedMessage id="log-activity" />} id="dt-tab-1" aria-controls="dt-tabpanel-1" />
            <Tab label={<FormattedMessage id="log-payment" />} id="dt-tab-2" aria-controls="dt-tabpanel-2" />
            <Tab label="Log Papan Kerja Breeding" id="dt-tab-3" aria-controls="dt-tabpanel-3" />
            <Tab label="Persetujuan Policy" id="dt-tab-4" aria-controls="dt-tabpanel-4" />
          </Tabs>
        </Box>

        <Box sx={{ mt: { xs: 1.5, sm: 2.5 } }}>
          {/* ── Tab 0: Detail ── */}
          <TabPanel value={tabSelected} index={0} name="detail-transaction">
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {/* Informasi Transaksi */}
              <SectionCard icon={<FavoriteIcon fontSize="small" color="primary" />} title="Informasi Transaksi Breeding">
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <InfoRow label="No. Registrasi" value={data.detail.registrationNo} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box>
                        <Chip
                          label={data.detail.status || '-'}
                          size="small"
                          color={STATUS_CONFIG[(data.detail.status || '').toLowerCase()]?.color || 'default'}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <InfoRow label="Lokasi" value={data.detail.locationName} />
                  {data.detail.serviceCategory && <InfoRow label="Kategori Layanan" value={data.detail.serviceCategory} />}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Periode Breeding
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight={500}>
                            {data.detail.startDate || '-'} → {data.detail.endDate || '-'}
                          </Typography>
                        </Stack>
                        {calcDuration(data.detail.startDate, data.detail.endDate) && (
                          <Chip label={`${calcDuration(data.detail.startDate, data.detail.endDate)} hari`} size="small" color="primary" />
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                  {data.detail.note && <InfoRow label="Catatan" value={data.detail.note} fullWidth />}
                  <InfoRow label="Dibuat Oleh" value={data.detail.createdBy} />
                  <InfoRow label="Dibuat Pada" value={data.detail.createdAt} />
                </Grid>
              </SectionCard>

              {/* Informasi Customer */}
              <SectionCard icon={<BadgeIcon fontSize="small" color="primary" />} title="Informasi Customer">
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <InfoRow label="Nama Customer" value={data.detail.customerName} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Tipe Customer
                      </Typography>
                      <Box>
                        <Chip
                          label={+data.detail.isNewCustomer ? 'Customer Baru' : 'Customer Lama'}
                          size="small"
                          color={+data.detail.isNewCustomer ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  {data.detail.customerGroup && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.secondary">
                          Grup Member
                        </Typography>
                        <Box>
                          <Chip
                            icon={<CorporateFareIcon />}
                            label={data.detail.customerGroup}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                  <InfoRow label="Pendaftar" value={data.detail.registrant} />
                </Grid>
              </SectionCard>

              {/* Informasi Hewan & Medis */}
              <SectionCard icon={<PetsIcon fontSize="small" color="primary" />} title="Informasi Hewan & Medis">
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <InfoRow label="Nama Hewan" value={data.detail.petName} />
                  <InfoRow label="Kategori" value={data.detail.petCategoryName} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Jenis Kelamin
                      </Typography>
                      <Box>
                        <Chip
                          label={data.detail.petGender === 'J' ? '♂ Jantan' : data.detail.petGender === 'B' ? '♀ Betina' : '-'}
                          size="small"
                          color={data.detail.petGender === 'J' ? 'info' : 'error'}
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Status Steril
                      </Typography>
                      <Box>
                        <Chip
                          label={data.detail.petSterile ? 'Sudah Steril' : 'Belum Steril'}
                          size="small"
                          color={data.detail.petSterile ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <InfoRow label="Umur" value={petAge(data.detail.petYear, data.detail.petMonth)} />
                  <InfoRow label="Kondisi Masuk" value={data.detail.condition} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Dokter Penanggung Jawab
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <MedicalServicesIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
                          {data.detail.picDoctor || '-'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>
            </Stack>
          </TabPanel>

          {/* ── Tab 1: Log Activity ── */}
          <TabPanel value={tabSelected} index={1} name="detail-transaction">
            <LogActivityDetailTransaction
              data={data.log}
              onFetchData={(e) => {
                if (e) setFilterLog(e);
              }}
            />
          </TabPanel>

          {/* ── Tab 2: Log Payment ── */}
          <TabPanel value={tabSelected} index={2} name="detail-transaction">
            {data.paymentLogs.some((p) => p.verificationStatus === 'pending' || p.isPayed === 0) && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'warning.main' }}>
                <Typography variant="subtitle2" color="warning.dark" mb={1}>
                  Pembayaran Menunggu Verifikasi
                </Typography>
                {data.paymentLogs
                  .filter((p) => p.verificationStatus === 'pending' || (p.isPayed === 0 && !p.proofOfPayment))
                  .map((pay) => (
                    <Box
                      key={pay.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                        mb: 1,
                        p: 1,
                        bgcolor: 'warning.lighter',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {pay.notaNumber} — {pay.amount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pay.verificationStatus === 'pending' ? `Bukti diunggah oleh ${pay.uploadedByName || '-'}` : 'Belum ada bukti'}
                        </Typography>
                        {pay.verificationStatus === 'rejected' && (
                          <Typography variant="caption" color="error.main" display="block">
                            Ditolak: {pay.verificationNote}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        size="small"
                        label={
                          pay.verificationStatus === 'pending'
                            ? 'Pending'
                            : pay.verificationStatus === 'rejected'
                            ? 'Ditolak'
                            : 'Belum Upload'
                        }
                        color={
                          pay.verificationStatus === 'pending' ? 'warning' : pay.verificationStatus === 'rejected' ? 'error' : 'default'
                        }
                      />
                      {(!pay.proofOfPayment || pay.verificationStatus === 'rejected') && (
                        <Button size="small" variant="outlined" onClick={() => setUploadProofDialog({ open: true, paymentId: pay.id })}>
                          Upload Bukti
                        </Button>
                      )}
                      {isAdminMgr && pay.verificationStatus === 'pending' && pay.uploadedBy !== user?.id && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => setConfirmDialog({ open: true, paymentId: pay.id })}
                          >
                            Konfirmasi
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => setRejectDialog({ open: true, paymentId: pay.id, note: '' })}
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                    </Box>
                  ))}
              </Paper>
            )}
            <LogPaymentDetailTransaction
              data={data.paymentLogs}
              onFetchData={(e) => {
                if (e) setFilterLogPayment(e);
              }}
            />
          </TabPanel>

          {/* ── Tab 3: Papan Kerja Breeding ── */}
          <TabPanel value={tabSelected} index={3} name="detail-transaction">
            <PapanKerjaBreedingTab transactionId={+id} />
          </TabPanel>

          {/* ── Tab 4: Persetujuan Policy ── */}
          <TabPanel value={tabSelected} index={4} name="detail-transaction">
            <PolicyAgreementTab agreements={data.policyAgreements} />
          </TabPanel>
        </Box>
      </ModalC>

      {/* ── Dialogs ── */}
      <ModalC
        title="Upload Bukti Pembayaran"
        open={uploadProofDialog.open}
        onOk={onUploadProof}
        onCancel={() => {
          setUploadProofDialog({ open: false, paymentId: null });
          setProofFile(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Upload bukti transfer. Setelah diunggah, Finance/Manager akan memverifikasi.
          </Typography>
          <SingleFileUpload file={proofFile} setFieldValue={(_, v) => setProofFile(v)} />
        </Stack>
      </ModalC>

      <ConfirmationC
        open={confirmDialog.open}
        title="Konfirmasi Pembayaran"
        content="Yakin ingin mengkonfirmasi bukti pembayaran ini?"
        onClose={onConfirmPayment}
        btnTrueText="Konfirmasi"
        btnFalseText="Batal"
      />

      <ModalC
        title="Tolak Bukti Pembayaran"
        open={rejectDialog.open}
        onOk={onRejectPayment}
        onCancel={() => setRejectDialog({ open: false, paymentId: null, note: '' })}
        fullWidth
        maxWidth="sm"
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Berikan alasan penolakan agar staff dapat mengupload ulang bukti yang benar.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Catatan Penolakan"
            value={rejectDialog.note}
            onChange={(e) => setRejectDialog((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Contoh: Bukti tidak terbaca, nominal tidak sesuai"
          />
        </Stack>
      </ModalC>
    </>
  );
};

TransactionDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TransactionDetail;
