import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { FormattedMessage } from 'react-intl';
import { useDiscountFormStore } from '../../discount-form-store';
import { getProductSellClinicByLocation, getServiceListByLocation } from 'service/service-global';
import { formateNumber } from 'utils/func';

import NumberFormatCustom from 'utils/number-format';

const SettingDiscount = () => {
  const productOrService = useDiscountFormStore((state) => state.discount.productOrService);
  const percentOrAmount = useDiscountFormStore((state) => state.discount.percentOrAmount);
  const productType = useDiscountFormStore((state) => state.discount.productType);
  const locations = useDiscountFormStore((state) => state.locations);

  const productName = useDiscountFormStore((state) => state.discount.productName);
  const productList = useDiscountFormStore((state) => state.discount.productList);

  const serviceId = useDiscountFormStore((state) => state.discount.serviceId);
  const serviceList = useDiscountFormStore((state) => state.discount.serviceList);

  const amount = useDiscountFormStore((state) => state.discount.amount);
  const percent = useDiscountFormStore((state) => state.discount.percent);

  const totalMaxUsage = useDiscountFormStore((state) => state.discount.totalMaxUsage);
  const maxUsagePerCustomer = useDiscountFormStore((state) => state.discount.maxUsagePerCustomer);

  const onFieldHandler = async (event) => {
    const elementName = event.target.name;
    let getValue = event.target.value;
    const stateAdditional = {};

    if (elementName === 'productOrService') {
      stateAdditional['productType'] = '';
      stateAdditional['productName'] = null;
      stateAdditional['productList'] = [];
      stateAdditional['serviceId'] = null;
      stateAdditional['serviceList'] = [];

      if (getValue === 'service') {
        const getRespServiceDropdown = await getServiceListByLocation([...locations.map((dt) => dt.value)]);
        stateAdditional['serviceList'] = getRespServiceDropdown;
      }
    }

    if (elementName === 'productType') {
      const setProductType = getValue ? getValue.replace('product', '').toLowerCase() : '';
      const getRespProductDropdown = await getProductSellClinicByLocation(setProductType, [...locations.map((dt) => dt.value)]);

      stateAdditional['productName'] = null;
      stateAdditional['productList'] = getRespProductDropdown;
    }

    // handling percentage input
    if (elementName === 'percent') {
      if (getValue.length > 3) return;
      else if (+getValue < 0 || +getValue > 100) return;
    }

    if (elementName === 'amount') getValue = formateNumber(getValue);

    useDiscountFormStore.setState((prevState) => {
      return {
        discount: { ...prevState.discount, ...stateAdditional, [elementName]: getValue },
        discountFormTouch: true
      };
    });
  };

  const onDropdownHandler = (selected, key) => {
    useDiscountFormStore.setState((prevState) => {
      return {
        discount: { ...prevState.discount, [key]: selected },
        discountFormTouch: true
      };
    });
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productOrService">
                  <FormattedMessage id="product-or-service" />
                </InputLabel>
                <FormControl>
                  <Select
                    id="productOrService"
                    name="productOrService"
                    value={productOrService || ''}
                    onChange={onFieldHandler}
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

            {productOrService === 'product' && (
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
                        value={productType || ''}
                        onChange={onFieldHandler}
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
                      options={productList}
                      value={productName}
                      isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
                      onChange={(_, selected) => onDropdownHandler(selected, 'productName')}
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
            {productOrService === 'service' && (
              <>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="serviceId">{<FormattedMessage id="service" />}</InputLabel>
                    <Autocomplete
                      id="serviceId"
                      options={serviceList}
                      value={serviceId}
                      isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
                      onChange={(_, selected) => onDropdownHandler(selected, 'serviceId')}
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
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="percentOrAmount">
                  <FormattedMessage id="type" />
                </InputLabel>
                <FormControl>
                  <Select
                    id="percentOrAmount"
                    name="percentOrAmount"
                    value={percentOrAmount || ''}
                    onChange={onFieldHandler}
                    placeholder="Select"
                  >
                    <MenuItem value="">
                      <em>
                        <FormattedMessage id="select" />
                      </em>
                    </MenuItem>
                    <MenuItem value={'percent'}>
                      <FormattedMessage id="percentage" />
                    </MenuItem>
                    <MenuItem value={'amount'}>
                      <FormattedMessage id="amount" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            {percentOrAmount === 'percent' && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="percent">
                    <FormattedMessage id="percent" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="percent"
                    name="percent"
                    value={percent}
                    onChange={onFieldHandler}
                    InputProps={{
                      startAdornment: '%',
                      min: 0,
                      max: 100,
                      maxLength: 3
                    }}
                  />
                </Stack>
              </Grid>
            )}

            {percentOrAmount === 'amount' && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="amount">
                    <FormattedMessage id="amount" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={onFieldHandler}
                    InputProps={{
                      startAdornment: 'Rp',
                      inputComponent: NumberFormatCustom
                    }}
                  />
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}>
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

export default SettingDiscount;
