import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import EventIcon from '@mui/icons-material/Event';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PetsIcon from '@mui/icons-material/Pets';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
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
import { confirmPaymentPetSalon, getTransactionPetSalonDetail, rejectPaymentPetSalon, uploadPaymentProofPetSalon } from '../service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  'menunggu dokter': 'warning',
  'dalam perawatan': 'info',
  'proses check-out': 'warning',
  'menunggu persetujuan policy': 'warning',
  selesai: 'success',
  batal: 'error',
  ditolak: 'error'
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
      const resp = await getTransactionPetSalonDetail({ id, ...filterLog, ...filterLogPayment });
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
      await uploadPaymentProofPetSalon({ id: uploadProofDialog.paymentId, file });
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
      await confirmPaymentPetSalon({ id: confirmDialog.paymentId });
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
      await rejectPaymentPetSalon({ id: rejectDialog.paymentId, note: rejectDialog.note });
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
            <Tab label="Persetujuan Policy" id="dt-tab-3" aria-controls="dt-tabpanel-3" />
          </Tabs>
        </Box>

        <Box sx={{ mt: { xs: 1.5, sm: 2.5 } }}>
          {/* ── Tab 0: Detail ── */}
          <TabPanel value={tabSelected} index={0} name="detail-transaction">
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {/* Informasi Transaksi */}
              <SectionCard icon={<ContentCutIcon fontSize="small" color="primary" />} title="Informasi Transaksi Salon">
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
                          color={STATUS_COLOR[(data.detail.status || '').toLowerCase()] || 'default'}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <InfoRow label="Lokasi" value={data.detail.locationName} />
                  {data.detail.serviceCategory && <InfoRow label="Kategori Layanan" value={data.detail.serviceCategory} />}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Tanggal Salon
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="flex-start" flexWrap="wrap" sx={{ minWidth: 0 }}>
                        <EventIcon sx={{ fontSize: 14, color: 'text.secondary', mt: '3px', flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
                          {data.detail.startDate || '-'}
                          {data.detail.endDate && data.detail.endDate !== data.detail.startDate ? ` → ${data.detail.endDate}` : ''}
                        </Typography>
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

              {/* Informasi Hewan */}
              <SectionCard icon={<PetsIcon fontSize="small" color="primary" />} title="Informasi Hewan">
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
                        Groomer / Dokter
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
            {/* Panel Verifikasi Bukti Pembayaran */}
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
                      {/* Upload proof — semua user */}
                      {(!pay.proofOfPayment || pay.verificationStatus === 'rejected') && (
                        <Button size="small" variant="outlined" onClick={() => setUploadProofDialog({ open: true, paymentId: pay.id })}>
                          Upload Bukti
                        </Button>
                      )}
                      {/* Konfirmasi / Tolak — Admin/Manager, orang berbeda */}
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

          {/* ── Tab 3: Persetujuan Policy ── */}
          <TabPanel value={tabSelected} index={3} name="detail-transaction">
            <PolicyAgreementTab agreements={data.policyAgreements} />
          </TabPanel>
        </Box>
      </ModalC>

      {/* ── Upload Bukti Dialog ── */}
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

      {/* ── Konfirmasi Dialog ── */}
      <ConfirmationC
        open={confirmDialog.open}
        title="Konfirmasi Pembayaran"
        content="Yakin ingin mengkonfirmasi bukti pembayaran ini? Pastikan bukti transfer sudah sesuai."
        onClose={onConfirmPayment}
        btnTrueText="Konfirmasi"
        btnFalseText="Batal"
      />

      {/* ── Tolak Dialog ── */}
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
