import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  checkPromoTransactionPetClinic,
  createPaymentPetClinicOutpatient,
  getActiveTodayPromos,
  getBeforePayment,
  printInvoicePetClinicOutpatient,
  uploadProofOfPayment
} from '../../service';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { createMessageBackend, getServiceListByLocation, processDownloadPDF } from 'service/service-global';
import { getProductSellDropdown } from 'pages/product/product-list/service';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import SummaryTable from './summary-table';
import PromoOfferTransactionPetClinic from './promo-offer';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
    <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
    </Box>
    <Divider />
    <Box sx={{ px: 2, py: 2 }}>{children}</Box>
  </Paper>
);
SectionCard.propTypes = { icon: PropTypes.node, title: PropTypes.string, children: PropTypes.node };

const InfoField = ({ label, value }) => (
  <Grid item xs={12} sm={4}>
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Stack>
  </Grid>
);
InfoField.propTypes = { label: PropTypes.string, value: PropTypes.any };

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);
TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

const PROMO_TYPE_CONFIG = {
  'Free Item':   { color: 'success', label: 'Free Item' },
  'Discount':    { color: 'error',   label: 'Diskon' },
  'Bundle':      { color: 'warning', label: 'Bundle' },
  'Based Sales': { color: 'info',    label: 'Based Sales' },
};

const PromoTypeBadge = ({ type }) => {
  const cfg = PROMO_TYPE_CONFIG[type] || { color: 'default', label: type };
  return <Chip label={cfg.label} size="small" color={cfg.color} variant="filled" sx={{ fontWeight: 600, fontSize: 10 }} />;
};
PromoTypeBadge.propTypes = { type: PropTypes.string };

// ── Main Component ─────────────────────────────────────────────────────────────

const Payment = (props) => {
  const { data } = props;
  const [formValue, setFormValue] = useState({
    customerName: '',
    phoneNumber: '',
    arrivalTime: '',
    productSell: null,
    unitPriceProductSell: '',
    quantityProductSell: '',
    service: null,
    unitPriceService: '',
    quantityService: '',
    notes: '',
    unitPriceServiceErr: '',
    unitPriceProductSellErr: '',
    quantityProductSellErr: '',
    productSellDropdownList: [],
    serviceDropdownList: [],
    recipeList: [],
    serviceList: [],
    productList: [],
    summaryList: [],
    summarySubtotal: 0,
    summaryDiscountNote: '',
    summaryTotalDiscount: 0,
    summaryTotalPayment: 0,
    summaryPromoNotes: [],
    promoBasedSaleId: '',
    discountBasedSales: 0,
    paymentMethod: '',
    dpNominal: '',
    dpNominalErr: '',
    dpNextPayment: null,
    installmentDuration: '',
    installmentTenor: '',
    installmentDp: ''
  });
  const [disabledOke, setDisabledOk] = useState(false);
  const [promoOfferDialog, setPromoOfferDialog] = useState({ isOpen: false, data: {} });
  const [tabActive, setTabActive] = useState(0);
  const [todayPromos, setTodayPromos] = useState([]);
  const [todayPromosLoading, setTodayPromosLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);   // File object
  const [proofPreview, setProofPreview] = useState(null);   // URL string (image) atau null (pdf)
  const fileInputRef = useRef(null);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const errorMessageUnitPriceExceedBasePrice = intl.formatMessage({ id: 'unit-price-mus-not-exceed-base-price' });

  // ── Data Fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setTodayPromosLoading(true);
      Promise.all([
        getBeforePayment(data.transactionId),
        getServiceListByLocation([data.locationId]),
        getProductSellDropdown(data.locationId),
        getActiveTodayPromos(data.locationId)
      ]).then(([respBeforePayment, respService, respProductSell, respPromos]) => {
        setTodayPromos(respPromos.data || []);
        setTodayPromosLoading(false);
        const beforePaymentData = respBeforePayment.data;
        const { recipes, services } = beforePaymentData.data;
        const customerName = beforePaymentData.customerName;
        const phoneNumber = beforePaymentData.phoneNumber;
        const arrivalTime = beforePaymentData.arrivalTime;

        const new_recipes = (recipes || []).map((dt) => ({
          ...dt,
          productId: +dt.productId,
          unitPrice: '',
          totalPrice: '',
          unitPriceErr: ''
        }));
        const new_services = (services || []).map((dt) => ({
          ...dt,
          serviceId: +dt.serviceId,
          basedPrice: +String(dt.basedPrice ?? 0).replace(/,/g, ''),
          unitPrice: '',
          totalPrice: '',
          unitPriceErr: ''
        }));

        const new_service_dropdown_list = [...respService].map((dt) => ({
          ...dt,
          label: `${dt.label} - ${dt.price}`,
          name: dt.label
        }));
        const new_product_sell_list = [...respProductSell].map((dt) => ({
          ...dt,
          label: `${dt.label} - ${dt.data.price}`
        }));

        setFormValue((prevState) => ({
          ...prevState,
          customerName,
          phoneNumber,
          arrivalTime,
          recipeList: new_recipes,
          serviceList: new_services,
          serviceDropdownList: new_service_dropdown_list,
          productSellDropdownList: new_product_sell_list
        }));
      }).catch(() => setTodayPromosLoading(false));
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const findRecipeErr = formValue.recipeList.find((dt) => dt.unitPriceErr);
    const findServiceErr = formValue.serviceList.find((dt) => dt.unitPriceErr);
    if (findRecipeErr || findServiceErr || formValue.dpNominalErr) setDisabledOk(true);
    else setDisabledOk(false);
  }, [formValue]);

  // ── Table columns ─────────────────────────────────────────────────────────
  const columnsRecipe = useMemo(
    () => [
      { Header: 'No', accessor: 'no', isNotSorting: true, Cell: (d) => d.row.index + 1 },
      { Header: <FormattedMessage id="product" />, accessor: 'productName', isNotSorting: true },
      { Header: <FormattedMessage id="dosage" />, accessor: 'dosage', isNotSorting: true },
      { Header: <FormattedMessage id="unit" />, accessor: 'unit', isNotSorting: true },
      { Header: <FormattedMessage id="frequency" />, accessor: 'frequency', isNotSorting: true },
      { Header: <FormattedMessage id="duration" />, accessor: 'duration', isNotSorting: true },
      { Header: <FormattedMessage id="medication" />, accessor: 'giveMedicine', isNotSorting: true },
      { Header: <FormattedMessage id="notes" />, accessor: 'notes', isNotSorting: true },
      { Header: <FormattedMessage id="based-price" />, accessor: 'basedPrice', isNotSorting: true },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unitPrice',
        isNotSorting: true,
        Cell: (d) => {
          const rowIndex = d.row.index;
          const rowUnitPriceErr = d.row.original.unitPriceErr;
          return (
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
              value={d.row.original.unitPrice || ''}
              onChange={(e) => {
                const unitPriceValue = +e.target.value;
                const basedPrice = +d.row.original.basedPrice;
                const recipeTotalPrice = +d.row.original.dosage * +d.row.original.frequency * +d.row.original.duration * unitPriceValue;
                setFormValue((prev) => {
                  const list = [...prev.recipeList];
                  list[rowIndex] = {
                    ...list[rowIndex],
                    unitPrice: unitPriceValue,
                    totalPrice: recipeTotalPrice,
                    unitPriceErr: unitPriceValue > basedPrice ? errorMessageUnitPriceExceedBasePrice : ''
                  };
                  return { ...prev, recipeList: list };
                });
              }}
              error={Boolean(rowUnitPriceErr)}
              helperText={rowUnitPriceErr}
            />
          );
        }
      },
      { Header: <FormattedMessage id="total-price" />, accessor: 'totalPrice', isNotSorting: true }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl]
  );

  const columnsService = useMemo(
    () => [
      { Header: 'No', accessor: 'no', isNotSorting: true, Cell: (d) => d.row.index + 1 },
      { Header: <FormattedMessage id="service-name" />, accessor: 'serviceName', isNotSorting: true },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="based-price" />, accessor: 'basedPrice', isNotSorting: true },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unitPrice',
        isNotSorting: true,
        Cell: (d) => {
          const rowIndex = d.row.index;
          const rowUnitPriceErr = d.row.original.unitPriceErr;
          return (
            <TextField
              fullWidth
              size="small"
              type="number"
              value={d.row.original.unitPrice || ''}
              onChange={(e) => {
                const unitPriceValue = +e.target.value;
                const basedPrice = +d.row.original.basedPrice;
                setFormValue((prev) => {
                  const list = [...prev.serviceList];
                  list[rowIndex] = {
                    ...list[rowIndex],
                    unitPrice: unitPriceValue,
                    totalPrice: unitPriceValue * +d.row.original.quantity,
                    unitPriceErr: unitPriceValue > basedPrice ? errorMessageUnitPriceExceedBasePrice : ''
                  };
                  return { ...prev, serviceList: list };
                });
              }}
              error={Boolean(rowUnitPriceErr)}
              helperText={rowUnitPriceErr}
            />
          );
        }
      },
      { Header: <FormattedMessage id="total-price" />, accessor: 'totalPrice', isNotSorting: true }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const columnProduct = useMemo(
    () => [
      { Header: 'No', accessor: 'no', isNotSorting: true, Cell: (d) => d.row.index + 1 },
      { Header: <FormattedMessage id="product-name" />, accessor: 'productName', isNotSorting: true },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="unit-price" />, accessor: 'unitPrice', isNotSorting: true },
      { Header: <FormattedMessage id="total-price" />, accessor: 'totalPrice', isNotSorting: true },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (d) => (
          <IconButton size="medium" variant="contained" color="error" onClick={() => onDeleteRowHandler('productList', d.row.index)}>
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const onFieldHandler = (e) => setFormValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onAddService = () => {
    setFormValue((prev) => ({
      ...prev,
      service: null,
      unitPriceService: '',
      quantityService: '',
      serviceList: [
        ...prev.serviceList,
        {
          serviceId: prev.service?.value,
          serviceName: prev.service?.name,
          quantity: prev.quantityService,
          basedPrice: prev.service?.price,
          unitPrice: prev.unitPriceService,
          totalPrice: prev.quantityService * prev.unitPriceService
        }
      ]
    }));
  };

  const onDisabledService = () =>
    Boolean(!formValue.service || !formValue.unitPriceService || !formValue.quantityService || formValue.unitPriceServiceErr);

  const onAddProductSell = () => {
    setFormValue((prev) => ({
      ...prev,
      productSell: null,
      unitPriceProductSell: '',
      quantityProductSell: '',
      productList: [
        ...prev.productList,
        {
          productId: prev.productSell.value,
          productName: prev.productSell?.data.fullName,
          quantity: +prev.quantityProductSell,
          basedPrice: +prev.productSell?.data.price,
          unitPrice: +prev.unitPriceProductSell,
          totalPrice: +prev.quantityProductSell * +prev.unitPriceProductSell
        }
      ]
    }));
  };

  const onDisabledProductSell = () =>
    Boolean(!formValue.productSell || !formValue.unitPriceProductSell || !formValue.quantityProductSell ||
      formValue.unitPriceProductSellErr || formValue.quantityProductSellErr);

  const onDeleteRowHandler = (procedure, rowIndex) => {
    setFormValue((prev) => {
      const list = [...prev[procedure]];
      list.splice(rowIndex, 1);
      return { ...prev, [procedure]: list };
    });
  };

  const minimumDownPaymentNominal = () => (20 / 100) * formValue.summaryTotalPayment;

  const onCheckPromo = async () => {
    const recipes = formValue.recipeList.map((dt) => ({
      productId: +dt.productId,
      dosage: +dt.dosage,
      unit: dt.unit,
      frequency: +dt.frequency,
      duration: +dt.duration,
      giveMedicine: dt.giveMedicine,
      notes: dt.notes,
      eachPrice: +dt.unitPrice,
      priceOverall: +dt.totalPrice
    }));
    const services = formValue.serviceList.map((dt) => ({
      serviceId: +dt.serviceId,
      quantity: +dt.quantity,
      eachPrice: +dt.unitPrice,
      priceOverall: +dt.totalPrice
    }));
    const products = formValue.productList.map((dt) => ({
      productId: dt.productId,
      quantity: dt.quantity,
      eachPrice: +dt.unitPrice,
      priceOverall: +dt.totalPrice
    }));

    try {
      const getRespPromo = await checkPromoTransactionPetClinic({
        transactionPetClinicId: data.transactionId,
        recipes,
        services,
        products
      });
      const { freeItem, discount, bundles, basedSales } = getRespPromo.data;
      setPromoOfferDialog({
        isOpen: true,
        data: { transactionPetClinicId: data.transactionId, freeItems: freeItem, discounts: discount, bundles, basedSales, recipes, services, products }
      });
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onSubmit = async () => {
    try {
      // 1. Buat payment → dapatkan paymentId
      const paymentResp = await createPaymentPetClinicOutpatient(data.transactionId, formValue);
      const paymentId = paymentResp?.data?.id;

      // 2. Upload bukti pembayaran
      if (paymentId && paymentProof) {
        await uploadProofOfPayment({ paymentId, file: paymentProof });
      }

      // 3. Print invoice — backend baca langsung dari DB
      const resp = await printInvoicePetClinicOutpatient(data.transactionId);
      if (resp && resp.status === 200) {
        processDownloadPDF(resp);
        dispatch(snackbarSuccess('Transaction Payment Pet Clinic has been successfully'));
        props.onClose(true);
      }
    } catch (error) {
      dispatch(snackbarError(createMessageBackend(error)));
    }
  };

  const TABS = ['Info & Resep', 'Tambah Layanan & Produk', 'Promo & Ringkasan', 'Metode Pembayaran'];
  const hasPromoApplied = Boolean(formValue.summaryList.length);
  const paymentReady = Boolean(formValue.paymentMethod);

  // ── Validasi per-tab ────────────────────────────────────────────────────────
  const tab0Valid =
    formValue.recipeList.length === 0 ||
    formValue.recipeList.every((r) => r.unitPrice > 0 && !r.unitPriceErr);

  const tab1Valid =
    formValue.serviceList.length === 0 ||
    formValue.serviceList.every((s) => s.unitPrice > 0 && !s.unitPriceErr);

  const tab2Valid = hasPromoApplied;

  const minDp = (20 / 100) * formValue.summaryTotalPayment;
  const paymentMethodValid =
    formValue.paymentMethod === 'full' ||
    (formValue.paymentMethod === 'dp' &&
      +formValue.dpNominal >= minDp &&
      formValue.dpNominal !== '' &&
      Boolean(formValue.dpNextPayment) &&
      !formValue.dpNominalErr) ||
    (formValue.paymentMethod === 'cicilan' &&
      Boolean(formValue.installmentDuration) &&
      Boolean(formValue.installmentTenor));
  const tab3Valid = paymentMethodValid && Boolean(paymentProof);

  const tabValid = [tab0Valid, tab1Valid, tab2Valid, tab3Valid];

  // Hanya boleh pindah tab jika semua tab sebelumnya sudah valid
  const onTabChange = (_, newTab) => {
    if (newTab < tabActive) {
      setTabActive(newTab); // selalu boleh balik ke tab sebelumnya
      return;
    }
    const allPrevValid = Array.from({ length: newTab }, (_, i) => tabValid[i]).every(Boolean);
    if (allPrevValid) setTabActive(newTab);
  };

  // Pesan validasi per tab
  const tab0InvalidMsg = !tab0Valid ? 'Harap isi unit price untuk semua resep obat sebelum melanjutkan.' : '';
  const tab1InvalidMsg = !tab1Valid ? 'Harap isi unit price untuk semua layanan sebelum melanjutkan.' : '';
  const tab3InvalidMsg = (() => {
    if (!formValue.paymentMethod) return 'Harap pilih metode pembayaran.';
    if (formValue.paymentMethod === 'dp') {
      if (!formValue.dpNominal || +formValue.dpNominal < minDp) return `Nominal DP minimal Rp ${minDp}.`;
      if (!formValue.dpNextPayment) return 'Harap isi tanggal pelunasan berikutnya.';
    }
    if (formValue.paymentMethod === 'cicilan') {
      if (!formValue.installmentDuration) return 'Harap pilih durasi cicilan.';
      if (!formValue.installmentTenor) return 'Harap pilih tenor cicilan.';
    }
    if (!paymentProof) return 'Harap upload bukti pembayaran terlebih dahulu.';
    return '';
  })();

  return (
    <>
      <ModalC
        title={<FormattedMessage id="payment-pet-clinic-inpatient" />}
        open={props.open}
        onOk={onSubmit}
        disabledOk={disabledOke || !tab3Valid}
        okText={<FormattedMessage id="save-and-print" />}
        onCancel={() => props.onClose(false)}
        fullWidth
        maxWidth="xl"
      >
        {/* ── Tab Navigation ── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
          <Tabs
            value={tabActive}
            onChange={onTabChange}
            variant={matchDownSM ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
          >
            {TABS.map((label, i) => {
              const isDone = tabValid[i] && tabActive > i;
              const isBlocked = i > 0 && !Array.from({ length: i }, (_, j) => tabValid[j]).every(Boolean);
              return (
                <Tab
                  key={i}
                  disabled={isBlocked}
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Chip
                        label={isDone ? '✓' : i + 1}
                        size="small"
                        color={isDone ? 'success' : tabActive === i ? 'primary' : 'default'}
                        sx={{ minWidth: 22, height: 20, fontSize: 11, opacity: isBlocked ? 0.4 : 1 }}
                      />
                      <Typography variant="caption" fontWeight={tabActive === i ? 700 : 400} sx={{ opacity: isBlocked ? 0.5 : 1 }}>
                        {label}
                      </Typography>
                    </Stack>
                  }
                />
              );
            })}
          </Tabs>
        </Box>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 0 — Info Transaksi & Resep Dokter                         */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={0}>

          <SectionCard icon={<AccountCircleIcon fontSize="small" color="primary" />} title="Informasi Transaksi">
            <Grid container spacing={2}>
              <InfoField label={intl.formatMessage({ id: 'customer-name' })} value={formValue.customerName} />
              <InfoField label={intl.formatMessage({ id: 'phone-number' })} value={formValue.phoneNumber} />
              <InfoField label={intl.formatMessage({ id: 'arrival-time' })} value={formValue.arrivalTime} />
            </Grid>
          </SectionCard>

          <SectionCard icon={<MedicalServicesIcon fontSize="small" color="primary" />} title="Resep Obat dari Dokter">
            {formValue.recipeList.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 1 }}>Tidak ada resep obat untuk transaksi ini.</Alert>
            ) : (
              <ScrollX>
                <ReactTable columns={columnsRecipe} data={formValue.recipeList} colSpanPagination={11} />
              </ScrollX>
            )}
          </SectionCard>

          {tab0InvalidMsg && (
            <Alert severity="error" sx={{ borderRadius: 1, mb: 1.5 }}>{tab0InvalidMsg}</Alert>
          )}
          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" size="small" disabled={!tab0Valid} onClick={() => setTabActive(1)}>
              Selanjutnya →
            </Button>
          </Box>
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 1 — Tambah Layanan & Produk Jual                          */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={1}>

          {/* ── Promo Aktif Hari Ini ── */}
          <SectionCard icon={<CampaignIcon fontSize="small" color="warning" />} title="Promo Aktif Hari Ini">
            {todayPromosLoading ? (
              <Stack spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={44} />
                ))}
              </Stack>
            ) : todayPromos.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                Tidak ada promo aktif hari ini.
              </Alert>
            ) : (
              <Stack spacing={1}>
                {todayPromos.map((promo) => (
                  <Box
                    key={promo.id}
                    sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      p: 1.25, borderRadius: 1.5, border: '1px solid',
                      borderColor: 'divider', bgcolor: 'background.paper'
                    }}
                  >
                    <PromoTypeBadge type={promo.type} />
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600} noWrap>{promo.name}</Typography>
                      {promo.note && (
                        <Tooltip title={promo.note} placement="top-start" arrow>
                          <Typography
                            variant="caption" color="text.secondary"
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {promo.note}
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                      s/d {promo.endDate}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>

          {/* Tambah Layanan */}
          <SectionCard icon={<MedicalServicesIcon fontSize="small" color="primary" />} title="Tambah Layanan">
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="service" /></Typography>
                  <Autocomplete
                    size="small"
                    options={formValue.serviceDropdownList}
                    value={formValue.service}
                    isOptionEqualToValue={(opt, val) => val === '' || opt.id === val.id}
                    onChange={(_, selected) => {
                      const selectedValue = selected ? { ...selected, value: +selected.id } : null;
                      onFieldHandler({ target: { name: 'service', value: selectedValue } });
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="unit-price" /></Typography>
                  <TextField
                    size="small" fullWidth type="number" name="unitPriceService"
                    value={formValue.unitPriceService} inputProps={{ min: 0 }}
                    onChange={(e) => {
                      onFieldHandler(e);
                      setFormValue((prev) => ({
                        ...prev,
                        unitPriceServiceErr: +e.target.value > +prev.service?.price ? errorMessageUnitPriceExceedBasePrice : ''
                      }));
                    }}
                    error={Boolean(formValue.unitPriceServiceErr)}
                    helperText={formValue.unitPriceServiceErr}
                  />
                </Stack>
              </Grid>
              <Grid item xs={10} sm={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="quantity" /></Typography>
                  <TextField
                    size="small" fullWidth type="number" name="quantityService"
                    value={formValue.quantityService} inputProps={{ min: 0 }}
                    onChange={onFieldHandler}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2} sm={1} display="flex" alignItems="flex-end" justifyContent="center">
                <IconButton
                  style={{ width: matchDownSM ? '100%' : 'unset' }}
                  size="medium" variant="contained" color="primary"
                  onClick={onAddService} disabled={onDisabledService()}
                >
                  <PlusOutlined />
                </IconButton>
              </Grid>
            </Grid>

            {formValue.serviceList.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  Daftar Layanan
                </Typography>
                <ScrollX>
                  <ReactTable columns={columnsService} data={formValue.serviceList} />
                </ScrollX>
              </Box>
            )}
          </SectionCard>

          {/* Tambah Produk Jual */}
          <SectionCard icon={<ShoppingCartIcon fontSize="small" color="primary" />} title="Tambah Produk Jual">
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="product-sell" /></Typography>
                  <Autocomplete
                    size="small"
                    options={formValue.productSellDropdownList}
                    value={formValue.productSell}
                    isOptionEqualToValue={(opt, val) => val === '' || opt.value === val.value}
                    onChange={(_, selected) => {
                      const selectedValue = selected ? { ...selected, value: +selected.value } : null;
                      onFieldHandler({ target: { name: 'productSell', value: selectedValue } });
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="unit-price" /></Typography>
                  <TextField
                    size="small" fullWidth type="number" name="unitPriceProductSell"
                    value={formValue.unitPriceProductSell} inputProps={{ min: 0 }}
                    onChange={(e) => {
                      onFieldHandler(e);
                      setFormValue((prev) => ({
                        ...prev,
                        unitPriceProductSellErr: +e.target.value > +prev.productSell?.data.price ? errorMessageUnitPriceExceedBasePrice : ''
                      }));
                    }}
                    error={Boolean(formValue.unitPriceProductSellErr)}
                    helperText={formValue.unitPriceProductSellErr}
                  />
                </Stack>
              </Grid>
              <Grid item xs={10} sm={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="quantity" /></Typography>
                  <TextField
                    size="small" fullWidth type="number" name="quantityProductSell"
                    value={formValue.quantityProductSell} inputProps={{ min: 0 }}
                    onChange={(e) => {
                      onFieldHandler(e);
                      setFormValue((prev) => {
                        const inStock = +prev.productSell?.data.inStock;
                        return {
                          ...prev,
                          quantityProductSellErr: +e.target.value > inStock ? `Quantity exceeds stock. Only ${inStock} left in stock.` : ''
                        };
                      });
                    }}
                    error={Boolean(formValue.quantityProductSellErr)}
                    helperText={formValue.quantityProductSellErr}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2} sm={1} display="flex" alignItems="flex-end" justifyContent="center">
                <IconButton
                  style={{ width: matchDownSM ? '100%' : 'unset' }}
                  size="medium" variant="contained" color="primary"
                  onClick={onAddProductSell} disabled={onDisabledProductSell()}
                >
                  <PlusOutlined />
                </IconButton>
              </Grid>
            </Grid>

            {formValue.productList.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  Daftar Produk Jual
                </Typography>
                <ScrollX>
                  <ReactTable columns={columnProduct} data={formValue.productList} />
                </ScrollX>
              </Box>
            )}
          </SectionCard>

          {/* Catatan */}
          <SectionCard icon={<ReceiptLongIcon fontSize="small" color="primary" />} title="Catatan">
            <TextField
              multiline fullWidth rows={3} size="small"
              name="notes" value={formValue.notes}
              onChange={onFieldHandler}
              placeholder="Tambahkan catatan pembayaran..."
            />
          </SectionCard>

          {tab1InvalidMsg && (
            <Alert severity="error" sx={{ borderRadius: 1, mb: 1.5 }}>{tab1InvalidMsg}</Alert>
          )}
          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" size="small" onClick={() => setTabActive(0)}>← Kembali</Button>
            <Button variant="contained" size="small" disabled={!tab1Valid} onClick={() => setTabActive(2)}>Selanjutnya →</Button>
          </Box>
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 2 — Promo & Ringkasan                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={2}>

          <SectionCard icon={<LocalOfferIcon fontSize="small" color="primary" />} title="Cek Promosi">
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Klik tombol di bawah untuk mengecek promosi yang tersedia berdasarkan item yang dipilih.
              </Typography>
              <Box>
                <Button variant="contained" color="info" onClick={onCheckPromo} startIcon={<LocalOfferIcon />}>
                  <FormattedMessage id="promotion-can-be-offered" />
                </Button>
              </Box>

              {hasPromoApplied && (
                <Alert severity="success" sx={{ borderRadius: 1 }}>
                  Promosi berhasil diterapkan. Lihat ringkasan di bawah.
                </Alert>
              )}
            </Stack>
          </SectionCard>

          <SectionCard icon={<ReceiptLongIcon fontSize="small" color="primary" />} title="Ringkasan Transaksi">
            {!hasPromoApplied ? (
              <Alert severity="warning" sx={{ borderRadius: 1 }}>
                Belum ada ringkasan. Silakan klik &quot;Cek Promosi&quot; terlebih dahulu untuk mengkalkulasi total pembayaran.
              </Alert>
            ) : (
              <SummaryTable formValue={formValue} />
            )}
          </SectionCard>

          {Boolean(formValue.summaryPromoNotes.length) && (
            <SectionCard icon={<LocalOfferIcon fontSize="small" color="success" />} title="Detail Promosi">
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {formValue.summaryPromoNotes.map((item, idx) => (
                  <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </SectionCard>
          )}

          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" size="small" onClick={() => setTabActive(1)}>← Kembali</Button>
            <Button variant="contained" size="small" disabled={!hasPromoApplied} onClick={() => setTabActive(3)}>
              Selanjutnya →
            </Button>
          </Box>
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 3 — Metode Pembayaran                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={3}>

          {/* Total Summary */}
          {hasPromoApplied && (
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'primary.50', borderColor: 'primary.light' }}
            >
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stack spacing={0.25} alignItems="center">
                    <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">{formValue.summarySubtotal}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack spacing={0.25} alignItems="center">
                    <Typography variant="caption" color="text.secondary">{formValue.summaryDiscountNote || 'Diskon'}</Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main">-{formValue.summaryTotalDiscount}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack spacing={0.25} alignItems="center">
                    <Typography variant="caption" color="text.secondary">Total Bayar</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">{formValue.summaryTotalPayment}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}

          <SectionCard icon={<PaymentsIcon fontSize="small" color="primary" />} title="Metode Pembayaran">
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="payment-method" /></Typography>
                <Select
                  size="small"
                  name="paymentMethod"
                  value={formValue.paymentMethod}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, dpNominal: '', dpNominalErr: '', paymentMethod: e.target.value }))}
                  sx={{ maxWidth: 300 }}
                >
                  <MenuItem value=""><em>Pilih metode pembayaran</em></MenuItem>
                  <MenuItem value="full">Full Payment</MenuItem>
                  <MenuItem value="dp">DP + Pelunasan</MenuItem>
                  <MenuItem value="cicilan">Cicilan</MenuItem>
                </Select>
              </Stack>

              {/* DP */}
              {formValue.paymentMethod === 'dp' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>Nominal DP</Typography>
                        <TextField
                          size="small" fullWidth type="number" name="dpNominal"
                          value={formValue.dpNominal}
                          inputProps={{ min: minimumDownPaymentNominal() }}
                          onChange={(e) => {
                            onFieldHandler(e);
                            setFormValue((prev) => ({
                              ...prev,
                              dpNominalErr: +e.target.value < minimumDownPaymentNominal()
                                ? `Minimum down payment is ${minimumDownPaymentNominal()}.` : ''
                            }));
                          }}
                          error={Boolean(formValue.dpNominalErr)}
                          helperText={formValue.dpNominalErr || `Minimum DP: ${minimumDownPaymentNominal()}`}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}><FormattedMessage id="next-payment" /></Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopDatePicker
                            disablePast inputFormat="DD/MM/YYYY"
                            value={formValue.dpNextPayment}
                            onChange={(v) => onFieldHandler({ target: { name: 'dpNextPayment', value: v } })}
                            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                          />
                        </LocalizationProvider>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Cicilan */}
              {formValue.paymentMethod === 'cicilan' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}><FormattedMessage id="duration" /></Typography>
                        <Select
                          size="small" fullWidth name="installmentDuration"
                          value={formValue.installmentDuration}
                          onChange={(e) => setFormValue((prev) => ({ ...prev, installmentDuration: e.target.value }))}
                        >
                          <MenuItem value=""><em>Pilih Durasi</em></MenuItem>
                          <MenuItem value="harian">Harian</MenuItem>
                          <MenuItem value="mingguan">Mingguan</MenuItem>
                          <MenuItem value="bulanan">Bulanan</MenuItem>
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>Tenor</Typography>
                        <Select
                          size="small" fullWidth name="installmentTenor"
                          value={formValue.installmentTenor}
                          onChange={(e) => setFormValue((prev) => ({ ...prev, installmentTenor: e.target.value }))}
                        >
                          <MenuItem value=""><em>Pilih Tenor</em></MenuItem>
                          {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                            <MenuItem key={num} value={num}>{num}</MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>Cicilan Uang Muka</Typography>
                        <TextField
                          size="small" fullWidth type="number" name="installmentDp"
                          value={formValue.installmentDp} inputProps={{ min: 0 }}
                          onChange={onFieldHandler}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {formValue.paymentMethod === 'full' && (
                <Alert severity="success" sx={{ borderRadius: 1 }}>
                  Pembayaran penuh akan dilakukan sekarang. Total: <strong>{formValue.summaryTotalPayment}</strong>
                </Alert>
              )}
            </Stack>
          </SectionCard>

          {/* ── Bukti Pembayaran ── */}
          <SectionCard icon={<CloudUploadIcon fontSize="small" color="primary" />} title="Bukti Pembayaran *">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPaymentProof(file);
                if (file.type.startsWith('image/')) {
                  setProofPreview(URL.createObjectURL(file));
                } else {
                  setProofPreview(null);
                }
                e.target.value = '';
              }}
            />

            {!paymentProof ? (
              /* ── Upload Zone ── */
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  setPaymentProof(file);
                  if (file.type.startsWith('image/')) {
                    setProofPreview(URL.createObjectURL(file));
                  } else {
                    setProofPreview(null);
                  }
                }}
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  bgcolor: 'primary.50',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.100' }
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  Klik atau drag file ke sini
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Format: JPG, PNG, PDF — Maks. 2 MB
                </Typography>
              </Box>
            ) : (
              /* ── File Preview ── */
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'success.light',
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: 'success.50'
                }}
              >
                {/* Thumbnail / Icon */}
                {proofPreview ? (
                  <Box
                    component="img"
                    src={proofPreview}
                    alt="preview"
                    sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0, border: '1px solid', borderColor: 'divider' }}
                  />
                ) : (
                  <Box sx={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'error.50', borderRadius: 1.5, flexShrink: 0 }}>
                    <InsertDriveFileIcon sx={{ fontSize: 36, color: 'error.main' }} />
                  </Box>
                )}

                {/* Info */}
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={600} noWrap>{paymentProof.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(paymentProof.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Box mt={0.5}>
                    <Chip label="Siap diupload" size="small" color="success" variant="filled" sx={{ fontSize: 10 }} />
                  </Box>
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={0.5} flexShrink={0}>
                  <Tooltip title="Ganti file">
                    <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ minWidth: 0, px: 1 }}>
                      Ganti
                    </Button>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton
                      size="small" color="error"
                      onClick={() => { setPaymentProof(null); setProofPreview(null); }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            )}
          </SectionCard>

          {tab3InvalidMsg && (
            <Alert severity="error" sx={{ borderRadius: 1, mb: 1.5 }}>{tab3InvalidMsg}</Alert>
          )}
          <Box display="flex" justifyContent="flex-start">
            <Button variant="outlined" size="small" onClick={() => setTabActive(2)}>← Kembali</Button>
          </Box>
        </TabPanel>
      </ModalC>

      {promoOfferDialog.isOpen && (
        <PromoOfferTransactionPetClinic
          open={promoOfferDialog.isOpen}
          data={promoOfferDialog.data}
          onClose={(resp) => {
            if (resp) {
              const summaryList = resp.purchases.map((dt) => ({
                ...dt,
                included_items: dt.included_items?.map((detail) => ({
                  ...detail,
                  item_name: `${detail.name} (harga normal Rp ${detail.normal_price || '-'})`
                }))
              }));
              setFormValue((prev) => ({
                ...prev,
                summaryList,
                summarySubtotal: resp.subtotal,
                summaryDiscountNote: resp.discount_note,
                summaryTotalDiscount: resp.total_discount,
                summaryTotalPayment: resp.total_payment,
                summaryPromoNotes: resp.promo_notes,
                discountBasedSale: resp.discount_based_sales,
                promoBasedSaleId: +resp.promoBasedSaleId
              }));
            }
            setPromoOfferDialog({ isOpen: false, data: {} });
          }}
        />
      )}
    </>
  );
};

Payment.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default Payment;
