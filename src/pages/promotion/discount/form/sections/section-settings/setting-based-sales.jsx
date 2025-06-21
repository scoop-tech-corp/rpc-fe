import { FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useDiscountFormStore } from '../../discount-form-store';
import { formateNumber } from 'utils/func';

import NumberFormatCustom from 'utils/number-format';

const SettingBasedSales = () => {
  const minPurchase = useDiscountFormStore((state) => state.basedSale.minPurchase);
  const maxPurchase = useDiscountFormStore((state) => state.basedSale.maxPurchase);

  const percentOrAmount = useDiscountFormStore((state) => state.basedSale.percentOrAmount);
  const amount = useDiscountFormStore((state) => state.basedSale.amount);
  const percent = useDiscountFormStore((state) => state.basedSale.percent);

  const totalMaxUsage = useDiscountFormStore((state) => state.basedSale.totalMaxUsage);
  const maxUsagePerCustomer = useDiscountFormStore((state) => state.basedSale.maxUsagePerCustomer);

  const onFieldHandler = async (event) => {
    const elementName = event.target.name;
    let getValue = event.target.value;

    if (['amount', 'minPurchase', 'maxPurchase'].includes(elementName)) {
      getValue = formateNumber(getValue);
    }

    useDiscountFormStore.setState((prevState) => {
      return {
        basedSale: { ...prevState.basedSale, [elementName]: getValue },
        discountFormTouch: true
      };
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="min-purchase">
                <FormattedMessage id="min-purchase" />
              </InputLabel>
              <TextField
                fullWidth
                id="minPurchase"
                name="minPurchase"
                value={minPurchase}
                onChange={onFieldHandler}
                InputProps={{
                  startAdornment: 'Rp',
                  inputComponent: NumberFormatCustom
                }}
              />
            </Stack>
          </Grid>
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
              <InputLabel htmlFor="max-purchase">
                <FormattedMessage id="max-purchase" />
              </InputLabel>
              <TextField
                fullWidth
                id="maxPurchase"
                name="maxPurchase"
                value={maxPurchase}
                onChange={onFieldHandler}
                InputProps={{
                  startAdornment: 'Rp',
                  inputComponent: NumberFormatCustom
                }}
              />
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
  );
};

export default SettingBasedSales;
