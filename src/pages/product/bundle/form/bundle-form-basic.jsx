import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import { getAllState, useProductBundleFormStore } from './bundle-form-store';
import { getProductClinicDropdown } from 'pages/product/product-list/service';
import { useState } from 'react';

const nameValidation = [
  { code: 0, message: <FormattedMessage id="name-is-required" /> },
  { code: 1, message: <FormattedMessage id="name-minimum-3-characters-length" /> },
  { code: 2, message: <FormattedMessage id="name-maximum-20-characters-length" /> }
];

const BasicDetail = () => {
  const name = useProductBundleFormStore((state) => state.name);
  const remark = useProductBundleFormStore((state) => state.remark);
  const status = useProductBundleFormStore((state) => state.status);

  const sellingLocation = useProductBundleFormStore((state) => state.sellingLocation);
  const sellingLocationList = useProductBundleFormStore((state) => state.sellingLocationList);

  const category = useProductBundleFormStore((state) => state.category);
  const categoryList = useProductBundleFormStore((state) => state.categoryList);

  const [formError, setFormError] = useState({ nameErr: '', remarkErr: '', sellingLocationErr: '', categoryErr: '' });

  const onCheckValidation = () => {
    const getName = getAllState().name;
    const getRemark = getAllState().remark;
    const getSellingLocation = getAllState().sellingLocation;
    const getCategory = getAllState().category;
    let nameErr = '';
    let remarkErr = '';
    let sellingLocationErr = '';
    let categoryErr = '';

    if (!getName) nameErr = nameValidation.find((d) => d.code === 0).message;
    else if (getName.length < 3) nameErr = nameValidation.find((d) => d.code === 1).message;
    else if (getName.length > 20) nameErr = nameValidation.find((d) => d.code === 2).message;

    if (getRemark.length > 50) remarkErr = <FormattedMessage id="remark-maximum-50-characters-length" />;
    if (!getSellingLocation) sellingLocationErr = <FormattedMessage id="selling-location-is-required" />;
    if (!getCategory) categoryErr = <FormattedMessage id="category-is-required" />;

    if (nameErr || remarkErr || sellingLocationErr || categoryErr) {
      setFormError((prevState) => ({ ...prevState, nameErr, remarkErr, sellingLocationErr, categoryErr }));
      useProductBundleFormStore.setState({ bundleFormError: true });
    } else {
      setFormError((prevState) => ({ ...prevState, nameErr: '', remarkErr: '', sellingLocationErr: '', categoryErr: '' }));
      useProductBundleFormStore.setState({ bundleFormError: false });
    }
  };

  const onFieldHandler = (e) => {
    useProductBundleFormStore.setState({ [e.target.name]: e.target.value, bundleFormTouch: true });
    onCheckValidation();
  };

  const onSelectStatus = (e) => {
    useProductBundleFormStore.setState({ [e.target.name]: e.target.value, bundleFormTouch: true });
    onCheckValidation();
  };

  const onSelectDropdown = async (newValue, procedure) => {
    if (procedure === 'sellingLocation') {
      useProductBundleFormStore.setState({ productList: [], selectedProducts: [], products: [] });
      if (newValue) {
        const getProduct = await getProductClinicDropdown(+newValue.value);
        const newProductDropdown = getProduct.length
          ? getProduct.map((dt) => ({ id: +dt.data.id, label: dt.label, value: +dt.value, price: +dt.data.price, quantity: '', total: '' }))
          : [];

        useProductBundleFormStore.setState({ productList: newProductDropdown });
      }
    }

    useProductBundleFormStore.setState({ [procedure]: newValue ? newValue : null, bundleFormTouch: true });
    onCheckValidation();
  };

  return (
    <MainCard title={<FormattedMessage id="basic-detail" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="name">
              <FormattedMessage id="name" />
            </InputLabel>
            <TextField
              fullWidth
              id="name"
              name="name"
              value={name}
              onChange={onFieldHandler}
              error={Boolean(formError.nameErr && formError.nameErr.toString().length > 0)}
              helperText={formError.nameErr}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="selling-location">
              <FormattedMessage id="selling-location" />
            </InputLabel>
            <Autocomplete
              id="selling-location"
              options={sellingLocationList}
              value={sellingLocation}
              isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
              onChange={(_, value) => onSelectDropdown(value, 'sellingLocation')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formError.sellingLocationErr && formError.sellingLocationErr.toString().length > 0)}
                  helperText={formError.sellingLocationErr ? formError.sellingLocationErr : ''}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="category">
              <FormattedMessage id="category" />
            </InputLabel>
            <Autocomplete
              id="category"
              options={categoryList}
              value={category}
              isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
              onChange={(_, value) => onSelectDropdown(value, 'category')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formError.categoryErr && formError.categoryErr.toString().length > 0)}
                  helperText={formError.categoryErr ? formError.categoryErr : ''}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="remark">
              <FormattedMessage id="remark" />
            </InputLabel>
            <TextField
              fullWidth
              id="remark"
              name="remark"
              value={remark}
              onChange={onFieldHandler}
              error={Boolean(formError.remarkErr && formError.remarkErr.toString().length > 0)}
              helperText={formError.remarkErr}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="status">Status</InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select id="status" name="status" value={status} onChange={onSelectStatus} placeholder="Select status">
                <MenuItem value="">
                  <em>Select status</em>
                </MenuItem>
                <MenuItem value={'1'}>
                  <FormattedMessage id="active" />
                </MenuItem>
                <MenuItem value={'0'}>
                  <FormattedMessage id="inactive" />
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default BasicDetail;
