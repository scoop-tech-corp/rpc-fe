import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  calculatePetHotelOutpatient,
  uploadPaymentProofPetHotel,
  createPaymentPetHotelOutpatient,
  getBeforePayment,
  getPaymentMethodsPetHotel,
  printInvoicePetHotelOutpatientNew
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
import { getActiveTodayPromos } from 'pages/transaction/pages/pet-clinic/service';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import SummaryTable from './summary-table';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
    <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">
        {title}
      </Typography>
    </Box>
    <Divider />
    <Box sx={{ px: 2, py: 2 }}>{children}</Box>
  </Paper>
);
SectionCard.propTypes = { icon: PropTypes.node, title: PropTypes.string, children: PropTypes.node };

const InfoField = ({ label, value }) => (
  <Grid item xs={12} sm={4}>
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
InfoField.propTypes = { label: PropTypes.string, value: PropTypes.any };

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);
TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

const PROMO_TYPE_CONFIG = {
  'Free Item': { color: 'success', label: 'Free Item' },
  Discount: { color: 'error', label: 'Diskon' },
  Bundle: { color: 'warning', label: 'Bundle' },
  'Based Sales': { color: 'info', label: 'Based Sales' }
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
    finishTime: '',
    cage: null,
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
    serviceList: [],
    productList: [],
    summaryList: [],
    summarySubtotal: 0,
    summaryDiscountNote: '',
    summaryTotalDiscount: 0,
    summaryTotalPayment: 0,
    summaryPromoNotes: [],
    promoBasedSaleId: '',
    discountBasedSale: 0,
    paymentMethod: '',
    paymentMethodId: '',
    dpNominal: '',
    dpNominalErr: '',
    dpNextPayment: null,
    installmentDuration: '',
    installmentTenor: '',
    installmentDp: ''
  });
  const [disabledOke, setDisabledOk] = useState(false);
  const [tabActive, setTabActive] = useState(0);
  const [todayPromos, setTodayPromos] = useState([]);
  const [todayPromosLoading, setTodayPromosLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Promo state
  const [availablePromos, setAvailablePromos] = useState({ freeItems: [], discounts: [], bundles: [], basedSales: [] });
  const [selectedPromos, setSelectedPromos] = useState({ freeItems: [], discounts: [], bundles: [], basedSaleId: null });
  const [promoLoading, setPromoLoading] = useState(false);
  const [calculateDone, setCalculateDone] = useState(false);

  // Payment methods from paymentMethodFinances
  const [paymentMethods, setPaymentMethods] = useState([]);

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
        getActiveTodayPromos(data.locationId),
        getPaymentMethodsPetHotel()
      ])
        .then(([respBeforePayment, respService, respProductSell, respPromos, respPaymentMethods]) => {
          setPaymentMethods(respPaymentMethods.data || []);
          setTodayPromos(respPromos.data || []);
          setTodayPromosLoading(false);
          const beforePaymentData = respBeforePayment.data;
          const { services, products } = beforePaymentData.data;
          const customerName = beforePaymentData.customerName;
          const phoneNumber = beforePaymentData.phoneNumber;
          const arrivalTime = beforePaymentData.arrivalTime;
          const finishTime = beforePaymentData.finishTime;
          const cage = beforePaymentData.cage;

          const new_services = (services || []).map((dt) => ({
            ...dt,
            serviceId: +dt.serviceId,
            basedPrice: +String(dt.basedPrice ?? 0).replace(/,/g, ''),
            unitPrice: '',
            totalPrice: '',
            unitPriceErr: ''
          }));
          const new_products = (products || []).map((dt) => ({
            ...dt,
            productId: +dt.productId,
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
            finishTime,
            cage,
            serviceList: new_services,
            productList: new_products,
            serviceDropdownList: new_service_dropdown_list,
            productSellDropdownList: new_product_sell_list
          }));
        })
        .catch(() => setTodayPromosLoading(false));
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const findServiceErr = formValue.serviceList.find((dt) => dt.unitPriceErr);
    if (findServiceErr || formValue.dpNominalErr) setDisabledOk(true);
    else setDisabledOk(false);
  }, [formValue]);

  // ── Calculate (unified promo + summary) ───────────────────────────────────
  const buildItemsPayload = () => {
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
    return { services, products };
  };

  const runCalculate = async (promos) => {
    setPromoLoading(true);
    try {
      const { services, products } = buildItemsPayload();
      const resp = await calculatePetHotelOutpatient({
        transactionId: data.transactionId,
        services,
        products,
        selectedPromos: promos
      });
      const { purchases, availablePromos: ap, summary } = resp.data;
      setAvailablePromos(ap || { freeItems: [], discounts: [], bundles: [], basedSales: [] });
      const summaryList = (purchases || []).map((dt) => ({
        ...dt,
        included_items: dt.included_items?.map((detail) => ({
          ...detail,
          item_name: `${detail.name} (harga normal Rp ${detail.normal_price || '-'})`
        }))
      }));
      setFormValue((prev) => ({
        ...prev,
        summaryList,
        summarySubtotal: summary.subtotal,
        summaryDiscountNote: summary.discount_note,
        summaryTotalDiscount: summary.total_discount,
        summaryTotalPayment: summary.total_payment,
        summaryPromoNotes: summary.promo_notes || [],
        discountBasedSale: summary.discount_based_sales,
        promoBasedSaleId: summary.selected_based_sale_id || ''
      }));
      setCalculateDone(true);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setPromoLoading(false);
    }
  };

  // Auto-calculate when entering Tab 2
  useEffect(() => {
    if (tabActive === 2 && !calculateDone) {
      runCalculate(selectedPromos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabActive]);

  const onTogglePromo = (type, id) => {
    setSelectedPromos((prev) => {
      let updated;
      if (type === 'basedSale') {
        updated = { ...prev, basedSaleId: prev.basedSaleId === id ? null : id };
      } else {
        const key = type + 's'; // freeItems, discounts, bundles
        const already = prev[key].includes(id);
        updated = { ...prev, [key]: already ? prev[key].filter((x) => x !== id) : [...prev[key], id] };
      }
      runCalculate(updated);
      return updated;
    });
  };

  // ── Table columns ─────────────────────────────────────────────────────────
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
      { Header: <FormattedMessage id="total-price" />, accessor: 'totalPrice', isNotSorting: true },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (d) => (
          <IconButton size="medium" variant="contained" color="error" onClick={() => onDeleteRowHandler('serviceList', d.row.index)}>
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl]
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
    Boolean(
      !formValue.productSell ||
        !formValue.unitPriceProductSell ||
        !formValue.quantityProductSell ||
        formValue.unitPriceProductSellErr ||
        formValue.quantityProductSellErr
    );

  const onDeleteRowHandler = (procedure, rowIndex) => {
    setFormValue((prev) => {
      const list = [...prev[procedure]];
      list.splice(rowIndex, 1);
      return { ...prev, [procedure]: list };
    });
  };

  const minimumDownPaymentNominal = () => (20 / 100) * formValue.summaryTotalPayment;

  const onSubmit = async () => {
    try {
      // 1. Create payment record → get paymentId
      const paymentResp = await createPaymentPetHotelOutpatient(data.transactionId, formValue);
      const paymentId = paymentResp?.data?.id;

      // 2. Upload bukti pembayaran → status = 'pending' (menunggu konfirmasi Finance/Manager)
      //    Konfirmasi dilakukan terpisah oleh orang berbeda (4-eyes principle)
      if (paymentId && paymentProof) {
        await uploadPaymentProofPetHotel({ id: paymentId, file: paymentProof });
      }

      // 3. Print invoice
      const resp = await printInvoicePetHotelOutpatientNew(data.transactionId);
      if (resp && resp.status === 200) {
        processDownloadPDF(resp);
        dispatch(snackbarSuccess('Pembayaran berhasil disimpan. Bukti menunggu verifikasi Finance/Manager.'));
        props.onClose(true);
      }
    } catch (error) {
      dispatch(snackbarError(createMessageBackend(error)));
    }
  };

  const TABS = [
    intl.formatMessage({ id: 'transaction-information' }),
    intl.formatMessage({ id: 'add-service-and-product' }),
    intl.formatMessage({ id: 'promo-and-summary' }),
    intl.formatMessage({ id: 'payment-method' })
  ];

  // ── Validasi per-tab ────────────────────────────────────────────────────────
  // Tab 0: always valid (no prescriptions to fill)
  const tab0Valid = true;

  const tab1Valid = formValue.serviceList.length === 0 || formValue.serviceList.every((s) => s.unitPrice > 0 && !s.unitPriceErr);

  // Tab 2 valid once calculate has run at least once
  const tab2Valid = calculateDone;

  const minDp = (20 / 100) * formValue.summaryTotalPayment;
  const paymentMethodValid =
    Boolean(formValue.paymentMethodId) &&
    (formValue.paymentMethod === 'full' ||
      (formValue.paymentMethod === 'dp' &&
        +formValue.dpNominal >= minDp &&
        formValue.dpNominal !== '' &&
        Boolean(formValue.dpNextPayment) &&
        !formValue.dpNominalErr) ||
      (formValue.paymentMethod === 'cicilan' && Boolean(formValue.installmentDuration) && Boolean(formValue.installmentTenor)));
  const tab3Valid = paymentMethodValid && Boolean(paymentProof);

  const tabValid = [tab0Valid, tab1Valid, tab2Valid, tab3Valid];

  const onTabChange = (_, newTab) => {
    if (newTab < tabActive) {
      setTabActive(newTab);
      return;
    }
    const allPrevValid = Array.from({ length: newTab }, (_, i) => tabValid[i]).every(Boolean);
    if (allPrevValid) setTabActive(newTab);
  };

  const tab1InvalidMsg = !tab1Valid ? intl.formatMessage({ id: 'fill-unit-price-services' }) : '';
  const tab3InvalidMsg = (() => {
    if (!formValue.paymentMethodId) return intl.formatMessage({ id: 'please-select-payment-source' });
    if (!formValue.paymentMethod) return intl.formatMessage({ id: 'please-select-payment-type' });
    if (formValue.paymentMethod === 'dp') {
      if (!formValue.dpNominal || +formValue.dpNominal < minDp) return `${intl.formatMessage({ id: 'dp-nominal' })} minimal Rp ${minDp}.`;
      if (!formValue.dpNextPayment) return intl.formatMessage({ id: 'please-fill-settlement-date' });
    }
    if (formValue.paymentMethod === 'cicilan') {
      if (!formValue.installmentDuration) return intl.formatMessage({ id: 'please-select-installment-duration' });
      if (!formValue.installmentTenor) return intl.formatMessage({ id: 'please-select-installment-tenor' });
    }
    if (!paymentProof) return intl.formatMessage({ id: 'please-upload-payment-proof' });
    return '';
  })();

  return (
    <>
      <ModalC
        title={<FormattedMessage id="payment-pet-hotel-inpatient" />}
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
          <Tabs value={tabActive} onChange={onTabChange} variant={matchDownSM ? 'scrollable' : 'fullWidth'} scrollButtons="auto">
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
        {/* TAB 0 — Info Transaksi                                        */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={0}>
          <SectionCard
            icon={<AccountCircleIcon fontSize="small" color="primary" />}
            title={intl.formatMessage({ id: 'transaction-information' })}
          >
            <Grid container spacing={2}>
              <InfoField label={intl.formatMessage({ id: 'customer-name' })} value={formValue.customerName} />
              <InfoField label={intl.formatMessage({ id: 'phone-number' })} value={formValue.phoneNumber} />
              <InfoField label={intl.formatMessage({ id: 'arrival-time' })} value={formValue.arrivalTime} />
              <InfoField label="Selesai Menginap" value={formValue.finishTime} />
              <InfoField label="Kandang" value={formValue.cage?.unitName} />
            </Grid>
          </SectionCard>

          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" size="small" onClick={() => setTabActive(1)}>
              <FormattedMessage id="next" /> →
            </Button>
          </Box>
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 1 — Tambah Layanan & Produk Jual                          */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={1}>
          {/* ── Promo Aktif Hari Ini ── */}
          <SectionCard icon={<CampaignIcon fontSize="small" color="warning" />} title={intl.formatMessage({ id: 'active-promo-today' })}>
            {todayPromosLoading ? (
              <Stack spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={44} />
                ))}
              </Stack>
            ) : todayPromos.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                <FormattedMessage id="no-active-promo-today" />
              </Alert>
            ) : (
              <Stack spacing={1}>
                {todayPromos.map((promo) => (
                  <Box
                    key={promo.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 1.25,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <PromoTypeBadge type={promo.type} />
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {promo.name}
                      </Typography>
                      {promo.note && (
                        <Tooltip title={promo.note} placement="top-start" arrow>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {promo.note}
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                      <FormattedMessage id="valid-until" /> {promo.endDate}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>

          {/* Tambah Layanan */}
          <SectionCard icon={<MedicalServicesIcon fontSize="small" color="primary" />} title={intl.formatMessage({ id: 'add-service' })}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>
                    <FormattedMessage id="service" />
                  </Typography>
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
                  <Typography variant="caption" fontWeight={600}>
                    <FormattedMessage id="unit-price" />
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name="unitPriceService"
                    value={formValue.unitPriceService}
                    inputProps={{ min: 0 }}
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
                  <Typography variant="caption" fontWeight={600}>
                    <FormattedMessage id="quantity" />
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name="quantityService"
                    value={formValue.quantityService}
                    inputProps={{ min: 0 }}
                    onChange={onFieldHandler}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2} sm={1} display="flex" alignItems="flex-end" justifyContent="center">
                <IconButton
                  style={{ width: matchDownSM ? '100%' : 'unset' }}
                  size="medium"
                  variant="contained"
                  color="primary"
                  onClick={onAddService}
                  disabled={onDisabledService()}
                >
                  <PlusOutlined />
                </IconButton>
              </Grid>
            </Grid>

            {formValue.serviceList.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  <FormattedMessage id="service-list" />
                </Typography>
                <ScrollX>
                  <ReactTable columns={columnsService} data={formValue.serviceList} />
                </ScrollX>
              </Box>
            )}
          </SectionCard>

          {/* Tambah Produk Jual */}
          <SectionCard icon={<ShoppingCartIcon fontSize="small" color="primary" />} title={intl.formatMessage({ id: 'add-product-sell' })}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>
                    <FormattedMessage id="product-sell" />
                  </Typography>
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
                  <Typography variant="caption" fontWeight={600}>
                    <FormattedMessage id="unit-price" />
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name="unitPriceProductSell"
                    value={formValue.unitPriceProductSell}
                    inputProps={{ min: 0 }}
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
                  <Typography variant="caption" fontWeight={600}>
                    <FormattedMessage id="quantity" />
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name="quantityProductSell"
                    value={formValue.quantityProductSell}
                    inputProps={{ min: 0 }}
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
                  size="medium"
                  variant="contained"
                  color="primary"
                  onClick={onAddProductSell}
                  disabled={onDisabledProductSell()}
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
          <SectionCard icon={<ReceiptLongIcon fontSize="small" color="primary" />} title={intl.formatMessage({ id: 'notes' })}>
            <TextField
              multiline
              fullWidth
              rows={3}
              size="small"
              name="notes"
              value={formValue.notes}
              onChange={onFieldHandler}
              placeholder={intl.formatMessage({ id: 'payment-note-placeholder' })}
            />
          </SectionCard>

          {tab1InvalidMsg && (
            <Alert severity="error" sx={{ borderRadius: 1, mb: 1.5 }}>
              {tab1InvalidMsg}
            </Alert>
          )}
          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" size="small" onClick={() => setTabActive(0)}>
              ← <FormattedMessage id="back" />
            </Button>
            <Button variant="contained" size="small" disabled={!tab1Valid} onClick={() => setTabActive(2)}>
              <FormattedMessage id="next" /> →
            </Button>
          </Box>
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 2 — Promo & Ringkasan                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={2}>
          {promoLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <Stack alignItems="center" spacing={1}>
                <CircularProgress size={32} />
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage id="calculating" />
                </Typography>
              </Stack>
            </Box>
          ) : (
            <>
              {/* ── Promo Tersedia ── */}
              {availablePromos.freeItems.length > 0 ||
              availablePromos.discounts.length > 0 ||
              availablePromos.bundles.length > 0 ||
              availablePromos.basedSales.length > 0 ? (
                <SectionCard
                  icon={<LocalOfferIcon fontSize="small" color="warning" />}
                  title={intl.formatMessage({ id: 'promo-available-title' })}
                >
                  <Stack spacing={1}>
                    {availablePromos.freeItems.map((promo) => (
                      <Box
                        key={promo.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: selectedPromos.freeItems.includes(promo.id) ? 'success.main' : 'divider',
                          bgcolor: selectedPromos.freeItems.includes(promo.id) ? 'success.50' : 'background.paper'
                        }}
                      >
                        <Chip label="Free Item" size="small" color="success" variant="filled" sx={{ fontSize: 10, fontWeight: 600 }} />
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={600}>
                            {promo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {promo.note}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={selectedPromos.freeItems.includes(promo.id)}
                              onChange={() => onTogglePromo('freeItem', promo.id)}
                            />
                          }
                          label=""
                        />
                      </Box>
                    ))}
                    {availablePromos.discounts.map((promo) => (
                      <Box
                        key={promo.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: selectedPromos.discounts.includes(promo.id) ? 'error.main' : 'divider',
                          bgcolor: selectedPromos.discounts.includes(promo.id) ? 'error.50' : 'background.paper'
                        }}
                      >
                        <Chip label="Diskon" size="small" color="error" variant="filled" sx={{ fontSize: 10, fontWeight: 600 }} />
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={600}>
                            {promo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {promo.note}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={selectedPromos.discounts.includes(promo.id)}
                              onChange={() => onTogglePromo('discount', promo.id)}
                            />
                          }
                          label=""
                        />
                      </Box>
                    ))}
                    {availablePromos.bundles.map((promo) => (
                      <Box
                        key={promo.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: selectedPromos.bundles.includes(promo.id) ? 'warning.main' : 'divider',
                          bgcolor: selectedPromos.bundles.includes(promo.id) ? 'warning.50' : 'background.paper'
                        }}
                      >
                        <Chip label="Bundle" size="small" color="warning" variant="filled" sx={{ fontSize: 10, fontWeight: 600 }} />
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={600}>
                            {promo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {promo.note}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={selectedPromos.bundles.includes(promo.id)}
                              onChange={() => onTogglePromo('bundle', promo.id)}
                            />
                          }
                          label=""
                        />
                      </Box>
                    ))}
                    {availablePromos.basedSales.map((promo) => (
                      <Box
                        key={promo.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: selectedPromos.basedSaleId === promo.id ? 'info.main' : 'divider',
                          bgcolor: selectedPromos.basedSaleId === promo.id ? 'info.50' : 'background.paper'
                        }}
                      >
                        <Chip label="Belanja" size="small" color="info" variant="filled" sx={{ fontSize: 10, fontWeight: 600 }} />
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={600}>
                            {promo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {promo.note}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={selectedPromos.basedSaleId === promo.id}
                              onChange={() => onTogglePromo('basedSale', promo.id)}
                            />
                          }
                          label=""
                        />
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>
              ) : (
                calculateDone && (
                  <Alert severity="info" sx={{ borderRadius: 1, mb: 2 }}>
                    <FormattedMessage id="no-available-promo" />
                  </Alert>
                )
              )}

              {/* ── Ringkasan ── */}
              <SectionCard
                icon={<ReceiptLongIcon fontSize="small" color="primary" />}
                title={intl.formatMessage({ id: 'transaction-summary' })}
              >
                {!calculateDone ? (
                  <Alert severity="warning" sx={{ borderRadius: 1 }}>
                    <FormattedMessage id="waiting-calculation" />
                  </Alert>
                ) : (
                  <SummaryTable formValue={formValue} />
                )}
              </SectionCard>

              {Boolean(formValue.summaryPromoNotes.length) && (
                <SectionCard
                  icon={<LocalOfferIcon fontSize="small" color="success" />}
                  title={intl.formatMessage({ id: 'applied-promo-detail' })}
                >
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {formValue.summaryPromoNotes.map((item, idx) => (
                      <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </SectionCard>
              )}
            </>
          )}

          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" size="small" onClick={() => setTabActive(1)}>
              ← <FormattedMessage id="back" />
            </Button>
            <Button variant="contained" size="small" disabled={!tab2Valid || promoLoading} onClick={() => setTabActive(3)}>
              <FormattedMessage id="next" /> →
            </Button>
          </Box>
        </TabPanel>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 3 — Metode Pembayaran                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <TabPanel value={tabActive} index={3}>
          {/* Total Summary */}
          {calculateDone && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'primary.50', borderColor: 'primary.light' }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stack spacing={0.25} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="subtotal" />
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {formValue.summarySubtotal}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack spacing={0.25} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {formValue.summaryDiscountNote || 'Diskon'}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                      -{formValue.summaryTotalDiscount}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack spacing={0.25} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="total-payment" />
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {formValue.summaryTotalPayment}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}

          <SectionCard icon={<PaymentsIcon fontSize="small" color="primary" />} title={intl.formatMessage({ id: 'payment-method' })}>
            <Stack spacing={2}>
              {/* ── Sumber Pembayaran ── */}
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}>
                  <FormattedMessage id="payment-source" /> *
                </Typography>
                <Select
                  size="small"
                  value={formValue.paymentMethodId}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, paymentMethodId: e.target.value }))}
                  sx={{ maxWidth: 300 }}
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-payment-source" />
                    </em>
                  </MenuItem>
                  {paymentMethods.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              {/* ── Tipe Pembayaran ── */}
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}>
                  <FormattedMessage id="payment-type" />
                </Typography>
                <Select
                  size="small"
                  name="paymentMethod"
                  value={formValue.paymentMethod}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, dpNominal: '', dpNominalErr: '', paymentMethod: e.target.value }))}
                  sx={{ maxWidth: 300 }}
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-payment-type" />
                    </em>
                  </MenuItem>
                  <MenuItem value="full">
                    <FormattedMessage id="full-payment" />
                  </MenuItem>
                  <MenuItem value="dp">
                    <FormattedMessage id="dp-installment" />
                  </MenuItem>
                  <MenuItem value="cicilan">
                    <FormattedMessage id="installment" />
                  </MenuItem>
                </Select>
              </Stack>

              {/* DP */}
              {formValue.paymentMethod === 'dp' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>
                          <FormattedMessage id="dp-nominal" />
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          name="dpNominal"
                          value={formValue.dpNominal}
                          inputProps={{ min: minimumDownPaymentNominal() }}
                          onChange={(e) => {
                            onFieldHandler(e);
                            setFormValue((prev) => ({
                              ...prev,
                              dpNominalErr:
                                +e.target.value < minimumDownPaymentNominal()
                                  ? `Minimum down payment is ${minimumDownPaymentNominal()}.`
                                  : ''
                            }));
                          }}
                          error={Boolean(formValue.dpNominalErr)}
                          helperText={formValue.dpNominalErr || `Minimum DP: ${minimumDownPaymentNominal()}`}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>
                          <FormattedMessage id="next-payment" />
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopDatePicker
                            disablePast
                            inputFormat="DD/MM/YYYY"
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
                        <Typography variant="caption" fontWeight={600}>
                          <FormattedMessage id="duration" />
                        </Typography>
                        <Select
                          size="small"
                          fullWidth
                          name="installmentDuration"
                          value={formValue.installmentDuration}
                          onChange={(e) => setFormValue((prev) => ({ ...prev, installmentDuration: e.target.value }))}
                        >
                          <MenuItem value="">
                            <em>
                              <FormattedMessage id="select-duration" />
                            </em>
                          </MenuItem>
                          <MenuItem value="harian">
                            <FormattedMessage id="daily" />
                          </MenuItem>
                          <MenuItem value="mingguan">
                            <FormattedMessage id="weekly" />
                          </MenuItem>
                          <MenuItem value="bulanan">
                            <FormattedMessage id="monthly" />
                          </MenuItem>
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>
                          <FormattedMessage id="tenor" />
                        </Typography>
                        <Select
                          size="small"
                          fullWidth
                          name="installmentTenor"
                          value={formValue.installmentTenor}
                          onChange={(e) => setFormValue((prev) => ({ ...prev, installmentTenor: e.target.value }))}
                        >
                          <MenuItem value="">
                            <em>
                              <FormattedMessage id="select-tenor" />
                            </em>
                          </MenuItem>
                          {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                            <MenuItem key={num} value={num}>
                              {num}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>
                          <FormattedMessage id="installment-down-payment" />
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          name="installmentDp"
                          value={formValue.installmentDp}
                          inputProps={{ min: 0 }}
                          onChange={onFieldHandler}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {formValue.paymentMethod === 'full' && (
                <Alert severity="success" sx={{ borderRadius: 1 }}>
                  <FormattedMessage id="full-payment-info" /> <strong>{formValue.summaryTotalPayment}</strong>
                </Alert>
              )}
            </Stack>
          </SectionCard>

          {/* ── Bukti Pembayaran ── */}
          <SectionCard
            icon={<CloudUploadIcon fontSize="small" color="primary" />}
            title={`${intl.formatMessage({ id: 'proof-of-payment' })} *`}
          >
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
                  <FormattedMessage id="click-or-drag-file" />
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage id="file-format-info" />
                </Typography>
              </Box>
            ) : (
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
                {proofPreview ? (
                  <Box
                    component="img"
                    src={proofPreview}
                    alt="preview"
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: 'cover',
                      borderRadius: 1.5,
                      flexShrink: 0,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'error.50',
                      borderRadius: 1.5,
                      flexShrink: 0
                    }}
                  >
                    <InsertDriveFileIcon sx={{ fontSize: 36, color: 'error.main' }} />
                  </Box>
                )}

                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {paymentProof.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(paymentProof.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={intl.formatMessage({ id: 'ready-to-upload' })}
                      size="small"
                      color="success"
                      variant="filled"
                      sx={{ fontSize: 10 }}
                    />
                  </Box>
                </Box>

                <Stack direction="row" spacing={0.5} flexShrink={0}>
                  <Tooltip title={intl.formatMessage({ id: 'change-file' })}>
                    <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ minWidth: 0, px: 1 }}>
                      <FormattedMessage id="change" />
                    </Button>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage({ id: 'delete' })}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setPaymentProof(null);
                        setProofPreview(null);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            )}
          </SectionCard>

          {tab3InvalidMsg && (
            <Alert severity="error" sx={{ borderRadius: 1, mb: 1.5 }}>
              {tab3InvalidMsg}
            </Alert>
          )}
          <Box display="flex" justifyContent="flex-start">
            <Button variant="outlined" size="small" onClick={() => setTabActive(2)}>
              ← <FormattedMessage id="back" />
            </Button>
          </Box>
        </TabPanel>
      </ModalC>
    </>
  );
};

Payment.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default Payment;
