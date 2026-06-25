import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { PrinterOutlined } from '@ant-design/icons';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ConfirmationC from 'components/ConfirmationC';
import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';
import { CONSTANT_ADMINISTRATOR, isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import LogActivityDetailTransaction from 'pages/transaction/detail/log-activity';
import {
  confirmPaymentPetShopTransaction,
  deletePetShopTransaction,
  generateInvoicePetShopTransaction,
  getTransactionPetShopDetail,
  rejectPaymentPetShop,
  uploadPaymentProofPetShop
} from 'pages/transaction/service';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend, processDownloadPDF } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { formatThousandSeparator } from 'utils/func';
import configGlobal from '../../../../../config';

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1, sm: 1.25 },
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
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
InfoRow.propTypes = { label: PropTypes.string, value: PropTypes.any, fullWidth: PropTypes.bool };

// ── Main Component ────────────────────────────────────────────────────────────

const TransactionDetailPetShop = (props) => {
  const { id } = props.data;
  const { user } = useAuth();
  const dispatch = useDispatch();

  const isAdmin = user?.role === CONSTANT_ADMINISTRATOR;
  const isAdminMgr = isAdminOrManager(user?.role);

  const [tabSelected, setTabSelected] = useState(0);
  const [data, setData] = useState({ detail: {}, log: [] });
  const [filterLog, setFilterLog] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [uploadProofDialog, setUploadProofDialog] = useState(false);
  const [confirmPaymentDialog, setConfirmPaymentDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState({ open: false, note: '' });
  const [proofZoom, setProofZoom] = useState(false);
  const [file, setFile] = useState(null);

  const products = useMemo(() => data.detail?.products || [], [data]);

  const grandTotal = useMemo(() => products.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0), [products]);

  const fetchData = async () => {
    try {
      const resp = await getTransactionPetShopDetail({ id, ...filterLog });
      const d = resp.data;
      setData({ detail: d.detail || {}, log: d?.transactionLogs || [] });
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLog]);

  const onPrintInvoice = async () => {
    try {
      const resp = await generateInvoicePetShopTransaction(id);
      processDownloadPDF(resp, `nota-petshop-${id}`);
      dispatch(snackbarSuccess('Invoice berhasil diunduh'));
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const detail = data.detail || {};
  const verificationStatus = detail.verificationStatus;
  const isSameAsUploader = user?.id && detail.uploadedBy && user.id === detail.uploadedBy;

  const onUploadProof = async () => {
    try {
      if (!file?.[0]) {
        dispatch(snackbarError('Pilih file bukti pembayaran terlebih dahulu'));
        return;
      }
      await uploadPaymentProofPetShop({ transactionId: id, file: file[0] });
      dispatch(snackbarSuccess('Bukti pembayaran berhasil diunggah. Menunggu konfirmasi Finance/Manager.'));
      setUploadProofDialog(false);
      setFile(null);
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onConfirmPayment = async () => {
    try {
      await confirmPaymentPetShopTransaction({ transactionId: id });
      dispatch(snackbarSuccess('Konfirmasi pembayaran berhasil'));
      setConfirmPaymentDialog(false);
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onRejectPayment = async () => {
    if (!rejectDialog.note.trim()) {
      dispatch(snackbarError('Catatan penolakan wajib diisi'));
      return;
    }
    try {
      await rejectPaymentPetShop({ transactionId: id, note: rejectDialog.note });
      dispatch(snackbarSuccess('Bukti pembayaran ditolak. Staff dapat upload ulang.'));
      setRejectDialog({ open: false, note: '' });
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onDelete = async (confirmed) => {
    if (confirmed) {
      try {
        await deletePetShopTransaction([id]);
        dispatch(snackbarSuccess('Transaksi berhasil dihapus'));
        setDeleteDialog(false);
        props.onClose();
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    } else {
      setDeleteDialog(false);
    }
  };

  const proofUrl = data.detail?.proofOfPayment ? `${configGlobal.apiUrl}/storage/${data.detail.proofOfPayment}` : null;

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
        {/* ── Action Buttons ── */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
          {isAdminMgr && (
            <Button variant="outlined" size="small" onClick={() => props.onClose('edit')}>
              <FormattedMessage id="edit" />
            </Button>
          )}
          <Button variant="outlined" size="small" startIcon={<PrinterOutlined />} onClick={onPrintInvoice}>
            <FormattedMessage id="print-invoice" />
          </Button>
          {/* Upload Bukti — semua role, selama belum verified */}
          {detail.isPayed !== 2 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PaymentIcon sx={{ fontSize: 16 }} />}
              color={verificationStatus === 'pending' ? 'warning' : 'primary'}
              onClick={() => setUploadProofDialog(true)}
            >
              {verificationStatus === 'pending' ? 'Upload Ulang Bukti' : 'Upload Bukti Pembayaran'}
            </Button>
          )}
          {/* Konfirmasi — Admin/Manager, berbeda dari uploader, bukti sudah pending */}
          {isAdminMgr && verificationStatus === 'pending' && !isSameAsUploader && (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                color="success"
                onClick={() => setConfirmPaymentDialog(true)}
              >
                Konfirmasi Pembayaran
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                color="error"
                onClick={() => setRejectDialog({ open: true, note: '' })}
              >
                Tolak Bukti
              </Button>
            </>
          )}
          {isAdmin && (
            <Button variant="outlined" size="small" color="error" onClick={() => setDeleteDialog(true)}>
              <FormattedMessage id="delete" />
            </Button>
          )}
        </Stack>

        {/* ── Tabs ── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, v) => setTabSelected(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="detail petshop tabs"
          >
            <Tab label={<FormattedMessage id="details" />} id="tab-0" aria-controls="tabpanel-0" />
            <Tab label={<FormattedMessage id="log-activity" />} id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>
        </Box>

        <Box sx={{ mt: { xs: 1.5, sm: 2.5 } }}>
          {/* ── Tab 0: Detail ── */}
          <TabPanel value={tabSelected} index={0} name="detail-petshop">
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {/* Info Transaksi */}
              <SectionCard icon={<ReceiptLongIcon fontSize="small" color="primary" />} title="Informasi Transaksi">
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <InfoRow label="Dibuat Oleh" value={data.detail.createdBy} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Tanggal Transaksi
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="flex-start">
                        <EventIcon sx={{ fontSize: 14, color: 'text.secondary', mt: '3px', flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
                          {data.detail.createdAt || '-'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <InfoRow label="Customer" value={data.detail.customerName} />
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Lokasi
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="flex-start">
                        <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary', mt: '3px', flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {data.detail.locationName || '-'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  {data.detail.notes && <InfoRow label="Catatan" value={data.detail.notes} fullWidth />}
                </Grid>
              </SectionCard>

              {/* Info Pembayaran */}
              <SectionCard icon={<PaymentIcon fontSize="small" color="primary" />} title="Informasi Pembayaran">
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Metode Pembayaran
                      </Typography>
                      {data.detail.paymentMethod ? (
                        <Chip
                          label={data.detail.paymentMethod}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                        />
                      ) : (
                        <Typography variant="body2" fontWeight={500} color="text.disabled">
                          —
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Total Pembayaran
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="success.main" fontSize={15}>
                        Rp {formatThousandSeparator(grandTotal)}
                      </Typography>
                    </Stack>
                  </Grid>
                  {/* Status Verifikasi */}
                  {verificationStatus && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.secondary">
                          Status Verifikasi
                        </Typography>
                        <Chip
                          size="small"
                          label={
                            verificationStatus === 'verified'
                              ? 'Terverifikasi'
                              : verificationStatus === 'rejected'
                              ? 'Ditolak'
                              : 'Menunggu Verifikasi'
                          }
                          color={verificationStatus === 'verified' ? 'success' : verificationStatus === 'rejected' ? 'error' : 'warning'}
                          sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                        />
                        {verificationStatus === 'rejected' && detail.verificationNote && (
                          <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>
                            Alasan: {detail.verificationNote}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  )}

                  {/* Bukti Pembayaran */}
                  <Grid item xs={12}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Bukti Pembayaran
                      </Typography>
                      {proofUrl ? (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          <Box
                            component="img"
                            src={proofUrl}
                            alt="bukti-pembayaran"
                            sx={{
                              width: 120,
                              height: 160,
                              objectFit: 'cover',
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer'
                            }}
                            onClick={() => setProofZoom(true)}
                          />
                          <Tooltip title="Perbesar">
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                              }}
                              onClick={() => setProofZoom(true)}
                            >
                              <ZoomInIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 1.5,
                              border: '2px dashed',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.50'
                            }}
                          >
                            <PaymentIcon sx={{ color: 'text.disabled', fontSize: 28 }} />
                          </Box>
                          <Typography variant="caption" color="text.disabled">
                            Belum ada bukti pembayaran
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Daftar Produk */}
              <SectionCard icon={<ShoppingBagIcon fontSize="small" color="primary" />} title={`Produk & Layanan (${products.length} item)`}>
                {products.length === 0 ? (
                  <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
                    Tidak ada produk
                  </Typography>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 560 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12, width: 32 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Produk</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Kategori</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'center' }}>Qty</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'center' }}>Bonus</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'center' }}>Diskon</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'right' }}>Harga Satuan</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'right' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((p, i) => {
                          const bundleItems = p.included_items || [];
                          const isBundle = bundleItems.length > 0;
                          return (
                            <Fragment key={i}>
                              <TableRow
                                sx={{
                                  '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                                  verticalAlign: 'top'
                                }}
                              >
                                <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{i + 1}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={isBundle ? 700 : 400}>
                                    {p.item_name}
                                  </Typography>
                                  {isBundle && (
                                    <Chip
                                      label="Bundle"
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                      sx={{ mt: 0.5, height: 18, fontSize: 10 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={p.category === 'productSell' ? 'Jual' : 'Klinik'}
                                    size="small"
                                    color={p.category === 'productSell' ? 'info' : 'warning'}
                                    variant="outlined"
                                    sx={{ fontSize: 11, height: 20 }}
                                  />
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center', fontSize: 12 }}>{p.quantity ?? 0}</TableCell>
                                <TableCell sx={{ textAlign: 'center', fontSize: 12 }}>
                                  {+p.bonus > 0 ? (
                                    <Chip
                                      label={`+${p.bonus}`}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      sx={{ fontSize: 11, height: 18 }}
                                    />
                                  ) : (
                                    <Typography variant="caption" color="text.disabled">
                                      —
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center', fontSize: 12 }}>
                                  {+p.discount > 0 ? (
                                    <Chip
                                      label={`${p.discount}%`}
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      sx={{ fontSize: 11, height: 18 }}
                                    />
                                  ) : (
                                    <Typography variant="caption" color="text.disabled">
                                      —
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right', fontSize: 12, whiteSpace: 'nowrap' }}>
                                  Rp {formatThousandSeparator(p.unit_price || p.total || 0)}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                                  Rp {formatThousandSeparator(p.total || 0)}
                                </TableCell>
                              </TableRow>

                              {/* Bundle sub-items */}
                              {isBundle &&
                                bundleItems.map((bi, j) => (
                                  <TableRow key={`${i}-bi-${j}`} sx={{ bgcolor: 'secondary.lighter' }}>
                                    <TableCell />
                                    <TableCell colSpan={5}>
                                      <Stack direction="row" spacing={0.75} alignItems="center">
                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0 }} />
                                        <Typography variant="caption" color="text.secondary">
                                          {bi.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">
                                          (normal Rp {formatThousandSeparator(bi.normal_price)})
                                        </Typography>
                                      </Stack>
                                    </TableCell>
                                    <TableCell />
                                    <TableCell />
                                  </TableRow>
                                ))}
                            </Fragment>
                          );
                        })}

                        {/* Grand Total row */}
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            sx={{ textAlign: 'right', fontWeight: 700, pt: 1.5, borderTop: '2px solid', borderColor: 'divider' }}
                          >
                            Grand Total
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: 'right',
                              fontWeight: 800,
                              fontSize: 13,
                              color: 'success.main',
                              pt: 1.5,
                              borderTop: '2px solid',
                              borderColor: 'divider',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Rp {formatThousandSeparator(grandTotal)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </SectionCard>
            </Stack>
          </TabPanel>

          {/* ── Tab 1: Log Activity ── */}
          <TabPanel value={tabSelected} index={1} name="detail-petshop">
            <LogActivityDetailTransaction
              data={data.log}
              onFetchData={(e) => {
                if (e) setFilterLog(e);
              }}
            />
          </TabPanel>
        </Box>
      </ModalC>

      {/* ── Zoom Proof of Payment ── */}
      <Dialog open={proofZoom} onClose={() => setProofZoom(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography variant="subtitle2" mb={1} textAlign="left">
            Bukti Pembayaran
          </Typography>
          {proofUrl && (
            <Box
              component="img"
              src={proofUrl}
              alt="bukti-pembayaran"
              sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 1, objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Upload Bukti Modal (Step 1: Staff) ── */}
      <ModalC
        title="Upload Bukti Pembayaran"
        open={uploadProofDialog}
        onOk={onUploadProof}
        onCancel={() => {
          setUploadProofDialog(false);
          setFile(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Upload bukti transfer/pembayaran. Setelah diupload, Finance atau Manager akan memverifikasi.
          </Typography>
          <SingleFileUpload file={file} setFieldValue={(_, value) => setFile(value)} />
        </Stack>
      </ModalC>

      {/* ── Konfirmasi Pembayaran Modal (Step 2: Finance/Manager) ── */}
      <ConfirmationC
        open={confirmPaymentDialog}
        title="Konfirmasi Pembayaran"
        content="Anda yakin ingin mengkonfirmasi pembayaran ini? Pastikan Anda telah memeriksa bukti transfer."
        onClose={(confirmed) => {
          if (confirmed) onConfirmPayment();
          else setConfirmPaymentDialog(false);
        }}
        btnTrueText="Konfirmasi"
        btnFalseText="Batal"
      />

      {/* ── Tolak Bukti Modal ── */}
      <ModalC
        title="Tolak Bukti Pembayaran"
        open={rejectDialog.open}
        onOk={onRejectPayment}
        onCancel={() => setRejectDialog({ open: false, note: '' })}
        fullWidth
        maxWidth="sm"
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Berikan alasan penolakan. Staff akan diminta upload ulang bukti yang benar.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Catatan Penolakan"
            value={rejectDialog.note}
            onChange={(e) => setRejectDialog((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Contoh: Bukti transfer tidak terbaca, nominal tidak sesuai, dll."
          />
        </Stack>
      </ModalC>

      {/* ── Delete Confirm ── */}
      <ConfirmationC
        open={deleteDialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={onDelete}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

TransactionDetailPetShop.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TransactionDetailPetShop;
