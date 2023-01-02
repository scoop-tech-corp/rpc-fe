import { Grid, Stack, InputLabel, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductSellDetailStore } from '../../../product-sell-detail-store';

import NumberFormatCustom from 'utils/number-format';

const PricingBasic = () => {
  const costPrice = useProductSellDetailStore((state) => state.costPrice);
  const marketPrice = useProductSellDetailStore((state) => state.marketPrice);
  const price = useProductSellDetailStore((state) => state.price);

  const onFieldHandler = (e) => {
    const getValue = e.target.value ? +e.target.value.replace(',', '') : '';

    useProductSellDetailStore.setState({ [e.target.name]: getValue, productSellDetailTouch: true });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <Stack spacing={1}>
          <InputLabel htmlFor="costPrice">
            <FormattedMessage id="cost" />
          </InputLabel>
          <TextField
            fullWidth
            id="costPrice"
            name="costPrice"
            value={costPrice}
            onChange={onFieldHandler}
            InputProps={{
              startAdornment: 'Rp',
              inputComponent: NumberFormatCustom
            }}
          />
        </Stack>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Stack spacing={1}>
          <InputLabel htmlFor="marketPrice">
            <FormattedMessage id="market-price" />
          </InputLabel>
          <TextField
            fullWidth
            id="marketPrice"
            name="marketPrice"
            value={marketPrice}
            onChange={onFieldHandler}
            InputProps={{
              startAdornment: 'Rp',
              inputComponent: NumberFormatCustom
            }}
          />
        </Stack>
      </Grid>

      <Grid item xs={12} sm={4}>
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
    </Grid>
  );
};

export default PricingBasic;
