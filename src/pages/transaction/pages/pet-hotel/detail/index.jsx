import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import EventIcon from '@mui/icons-material/Event';
import GavelIcon from '@mui/icons-material/Gavel';
import HotelIcon from '@mui/icons-material/Hotel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PetsIcon from '@mui/icons-material/Pets';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import LogActivityDetailTransaction from 'pages/transaction/detail/log-activity';
import LogPaymentDetailTransaction from 'pages/transaction/detail/log-payment';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend, processDownloadPDF } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import LogPerawatanTab from '../components/log-perawatan-tab';
import {
  acceptTransactionPetHotel,
  confirmPaymentPetHotel,
  deleteTransactionPetHotel,
  getCheckoutInvoice,
  getPapanKerjaHarian,
  getPapanKerjaVetnurse,
  getPrepaymentReceipt,
  getTransactionPetHotelDetail,
  rejectPaymentPetHotel
} from '../service';
import useAuth from 'hooks/useAuth';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  'menunggu konfirmasi': 'warning',
  'dalam perawatan': 'info',
  selesai: 'success',
  dibatalkan: 'error'
};

const CAGE_TYPE_LABEL = {
  hotel: 'Hotel',
  maternal: 'Maternal',
  general: 'General',
  breeding: 'Breeding',
  salon: 'Salon'
};

const calcDuration = (start, end) => {
  if (!start || !end) return null;
  // startDate & endDate dari BE sudah dalam format yyyy-mm-dd (ISO 8601)
  const diff = Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : null;
};

const petAge = (year, month) => {
  const parts = [];
  if (year) parts.push(`${year} thn`);
  if (month) parts.push(`${month} bln`);
  return parts.join(' ') || '-';
};

// ── Policy Agreement Tab ─────────────────────────────────────────────────────
const PolicyAgreementTab = ({ agreements }) => {
  const [sigDialog, setSigDialog] = useState(null); // { title, signatureData }

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
    <Stack spacing={2}>
      {/* Ringkasan penanda tangan */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CheckCircleOutlineIcon color="success" />
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

      {/* Daftar policy — accordion per item */}
      {agreements.map((pa, idx) => (
        <Accordion key={pa.id} variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                {idx + 1}. {pa.contractTitle}
              </Typography>
              <Chip label={`v${pa.contractVersion || '1'}`} size="small" variant="outlined" />
              {pa.hasSigned ? (
                <Tooltip title="Sudah ditandatangani">
                  <CheckCircleOutlineIcon color="success" fontSize="small" />
                </Tooltip>
              ) : null}
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Isi policy */}
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

              {/* Tanda tangan */}
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

      {/* Dialog zoom tanda tangan */}
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

// ── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
    <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">
        {title}
      </Typography>
    </Box>
    <Divider />
    <Box sx={{ px: 2, py: 1.5 }}>{children}</Box>
  </Paper>
);

// ── Info Row ─────────────────────────────────────────────────────────────────
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

const TransactionDetail = (props) => {
  const { id } = props.data;
  const { user } = useAuth();
  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState({ accept: false, reject: false, delete: false });
  const [data, setData] = useState({ detail: {}, log: [], paymentLogs: [], policyAgreements: [] });
  const [filterLog, setFilterLog] = useState({});
  const [filterLogPayment, setFilterLogPayment] = useState({});
  // State untuk konfirmasi/tolak bukti pembayaran
  const [verifyDialog, setVerifyDialog] = useState({ open: false, type: '', paymentId: null, note: '' });
  const onChangeTab = (value) => setTabSelected(value);
  const dispatch = useDispatch();

  const onCancel = () => props.onClose(false);

  // procedure => accept , cancel
  const onConfirm = async (val, procedure) => {
    if (val) {
      await acceptTransactionPetHotel({
        transactionId: +data.detail.id,
        status: procedure === 'accept' ? 1 : 0,
        reason: procedure === 'cancel' ? val : ''
      })
        .then((resp) => {
          if (resp.status === 200) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarSuccess(`Success ${procedure} patient`));
            props.onClose(`${procedure}-patient`);
          }
        })
        .catch((err) => {
          if (err) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog({ accept: false, reject: false, delete: false });
    }
  };

  const onDelete = async (val) => {
    if (val) {
      await deleteTransactionPetHotel([id])
        .then((resp) => {
          if (resp.status === 200) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarSuccess(`Success delete data`));
            props.onClose(`delete`);
          }
        })
        .catch((err) => {
          if (err) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog({ accept: false, reject: false, delete: false });
    }
  };

  // ── Handler konfirmasi / tolak bukti pembayaran ─────────────────────────────
  const onVerifyPayment = async () => {
    try {
      if (verifyDialog.type === 'confirm') {
        await confirmPaymentPetHotel({ id: verifyDialog.paymentId });
        dispatch(snackbarSuccess('Pembayaran berhasil dikonfirmasi.'));
      } else {
        if (!verifyDialog.note.trim()) {
          dispatch(snackbarError('Alasan penolakan wajib diisi.'));
          return;
        }
        await rejectPaymentPetHotel({ id: verifyDialog.paymentId, note: verifyDialog.note });
        dispatch(snackbarSuccess('Bukti pembayaran ditolak. Staff dapat upload ulang.'));
      }
      setVerifyDialog({ open: false, type: '', paymentId: null, note: '' });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const fetchData = async () => {
    const resp = await getTransactionPetHotelDetail({
      id,
      ...filterLog,
      ...filterLogPayment
    });
    const getData = resp.data;
    setData({
      detail: getData.detail,
      log: getData.transactionLogs,
      paymentLogs: getData.paymentLogs || [],
      policyAgreements: getData.policyAgreements || []
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLog, filterLogPayment]);

  const onPrintPaymentLog = async (row) => {
    try {
      let resp;
      if (row.type === 'DP / Pembayaran Awal') {
        resp = await getPrepaymentReceipt(row.id);
        processDownloadPDF(resp, `dp-receipt-${row.notaNumber || row.id}`);
      } else {
        resp = await getCheckoutInvoice(id);
        processDownloadPDF(resp, `invoice-pethotel-${id}`);
      }
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-transaction" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="lg"
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="detail transaction tab"
          >
            <Tab label={<FormattedMessage id="details" />} id="detail-transaction-tab-0" aria-controls="detail-transaction-tabpanel-0" />
            <Tab
              label={<FormattedMessage id="log-activity" />}
              id="detail-transaction-tab-1"
              aria-controls="detail-transaction-tabpanel-1"
            />
            <Tab
              label={<FormattedMessage id="log-payment" />}
              id="detail-transaction-tab-2"
              aria-controls="detail-transaction-tabpanel-2"
            />
            <Tab label="Log Perawatan Harian" id="detail-transaction-tab-3" aria-controls="detail-transaction-tabpanel-3" />
            <Tab label="Log Vetnurse Board" id="detail-transaction-tab-4" aria-controls="detail-transaction-tabpanel-4" />
            <Tab label="Persetujuan Policy" id="detail-transaction-tab-5" aria-controls="detail-transaction-tabpanel-5" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="detail-transaction">
            <Stack spacing={2}>
              {/* ── Section 1: Info Transaksi ── */}
              <SectionCard icon={<HotelIcon fontSize="small" color="primary" />} title="Informasi Transaksi">
                <Grid container spacing={2}>
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
                          color={STATUS_COLOR[data.detail.status?.toLowerCase()] || 'default'}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <InfoRow label="Lokasi" value={data.detail.locationName} />
                  {data.detail.serviceCategory && <InfoRow label="Kategori Layanan" value={data.detail.serviceCategory} />}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Kandang
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography variant="body2" fontWeight={500}>
                          {data.detail.cageName || '-'}
                        </Typography>
                        {data.detail.cageType && (
                          <Chip label={CAGE_TYPE_LABEL[data.detail.cageType] ?? data.detail.cageType} size="small" variant="outlined" />
                        )}
                        {data.detail.cageSize && (
                          <Chip label={`Size ${data.detail.cageSize}`} size="small" variant="outlined" color="secondary" />
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Periode Menginap
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

              {/* ── Section 2: Info Customer ── */}
              <SectionCard icon={<BadgeIcon fontSize="small" color="primary" />} title="Informasi Customer">
                <Grid container spacing={2}>
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

              {/* ── Section 3: Info Hewan & Medis ── */}
              <SectionCard icon={<PetsIcon fontSize="small" color="primary" />} title="Informasi Hewan & Medis">
                <Grid container spacing={2}>
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
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MedicalServicesIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>
                          {data.detail.picDoctor || '-'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>
            </Stack>
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="detail-transaction">
            <LogActivityDetailTransaction
              data={data.log}
              onFetchData={(e) => {
                if (e) setFilterLog(e);
              }}
            />
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="detail-transaction">
            {/* ── Panel Verifikasi Bukti Pembayaran ── */}
            {data.paymentLogs.filter((p) => p.verificationStatus === 'pending').length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'warning.main', bgcolor: 'warning.lighter' }}>
                <Typography variant="subtitle2" fontWeight="bold" color="warning.dark" mb={1}>
                  ⚠️ Bukti Pembayaran Menunggu Verifikasi
                </Typography>
                {data.paymentLogs
                  .filter((p) => p.verificationStatus === 'pending')
                  .map((p) => {
                    const isSameUploader = p.uploadedBy === user?.id;
                    const canVerify = (user?.role === 'administrator' || user?.role === 'manager') && !isSameUploader;
                    return (
                      <Stack
                        key={p.id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
                      >
                        <Stack spacing={0.25}>
                          <Typography variant="body2" fontWeight={500}>
                            {p.notaNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.amount} · Diupload oleh: {p.uploadedByName?.trim() || '-'}
                          </Typography>
                          {isSameUploader && (
                            <Typography variant="caption" color="warning.dark">
                              Anda yang mengupload — tidak bisa konfirmasi sendiri
                            </Typography>
                          )}
                        </Stack>
                        {canVerify && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => setVerifyDialog({ open: true, type: 'confirm', paymentId: p.id, note: '' })}
                            >
                              Konfirmasi
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => setVerifyDialog({ open: true, type: 'reject', paymentId: p.id, note: '' })}
                            >
                              Tolak
                            </Button>
                          </Stack>
                        )}
                      </Stack>
                    );
                  })}
              </Paper>
            )}
            <LogPaymentDetailTransaction
              data={data.paymentLogs}
              onFetchData={(e) => {
                if (e) setFilterLogPayment(e);
              }}
              onPrint={onPrintPaymentLog}
            />
          </TabPanel>
          <TabPanel value={tabSelected} index={3} name="detail-transaction">
            <LogPerawatanTab
              transactionId={+id}
              fetcher={getPapanKerjaHarian}
              emptyLabel="Belum ada log perawatan harian untuk transaksi ini."
            />
          </TabPanel>
          <TabPanel value={tabSelected} index={4} name="detail-transaction">
            <LogPerawatanTab
              transactionId={+id}
              fetcher={getPapanKerjaVetnurse}
              emptyLabel="Belum ada log vetnurse board untuk transaksi ini."
            />
          </TabPanel>

          {/* ── Tab 5: Persetujuan Policy ── */}
          <TabPanel value={tabSelected} index={5} name="detail-transaction">
            <PolicyAgreementTab agreements={data.policyAgreements} />
          </TabPanel>
        </Box>
      </ModalC>

      <ConfirmationC
        open={dialog.delete}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onDelete(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      {/* ── Dialog Konfirmasi / Tolak Bukti Pembayaran ── */}
      <Dialog
        open={verifyDialog.open}
        onClose={() => setVerifyDialog({ open: false, type: '', paymentId: null, note: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{verifyDialog.type === 'confirm' ? '✅ Konfirmasi Pembayaran' : '❌ Tolak Bukti Pembayaran'}</DialogTitle>
        <DialogContent>
          {verifyDialog.type === 'confirm' ? (
            <Typography variant="body2">
              Apakah Anda yakin bukti pembayaran ini valid dan sesuai nominal transaksi? Tindakan ini tidak dapat dibatalkan.
            </Typography>
          ) : (
            <Stack spacing={2} mt={1}>
              <Typography variant="body2">Jelaskan alasan penolakan agar staff dapat memperbaiki bukti pembayaran.</Typography>
              <TextField
                label="Alasan Penolakan *"
                multiline
                rows={3}
                fullWidth
                value={verifyDialog.note}
                onChange={(e) => setVerifyDialog((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Contoh: Nominal tidak sesuai / bukti sudah kadaluarsa / gambar tidak jelas"
              />
            </Stack>
          )}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
            <Button variant="outlined" onClick={() => setVerifyDialog({ open: false, type: '', paymentId: null, note: '' })}>
              Batal
            </Button>
            <Button variant="contained" color={verifyDialog.type === 'confirm' ? 'success' : 'error'} onClick={onVerifyPayment}>
              {verifyDialog.type === 'confirm' ? 'Ya, Konfirmasi' : 'Tolak'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <ConfirmationC
        open={dialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-this-patient" />}
        onClose={(response) => onConfirm(response, 'accept')}
        btnTrueText="Ok"
      />
      <FormReject
        open={dialog.reject}
        title={<FormattedMessage id="confirm-and-please-fill-in-the-reasons-for-cancel-this-patient" />}
        onSubmit={(response) => onConfirm(response, 'cancel')}
        onClose={() => setDialog({ accept: false, reject: false })}
      />
    </>
  );
};

TransactionDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TransactionDetail;
