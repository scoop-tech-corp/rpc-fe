import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useDiscountFormStore } from '../../discount-form-store';
import { getProductSellClinicByLocation } from 'service/service-global';

const SettingFreeItem = () => {
  const qtyBuyItem = useDiscountFormStore((state) => state.freeItem.quantityBuyItem);
  const qtyFreeItem = useDiscountFormStore((state) => state.freeItem.quantityFreeItem);
  const productBuyType = useDiscountFormStore((state) => state.freeItem.productBuyType);
  const productFreeType = useDiscountFormStore((state) => state.freeItem.productFreeType);
  const locations = useDiscountFormStore((state) => state.locations);

  const productBuyName = useDiscountFormStore((state) => state.freeItem.productBuyName);
  const productBuyList = useDiscountFormStore((state) => state.freeItem.productBuyList);
  const productFreeName = useDiscountFormStore((state) => state.freeItem.productFreeName);
  const productFreeList = useDiscountFormStore((state) => state.freeItem.productFreeList);

  const totalMaxUsage = useDiscountFormStore((state) => state.freeItem.totalMaxUsage);
  const maxUsagePerCustomer = useDiscountFormStore((state) => state.freeItem.maxUsagePerCustomer);

  const onFieldHandler = async (event) => {
    const stateProduct = {};
    if (['productBuyType', 'productFreeType'].includes(event.target.name)) {
      if (event.target.value) {
        const setProductType = event.target.value === 'productSell' ? 'sell' : 'clinic';
        const getRespProductDropdown = await getProductSellClinicByLocation(setProductType, [...locations.map((dt) => dt.value)]);

        stateProduct[`product${event.target.name === 'productBuyType' ? 'Buy' : 'Free'}Name`] = null;
        stateProduct[`product${event.target.name === 'productBuyType' ? 'Buy' : 'Free'}List`] = getRespProductDropdown;
      }
    }
    useDiscountFormStore.setState((prevState) => {
      return {
        freeItem: {
          ...prevState.freeItem,
          ...stateProduct,
          [event.target.name]: event.target.value
        },
        discountFormTouch: true
      };
    });
  };

  const onDropdownHandler = (selected, key) => {
    useDiscountFormStore.setState((prevState) => {
      return {
        freeItem: {
          ...prevState.freeItem,
          [key]: selected
        },
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
                <InputLabel htmlFor="quantity-buy-item">{<FormattedMessage id="quantity-buy-item" />}</InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="quantityBuyItem"
                  name="quantityBuyItem"
                  value={qtyBuyItem}
                  inputProps={{ min: 0 }}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="status">
                  <FormattedMessage id="product-type" />
                </InputLabel>
                <FormControl>
                  <Select
                    id="productBuyType"
                    name="productBuyType"
                    value={productBuyType || ''}
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
                <InputLabel htmlFor="productBuyName">{<FormattedMessage id="buy-product-item" />}</InputLabel>
                <Autocomplete
                  id="productBuyName"
                  options={productBuyList}
                  value={productBuyName}
                  isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
                  onChange={(_, selected) => onDropdownHandler(selected, 'productBuyName')}
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
        <Grid item xs={12} sm={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="quantity-free-item">{<FormattedMessage id="free-quantity-item" />}</InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="quantityFreeItem"
                  name="quantityFreeItem"
                  value={qtyFreeItem}
                  inputProps={{ min: 0 }}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="status">
                  <FormattedMessage id="product-type" />
                </InputLabel>
                <FormControl>
                  <Select
                    id="productFreeType"
                    name="productFreeType"
                    value={productFreeType || ''}
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
                <InputLabel htmlFor="productFreeName">{<FormattedMessage id="free-product" />}</InputLabel>
                <Autocomplete
                  id="productFreeName"
                  options={productFreeList}
                  value={productFreeName}
                  isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
                  onChange={(_, selected) => onDropdownHandler(selected, 'productFreeName')}
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
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default SettingFreeItem;
