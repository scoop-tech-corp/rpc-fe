import { Grid, Stack, InputLabel, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductClinicFormStore } from '../../../product-clinic-form-store';

import NumberFormatCustom from 'utils/number-format';

const PricingBasic = () => {
  const costPrice = useProductClinicFormStore((state) => state.costPrice);
  const marketPrice = useProductClinicFormStore((state) => state.marketPrice);
  const price = useProductClinicFormStore((state) => state.price);

  const onFieldHandler = (e) => {
    const getValue = e.target.value ? +e.target.value.replace(',', '') : '';
    useProductClinicFormStore.setState({ [e.target.name]: getValue, productClinicFormTouch: true });
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
            onKeyUp={onFieldHandler}
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
            onKeyUp={onFieldHandler}
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
            onKeyUp={onFieldHandler}
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
