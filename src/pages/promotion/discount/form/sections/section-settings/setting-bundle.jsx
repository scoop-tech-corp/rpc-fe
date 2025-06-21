import { Autocomplete, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { defaultBundleDetails, useDiscountFormStore } from '../../discount-form-store';
import { formateNumber } from 'utils/func';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getProductSellClinicByLocation, getServiceListByLocation } from 'service/service-global';

import NumberFormatCustom from 'utils/number-format';

const SettingBundle = () => {
  const locations = useDiscountFormStore((state) => state.locations);
  const bundleDetails = useDiscountFormStore((state) => state.bundleDetails);

  const price = useDiscountFormStore((state) => state.bundle.price);
  const totalMaxUsage = useDiscountFormStore((state) => state.bundle.totalMaxUsage);
  const maxUsagePerCustomer = useDiscountFormStore((state) => state.bundle.maxUsagePerCustomer);

  const onFieldHandler = async (event, idx = null) => {
    const elementName = event.target.name;
    let getValue = event.target.value;
    const getPrevBundleDetails = [...bundleDetails];

    if (['price'].includes(elementName)) getValue = formateNumber(getValue);

    // event handling field detail bundle (array)
    if (typeof idx === 'number') {
      if (elementName === 'productOrService') {
        getPrevBundleDetails[idx]['productType'] = '';
        getPrevBundleDetails[idx]['productName'] = null;
        getPrevBundleDetails[idx]['productList'] = [];
        getPrevBundleDetails[idx]['serviceId'] = null;
        getPrevBundleDetails[idx]['serviceList'] = [];

        if (getValue === 'service') {
          const getData = await getServiceListByLocation([...locations.map((dt) => dt.value)]);
          getPrevBundleDetails[idx]['serviceList'] = getData;
        }
      }

      if (elementName === 'productType') {
        const setProductType = getValue ? getValue.replace('product', '').toLowerCase() : '';
        const getData = await getProductSellClinicByLocation(setProductType, [...locations.map((dt) => dt.value)]);

        getPrevBundleDetails[idx]['productName'] = null;
        getPrevBundleDetails[idx]['productList'] = getData;
      }

      getPrevBundleDetails[idx][elementName] = getValue;
    }

    useDiscountFormStore.setState((prevState) => {
      const setBundle = typeof idx === 'number' ? {} : { [elementName]: getValue };

      return {
        bundle: { ...prevState.bundle, ...setBundle },
        bundleDetails: getPrevBundleDetails,
        discountFormTouch: true
      };
    });
  };

  const onDropdownHandler = (selected, key, idx) => {
    useDiscountFormStore.setState((prevState) => {
      const getPrevBundleDetails = [...prevState.bundleDetails];
      if (!isNaN(idx)) getPrevBundleDetails[idx][key] = selected;

      return { bundleDetails: getPrevBundleDetails, discountFormTouch: true };
    });
  };

  const onActionBundleDetail = (action, idx) => {
    useDiscountFormStore.setState((prevState) => {
      let newBundleDetail = [];
      if (action === 'add') {
        newBundleDetail = [...prevState.bundleDetails, { ...defaultBundleDetails }];
      } else if (action === 'delete') {
        newBundleDetail = [...prevState.bundleDetails];
        newBundleDetail.splice(idx, 1);
      }

      return { bundleDetails: newBundleDetail, discountFormTouch: true };
    });
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => onActionBundleDetail('add')}>
            <FormattedMessage id="add" />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {bundleDetails.map((dt, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="ActiveCaption">
                      <FormattedMessage id="bundle-only" /> {idx + 1}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="productOrService">
                        <FormattedMessage id="product-or-service" />
                      </InputLabel>
                      <FormControl>
                        <Select
                          id="productOrService"
                          name="productOrService"
                          value={dt.productOrService || ''}
                          onChange={(e) => onFieldHandler(e, idx)}
                          placeholder="Select"
                        >
                          <MenuItem value="">
                            <em>
                              <FormattedMessage id="select" />
                            </em>
                          </MenuItem>
                          <MenuItem value={'product'}>
                            <FormattedMessage id="product" />
                          </MenuItem>
                          <MenuItem value={'service'}>
                            <FormattedMessage id="service" />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>

                  {dt.productOrService === 'product' && (
                    <>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="status">
                            <FormattedMessage id="product-type" />
                          </InputLabel>
                          <FormControl>
                            <Select
                              id="productType"
                              name="productType"
                              value={dt.productType || ''}
                              onChange={(e) => onFieldHandler(e, idx)}
                              placeholder="Select product type"
                            >
                              <MenuItem value="">
                                <em>
                                  <FormattedMessage id="select-product" />
                                </em>
                              </MenuItem>
                              <MenuItem value={'productSell'}>
                                <FormattedMessage id="product-sell" />
                              </MenuItem>
                              <MenuItem value={'productClinic'}>
                                <FormattedMessage id="product-clinic" />
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="productName">{<FormattedMessage id="buy-product-item" />}</InputLabel>
                          <Autocomplete
                            id="productName"
                            options={dt.productList}
                            value={dt.productName}
                            isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
                            onChange={(_, selected) => onDropdownHandler(selected, 'productName', idx)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                // error={Boolean(generalInfoErr.branchErr && generalInfoErr.branchErr.length > 0)}
                                // helperText={generalInfoErr.branchErr}
                                variant="outlined"
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                    </>
                  )}

                  {dt.productOrService === 'service' && (
                    <>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="serviceId">{<FormattedMessage id="service" />}</InputLabel>
                          <Autocomplete
                            id="serviceId"
                            options={dt.serviceList}
                            value={dt.serviceId}
                            isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
                            onChange={(_, selected) => onDropdownHandler(selected, 'serviceId', idx)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                // error={Boolean(generalInfoErr.branchErr && generalInfoErr.branchErr.length > 0)}
                                // helperText={generalInfoErr.branchErr}
                                variant="outlined"
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="quantity">{<FormattedMessage id="quantity" />}</InputLabel>
                      <TextField
                        fullWidth
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={dt.quantity}
                        inputProps={{ min: 0 }}
                        onChange={(e) => onFieldHandler(e, idx)}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} display="flex" justifyContent="flex-end">
                    <Button variant="contained" color="error" startIcon={<DeleteOutlined />} onClick={() => onActionBundleDetail('delete')}>
                      <FormattedMessage id="delete" />
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="price">
                  <FormattedMessage id="price" />
                </InputLabel>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  value={price}
                  onChange={onFieldHandler}
                  InputProps={{
                    startAdornment: 'Rp',
                    inputComponent: NumberFormatCustom
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="total-max-usage">{<FormattedMessage id="total-max-usage" />}</InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="totalMaxUsage"
                  name="totalMaxUsage"
                  value={totalMaxUsage}
                  inputProps={{ min: 0 }}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="max-usage-per-customer">{<FormattedMessage id="max-usage-per-customer" />}</InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="maxUsagePerCustomer"
                  name="maxUsagePerCustomer"
                  value={maxUsagePerCustomer}
                  inputProps={{ min: 0 }}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default SettingBundle;
