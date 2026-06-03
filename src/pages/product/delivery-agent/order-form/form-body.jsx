import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Autocomplete,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useParams } from 'react-router';
import { generateDeliveryNumber, getCustomerListByLocation, getProductsByType } from '../service';
import { getAllState, useOrderFormStore } from './form-store';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';

const PRODUCT_TYPES = [
  { label: 'Sell', value: 'sell' },
  { label: 'Clinic', value: 'clinic' },
  { label: 'Product', value: 'product' }
];

const emptyDetail = { productType: 'product', productId: '', qty: 1, unitPrice: '', weight: '', note: '' };

const set = (field) => (value) =>
  useOrderFormStore.setState((prev) => ({ ...prev, [field]: value, isFormTouch: true }));

const OrderFormBody = () => {
  const intl = useIntl();
  const { id } = useParams();

  const {
    deliveryNumber,
    locationId,
    locationList,
    customerList,
    productOptions,
    customerId,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryDate,
    deliveryTime,
    note,
    details
  } = useOrderFormStore();

  const selectedCustomer = customerList.find((c) => c.value === customerId) ?? null;

  const isFormError =
    !locationId ||
    !deliveryNumber ||
    !deliveryAddress ||
    !deliveryDate ||
    details.length === 0 ||
    details.some((d) => !d.productId || d.qty < 1);

  useEffect(() => {
    useOrderFormStore.setState({ isFormError });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormError]);

  const onLocationChange = async (selected) => {
    useOrderFormStore.setState({
      locationId: selected,
      isFormTouch: true,
      customerId: null,
      customerName: '',
      customerPhone: '',
      customerList: [],
      productOptions: { sell: [], clinic: [], product: [] }
    });
    if (selected) {
      const locId = selected.value;
      const [customers, sell, clinic, product] = await Promise.all([
        getCustomerListByLocation(locId).catch(() => []),
        getProductsByType('sell', locId).catch(() => []),
        getProductsByType('clinic', locId).catch(() => []),
        getProductsByType('product', locId).catch(() => [])
      ]);
      useOrderFormStore.setState({
        customerList: customers,
        productOptions: { sell, clinic, product }
      });
      if (!id) {
        const resp = await generateDeliveryNumber(locId).catch(() => null);
        if (resp) useOrderFormStore.setState({ deliveryNumber: resp.data.deliveryNumber });
      }
    }
  };

  const onCustomerChange = (selected) => {
    useOrderFormStore.setState({
      customerId: selected?.value ?? null,
      customerName: selected?.name ?? '',
      customerPhone: selected?.phone ?? '',
      isFormTouch: true
    });
  };

  const onProductChange = (index, selected) => {
    const next = getAllState().details.map((d, i) =>
      i === index
        ? { ...d, productId: selected?.value ?? '', unitPrice: selected?.price ?? d.unitPrice }
        : d
    );
    useOrderFormStore.setState({ details: next, isFormTouch: true });
  };

  const onProductTypeChange = (index, newType) => {
    const next = getAllState().details.map((d, i) =>
      i === index ? { ...d, productType: newType, productId: '', unitPrice: '' } : d
    );
    useOrderFormStore.setState({ details: next, isFormTouch: true });
  };

  const onDetailChange = (index, field, value) => {
    const next = getAllState().details.map((d, i) => (i === index ? { ...d, [field]: value } : d));
    useOrderFormStore.setState({ details: next, isFormTouch: true });
  };

  const addDetail = () => {
    useOrderFormStore.setState((prev) => ({
      details: [...prev.details, { ...emptyDetail }],
      isFormTouch: true
    }));
  };

  const removeDetail = (index) => {
    useOrderFormStore.setState((prev) => ({
      details: prev.details.filter((_, i) => i !== index),
      isFormTouch: true
    }));
  };

  return (
    <Stack spacing={3}>
      <MainCard title={<FormattedMessage id="delivery-information" defaultMessage="Delivery Information" />}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={locationList}
              value={locationId}
              isOptionEqualToValue={(opt, val) => opt.value === val.value}
              onChange={(_, val) => onLocationChange(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label={<FormattedMessage id="location" defaultMessage="Location" />}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              disabled
              label="DO Number"
              value={deliveryNumber}
              InputLabelProps={{ shrink: !!deliveryNumber }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={customerList}
              value={selectedCustomer}
              disabled={!locationId}
              isOptionEqualToValue={(opt, val) => opt.value === val.value}
              onChange={(_, val) => onCustomerChange(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={<FormattedMessage id="customer-name" defaultMessage="Customer Name" />}
                  placeholder={!locationId ? 'Pilih lokasi terlebih dahulu' : ''}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={<FormattedMessage id="customer-phone" defaultMessage="Customer Phone" />}
              value={customerPhone}
              onChange={(e) => set('customerPhone')(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label={<FormattedMessage id="delivery-address" defaultMessage="Delivery Address" />}
              value={deliveryAddress}
              onChange={(e) => set('deliveryAddress')(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="date"
              label={<FormattedMessage id="delivery-date" defaultMessage="Delivery Date" />}
              value={deliveryDate}
              onChange={(e) => set('deliveryDate')(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label={<FormattedMessage id="delivery-time" defaultMessage="Delivery Time" />}
              value={deliveryTime}
              onChange={(e) => set('deliveryTime')(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={<FormattedMessage id="note" defaultMessage="Note" />}
              value={note}
              onChange={(e) => set('note')(e.target.value)}
            />
          </Grid>
        </Grid>
      </MainCard>

      <MainCard
        title={<FormattedMessage id="items" defaultMessage="Items" />}
        secondary={
          <Button size="small" variant="contained" startIcon={<PlusOutlined />} onClick={addDetail}>
            <FormattedMessage id="add-item" defaultMessage="Add Item" />
          </Button>
        }
      >
        {details.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            <FormattedMessage id="no-items-yet" defaultMessage="No items yet. Click Add Item." />
          </Typography>
        )}

        <Stack spacing={2}>
          {details.map((detail, index) => {
            const productList = productOptions[detail.productType] ?? [];
            const selectedProduct = productList.find((p) => p.value === +detail.productId) ?? null;

            return (
              <Grid key={index} container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel><FormattedMessage id="type" defaultMessage="Type" /></InputLabel>
                    <Select
                      value={detail.productType}
                      label={<FormattedMessage id="type" defaultMessage="Type" />}
                      onChange={(e) => onProductTypeChange(index, e.target.value)}
                    >
                      {PRODUCT_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    size="small"
                    options={productList}
                    value={selectedProduct}
                    disabled={!locationId}
                    isOptionEqualToValue={(opt, val) => opt.value === val.value}
                    onChange={(_, val) => onProductChange(index, val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label={<FormattedMessage id="product" defaultMessage="Product" />}
                        placeholder={!locationId ? 'Pilih lokasi dulu' : ''}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={1}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="number"
                    label={intl.formatMessage({ id: 'qty', defaultMessage: 'Qty' })}
                    value={detail.qty}
                    inputProps={{ min: 1 }}
                    onChange={(e) => onDetailChange(index, 'qty', +e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={intl.formatMessage({ id: 'unit-price', defaultMessage: 'Unit Price' })}
                    value={detail.unitPrice}
                    inputProps={{ min: 0 }}
                    onChange={(e) => onDetailChange(index, 'unitPrice', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={intl.formatMessage({ id: 'weight', defaultMessage: 'Weight (kg)' })}
                    value={detail.weight}
                    inputProps={{ min: 0, step: 0.01 }}
                    onChange={(e) => onDetailChange(index, 'weight', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label={intl.formatMessage({ id: 'note', defaultMessage: 'Note' })}
                    value={detail.note}
                    onChange={(e) => onDetailChange(index, 'note', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton color="error" onClick={() => removeDetail(index)}>
                    <DeleteFilled />
                  </IconButton>
                </Grid>
              </Grid>
            );
          })}
        </Stack>
      </MainCard>
    </Stack>
  );
};

export default OrderFormBody;
