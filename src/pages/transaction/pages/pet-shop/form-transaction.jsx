import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import ErrorContainer from 'components/@extended/ErrorContainer';
import IconButton from 'components/@extended/IconButton';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import ModalC from 'components/ModalC';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductClinicDropdown, getProductSellDropdown } from 'pages/product/product-list/service';
import {
  createPetShopTransaction,
  generateInvoicePetShopTransaction,
  getLocationTransactionList,
  getPaymentMethodTransactionList,
  getPromoList,
  getTransactionPetShopDetail,
  submitPromoDiscount,
  updatePetShopTransaction
} from 'pages/transaction/service';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getCustomerByLocationList, processDownloadPDF } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { formatThousandSeparator, jsonCentralized } from 'utils/func';
import { create } from 'zustand';
import FormPaymentMethod from './form/FormPaymentMethod';

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ['Customer & Lokasi', 'Produk', 'Pembayaran'];

const CONSTANT_FORM_VALUE = {
  customer: '',
  location: null,
  customerId: '',
  customerName: null,
  productSellSelected: null,
  productSellStock: 0,
  productSellMinPrice: 0,
  productSellPrice: null,
  productSellQuantity: null,
  productClinicSelected: null,
  productClinicStock: 0,
  productClinicMinPrice: 0,
  productClinicPrice: null,
  productClinicQuantity: null,
  notes: '',
  paymentMethodSelected: null
};

const INITIAL_STATE_PROMO = {
  freeItems: [],
  discounts: [],
  bundles: [],
  basedSales: []
};

// ── Zustand store ─────────────────────────────────────────────────────────────

export const dropdownList = create(() =>
  jsonCentralized({
    locationList: [],
    customerList: [],
    productSellList: [],
    productClinicList: [],
    paymentMethodList: [],
    promoFreeItem: [],
    promoDiscount: [],
    promoBundles: [],
    promoBasedSales: []
  })
);
export const getDropdownAll = () => dropdownList.getState();

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <Grid item xs={12}>
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
      <Typography variant="subtitle2" color="primary.dark" fontWeight="bold">
        {children}
      </Typography>
      <Divider />
    </Stack>
  </Grid>
);
SectionLabel.propTypes = { children: PropTypes.node };

// ── Main Component ────────────────────────────────────────────────────────────

const FormTransactionPetShop = (props) => {
  const { open, onClose, id } = props;

  const [isEditForm, setIsEditForm] = useState(!!id);
  const [formValue, setFormValue] = useState({ ...CONSTANT_FORM_VALUE });
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  const [, setIsError] = useState(false);
  const [formErrors, setFormErrors] = useState({
    productSellSelectedError: '',
    productSellMinPriceError: '',
    productSellQuantityError: '',
    productClinicSelectedError: '',
    productClinicMinPriceError: '',
    productClinicQuantityError: ''
  });
  const [newTransactionData, setNewTransactionData] = useState([]);
  const [newTransactionSummaryData, setNewTransactionSummaryData] = useState(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoData, setPromoData] = useState(INITIAL_STATE_PROMO);
  const [selectedPromoData, setSelectedPromoData] = useState(INITIAL_STATE_PROMO);
  const [openFormPaymentMethod, setOpenFormPaymentMethod] = useState(false);
  const [disabledOk, setDisabledOk] = useState(false);

  // Stepper (create mode only)
  const [activeStep, setActiveStep] = useState(0);
  const [stepError, setStepError] = useState('');

  const customerList = dropdownList((state) => state.customerList);
  const paymentMethodList = dropdownList((state) => state.paymentMethodList);
  const productSellList = dropdownList((state) => state.productSellList);
  const productClinicList = dropdownList((state) => state.productClinicList);

  const dispatch = useDispatch();

  // ── Dropdown loaders ─────────────────────────────────────────────────────

  const getCustomerByLocation = async (locationId) => {
    const customers = await getCustomerByLocationList(locationId);
    dropdownList.setState((prev) => ({ ...prev, customerList: customers }));
  };

  const getDropdownList = async () => {
    const getLocation = await getLocationTransactionList();
    const getPaymentMethod = await getPaymentMethodTransactionList();
    dropdownList.setState((prev) => ({ ...prev, locationList: getLocation, paymentMethodList: getPaymentMethod }));
  };

  // ── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      loaderGlobalConfig.setLoader(true);
      await getDropdownList();
      loaderGlobalConfig.setLoader(false);
      loaderService.setManualLoader(false);
    };
    init();
    return () => {
      dropdownList.setState(
        jsonCentralized({ locationList: [], customerList: [], productSellList: [], productClinicList: [], paymentMethodList: [] })
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Product dropdown when location changes ────────────────────────────────

  useEffect(() => {
    if (!formValue.location) return;
    setNewTransactionData([]);
    setNewTransactionSummaryData(null);

    const loadProducts = async () => {
      const [sells, clinics] = await Promise.all([
        getProductSellDropdown(formValue.location.value),
        getProductClinicDropdown(formValue.location.value)
      ]);
      dropdownList.setState((prev) => ({
        ...prev,
        productSellList: sells.map((p) => ({ ...p, label: `${p.data.fullName} - ${formatThousandSeparator(p.data.price)}` })),
        productClinicList: clinics.map((p) => ({ ...p, label: `${p.data.fullName} - ${formatThousandSeparator(p.data.price)}` }))
      }));
    };
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue.location]);

  // ── Edit: load detail ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    setIsEditForm(true);

    const getDetail = async () => {
      loaderGlobalConfig.setLoader(true);
      try {
        const resp = await getTransactionPetShopDetail({ id });
        const detail = resp.data.detail;

        const locations = await getLocationTransactionList();
        const selectedLocation = locations.find((l) => l.label === detail.locationName) || null;

        let selectedCustomer = null;
        if (selectedLocation) {
          const customers = await getCustomerByLocationList(selectedLocation.value);
          dropdownList.setState((prev) => ({ ...prev, customerList: customers }));
          selectedCustomer = customers.find((c) => c.label.split(' - ')[1] === detail.customerName) || null;
        }

        const paymentMethods = await getPaymentMethodTransactionList();
        const paymentMethodSelected = paymentMethods.find((p) => p.label === detail.paymentMethod) || null;

        setFormValue((prev) => ({
          ...prev,
          customer: 'old',
          location: selectedLocation,
          customerName: selectedCustomer,
          paymentMethodSelected,
          notes: detail.notes
        }));

        setSelectedPromoData((prev) => ({
          ...prev,
          ...detail.selectedPromos,
          basedSales: Array.isArray(detail.selectedPromos?.basedSales)
            ? detail.selectedPromos.basedSales[0] || null
            : detail.selectedPromos?.basedSales || null
        }));

        const mappedProducts = (detail.products || [])
          .filter((p) => p.category === 'sell' || p.category === 'clinic')
          .map((p) => ({
            locationId: selectedLocation?.value,
            productId: p.productId,
            productName: p.item_name,
            category: p.category === 'sell' ? 'productSell' : 'productClinic',
            quantity: +p.quantity,
            unitPrice: +p.unit_price,
            totalPrice: +p.total
          }));
        setNewTransactionData(mappedProducts);
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      } finally {
        loaderGlobalConfig.setLoader(false);
      }
    };
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-apply promo summary in edit mode
  useEffect(() => {
    if (!isEditForm || !newTransactionData.length) return;
    onSubmitPromo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTransactionData, selectedPromoData, isEditForm]);

  // ── Payment method ────────────────────────────────────────────────────────

  const onAddPaymentMethod = () => setOpenFormPaymentMethod(true);
  const onCloseFormPaymentMethod = async (val) => {
    if (val) {
      setOpenFormPaymentMethod(false);
      const list = await getPaymentMethodTransactionList();
      dropdownList.setState((prev) => ({ ...prev, paymentMethodList: list }));
    }
  };

  // ── Field handlers ────────────────────────────────────────────────────────

  const onFieldHandler = (e) => setFormValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Product: Sell ─────────────────────────────────────────────────────────

  const addProductSellToTransactionList = () => {
    const isLowerThanMin = Number(formValue.productSellPrice) < formValue.productSellMinPrice;
    const isExceedStock = Number(formValue.productSellQuantity) > formValue.productSellStock;
    const isAlreadyAdded = newTransactionData.some((i) => i.productId === formValue.productSellSelected?.value);

    if (isLowerThanMin || isExceedStock || isAlreadyAdded) {
      setIsError(true);
      setFormErrors((prev) => ({
        ...prev,
        productSellSelectedError: isAlreadyAdded ? 'Product already added.' : '',
        productSellMinPriceError:
          !isAlreadyAdded && isLowerThanMin ? `Harga minimal: ${formatThousandSeparator(formValue.productSellMinPrice)}` : '',
        productSellQuantityError: !isAlreadyAdded && isExceedStock ? `Stok hanya ${formValue.productSellStock}` : ''
      }));
      return;
    }

    setNewTransactionData((prev) => [
      ...prev,
      {
        locationId: formValue.location.value,
        productId: formValue.productSellSelected.value,
        productName: formValue.productSellSelected.label,
        category: 'productSell',
        quantity: +formValue.productSellQuantity,
        unitPrice: +formValue.productSellPrice,
        totalPrice: +formValue.productSellPrice * +formValue.productSellQuantity
      }
    ]);
    setFormValue((prev) => ({
      ...prev,
      productSellSelected: null,
      productSellStock: 0,
      productSellMinPrice: 0,
      productSellPrice: null,
      productSellQuantity: null
    }));
    setFormErrors((prev) => ({ ...prev, productSellSelectedError: '', productSellMinPriceError: '', productSellQuantityError: '' }));
    setIsError(false);
  };

  // ── Product: Clinic ───────────────────────────────────────────────────────

  const addProductClinicToTransactionList = () => {
    const isLowerThanMin = Number(formValue.productClinicPrice) < formValue.productClinicMinPrice;
    const isExceedStock = Number(formValue.productClinicQuantity) > formValue.productClinicStock;
    const isAlreadyAdded = newTransactionData.some((i) => i.productId === formValue.productClinicSelected?.value);

    if (isLowerThanMin || isExceedStock || isAlreadyAdded) {
      setIsError(true);
      setFormErrors((prev) => ({
        ...prev,
        productClinicSelectedError: isAlreadyAdded ? 'Product already added.' : '',
        productClinicMinPriceError:
          !isAlreadyAdded && isLowerThanMin ? `Harga minimal: ${formatThousandSeparator(formValue.productClinicMinPrice)}` : '',
        productClinicQuantityError: !isAlreadyAdded && isExceedStock ? `Stok hanya ${formValue.productClinicStock}` : ''
      }));
      return;
    }

    setNewTransactionData((prev) => [
      ...prev,
      {
        locationId: formValue.location.value,
        productId: formValue.productClinicSelected.value,
        productName: formValue.productClinicSelected.label,
        category: 'productClinic',
        quantity: +formValue.productClinicQuantity,
        unitPrice: +formValue.productClinicPrice,
        totalPrice: +formValue.productClinicPrice * +formValue.productClinicQuantity
      }
    ]);
    setFormValue((prev) => ({
      ...prev,
      productClinicSelected: null,
      productClinicStock: 0,
      productClinicMinPrice: 0,
      productClinicPrice: null,
      productClinicQuantity: null
    }));
    setFormErrors((prev) => ({ ...prev, productClinicSelectedError: '', productClinicMinPriceError: '', productClinicQuantityError: '' }));
    setIsError(false);
  };

  // ── Promo ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isPromoOpen) return;
    const load = async () => {
      const body = newTransactionData.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        eachPrice: i.unitPrice,
        priceOverall: i.totalPrice,
        locationId: i.locationId
      }));
      const resp = await getPromoList({ customerId: formValue?.customerName?.value || null, transactions: JSON.stringify(body) });
      const p = resp.data;
      setPromoData({ freeItems: p.freeItem, discounts: p.discount, bundles: p.bundles, basedSales: p.basedSales });
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPromoOpen]);

  const handlePromoChange = (key, multiple) => (_, selected) => {
    setSelectedPromoData((prev) => ({
      ...prev,
      [key]: multiple ? selected.map((i) => i.id) : selected?.id || null
    }));
  };

  const getSelectedObjects = (key, multiple) => {
    const ids = selectedPromoData[key];
    return multiple ? promoData[key].filter((i) => ids.includes(i.id)) : promoData[key].find((i) => i.id === ids);
  };

  const renderPromoAutocomplete = (inputId, labelId, key, multiple = true) => (
    <Grid item xs={12}>
      <Stack spacing={1}>
        <InputLabel htmlFor={inputId}>
          <FormattedMessage id={labelId} />
        </InputLabel>
        <Autocomplete
          id={inputId}
          multiple={multiple}
          options={promoData[key]}
          value={getSelectedObjects(key, multiple)}
          getOptionLabel={(o) => o.name || ''}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          onChange={handlePromoChange(key, multiple)}
          renderInput={(params) => <TextField {...params} placeholder="Pilih..." />}
          renderOption={(liProps, o) => (
            <li {...liProps} key={o.id}>
              <div>
                <strong>{o.name}</strong>
                <br />
                <small>{o.note}</small>
              </div>
            </li>
          )}
        />
      </Stack>
    </Grid>
  );

  const onSubmitPromo = async () => {
    try {
      const resp = await submitPromoDiscount({
        freeItems: JSON.stringify(selectedPromoData.freeItems),
        discounts: JSON.stringify(selectedPromoData.discounts),
        bundles: JSON.stringify(selectedPromoData.bundles),
        basedSales: +selectedPromoData.basedSales,
        products: JSON.stringify(
          newTransactionData.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            eachPrice: i.unitPrice,
            priceOverall: i.totalPrice,
            locationId: i.location
          }))
        )
      });
      setNewTransactionSummaryData(resp.data);
      setIsPromoOpen(false);
    } catch (err) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onPrint = async (transactionId) => {
    try {
      const resp = await generateInvoicePetShopTransaction(transactionId);
      processDownloadPDF(resp, 'nota_petshop');
      dispatch(snackbarSuccess('Invoice berhasil dicetak'));
    } catch (err) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onSubmit = async ({ withPrint = false } = {}) => {
    const responseError = (err) => {
      dispatch(snackbarError(createMessageBackend(err)));
      const { msg, detail } = createMessageBackend(err, true);
      setErrContent({ title: msg, detail });
    };

    const isNewCustomer = formValue.customer === 'new';
    const customer = isNewCustomer ? formValue.customerName : formValue.customerName.value;
    const productList = newTransactionData.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.unitPrice,
      note: null,
      promoId: null
    }));
    const payload = {
      isNewCustomer,
      customerId: isNewCustomer ? '' : customer,
      customerName: isNewCustomer ? customer : '',
      registrant: '',
      locationId: formValue.location.value,
      serviceCategory: 'Pet Shop',
      notes: formValue.notes,
      paymentMethod: formValue.paymentMethodSelected.value,
      productList,
      selectedPromos: selectedPromoData
    };

    try {
      setDisabledOk(true);
      let resp;

      if (isEditForm) {
        resp = await updatePetShopTransaction({ id, ...payload });
      } else {
        resp = await createPetShopTransaction(payload);
      }

      if (resp?.status === 200) {
        if (withPrint) await onPrint(resp.data.transactionId);
        dispatch(snackbarSuccess(`Transaksi berhasil ${isEditForm ? 'diperbarui' : 'dibuat'}`));
        onClose(true);
      }
    } catch (err) {
      responseError(err);
    } finally {
      setDisabledOk(false);
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────

  const clearForm = () => {
    setFormValue({ ...CONSTANT_FORM_VALUE });
    setErrContent({ title: '', detail: '' });
    setIsError(false);
    setFormErrors({
      productSellSelectedError: '',
      productSellMinPriceError: '',
      productSellQuantityError: '',
      productClinicSelectedError: '',
      productClinicMinPriceError: '',
      productClinicQuantityError: ''
    });
    setNewTransactionData([]);
    setNewTransactionSummaryData(null);
    setPromoData(INITIAL_STATE_PROMO);
    setSelectedPromoData(INITIAL_STATE_PROMO);
    setActiveStep(0);
    setStepError('');
  };

  // ── Stepper navigation ────────────────────────────────────────────────────

  const validateStep = (step) => {
    if (step === 0) {
      if (!formValue.customer) return 'Pilih tipe customer terlebih dahulu';
      if (!formValue.location) return 'Pilih lokasi terlebih dahulu';
      if (formValue.customer === 'old' && !formValue.customerName) return 'Pilih nama customer';
      if (formValue.customer === 'new' && !String(formValue.customerName || '').trim()) return 'Isi nama customer baru';
      return '';
    }
    if (step === 1) {
      if (newTransactionData.length === 0) return 'Tambahkan minimal satu produk terlebih dahulu';
      return '';
    }
    if (step === 2) {
      if (!formValue.paymentMethodSelected) return 'Pilih metode pembayaran terlebih dahulu';
      return '';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep(activeStep);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError('');
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepError('');
    setActiveStep((s) => s - 1);
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      { Header: 'No.', accessor: (_, i) => i + 1, id: 'rowNumber', isNotSorting: true, Cell: ({ row }) => row.index + 1 },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'productName',
        isNotSorting: true,
        Cell: (data) => data.value.split('-')[0]
      },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        isNotSorting: true,
        Cell: (data) => (data.value === 'productSell' ? 'Product Sell' : 'Product Clinic')
      },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unitPrice',
        isNotSorting: true,
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'totalPrice',
        isNotSorting: true,
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (data) => (
          <IconButton
            size="large"
            color="error"
            onClick={() =>
              setNewTransactionData((prev) => {
                const next = prev.filter((i) => i.productId !== data.row.original.productId);
                if (!next.length) setNewTransactionSummaryData(null);
                return next;
              })
            }
          >
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const summaryColumns = useMemo(
    () => [
      { Header: 'No.', accessor: (_, i) => i + 1, id: 'rowNumber', isNotSorting: true, Cell: ({ row }) => row.index + 1 },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'item_name',
        isNotSorting: true,
        Cell: (data) => {
          const extras = data.row.original?.included_items || [];
          return (
            <div>
              <p style={{ margin: 0 }}>{data.value}</p>
              {extras.map((e, i) => (
                <p key={e.name + i} style={{ margin: 0, fontSize: 12, color: '#888' }}>
                  {e.name} (normal Rp {formatThousandSeparator(e.normal_price)})
                </p>
              ))}
            </div>
          );
        }
      },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        isNotSorting: true,
        Cell: (data) => (data.value === 'productSell' ? 'Product Sell' : 'Product Clinic')
      },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="bonus" />, accessor: 'bonus', isNotSorting: true },
      { Header: <FormattedMessage id="discount" />, accessor: 'discount', isNotSorting: true, Cell: (data) => `${data.value}%` },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unit_price',
        isNotSorting: true,
        Cell: (data) => formatThousandSeparator(data?.value || data.row.original.total)
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'total',
        isNotSorting: true,
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Summary box ───────────────────────────────────────────────────────────

  const renderSummaryBox = () =>
    newTransactionSummaryData && (
      <Grid item xs={12}>
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="primary.dark" fontWeight="bold" mb={1.5}>
            Ringkasan Transaksi
          </Typography>
          <Box sx={{ overflowX: 'auto', mb: 2 }}>
            <ReactTable columns={summaryColumns} data={newTransactionSummaryData.purchases} />
          </Box>
          <Stack spacing={0.5} alignItems="flex-end">
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" fontWeight={600}>
                Rp {formatThousandSeparator(newTransactionSummaryData.subtotal)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">{newTransactionSummaryData.discount_note}:</Typography>
              <Typography variant="body2" fontWeight={600} color="error.main">
                - Rp {formatThousandSeparator(newTransactionSummaryData.total_discount)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" fontWeight={700}>
                <FormattedMessage id="total-payment" />:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="success.main">
                Rp {formatThousandSeparator(newTransactionSummaryData.total_payment)}
              </Typography>
            </Stack>
          </Stack>
          {newTransactionSummaryData.promo_notes?.length > 0 && (
            <Box mt={1.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Keterangan Promo:
              </Typography>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                {newTransactionSummaryData.promo_notes.map((n, i) => (
                  <li key={n + i} style={{ fontSize: 12 }}>
                    {n}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      </Grid>
    );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 0 — Customer & Lokasi
  // ══════════════════════════════════════════════════════════════════════════

  const renderStep0 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel required>
            <FormattedMessage id="new-or-existing-customer" />
          </InputLabel>
          <FormControl fullWidth size="small">
            <Select
              id="customer"
              name="customer"
              value={formValue.customer}
              onChange={(e) =>
                setFormValue((prev) => ({
                  ...prev,
                  customer: e.target.value,
                  location: null,
                  customerName: null
                }))
              }
            >
              <MenuItem value="">
                <em>
                  <FormattedMessage id="select-customer" />
                </em>
              </MenuItem>
              <MenuItem value="old">
                <FormattedMessage id="customer-old" />
              </MenuItem>
              <MenuItem value="new">
                <FormattedMessage id="customer-new" />
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      {formValue.customer && (
        <>
          <SectionLabel>Lokasi</SectionLabel>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="location" />
              </InputLabel>
              <Autocomplete
                id="location"
                options={getDropdownAll().locationList}
                value={formValue.location}
                isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                onChange={(_, selected) => {
                  const loc = selected || null;
                  setFormValue((e) => ({ ...e, location: loc, customerName: null }));
                  dropdownList.setState((prev) => ({ ...prev, customerList: [] }));
                  if (loc) getCustomerByLocation(loc.value);
                }}
                renderInput={(params) => <TextField {...params} placeholder="Pilih lokasi..." />}
              />
            </Stack>
          </Grid>
        </>
      )}

      {formValue.customer && formValue.location && (
        <>
          <SectionLabel>Informasi Customer</SectionLabel>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="customer-name" />
              </InputLabel>
              {formValue.customer === 'old' ? (
                <Autocomplete
                  id="customerName"
                  options={customerList}
                  value={formValue.customerName}
                  isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                  onChange={(_, sel) => setFormValue((e) => ({ ...e, customerName: sel || null }))}
                  renderInput={(params) => <TextField {...params} placeholder="Cari nama customer..." />}
                />
              ) : (
                <TextField
                  fullWidth
                  id="customerName"
                  name="customerName"
                  value={formValue.customerName || ''}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Nama lengkap customer baru"
                />
              )}
            </Stack>
          </Grid>
        </>
      )}
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Produk
  // ══════════════════════════════════════════════════════════════════════════

  const renderProductSection = (type) => {
    const isSell = type === 'sell';
    const selectedKey = isSell ? 'productSellSelected' : 'productClinicSelected';
    const listKey = isSell ? productSellList : productClinicList;
    const priceKey = isSell ? 'productSellPrice' : 'productClinicPrice';
    const qtyKey = isSell ? 'productSellQuantity' : 'productClinicQuantity';
    const minPriceKey = isSell ? 'productSellMinPrice' : 'productClinicMinPrice';
    const stockKey = isSell ? 'productSellStock' : 'productClinicStock';
    const errSelected = isSell ? 'productSellSelectedError' : 'productClinicSelectedError';
    const errMin = isSell ? 'productSellMinPriceError' : 'productClinicMinPriceError';
    const errQty = isSell ? 'productSellQuantityError' : 'productClinicQuantityError';
    const addFn = isSell ? addProductSellToTransactionList : addProductClinicToTransactionList;

    return (
      <>
        <Grid item xs={12} sm={5}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id={isSell ? 'product-sell' : 'product-clinic'} />
            </InputLabel>
            <Autocomplete
              id={isSell ? 'productSell' : 'productClinic'}
              options={listKey}
              value={formValue[selectedKey]}
              isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
              onChange={(_, sel) => {
                setFormValue((e) => ({
                  ...e,
                  [selectedKey]: sel || null,
                  [minPriceKey]: sel ? +sel.data.price : 0,
                  [stockKey]: sel ? +sel.data.inStock : 0
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} error={Boolean(formErrors[errSelected])} helperText={formErrors[errSelected]} />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="price" />
            </InputLabel>
            <TextField
              fullWidth
              id={priceKey}
              name={priceKey}
              value={formValue[priceKey] || ''}
              onChange={onFieldHandler}
              error={Boolean(formErrors[errMin])}
              helperText={formErrors[errMin]}
              placeholder={formValue[minPriceKey] ? `Min. ${formatThousandSeparator(formValue[minPriceKey])}` : ''}
            />
          </Stack>
        </Grid>
        <Grid item xs={10} sm={3}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="quantity" />
              {formValue[stockKey] > 0 && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  (stok: {formValue[stockKey]})
                </Typography>
              )}
            </InputLabel>
            <TextField
              fullWidth
              id={qtyKey}
              name={qtyKey}
              value={formValue[qtyKey] || ''}
              onChange={onFieldHandler}
              error={Boolean(formErrors[errQty])}
              helperText={formErrors[errQty]}
              type="number"
              inputProps={{ min: 1 }}
            />
          </Stack>
        </Grid>
        <Grid item xs={2} sm={1} sx={{ display: 'flex', alignItems: 'flex-end', pb: 0.5 }}>
          <IconButton
            size="medium"
            variant="contained"
            color="primary"
            onClick={addFn}
            title={`Tambah ${isSell ? 'Product Sell' : 'Product Clinic'}`}
          >
            <PlusOutlined />
          </IconButton>
        </Grid>
      </>
    );
  };

  const renderStep1 = () => (
    <Grid container spacing={3}>
      <SectionLabel>Product Sell</SectionLabel>
      {renderProductSection('sell')}

      <SectionLabel>Product Clinic</SectionLabel>
      {renderProductSection('clinic')}

      {newTransactionData.length > 0 && (
        <>
          <SectionLabel>Daftar Produk ({newTransactionData.length} item)</SectionLabel>
          <Grid item xs={12} sx={{ overflowX: 'auto' }}>
            <ReactTable columns={columns} data={newTransactionData} />
          </Grid>
        </>
      )}
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2 — Pembayaran
  // ══════════════════════════════════════════════════════════════════════════

  const renderStep2 = () => (
    <Grid container spacing={3}>
      {/* Promo */}
      <SectionLabel>Promo (Opsional)</SectionLabel>
      <Grid item xs={12}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" size="small" disabled={!newTransactionData.length} onClick={() => setIsPromoOpen(true)}>
            {newTransactionSummaryData ? '✓ Promo Diterapkan — Ubah' : 'Pilih Promo'}
          </Button>
          {newTransactionSummaryData && (
            <Button
              variant="text"
              size="small"
              color="inherit"
              onClick={() => {
                setSelectedPromoData(INITIAL_STATE_PROMO);
                setNewTransactionSummaryData(null);
              }}
            >
              Reset Promo
            </Button>
          )}
        </Stack>
      </Grid>

      {renderSummaryBox()}

      {/* Notes & Payment */}
      <SectionLabel>Catatan &amp; Pembayaran</SectionLabel>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="notes" />
          </InputLabel>
          <TextField
            fullWidth
            multiline
            rows={3}
            id="notes"
            name="notes"
            value={formValue.notes || ''}
            onChange={onFieldHandler}
            placeholder="Catatan tambahan (opsional)..."
          />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel required>
            <FormattedMessage id="payment-method" />
          </InputLabel>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box flex={1}>
              <Autocomplete
                id="paymentMethod"
                options={paymentMethodList}
                value={formValue.paymentMethodSelected}
                isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                onChange={(_, sel) => setFormValue((e) => ({ ...e, paymentMethodSelected: sel || null }))}
                renderInput={(params) => <TextField {...params} placeholder="Pilih metode pembayaran..." />}
              />
            </Box>
            <IconButton
              size="medium"
              variant="contained"
              color="primary"
              onClick={onAddPaymentMethod}
              title="Tambah metode pembayaran"
              sx={{ mt: 0.5, flexShrink: 0 }}
            >
              <PlusOutlined />
            </IconButton>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT MODE — Flat form dengan SectionLabels
  // ══════════════════════════════════════════════════════════════════════════

  const renderEditForm = () => (
    <Grid container spacing={3}>
      {/* Customer & Lokasi — read-only in edit */}
      <SectionLabel>Customer &amp; Lokasi</SectionLabel>
      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="customer-name" />
          </InputLabel>
          {formValue.customer === 'old' ? (
            <Autocomplete
              id="customerName"
              options={customerList}
              value={formValue.customerName}
              isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
              onChange={(_, sel) => setFormValue((e) => ({ ...e, customerName: sel || null }))}
              renderInput={(params) => <TextField {...params} />}
              disabled
            />
          ) : (
            <TextField
              fullWidth
              id="customerName"
              name="customerName"
              value={formValue.customerName || ''}
              onChange={onFieldHandler}
              disabled
            />
          )}
        </Stack>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="location" />
          </InputLabel>
          <Autocomplete
            id="location"
            options={getDropdownAll().locationList}
            value={formValue.location}
            isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
            renderInput={(params) => <TextField {...params} />}
            disabled
          />
        </Stack>
      </Grid>

      {/* Produk */}
      <SectionLabel>Product Sell</SectionLabel>
      {renderProductSection('sell')}
      <SectionLabel>Product Clinic</SectionLabel>
      {renderProductSection('clinic')}

      {newTransactionData.length > 0 && (
        <>
          <SectionLabel>Daftar Produk ({newTransactionData.length} item)</SectionLabel>
          <Grid item xs={12} sx={{ overflowX: 'auto' }}>
            <ReactTable columns={columns} data={newTransactionData} />
          </Grid>
        </>
      )}

      {/* Promo */}
      <SectionLabel>Promo (Opsional)</SectionLabel>
      <Grid item xs={12}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" size="small" disabled={!newTransactionData.length} onClick={() => setIsPromoOpen(true)}>
            {newTransactionSummaryData ? '✓ Promo Diterapkan — Ubah' : 'Pilih Promo'}
          </Button>
          {newTransactionSummaryData && (
            <Button
              variant="text"
              size="small"
              color="inherit"
              onClick={() => {
                setSelectedPromoData(INITIAL_STATE_PROMO);
                setNewTransactionSummaryData(null);
              }}
            >
              Reset Promo
            </Button>
          )}
        </Stack>
      </Grid>
      {renderSummaryBox()}

      {/* Catatan & Pembayaran */}
      <SectionLabel>Catatan &amp; Pembayaran</SectionLabel>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="notes" />
          </InputLabel>
          <TextField fullWidth multiline rows={3} id="notes" name="notes" value={formValue.notes || ''} onChange={onFieldHandler} />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="payment-method" />
          </InputLabel>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box flex={1}>
              <Autocomplete
                id="paymentMethod"
                options={paymentMethodList}
                value={formValue.paymentMethodSelected}
                isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                onChange={(_, sel) => setFormValue((e) => ({ ...e, paymentMethodSelected: sel || null }))}
                renderInput={(params) => <TextField {...params} />}
              />
            </Box>
            <IconButton size="medium" variant="contained" color="primary" onClick={onAddPaymentMethod} sx={{ mt: 0.5, flexShrink: 0 }}>
              <PlusOutlined />
            </IconButton>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );

  // ── Footer ────────────────────────────────────────────────────────────────

  const renderFooter = () => {
    if (isEditForm) {
      return (
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Button variant="outlined" onClick={clearForm}>
            <FormattedMessage id="clear" />
          </Button>
          <Button variant="outlined" onClick={() => onSubmit({ withPrint: true })} disabled={disabledOk}>
            <FormattedMessage id="save-and-print" />
          </Button>
          <Button variant="contained" onClick={() => onSubmit({})} disabled={disabledOk}>
            <FormattedMessage id="save" />
          </Button>
        </Stack>
      );
    }

    const isLastStep = activeStep === STEPS.length - 1;
    return (
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Box>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack}>
              ← Kembali
            </Button>
          )}
        </Box>
        <Box>
          {!isLastStep ? (
            <Button variant="contained" onClick={handleNext}>
              Lanjut →
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => onSubmit({ withPrint: true })} disabled={disabledOk}>
                <FormattedMessage id="save-and-print" />
              </Button>
              <Button variant="contained" color="primary" onClick={() => onSubmit({})} disabled={disabledOk}>
                💾 Simpan Transaksi
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ModalC
        title={<FormattedMessage id={(isEditForm ? 'edit' : 'add') + '-transaction'} />}
        open={open}
        onCancel={() => onClose(false)}
        isModalAction={false}
        fullWidth
        maxWidth="lg"
      >
        <ErrorContainer open={Boolean(errContent.title || errContent.detail)} content={errContent} />

        {!isEditForm && (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <Button size="small" variant="text" color="inherit" onClick={clearForm} sx={{ color: 'text.secondary' }}>
                Reset Form
              </Button>
            </Stack>
          </>
        )}

        {stepError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {stepError}
          </Alert>
        )}

        {isEditForm ? (
          renderEditForm()
        ) : (
          <>
            {activeStep === 0 && renderStep0()}
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
          </>
        )}

        {renderFooter()}
      </ModalC>

      {/* ─── Payment method creation modal ─── */}
      <FormPaymentMethod open={openFormPaymentMethod} onClose={onCloseFormPaymentMethod} />

      {/* ─── Promo selection modal ─── */}
      {isPromoOpen && (
        <ModalC
          title={<FormattedMessage id="promo-available" />}
          open={isPromoOpen}
          onOk={onSubmitPromo}
          onCancel={() => setIsPromoOpen(false)}
          fullWidth
          maxWidth="sm"
          otherDialogAction={
            <Button variant="outlined" onClick={() => setSelectedPromoData(INITIAL_STATE_PROMO)}>
              <FormattedMessage id="reset-all" />
            </Button>
          }
        >
          <Grid container spacing={2}>
            {renderPromoAutocomplete('freeItems', 'free-product', 'freeItems')}
            {renderPromoAutocomplete('discounts', 'discount', 'discounts')}
            {renderPromoAutocomplete('bundles', 'bundle', 'bundles')}
            {renderPromoAutocomplete('basedSales', 'based-on-purchase', 'basedSales', false)}
          </Grid>
        </ModalC>
      )}
    </>
  );
};

FormTransactionPetShop.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default FormTransactionPetShop;
