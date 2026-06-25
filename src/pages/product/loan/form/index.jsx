import { Autocomplete, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, getStaffList } from 'service/service-global';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PlusOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';
import { getProductSellDropdown, getProductClinicDropdown } from 'pages/product/product-list/service';
import { createLoanProduct, generateLoanNumber, getLoanProductDetail, updateLoanProduct } from '../service';
import dayjs from 'dayjs';

import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';

const PRODUCT_TYPES = [
  { value: 'sell', label: 'Product Sell' },
  { value: 'clinic', label: 'Product Clinic' },
  { value: 'product', label: 'Product Inventory' }
];

const createRow = () => ({
  _key: `${Date.now()}-${Math.random()}`,
  productType: 'sell',
  productId: null,
  productOptions: [],
  loanedQty: 1,
  suggestedPrice: 0
});

const ProductLoanForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intl = useIntl();
  const isEdit = Boolean(id);

  const [locationList, setLocationList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loanNumber, setLoanNumber] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [eventAddress, setEventAddress] = useState('');
  const [returnDeadline, setReturnDeadline] = useState(null);
  const [note, setNote] = useState('');
  const [details, setDetails] = useState([createRow()]);
  const [loading, setLoading] = useState(false);

  const loadProductOptions = async (type, locationId) => {
    try {
      if (type === 'sell') return await getProductSellDropdown(locationId);
      if (type === 'clinic') return await getProductClinicDropdown(locationId);
      return [];
    } catch {
      return [];
    }
  };

  const onChangeLocation = async (loc) => {
    setSelectedLocation(loc);
    if (!loc) {
      setLoanNumber('');
      return;
    }
    try {
      const resp = await generateLoanNumber(loc.value);
      setLoanNumber(resp.data.loanNumber ?? '');
    } catch (err) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    }

    const updatedDetails = await Promise.all(
      details.map(async (row) => ({
        ...row,
        productId: null,
        productOptions: await loadProductOptions(row.productType, loc.value)
      }))
    );
    setDetails(updatedDetails);
  };

  const onChangeProductType = async (index, type) => {
    const locationId = selectedLocation?.value;
    const options = locationId ? await loadProductOptions(type, locationId) : [];
    setDetails((prev) =>
      prev.map((row, i) => (i === index ? { ...row, productType: type, productId: null, productOptions: options } : row))
    );
  };

  const onChangeProductId = (index, option) => {
    setDetails((prev) => prev.map((row, i) => (i === index ? { ...row, productId: option } : row)));
  };

  const addRow = async () => {
    const newRow = createRow();
    if (selectedLocation) {
      newRow.productOptions = await loadProductOptions(newRow.productType, selectedLocation.value);
    }
    setDetails((prev) => [...prev, newRow]);
  };

  const removeRow = (index) => {
    if (details.length === 1) return;
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!selectedLocation) {
      dispatch(snackbarError('Location is required'));
      return false;
    }
    if (!selectedStaff) {
      dispatch(snackbarError('Staff is required'));
      return false;
    }
    if (!eventName.trim()) {
      dispatch(snackbarError('Event name is required'));
      return false;
    }
    if (!eventDate) {
      dispatch(snackbarError('Event date is required'));
      return false;
    }
    if (details.some((d) => !d.productId)) {
      dispatch(snackbarError('All product rows must have a product selected'));
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;

    const payload = {
      loanNumber,
      staffId: selectedStaff.value,
      locationId: selectedLocation.value,
      eventName,
      eventDate: dayjs(eventDate).format('YYYY-MM-DD'),
      eventAddress,
      returnDeadline: returnDeadline ? dayjs(returnDeadline).format('YYYY-MM-DD') : null,
      note,
      details: details.map((d) => ({
        productType: d.productType,
        productId: d.productId.value,
        loanedQty: d.loanedQty,
        suggestedPrice: d.suggestedPrice
      }))
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateLoanProduct({ id: Number(id), ...payload });
        dispatch(snackbarSuccess('Loan product updated successfully'));
      } else {
        await createLoanProduct(payload);
        dispatch(snackbarSuccess('Loan product created successfully'));
      }
      navigate('/product/loan');
    } catch (err) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (locList, staffListData) => {
    try {
      const resp = await getLoanProductDetail(id);
      const d = resp.data;

      const loc = locList.find((l) => l.value === +d.locationId) ?? null;
      const staff = staffListData.find((s) => s.value === +d.staffId) ?? null;

      setSelectedLocation(loc);
      setSelectedStaff(staff);
      setLoanNumber(d.loanNumber ?? '');
      setEventName(d.eventName ?? '');
      setEventDate(d.eventDate ? dayjs(d.eventDate) : null);
      setEventAddress(d.eventAddress ?? '');
      setReturnDeadline(d.returnDeadline ? dayjs(d.returnDeadline) : null);
      setNote(d.note ?? '');

      const loadedDetails = await Promise.all(
        (d.details ?? []).map(async (det) => {
          const opts = loc ? await loadProductOptions(det.productType, loc.value) : [];
          const productOption = opts.find((o) => o.value === +det.productId) ?? {
            label: det.productName,
            value: +det.productId
          };
          return {
            _key: det.id,
            productType: det.productType,
            productId: productOption,
            productOptions: opts,
            loanedQty: det.loanedQty,
            suggestedPrice: det.suggestedPrice ?? 0
          };
        })
      );
      setDetails(loadedDetails.length > 0 ? loadedDetails : [createRow()]);
    } catch (err) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  useEffect(() => {
    const init = async () => {
      const [locs, staff] = await Promise.all([getLocationList(), getStaffList()]);
      setLocationList(locs);
      setStaffList(staff);
      if (id) await loadDetail(locs, staff);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <HeaderPageCustom title={isEdit ? <FormattedMessage id="edit-loan" /> : <FormattedMessage id="new-loan" />} isBreadcrumb={true} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="loan-information" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={locationList}
                  value={selectedLocation}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, val) => onChangeLocation(val)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="location" />} required />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={<FormattedMessage id="loan-number" />}
                  value={loanNumber}
                  InputProps={{ readOnly: true }}
                  placeholder={intl.formatMessage({ id: 'select-location-first' })}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={staffList}
                  value={selectedStaff}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, val) => setSelectedStaff(val)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="staff" />} required />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={<FormattedMessage id="event-name" />}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label={<FormattedMessage id="event-date" />}
                    value={eventDate}
                    onChange={(val) => setEventDate(val)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label={<FormattedMessage id="return-deadline" />}
                    value={returnDeadline}
                    onChange={(val) => setReturnDeadline(val)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={<FormattedMessage id="event-address" />}
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={<FormattedMessage id="note" />}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard
            title={<FormattedMessage id="product-details" />}
            secondary={
              <Button variant="contained" startIcon={<PlusOutlined />} onClick={addRow} size="small" disabled={!selectedLocation}>
                <FormattedMessage id="add" />
              </Button>
            }
          >
            <Stack spacing={2}>
              {details.map((row, index) => (
                <Grid container spacing={2} key={row._key} alignItems="center">
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>
                        <FormattedMessage id="product-type" />
                      </InputLabel>
                      <Select
                        value={row.productType}
                        label={intl.formatMessage({ id: 'product-type' })}
                        onChange={(e) => onChangeProductType(index, e.target.value)}
                      >
                        {PRODUCT_TYPES.map((t) => (
                          <MenuItem key={t.value} value={t.value}>
                            {t.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Autocomplete
                      options={row.productOptions}
                      value={row.productId}
                      isOptionEqualToValue={(o, v) => o.value === v.value}
                      onChange={(_, val) => onChangeProductId(index, val)}
                      renderInput={(params) => <TextField {...params} label={<FormattedMessage id="product" />} />}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label={<FormattedMessage id="loaned-qty" />}
                      value={row.loanedQty}
                      inputProps={{ min: 1 }}
                      onChange={(e) =>
                        setDetails((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, loanedQty: Math.max(1, Number(e.target.value)) } : r))
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={6} sm={3} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label={<FormattedMessage id="suggested-price" />}
                      value={row.suggestedPrice}
                      inputProps={{ min: 0 }}
                      onChange={(e) =>
                        setDetails((prev) => prev.map((r, i) => (i === index ? { ...r, suggestedPrice: Number(e.target.value) } : r)))
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={1} md={1}>
                    <IconButton color="error" onClick={() => removeRow(index)} disabled={details.length === 1}>
                      <DeleteOutlined />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/product/loan')}>
              <FormattedMessage id="cancel" />
            </Button>
            <Button variant="contained" onClick={onSave} disabled={loading}>
              {isEdit ? <FormattedMessage id="save" /> : <FormattedMessage id="save-as-draft" />}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default ProductLoanForm;
