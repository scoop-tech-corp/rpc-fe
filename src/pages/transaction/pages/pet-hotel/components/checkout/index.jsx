import { AttachFile, DeleteOutline } from '@mui/icons-material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getPaymentMethodList } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import {
  addAdditionalTreatment,
  checkPromoTransactionPetHotel,
  checkoutPayment,
  deleteAdditionalTreatment,
  getAdditionalTreatments,
  getAvailableItems,
  getCheckoutInvoice,
  getCheckoutSummary
} from '../../service';
import { processDownloadPDF } from 'service/service-global';
import PromoOfferTransactionPetHotel from '../payment/promo-offer';

// ── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Ringkasan Tagihan', 'Tambah Item & Promo', 'Pembayaran'];

const ITEM_TABS = [
  { value: 'service', label: 'Layanan Hotel' },
  { value: 'clinic',  label: 'Layanan Klinik' },
  { value: 'petshop', label: 'Pet Shop' },
  { value: 'petsell', label: 'Pet Sell' }
];

const TYPE_LABEL = {
  service: 'Layanan Hotel', clinic: 'Layanan Klinik',
  petshop: 'Pet Shop', petsell: 'Pet Sell', product: 'Produk'
};

const TYPE_COLOR = {
  service: 'primary', clinic: 'secondary',
  petshop: 'success', petsell: 'warning', product: 'default'
};

const fmt = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val ?? 0);

// ── Sub-components ────────────────────────────────────────────────────────────

const SummaryRow = ({ label, value, isBold, isNegative, isTotal }) => (
  <TableRow>
    <TableCell sx={{ pl: isTotal ? 0 : 2, fontWeight: isBold || isTotal ? 'bold' : 'normal', fontSize: isTotal ? '1rem' : undefined, borderBottom: isTotal ? 2 : undefined }}>
      {label}
    </TableCell>
    <TableCell align="right" sx={{ fontWeight: isBold || isTotal ? 'bold' : 'normal', color: isNegative ? 'success.main' : isTotal ? 'primary.main' : undefined, fontSize: isTotal ? '1rem' : undefined, borderBottom: isTotal ? 2 : undefined }}>
      {isNegative ? `- ${fmt(value)}` : fmt(value)}
    </TableCell>
  </TableRow>
);
SummaryRow.propTypes = { label: PropTypes.string, value: PropTypes.number, isBold: PropTypes.bool, isNegative: PropTypes.bool, isTotal: PropTypes.bool };

// ── Main Component ────────────────────────────────────────────────────────────

const CheckOut = (props) => {
  const { data } = props;
  const dispatch = useDispatch();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payment, setPayment] = useState({ paymentMethodId: '', amountPaid: '', note: '', proof: null, proofName: '' });
  const [submitting, setSubmitting] = useState(false);
  const proofRef = useRef(null);

  // Step 1: Item tambahan
  const [itemTab, setItemTab] = useState('service');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState('');
  const [addedItems, setAddedItems] = useState([]);
  const [addingItem, setAddingItem] = useState(false);

  // Step 1: Promo
  const [promoDialog, setPromoDialog] = useState({ open: false, data: null });
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoApplied, setPromoApplied] = useState(null);

  const searchTimer = useRef(null);

  // ── Fetch summary ──────────────────────────────────────────────────────────
  const fetchSummary = useCallback(() => {
    getCheckoutSummary(data.transactionId)
      .then((resp) => {
        if (resp?.data) {
          setSummary(resp.data);
          // amountPaid = grandTotal dikurangi diskon promo yang sudah diterapkan
          setPromoApplied((promo) => {
            const promoDiscount = promo?.totalDiscount ?? 0;
            const effectiveTotal = Math.max(0, resp.data.checkout.grandTotal - promoDiscount);
            setPayment((p) => ({ ...p, amountPaid: effectiveTotal }));
            return promo;
          });
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  }, [data.transactionId, dispatch]);

  const fetchAddedItems = useCallback(() => {
    getAdditionalTreatments(data.transactionId)
      .then((resp) => setAddedItems(resp?.data ?? []))
      .catch(() => {});
  }, [data.transactionId]);

  useEffect(() => {
    fetchSummary();
    fetchAddedItems();
    getPaymentMethodList()
      .then((list) => { if (list?.length) setPaymentMethods(list); })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search items ───────────────────────────────────────────────────────────
  useEffect(() => {
    setSearchResults([]);
    setSelectedItem(null);
    if (!searchText.trim()) return;

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearching(true);
      getAvailableItems(data.transactionId, itemTab, searchText)
        .then((resp) => setSearchResults(resp?.data ?? []))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 400);

    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, itemTab]);

  const onTabChange = (_, val) => {
    setItemTab(val);
    setSearchText('');
    setSearchResults([]);
    setSelectedItem(null);
  };

  // ── Add item ───────────────────────────────────────────────────────────────
  const onAddItem = async () => {
    if (!selectedItem || qty < 1) return;
    setAddingItem(true);
    await addAdditionalTreatment({
      transactionId: data.transactionId,
      type: itemTab,
      itemId: selectedItem.id,
      quantity: qty,
      catatan
    })
      .then((resp) => {
        if (resp?.status === 201 || resp?.status === 200) {
          dispatch(snackbarSuccess(`${selectedItem.name} berhasil ditambahkan`));
          setSelectedItem(null);
          setSearchText('');
          setSearchResults([]);
          setQty(1);
          setCatatan('');
          fetchAddedItems();
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setAddingItem(false));
  };

  // ── Delete item ────────────────────────────────────────────────────────────
  const onDeleteItem = async (id) => {
    await deleteAdditionalTreatment(id)
      .then(() => {
        dispatch(snackbarSuccess('Item dihapus'));
        fetchAddedItems();
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  // ── Promo ──────────────────────────────────────────────────────────────────
  const onCheckPromo = async () => {
    setPromoChecking(true);

    // Helper: build service item dengan key yang dibutuhkan backend
    const toServiceItem = (serviceId, name, quantity, unitPrice) => ({
      serviceId,
      name,
      quantity: +quantity,
      eachPrice: +unitPrice,
      priceOverall: +unitPrice * +quantity
    });

    // Helper: build product item dengan key yang dibutuhkan backend
    const toProductItem = (productId, name, quantity, unitPrice) => ({
      productId,
      name,
      quantity: +quantity,
      eachPrice: +unitPrice,
      priceOverall: +unitPrice * +quantity
    });

    // Service dari treatment awal
    const initialServices = (summary?.services ?? []).map((s) => {
      const unitPrice = +String(s.price ?? 0).replace(/,/g, '');
      return toServiceItem(s.serviceId, s.name, s.quantity, unitPrice);
    });

    // Produk dari treatment awal
    const initialProducts = (summary?.products ?? []).map((p) => {
      const unitPrice = +String(p.price ?? 0).replace(/,/g, '');
      return toProductItem(p.productId, p.name, p.quantity, unitPrice);
    });

    // Item tambahan — service & clinic
    const additionalServices = addedItems.filter((i) => ['service', 'clinic'].includes(i.type))
      .map((i) => toServiceItem(i.itemId, i.itemName, i.quantity, i.price));

    // Item tambahan — product, petshop, petsell
    const additionalProducts = addedItems.filter((i) => ['product', 'petshop', 'petsell'].includes(i.type))
      .map((i) => toProductItem(i.itemId, i.itemName, i.quantity, i.price));

    const items    = [...initialServices, ...additionalServices];
    const products = [...initialProducts, ...additionalProducts];

    await checkPromoTransactionPetHotel({
      transactionPetHotelId: data.transactionId,
      services: items,
      products
    })
      .then((resp) => {
        const promoData = resp?.data;
        const hasPromo = promoData &&
          ([...(promoData.freeItems || []), ...(promoData.discounts || []),
            ...(promoData.bundles || [])].length > 0 || promoData.basedSales);

        if (!hasPromo) {
          dispatch(snackbarSuccess('Tidak ada promo yang tersedia saat ini'));
        } else {
          setPromoDialog({ open: true, data: { ...promoData, transactionPetHotelId: data.transactionId, services: items, products } });
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setPromoChecking(false));
  };


  // ── Payment ────────────────────────────────────────────────────────────────
  const onPay = async () => {
    if (!payment.paymentMethodId || !payment.amountPaid) return;
    setSubmitting(true);
    await checkoutPayment({
      transactionId:   data.transactionId,
      paymentMethodId: payment.paymentMethodId,
      amountPaid:      payment.amountPaid,
      note:            payment.note,
      proof:           payment.proof,
    })
      .then(async (resp) => {
        if (resp?.status === 201 || resp?.status === 200) {
          dispatch(snackbarSuccess('Pembayaran check-out berhasil dicatat'));
          // Download invoice otomatis
          try {
            const invoiceResp = await getCheckoutInvoice(data.transactionId);
            processDownloadPDF(invoiceResp, `Invoice_PetHotel_${data.transactionId}`);
          } catch {
            // invoice gagal tidak harus block close
          }
          props.onClose(true);
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  const onProofChange = (e) => {
    const file = e.target.files[0];
    if (file) setPayment((p) => ({ ...p, proof: file, proofName: file.name }));
  };

  const onRemoveProof = () => {
    setPayment((p) => ({ ...p, proof: null, proofName: '' }));
    if (proofRef.current) proofRef.current.value = '';
  };

  // ── Navigate between steps ─────────────────────────────────────────────────
  const goToStep = (s) => {
    if (s === 0 || s === 2) fetchSummary(); // refresh summary saat kembali/lanjut ke payment
    setStep(s);
  };

  if (!summary) {
    return (
      <ModalC title="Check-Out" open={props.open} onCancel={() => props.onClose(false)} isModalAction={false} maxWidth="sm" fullWidth>
        <Typography color="text.secondary" align="center" py={4}>Memuat data...</Typography>
      </ModalC>
    );
  }

  const co = summary.checkout;

  return (
    <>
      <ModalC
        title="Proses Check-Out"
        open={props.open}
        onCancel={() => props.onClose(false)}
        isModalAction={false}
        fullWidth
        maxWidth="lg"
      >
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {/* ══════════════ STEP 0: SUMMARY ══════════════ */}
        {step === 0 && (
          <Stack spacing={2.5}>
            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Kandang: <strong>{summary.cageName}</strong> &nbsp;|&nbsp;
                Tanggal Check-Out: <strong>{co.checkoutDate}</strong> &nbsp;|&nbsp;
                Lama Menginap: <strong>{co.daysStayed} hari</strong>
              </Typography>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableBody>
                  {/* Masa menginap */}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter', pt: 1.5 }}>
                      Masa Menginap
                    </TableCell>
                  </TableRow>
                  <SummaryRow label={`${summary.stayServiceName} — ${co.daysStayed} hari × ${fmt(co.pricePerDay)}`} value={co.subtotalStay} />

                  {/* Treatment awal */}
                  {(summary.services?.length > 0 || summary.products?.length > 0) && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter', pt: 1.5 }}>
                          Treatment Awal
                        </TableCell>
                      </TableRow>
                      {summary.services.map((s, i) => <SummaryRow key={`s${i}`} label={`${s.name} × ${s.quantity}`} value={s.total} />)}
                      {summary.products.map((p, i) => <SummaryRow key={`p${i}`} label={`${p.name} × ${p.quantity}`} value={p.total} />)}
                    </>
                  )}

                  {/* Treatment tambahan & item checkout */}
                  {summary.additional?.length > 0 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter', pt: 1.5 }}>
                          Treatment Tambahan & Item Pembelian
                        </TableCell>
                      </TableRow>
                      {summary.additional.map((a, i) => (
                        <TableRow key={`a${i}`}>
                          <TableCell sx={{ pl: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <span>{a.name} × {a.quantity}</span>
                              <Chip label={TYPE_LABEL[a.type] ?? a.type} size="small" color={TYPE_COLOR[a.type] ?? 'default'} variant="outlined" />
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{fmt(a.total)}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}

                  {/* Subtotal */}
                  <SummaryRow label="Subtotal" value={co.subtotalBeforeDiscount} isBold />

                  {/* DP */}
                  {co.totalPrepaid > 0 && <SummaryRow label="DP / Pembayaran Awal" value={co.totalPrepaid} isNegative />}


                  {/* Promo */}
                  {promoApplied && (
                    <TableRow>
                      <TableCell sx={{ pl: 2, color: 'success.main' }}>🎁 Promo diterapkan</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>- {fmt(promoApplied.totalDiscount ?? 0)}</TableCell>
                    </TableRow>
                  )}

                  <Divider component="tr" />
                  <SummaryRow label="TOTAL TAGIHAN" value={co.grandTotal} isTotal />
                </TableBody>
              </Table>
            </TableContainer>

            {/* Riwayat DP */}
            {summary.prepayments?.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">Riwayat DP:</Typography>
                <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                  {summary.prepayments.map((p, i) => (
                    <Chip key={i} size="small" label={`${p.paymentMethod} — ${fmt(p.amount)} (${p.recordedAt})`} />
                  ))}
                </Stack>
              </Box>
            )}

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => goToStep(1)}>
                Tambah Item & Cek Promo →
              </Button>
            </Stack>
          </Stack>
        )}

        {/* ══════════════ STEP 1: TAMBAH ITEM & PROMO ══════════════ */}
        {step === 1 && (
          <Stack spacing={2.5}>

            {/* ── Item search ── */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>Tambah Item Pembelian</Typography>

              <Tabs value={itemTab} onChange={onTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                {ITEM_TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
              </Tabs>

              {/* Search field */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                <TextField
                  size="small"
                  placeholder={`Cari ${ITEM_TABS.find((t) => t.value === itemTab)?.label}...`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">
                      {searching ? <CircularProgress size={14} /> : <SearchIcon fontSize="small" />}
                    </InputAdornment>
                  }}
                />
                <TextField size="small" label="Qty" type="number" value={qty}
                  onChange={(e) => setQty(Math.max(1, +e.target.value))}
                  inputProps={{ min: 1 }} sx={{ width: 80 }} />
                <TextField size="small" label="Catatan (opsional)" value={catatan}
                  onChange={(e) => setCatatan(e.target.value)} sx={{ flex: 1 }} />
                <Button variant="contained" onClick={onAddItem}
                  disabled={!selectedItem || qty < 1 || addingItem}>
                  {addingItem ? '...' : 'Tambah'}
                </Button>
              </Stack>

              {/* Search results */}
              {searchResults.length > 0 && !selectedItem && (
                <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflowY: 'auto' }}>
                  {searchResults.map((item) => (
                    <Box
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setSearchText(item.name); setSearchResults([]); }}
                      sx={{ px: 2, py: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{item.name}</Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="bold">{fmt(item.price)}</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Paper>
              )}

              {selectedItem && (
                <Alert severity="info" sx={{ mt: 1 }} onClose={() => { setSelectedItem(null); setSearchText(''); }}>
                  Dipilih: <strong>{selectedItem.name}</strong> — {fmt(selectedItem.price)} × {qty} = {fmt(selectedItem.price * qty)}
                </Alert>
              )}
            </Paper>

            {/* ── Daftar item yang sudah ditambah ── */}
            {addedItems.length > 0 && (
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Item Ditambahkan ({addedItems.length} item)
                  </Typography>
                </Box>
                <Divider />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                        <TableCell>Item</TableCell>
                        <TableCell>Kategori</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Harga</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Hapus</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {addedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="body2">{item.itemName}</Typography>
                            {item.catatan && <Typography variant="caption" color="text.secondary">{item.catatan}</Typography>}
                          </TableCell>
                          <TableCell>
                            <Chip label={TYPE_LABEL[item.type] ?? item.type} size="small"
                              color={TYPE_COLOR[item.type] ?? 'default'} variant="outlined" />
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{fmt(item.price)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{fmt(item.total)}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => onDeleteItem(item.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>Total Item</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {fmt(addedItems.reduce((s, i) => s + i.total, 0))}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* ── Cek Promo ── */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">🎁 Cek Promo Tersedia</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Periksa promo berdasarkan item yang dipilih
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={promoChecking ? <CircularProgress size={14} /> : <LocalOfferIcon />}
                  onClick={onCheckPromo}
                  disabled={promoChecking}
                >
                  {promoChecking ? 'Memeriksa...' : 'Cek Promo'}
                </Button>
              </Stack>

              {promoApplied && (
                <Alert severity="success" sx={{ mt: 1.5 }}>
                  Promo berhasil diterapkan! Total diskon: <strong>{fmt(promoApplied.totalDiscount)}</strong>
                </Alert>
              )}
            </Paper>

            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Button variant="outlined" onClick={() => goToStep(0)}>← Kembali ke Ringkasan</Button>
              <Button variant="contained" onClick={() => goToStep(2)}>Lanjut ke Pembayaran →</Button>
            </Stack>
          </Stack>
        )}

        {/* ══════════════ STEP 2: PAYMENT ══════════════ */}
        {step === 2 && (
          <Stack spacing={2.5}>
            {(() => {
              const promoDiscount = promoApplied?.totalDiscount ?? 0;
              const effectiveTotal = Math.max(0, co.grandTotal - promoDiscount);
              return (
                <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                  <Typography variant="h6" align="center">
                    Total: <strong>{fmt(effectiveTotal)}</strong>
                  </Typography>
                  {promoDiscount > 0 && (
                    <Typography variant="caption" color="success.main" display="block" align="center">
                      Sudah termasuk diskon promo {fmt(promoDiscount)}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" align="center">
                    {addedItems.length > 0 && `Termasuk ${addedItems.length} item tambahan`}
                  </Typography>
                </Box>
              );
            })()}

            <TextField select label="Metode Pembayaran" value={payment.paymentMethodId}
              onChange={(e) => setPayment((p) => ({ ...p, paymentMethodId: e.target.value }))}
              size="small" fullWidth>
              {paymentMethods.map((pm) => (
                <MenuItem key={pm.value} value={pm.value}>{pm.label}</MenuItem>
              ))}
            </TextField>

            <TextField label="Jumlah Dibayar (Rp)" type="number" value={payment.amountPaid}
              size="small" fullWidth disabled
              InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }} />

            <TextField
              label="Catatan (opsional)"
              value={payment.note}
              onChange={(e) => setPayment((p) => ({ ...p, note: e.target.value }))}
              size="small" fullWidth multiline rows={2}
            />

            {/* Upload bukti pembayaran */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <input
                ref={proofRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={onProofChange}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<AttachFile fontSize="small" />}
                onClick={() => proofRef.current?.click()}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Upload Bukti Bayar
              </Button>

              {payment.proofName ? (
                <Stack direction="row" alignItems="center" spacing={0.5}
                  sx={{ px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 1, maxWidth: 240 }}
                >
                  <Typography variant="caption" noWrap sx={{ flex: 1, color: 'text.secondary' }}>
                    {payment.proofName}
                  </Typography>
                  <IconButton size="small" onClick={onRemoveProof} sx={{ p: 0.25 }}>
                    <DeleteOutline fontSize="small" color="error" />
                  </IconButton>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.disabled" fontStyle="italic">
                  Belum ada file dipilih
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Button variant="outlined" onClick={() => setStep(1)}>← Kembali</Button>
              <Button variant="contained" color="success" onClick={onPay}
                disabled={!payment.paymentMethodId || !payment.amountPaid || submitting}>
                {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
              </Button>
            </Stack>
          </Stack>
        )}
      </ModalC>

      {/* Promo Dialog */}
      {promoDialog.open && promoDialog.data && (
        <PromoOfferTransactionPetHotel
          open={promoDialog.open}
          data={promoDialog.data}
          onClose={(result) => {
            setPromoDialog({ open: false, data: null });
            if (result && result !== false) {
              // Normalize snake_case → camelCase agar konsisten di FE
              const normalized = {
                ...result,
                totalDiscount:      result.total_discount      ?? result.totalDiscount      ?? 0,
                discountBasedSales: result.discount_based_sales ?? result.discountBasedSales ?? 0,
                totalPayment:       result.total_payment        ?? result.totalPayment        ?? 0,
              };
              setPromoApplied(normalized);
              // Update amountPaid agar langsung mencerminkan harga setelah diskon promo
              setSummary((s) => {
                if (!s?.checkout) return s;
                const effectiveTotal = Math.max(0, s.checkout.grandTotal - (normalized.totalDiscount ?? 0));
                setPayment((p) => ({ ...p, amountPaid: effectiveTotal }));
                return s;
              });
              fetchSummary();
              dispatch(snackbarSuccess('Promo berhasil diterapkan'));
            }
          }}
        />
      )}
    </>
  );
};

CheckOut.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default CheckOut;
