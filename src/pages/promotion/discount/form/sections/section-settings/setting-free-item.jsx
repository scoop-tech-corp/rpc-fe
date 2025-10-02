import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useDiscountFormStore } from '../../discount-form-store';
import { getProductSellClinicByLocation } from 'service/service-global';

const SettingFreeItem = () => {
  const qtyBuyItem = useDiscountFormStore((state) => state.freeItem.quantityBuy);
  const qtyFreeItem = useDiscountFormStore((state) => state.freeItem.quantityFree);
  const productBuyType = useDiscountFormStore((state) => state.freeItem.productBuyType);
  const productFreeType = useDiscountFormStore((state) => state.freeItem.productFreeType);
  const locations = useDiscountFormStore((state) => state.locations);

  const productBuyId = useDiscountFormStore((state) => state.freeItem.productBuyId);
  const productBuyList = useDiscountFormStore((state) => state.freeItem.productBuyList);
  const productFreeId = useDiscountFormStore((state) => state.freeItem.productFreeId);
  const productFreeList = useDiscountFormStore((state) => state.freeItem.productFreeList);

  const totalMaxUsage = useDiscountFormStore((state) => state.freeItem.totalMaxUsage);
  const maxUsagePerCustomer = useDiscountFormStore((state) => state.freeItem.maxUsagePerCustomer);

  const onFieldHandler = async (event) => {
    const stateProduct = {};
    if (['productBuyType', 'productFreeType'].includes(event.target.name)) {
      if (event.target.value) {
        // const setProductType = event.target.value === 'productSell' ? 'sell' : 'clinic';
        const getRespProductDropdown = await getProductSellClinicByLocation(event.target.value, [...locations.map((dt) => dt.value)]);

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
                  id="quantityBuy"
                  name="quantityBuy"
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
                    <MenuItem value={'sell'}>
                      <FormattedMessage id="product-sell" />
                    </MenuItem>
                    <MenuItem value={'clinic'}>
                      <FormattedMessage id="product-clinic" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productBuyId">{<FormattedMessage id="buy-product-item" />}</InputLabel>
                <Autocomplete
                  id="productBuyId"
                  options={productBuyList}
                  value={productBuyId}
                  isOptionEqualToValue={(option, val) => val === '' || option?.id === val?.id}
                  onChange={(_, selected) => onDropdownHandler(selected, 'productBuyId')}
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
                  id="quantityFree"
                  name="quantityFree"
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
                    <MenuItem value={'sell'}>
                      <FormattedMessage id="product-sell" />
                    </MenuItem>
                    <MenuItem value={'clinic'}>
                      <FormattedMessage id="product-clinic" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productFreeId">{<FormattedMessage id="free-product" />}</InputLabel>
                <Autocomplete
                  id="productFreeId"
                  options={productFreeList}
                  value={productFreeId}
                  isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
                  onChange={(_, selected) => onDropdownHandler(selected, 'productFreeId')}
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
