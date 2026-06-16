import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getServiceListByLocation, getLocationList } from 'service/service-global';
import { getProductSellDropdown } from 'pages/product/product-list/service';
import {
  createQuotation,
  updateQuotation,
  getCustomerDropdown,
  getPetDropdown,
  getDiscountOptions,
  calculateDiscount,
  SERVICE_TYPE_OPTIONS
} from '../../service';
import CircularProgress from '@mui/material/CircularProgress';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BlockIcon from '@mui/icons-material/Block';

import ModalC from 'components/ModalC';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const DEFAULT_FORM = {
  customerId: null,
  customerObj: null,
  petId: null,
  petObj: null,
  locationId: '',
  typeOfService: 'clinic',
  validUntil: dayjs().add(7, 'day'),
  notes: '',
  discountAmount: 0,
  items: []
};

const FormQuotation = ({ open, data, onClose }) => {
  const isEdit = Boolean(data?.id);
  const intl   = useIntl();
  const dispatch = useDispatch();

  const [form, setForm]               = useState(DEFAULT_FORM);
  const [customerList, setCustomerList] = useState([]);
  const [petList, setPetList]         = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  // Discount promo state
  const [discountOptions, setDiscountOptions]     = useState([]);
  const [selectedDiscountPromo, setSelectedDiscountPromo] = useState(null); // null = no discount
  const [discountLoading, setDiscountLoading]     = useState(false);

  // Row input states
  const [newItemType, setNewItemType]     = useState('service');
  const [newItemObj, setNewItemObj]       = useState(null);
  const [newQty, setNewQty]               = useState(1);
  const [newUnitPrice, setNewUnitPrice]   = useState('');
  const [newUnitPriceErr, setNewUnitPriceErr] = useState('');
  const [newNotes, setNewNotes]           = useState('');

  const errorMsgUnitPrice = intl.formatMessage({ id: 'unit-price-mus-not-exceed-base-price' });

  // Base price item yang sedang dipilih
  const getBasePrice = () => {
    if (!newItemObj) return 0;
    return newItemType === 'service'
      ? +(newItemObj.price ?? 0)
      : +(newItemObj.data?.price ?? 0);
  };

  // ── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    getLocationList().then((resp) => setLocationList(resp || []));

    if (isEdit && data) {
      setForm({
        customerId:     data.quotation?.customerId,
        customerObj:    { id: data.quotation?.customerId, label: data.quotation?.customerName },
        petId:          data.quotation?.petId,
        petObj:         data.quotation?.petName ? { id: data.quotation?.petId, label: data.quotation?.petName } : null,
        locationId:     data.quotation?.locationId ?? '',
        typeOfService:  data.quotation?.typeOfService ?? 'clinic',
        validUntil:     dayjs(data.quotation?.validUntil),
        notes:          data.quotation?.notes ?? '',
        discountAmount: data.quotation?.discountAmount ?? 0,
        items:          (data.items || []).map((i) => ({
          itemType:  i.itemType,
          serviceId: i.serviceId,
          productId: i.productId,
          itemName:  i.itemName,
          quantity:  i.quantity,
          unitPrice: i.unitPrice,
          totalPrice:i.totalPrice,
          notes:     i.notes ?? ''
        }))
      });
      if (data.quotation?.customerId) {
        getPetDropdown(data.quotation.customerId).then((r) => setPetList(r.data || []));
      }
    } else {
      setForm(DEFAULT_FORM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fetch customer, services, products & discount options saat lokasi berubah
  useEffect(() => {
    if (!form.locationId) return;

    // Customer — filter by lokasi, reset pilihan customer & pet
    setCustomerList([]);
    setForm((prev) => ({ ...prev, customerId: null, customerObj: null, petId: null, petObj: null }));
    setPetList([]);
    getCustomerDropdown(form.locationId).then((resp) => setCustomerList(resp.data || []));

    // Services & products
    getServiceListByLocation([form.locationId]).then((resp) =>
      setServiceList((resp || []).map((s) => ({ ...s, label: `${s.label} — Rp ${s.price}`, value: +s.id })))
    );
    getProductSellDropdown(form.locationId).then((resp) =>
      setProductList((resp || []).map((p) => ({ ...p, label: `${p.label} — Rp ${p.data.price}`, value: +p.value })))
    );

    // Discount options
    setDiscountOptions([]);
    setSelectedDiscountPromo(null);
    setForm((prev) => ({ ...prev, discountAmount: 0 }));
    getDiscountOptions(form.locationId).then((resp) => setDiscountOptions(resp.data || []));
  }, [form.locationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-hitung diskon saat promo atau items berubah
  useEffect(() => {
    if (!selectedDiscountPromo) {
      setForm((prev) => ({ ...prev, discountAmount: 0 }));
      return;
    }
    if (form.items.length === 0) {
      setForm((prev) => ({ ...prev, discountAmount: 0 }));
      return;
    }
    setDiscountLoading(true);
    calculateDiscount(selectedDiscountPromo.id, form.items)
      .then((resp) => {
        setForm((prev) => ({ ...prev, discountAmount: resp.data?.discountAmount ?? 0 }));
      })
      .catch(() => {})
      .finally(() => setDiscountLoading(false));
  }, [selectedDiscountPromo, form.items]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset unit price & error saat item type ganti
  const onItemTypeChange = (type) => {
    setNewItemType(type);
    setNewItemObj(null);
    setNewUnitPrice('');
    setNewUnitPriceErr('');
  };

  // Saat item (service/product) dipilih — auto-fill harga satuan dengan base price
  const onItemObjChange = (_, sel) => {
    setNewItemObj(sel);
    setNewUnitPriceErr('');
    if (sel) {
      const base = newItemType === 'service' ? +(sel.price ?? 0) : +(sel.data?.price ?? 0);
      setNewUnitPrice(String(base));
    } else {
      setNewUnitPrice('');
    }
  };

  const onUnitPriceChange = (e) => {
    const val = e.target.value;
    setNewUnitPrice(val);
    const base = getBasePrice();
    setNewUnitPriceErr(base > 0 && +val > base ? errorMsgUnitPrice : '');
  };

  const onCustomerChange = (_, selected) => {
    setForm((prev) => ({ ...prev, customerId: selected?.id ?? null, customerObj: selected, petId: null, petObj: null }));
    setPetList([]);
    if (selected?.id) {
      getPetDropdown(selected.id).then((r) => setPetList(r.data || []));
    }
  };

  // ── Items ────────────────────────────────────────────────────────────────
  const canAddItem = newItemObj && Number(newQty) > 0 && Number(newUnitPrice) > 0 && !newUnitPriceErr;

  const onAddItem = () => {
    const isService = newItemType === 'service';
    const item = {
      itemType:  newItemType,
      serviceId: isService ? newItemObj.value : null,
      productId: !isService ? newItemObj.value : null,
      itemName:  newItemObj.name || newItemObj.label?.split(' —')[0] || '',
      quantity:  Number(newQty),
      unitPrice: Number(newUnitPrice),
      totalPrice:Number(newQty) * Number(newUnitPrice),
      notes:     newNotes
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItemObj(null);
    setNewQty(1);
    setNewUnitPrice('');
    setNewUnitPriceErr('');
    setNewNotes('');
  };

  const onRemoveItem = (idx) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = form.items.reduce((s, i) => s + i.totalPrice, 0);
  const finalAmt = subtotal - Number(form.discountAmount || 0);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async () => {
    if (!form.customerId)    return dispatch(snackbarError(intl.formatMessage({ id: 'please-select-customer' })));
    if (!form.locationId)    return dispatch(snackbarError(intl.formatMessage({ id: 'please-select-location' })));
    if (!form.validUntil)    return dispatch(snackbarError(intl.formatMessage({ id: 'please-fill-valid-date' })));
    if (form.items.length === 0) return dispatch(snackbarError(intl.formatMessage({ id: 'please-add-min-item' })));

    const payload = {
      id:             data?.quotation?.id,
      customerId:     form.customerId,
      petId:          form.petId ?? undefined,
      locationId:     form.locationId,
      typeOfService:  form.typeOfService,
      validUntil:     form.validUntil ? dayjs(form.validUntil).format('YYYY-MM-DD') : '',
      notes:          form.notes,
      discountAmount: Number(form.discountAmount || 0),
      items:          form.items
    };

    try {
      if (isEdit) {
        await updateQuotation(payload);
        dispatch(snackbarSuccess(intl.formatMessage({ id: 'quotation-updated-success' })));
      } else {
        await createQuotation(payload);
        dispatch(snackbarSuccess(intl.formatMessage({ id: 'quotation-created-success' })));
      }
      onClose(true);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const dropdownOptions = newItemType === 'service' ? serviceList : productList;

  return (
    <ModalC
      title={isEdit ? <FormattedMessage id="edit-quotation" /> : <FormattedMessage id="create-quotation" />}
      open={open}
      onOk={onSubmit}
      okText={<FormattedMessage id="save" />}
      onCancel={() => onClose(false)}
      fullWidth
      maxWidth="md"
    >
      <Grid container spacing={2}>

        {/* ── 1. Lokasi — PERTAMA, memicu filter customer ── */}
        <Grid item xs={12} sm={6}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}><FormattedMessage id="location" /> *</Typography>
            <Select
              size="small"
              value={form.locationId}
              onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}
              fullWidth
            >
              <MenuItem value=""><em><FormattedMessage id="select-branch-first" /></em></MenuItem>
              {locationList.map((l) => (
                <MenuItem key={l.id || l.value} value={l.id || l.value}>{l.locationName || l.label}</MenuItem>
              ))}
            </Select>
          </Stack>
        </Grid>

        {/* ── 2. Jenis Layanan ── */}
        <Grid item xs={12} sm={6}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}><FormattedMessage id="service-type" /> *</Typography>
            <Select
              size="small"
              value={form.typeOfService}
              onChange={(e) => setForm((prev) => ({ ...prev, typeOfService: e.target.value }))}
              fullWidth
            >
              {SERVICE_TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </Stack>
        </Grid>

        {/* ── 3. Customer — difilter by lokasi ── */}
        <Grid item xs={12} sm={6}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}>
              <FormattedMessage id="customer" /> *
              {!form.locationId && (
                <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                  — {intl.formatMessage({ id: 'select-branch-first' })}
                </Typography>
              )}
            </Typography>
            <Autocomplete
              size="small"
              options={customerList}
              value={form.customerObj}
              disabled={!form.locationId}
              getOptionLabel={(o) => o?.label ?? ''}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              filterOptions={(opts, { inputValue }) => {
                const kw = inputValue.toLowerCase();
                return opts.filter(
                  (o) =>
                    (o.customerName ?? o.label ?? '').toLowerCase().includes(kw) ||
                    (o.memberNo ?? '').toLowerCase().includes(kw)
                );
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{option.customerName}</Typography>
                    {option.memberNo && (
                      <Typography variant="caption" color="text.secondary">
                        {option.memberNo}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={form.locationId ? intl.formatMessage({ id: 'no-customer-in-branch' }) : intl.formatMessage({ id: 'select-branch-first' })}
              onChange={onCustomerChange}
              renderInput={(params) => (
                <TextField {...params} placeholder={form.locationId ? intl.formatMessage({ id: 'search' }) : intl.formatMessage({ id: 'select-branch-first' })} />
              )}
            />
          </Stack>
        </Grid>

        {/* ── 4. Hewan — difilter by customer ── */}
        <Grid item xs={12} sm={6}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}><FormattedMessage id="pet" /></Typography>
            <Autocomplete
              size="small"
              options={petList}
              value={form.petObj}
              getOptionLabel={(o) => o?.label ?? ''}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disabled={!form.customerId}
              noOptionsText={intl.formatMessage({ id: 'no-pet-registered' })}
              onChange={(_, sel) => setForm((prev) => ({ ...prev, petId: sel?.id ?? null, petObj: sel }))}
              renderInput={(params) => (
                <TextField {...params} placeholder={form.customerId ? intl.formatMessage({ id: 'pet' }) : intl.formatMessage({ id: 'select-customer-first' })} />
              )}
            />
          </Stack>
        </Grid>

        {/* ── 5. Valid Until ── */}
        <Grid item xs={12} sm={6}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}><FormattedMessage id="valid-until-date" /> *</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                disablePast
                inputFormat="DD/MM/YYYY"
                value={form.validUntil}
                onChange={(v) => setForm((prev) => ({ ...prev, validUntil: v }))}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
              />
            </LocalizationProvider>
          </Stack>
        </Grid>

        {/* ── 6. Notes ── */}
        <Grid item xs={12} sm={6}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}><FormattedMessage id="notes" /></Typography>
            <TextField
              size="small" multiline rows={2} fullWidth
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={intl.formatMessage({ id: 'notes-for-customer' })}
            />
          </Stack>
        </Grid>

        {/* ══ Add Item Section ══ */}
        <Grid item xs={12}>
          <Divider><Typography variant="caption" fontWeight={700} color="text.secondary"><FormattedMessage id="add-item-section" /></Typography></Divider>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}><FormattedMessage id="type" /></Typography>
            <Select
              size="small"
              value={newItemType}
              onChange={(e) => onItemTypeChange(e.target.value)}
              fullWidth
            >
              <MenuItem value="service"><FormattedMessage id="service" /></MenuItem>
              <MenuItem value="product"><FormattedMessage id="product" /></MenuItem>
            </Select>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}>{newItemType === 'service' ? <FormattedMessage id="service" /> : <FormattedMessage id="product" />}</Typography>
            <Autocomplete
              size="small"
              options={dropdownOptions}
              value={newItemObj}
              disabled={!form.locationId}
              isOptionEqualToValue={(o, v) => o?.value === v?.value}
              onChange={onItemObjChange}
              renderInput={(params) => <TextField {...params} placeholder={form.locationId ? intl.formatMessage({ id: 'select' }) : intl.formatMessage({ id: 'select-location-first' })} />}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sm={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}><FormattedMessage id="qty" /></Typography>
            <TextField
              size="small" type="number" fullWidth
              value={newQty} inputProps={{ min: 1 }}
              onChange={(e) => setNewQty(e.target.value)}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} sm={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight={600}>
              <FormattedMessage id="unit-price" />
              {newItemObj && getBasePrice() > 0 && (
                <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                  (maks. Rp {getBasePrice().toLocaleString('id-ID')})
                </Typography>
              )}
            </Typography>
            <TextField
              size="small" type="number" fullWidth
              value={newUnitPrice}
              inputProps={{ min: 0, max: getBasePrice() || undefined }}
              onChange={onUnitPriceChange}
              error={Boolean(newUnitPriceErr)}
              helperText={newUnitPriceErr || ' '}
            />
          </Stack>
        </Grid>

        <Grid item xs={10} sm={1.5} display="flex" alignItems="flex-end">
          <Button
            fullWidth variant="contained" size="small"
            startIcon={<PlusOutlined />}
            disabled={!canAddItem}
            onClick={onAddItem}
          >
            <FormattedMessage id="add" />
          </Button>
        </Grid>

        {/* ══ Items List ══ */}
        {form.items.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
                <Typography variant="caption" fontWeight={700}><FormattedMessage id="item-list" /> ({form.items.length})</Typography>
              </Box>
              <Divider />
              {form.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.25,
                    borderBottom: idx < form.items.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider'
                  }}
                >
                  <Chip
                    label={item.itemType === 'service' ? intl.formatMessage({ id: 'service' }) : intl.formatMessage({ id: 'product' })}
                    size="small"
                    color={item.itemType === 'service' ? 'primary' : 'success'}
                    variant="outlined"
                    sx={{ flexShrink: 0, fontSize: 10 }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600} noWrap>{item.itemName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.quantity} × Rp {Number(item.unitPrice).toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} flexShrink={0}>
                    Rp {Number(item.totalPrice).toLocaleString('id-ID')}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => onRemoveItem(idx)}>
                    <DeleteFilled />
                  </IconButton>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        {form.items.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ borderRadius: 1 }}><FormattedMessage id="no-item-added" /></Alert>
          </Grid>
        )}

        {/* ══ Pilihan Diskon ══ */}
        <Grid item xs={12}>
          <Divider><Typography variant="caption" fontWeight={700} color="text.secondary"><FormattedMessage id="discount" /></Typography></Divider>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={1}>
            <Typography variant="caption" fontWeight={600}>
              <FormattedMessage id="discount-promo" />
              {!form.locationId && (
                <Typography component="span" variant="caption" color="text.disabled"> — {intl.formatMessage({ id: 'select-location-first' })}</Typography>
              )}
            </Typography>

            {/* Opsi: Tidak Pakai Diskon */}
            <Box
              onClick={() => setSelectedDiscountPromo(null)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 1.25, borderRadius: 1.5, border: '2px solid', cursor: 'pointer',
                borderColor: !selectedDiscountPromo ? 'primary.main' : 'divider',
                bgcolor: !selectedDiscountPromo ? 'primary.50' : 'background.paper',
                transition: 'all 0.15s'
              }}
            >
              <BlockIcon fontSize="small" color={!selectedDiscountPromo ? 'primary' : 'disabled'} />
              <Box flex={1}>
                <Typography variant="body2" fontWeight={600}><FormattedMessage id="no-discount" /></Typography>
                <Typography variant="caption" color="text.secondary"><FormattedMessage id="full-price-no-deduction" /></Typography>
              </Box>
              {!selectedDiscountPromo && (
                <Chip label={intl.formatMessage({ id: 'selected' })} size="small" color="primary" variant="filled" sx={{ fontSize: 10 }} />
              )}
            </Box>

            {/* Opsi promo dari DB */}
            {discountOptions.length === 0 && form.locationId && (
              <Typography variant="caption" color="text.disabled" sx={{ pl: 1 }}>
                <FormattedMessage id="no-active-discount-promo" />
              </Typography>
            )}

            {discountOptions.map((promo) => {
              const isSelected = selectedDiscountPromo?.id === promo.id;
              return (
                <Box
                  key={promo.id}
                  onClick={() => setSelectedDiscountPromo(isSelected ? null : promo)}
                  sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1.5,
                    p: 1.25, borderRadius: 1.5, border: '2px solid', cursor: 'pointer',
                    borderColor: isSelected ? 'error.main' : 'divider',
                    bgcolor: isSelected ? 'error.50' : 'background.paper',
                    transition: 'all 0.15s'
                  }}
                >
                  <LocalOfferIcon fontSize="small" color={isSelected ? 'error' : 'disabled'} sx={{ mt: 0.25 }} />
                  <Box flex={1} minWidth={0}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>{promo.name}</Typography>
                      <Chip label={intl.formatMessage({ id: 'discount' })} size="small" color="error" variant="outlined" sx={{ fontSize: 10 }} />
                    </Stack>
                    {promo.note && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {promo.note}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled">
                      <FormattedMessage id="valid-until" /> {promo.endDate}
                    </Typography>
                  </Box>
                  {isSelected && (
                    <Chip label={intl.formatMessage({ id: 'selected' })} size="small" color="error" variant="filled" sx={{ fontSize: 10, flexShrink: 0 }} />
                  )}
                </Box>
              );
            })}
          </Stack>
        </Grid>

        {/* ══ Summary Total ══ */}
        {form.items.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, maxWidth: 340, ml: 'auto', bgcolor: 'grey.50' }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary"><FormattedMessage id="subtotal" /></Typography>
                  <Typography variant="body2" fontWeight={600}>Rp {subtotal.toLocaleString('id-ID')}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="discount" />
                    {selectedDiscountPromo && (
                      <Typography component="span" variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                        ({selectedDiscountPromo.name})
                      </Typography>
                    )}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {discountLoading && <CircularProgress size={12} />}
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {form.discountAmount > 0 ? `- Rp ${Number(form.discountAmount).toLocaleString('id-ID')}` : 'Rp 0'}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" fontWeight={700}><FormattedMessage id="total" /></Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    Rp {finalAmt.toLocaleString('id-ID')}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </ModalC>
  );
};

FormQuotation.propTypes = {
  open:    PropTypes.bool,
  data:    PropTypes.object,
  onClose: PropTypes.func
};

export default FormQuotation;
