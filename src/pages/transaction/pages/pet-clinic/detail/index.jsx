import BadgeIcon from '@mui/icons-material/Badge';
import EventIcon from '@mui/icons-material/Event';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PetsIcon from '@mui/icons-material/Pets';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import {
  CONSTANT_ADMINISTRATOR,
  JOB_DOKTER,
  JOB_KASIR,
  JOB_PARAMEDIS,
  JOB_VETNURSE,
  isAdminOrManager
} from 'constant/role';
import useAuth from 'hooks/useAuth';
import LogActivityDetailTransaction from 'pages/transaction/detail/log-activity';
import LogPaymentDetailTransaction from 'pages/transaction/detail/log-payment';
import LogPerawatanTab from 'pages/transaction/pages/pet-hotel/components/log-perawatan-tab';
import CheckConditionTab from './check-condition-tab';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend, processDownloadPDF } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import {
  acceptTransactionPetClinic,
  getPapanKerjaHarianPetClinic,
  getPrepaymentReceiptPetClinic,
  getTransactionPetClinicDetail,
  printInvoicePetClinic
} from '../service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  'menunggu dokter': 'warning',
  'cek kondisi pet': 'info',
  'ditolak dokter': 'error',
  'input service dan obat': 'primary',
  'proses pembayaran': 'warning',
  'dalam perawatan': 'info',
  'selesai': 'success',
  'dibatalkan': 'error'
};

const petAge = (year, month) => {
  const parts = [];
  if (year) parts.push(`${year} thn`);
  if (month) parts.push(`${month} bln`);
  return parts.join(' ') || '-';
};

// ── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
    <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
    </Box>
    <Divider />
    <Box sx={{ px: 2, py: 1.5 }}>{children}</Box>
  </Paper>
);
SectionCard.propTypes = { icon: PropTypes.node, title: PropTypes.string, children: PropTypes.node };

// ── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, fullWidth = false }) => (
  <Grid item xs={12} sm={fullWidth ? 12 : 6}>
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Stack>
  </Grid>
);
InfoRow.propTypes = { label: PropTypes.string, value: PropTypes.any, fullWidth: PropTypes.bool };

// ── Main Component ─────────────────────────────────────────────────────────
const TransactionPetClinicDetail = (props) => {
  const { id } = props.data;
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState({ accept: false, reject: false });
  const [data, setData] = useState({ detail: {}, log: [], paymentLogs: [] });
  const [filterLog, setFilterLog] = useState({});
  const [filterLogPayment, setFilterLogPayment] = useState({});

  const isAdmin = user?.role === CONSTANT_ADMINISTRATOR;
  const isAdminMgr = isAdminOrManager(user?.role);
  const isKasir = user?.jobName === JOB_KASIR;
  const isDokter = user?.jobName === JOB_DOKTER;
  const isVetnurse = user?.jobName === JOB_VETNURSE;
  const isParamedis = user?.jobName === JOB_PARAMEDIS;

  const status = data.detail.status?.toLowerCase() || '';
  const isRawatInap = data.detail.typeOfCare === 'Rawat Inap' || data.detail.typeOfCare === 2 || data.detail.typeOfCare === '2';
  const isFinished = ['selesai', 'dibatalkan'].includes(status);

  const fetchData = async () => {
    try {
      const resp = await getTransactionPetClinicDetail({ id, ...filterLog, ...filterLogPayment });
      const d = resp.data;
      setData({
        detail: d.detail || {},
        log: d.transactionLogs || [],
        paymentLogs: d.paymentLogs || []
      });
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  useEffect(() => { fetchData(); }, [filterLog, filterLogPayment]); // eslint-disable-line

  // ── Accept / Reject ───────────────────────────────────────────────────────
  const onConfirm = async (val, procedure) => {
    if (!val) { setDialog({ accept: false, reject: false }); return; }
    try {
      const resp = await acceptTransactionPetClinic({
        transactionId: +data.detail.id,
        status: procedure === 'accept' ? 1 : 0,
        reason: procedure === 'reject' ? val : ''
      });
      if (resp?.status === 200) {
        setDialog({ accept: false, reject: false });
        dispatch(snackbarSuccess(`Berhasil ${procedure === 'accept' ? 'menerima' : 'menolak'} pasien`));
        props.onClose(`${procedure}-patient`);
      }
    } catch (err) {
      setDialog({ accept: false, reject: false });
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Print payment log ─────────────────────────────────────────────────────
  const onPrintPaymentLog = async (row) => {
    try {
      let resp;
      if (row.type === 'DP / Pembayaran Awal') {
        resp = await getPrepaymentReceiptPetClinic(row.id);
        processDownloadPDF(resp, `dp-receipt-${row.notaNumber || row.id}`);
      } else {
        resp = await printInvoicePetClinic(row.id);
        processDownloadPDF(resp, `invoice-petclinic-${id}`);
      }
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Action buttons ────────────────────────────────────────────────────────
  const renderActions = () => {
    const btns = [];

    // Edit
    if (!isFinished && (isAdminMgr || isKasir)) {
      btns.push(
        <Button key="edit" variant="outlined" size="small" onClick={() => props.onClose('edit')}>
          <FormattedMessage id="edit" />
        </Button>
      );
    }

    // Accept patient
    if (status === 'menunggu dokter' && (isAdminMgr || isDokter)) {
      btns.push(
        <Button key="accept" variant="contained" color="success" size="small" onClick={() => setDialog({ accept: true, reject: false })}>
          <FormattedMessage id="accept-patient" />
        </Button>
      );
    }

    // Reject patient
    if (status === 'menunggu dokter' && (isAdminMgr || isDokter)) {
      btns.push(
        <Button key="reject" variant="contained" color="error" size="small" onClick={() => setDialog({ accept: false, reject: true })}>
          Tolak Pasien
        </Button>
      );
    }

    // Reassign doctor
    if (status === 'ditolak dokter' && (isAdminMgr || isKasir)) {
      btns.push(
        <Button key="reassign" variant="contained" color="warning" size="small" onClick={() => props.onClose('reassign')}>
          Reassign Dokter
        </Button>
      );
    }

    // Check pet condition
    if (status === 'cek kondisi pet' && (isAdminMgr || isDokter)) {
      btns.push(
        <Button key="check" variant="contained" color="info" size="small" onClick={() => props.onClose('check-pet-condition')}>
          Cek Kondisi Pet
        </Button>
      );
    }

    // Service & recipe
    if (status === 'input service dan obat' && (isAdminMgr || isDokter)) {
      btns.push(
        <Button key="service" variant="contained" color="primary" size="small" onClick={() => props.onClose('service-and-recipe')}>
          <FormattedMessage id="service-and-recipe" />
        </Button>
      );
    }

    // Rawat inap actions
    if (status === 'dalam perawatan') {
      if (isAdminMgr || isDokter || isVetnurse || isParamedis) {
        btns.push(
          <Button key="papan" variant="outlined" color="info" size="small" onClick={() => props.onClose('papan-kerja-harian')}>
            Papan Kerja Harian
          </Button>
        );
      }
      if (isAdminMgr || isKasir) {
        btns.push(
          <Button key="dp" variant="outlined" size="small" onClick={() => props.onClose('prepayment')}>
            Bayar DP
          </Button>
        );
      }
      if (isAdminMgr || isDokter) {
        btns.push(
          <Button key="tindakan" variant="outlined" size="small" onClick={() => props.onClose('additional-treatment')}>
            Tindakan Tambahan
          </Button>
        );
      }
      if (isAdminMgr || isKasir) {
        btns.push(
          <Button key="checkout" variant="contained" color="warning" size="small" onClick={() => props.onClose('initiate-checkout')}>
            Initiate Checkout
          </Button>
        );
      }
    }

    // Payment
    if (status === 'proses pembayaran' && (isAdminMgr || isKasir)) {
      btns.push(
        <Button key="payment" variant="contained" color="success" size="small" onClick={() => props.onClose('payment')}>
          <FormattedMessage id="payment" />
        </Button>
      );
    }

    // Delete
    if (isAdmin) {
      btns.push(
        <Button key="delete" variant="outlined" color="error" size="small" onClick={() => props.onClose('delete')}>
          <FormattedMessage id="delete" />
        </Button>
      );
    }

    return btns;
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
        {/* ── Action buttons ── */}
        {renderActions().length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            {renderActions()}
          </Stack>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, val) => setTabSelected(val)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="detail transaction pet clinic tab"
          >
            <Tab label={<FormattedMessage id="details" />} id="tab-0" aria-controls="tabpanel-0" />
            <Tab label={<FormattedMessage id="log-activity" />} id="tab-1" aria-controls="tabpanel-1" />
            <Tab label={<FormattedMessage id="log-payment" />} id="tab-2" aria-controls="tabpanel-2" />
            {isRawatInap && (
              <Tab label="Log Papan Kerja Harian" id="tab-3" aria-controls="tabpanel-3" />
            )}
            <Tab
              label="Hasil Cek Kondisi Pet"
              id={`tab-${isRawatInap ? 4 : 3}`}
              aria-controls={`tabpanel-${isRawatInap ? 4 : 3}`}
            />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          {/* ── Tab 0: Detail ── */}
          <TabPanel value={tabSelected} index={0} name="detail-transaction">
            <Stack spacing={2}>

              {/* Info Transaksi */}
              <SectionCard icon={<LocalHospitalIcon fontSize="small" color="primary" />} title="Informasi Transaksi">
                <Grid container spacing={2}>
                  <InfoRow label="No. Registrasi" value={data.detail.registrationNo} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Box>
                        <Chip
                          label={data.detail.status || '-'}
                          size="small"
                          color={STATUS_COLOR[status] || 'default'}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <InfoRow label="Lokasi" value={data.detail.locationName} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Jenis Perawatan</Typography>
                      <Box>
                        <Chip
                          label={data.detail.typeOfCare || '-'}
                          size="small"
                          color={isRawatInap ? 'info' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        {isRawatInap ? 'Periode Perawatan' : 'Tanggal Kunjungan'}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight={500}>
                            {data.detail.startDate || '-'}
                            {isRawatInap && ` → ${data.detail.endDate || '-'}`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Grid>
                  {data.detail.note && (
                    <InfoRow label="Catatan" value={data.detail.note} fullWidth />
                  )}
                  <InfoRow label="Dibuat Oleh" value={data.detail.createdBy} />
                  <InfoRow label="Dibuat Pada" value={data.detail.createdAt} />
                </Grid>
              </SectionCard>

              {/* Info Customer */}
              <SectionCard icon={<BadgeIcon fontSize="small" color="primary" />} title="Informasi Customer">
                <Grid container spacing={2}>
                  <InfoRow label="Nama Customer" value={data.detail.customerName} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Tipe Customer</Typography>
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
                        <Typography variant="caption" color="text.secondary">Grup Member</Typography>
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

              {/* Info Hewan & Medis */}
              <SectionCard icon={<PetsIcon fontSize="small" color="primary" />} title="Informasi Hewan & Medis">
                <Grid container spacing={2}>
                  <InfoRow label="Nama Hewan" value={data.detail.petName} />
                  <InfoRow label="Kategori" value={data.detail.petCategoryName} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Jenis Kelamin</Typography>
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
                      <Typography variant="caption" color="text.secondary">Status Steril</Typography>
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
                      <Typography variant="caption" color="text.secondary">Dokter Penanggung Jawab</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MedicalServicesIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>{data.detail.picDoctor || '-'}</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Info Layanan & Resep (jika sudah diisi) */}
              {(data.detail.services?.length > 0 || data.detail.recipes?.length > 0) && (
                <SectionCard icon={<ReceiptLongIcon fontSize="small" color="primary" />} title="Layanan & Resep">
                  <Stack spacing={1.5}>
                    {data.detail.services?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                          Layanan
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {data.detail.services.map((s, i) => (
                            <Chip key={i} label={`${s.serviceName} ×${s.quantity}`} size="small" variant="outlined" color="primary" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    {data.detail.recipes?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                          Resep Obat
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {data.detail.recipes.map((r, i) => (
                            <Chip key={i} label={`${r.productName} ${r.dosage}${r.unit} (${r.giveMedicine})`} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </SectionCard>
              )}

            </Stack>
          </TabPanel>

          {/* ── Tab 1: Log Activity ── */}
          <TabPanel value={tabSelected} index={1} name="detail-transaction">
            <LogActivityDetailTransaction
              data={data.log}
              onFetchData={(e) => { if (e) setFilterLog(e); }}
            />
          </TabPanel>

          {/* ── Tab 2: Log Payment ── */}
          <TabPanel value={tabSelected} index={2} name="detail-transaction">
            <LogPaymentDetailTransaction
              data={data.paymentLogs}
              onFetchData={(e) => { if (e) setFilterLogPayment(e); }}
              onPrint={onPrintPaymentLog}
            />
          </TabPanel>

          {/* ── Tab 3: Log Papan Kerja Harian (rawat inap only) ── */}
          {isRawatInap && (
            <TabPanel value={tabSelected} index={3} name="detail-transaction">
              <LogPerawatanTab
                transactionId={+id}
                fetcher={getPapanKerjaHarianPetClinic}
                emptyLabel="Belum ada log papan kerja harian untuk transaksi ini."
              />
            </TabPanel>
          )}

          {/* ── Tab 4 / 3: Hasil Cek Kondisi Pet ── */}
          <TabPanel value={tabSelected} index={isRawatInap ? 4 : 3} name="detail-transaction">
            <CheckConditionTab transactionId={+id} />
          </TabPanel>
        </Box>
      </ModalC>

      {/* ── Dialogs ── */}
      <ConfirmationC
        open={dialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-this-patient" />}
        onClose={(val) => onConfirm(val, 'accept')}
        btnTrueText="Ya, Terima"
        btnFalseText="Batal"
      />
      <FormReject
        open={dialog.reject}
        title="Konfirmasi penolakan — isi alasan penolakan"
        onSubmit={(val) => onConfirm(val, 'reject')}
        onClose={() => setDialog({ accept: false, reject: false })}
      />
    </>
  );
};

TransactionPetClinicDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TransactionPetClinicDetail;
