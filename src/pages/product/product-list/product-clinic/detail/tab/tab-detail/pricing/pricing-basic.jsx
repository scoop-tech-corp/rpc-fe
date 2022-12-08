import { Grid, Stack, InputLabel, TextField } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import NumberFormatCustom from 'utils/number-format';
import ProductClinicDetailContext from '../../../product-clinic-detail-context';

const PricingBasic = () => {
  const { productClinicDetail, setProductClinicDetail } = useContext(ProductClinicDetailContext);
  const [pricingBasic, setPricingBasic] = useState({
    costPrice: '',
    marketPrice: '',
    price: ''
  });

  useEffect(() => {
    setPricingBasic({
      costPrice: productClinicDetail.costPrice || '',
      marketPrice: productClinicDetail.marketPrice || '',
      price: productClinicDetail.price || ''
    });
  }, [productClinicDetail.costPrice, productClinicDetail.marketPrice, productClinicDetail.price]);

  const onBlurHandler = (event) => {
    const getValue = event.target.value ? +event.target.value.replace(',', '') : '';

    setProductClinicDetail((value) => {
      return { ...value, [event.target.name]: getValue };
    });
  };

  const onFieldHandler = (event, procedure) => {
    const getValue = +event.target.value.replace(',', '');

    setPricingBasic((value) => {
      return { ...value, [procedure]: getValue };
    });
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
            value={pricingBasic.costPrice}
            onChange={(e) => onFieldHandler(e, 'costPrice')}
            onBlur={onBlurHandler}
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
            value={pricingBasic.marketPrice}
            onChange={(e) => onFieldHandler(e, 'marketPrice')}
            onBlur={onBlurHandler}
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
            value={pricingBasic.price}
            onChange={(e) => onFieldHandler(e, 'price')}
            onBlur={onBlurHandler}
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
