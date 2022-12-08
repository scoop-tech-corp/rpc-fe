import { FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ProductClinicDetailContext from '../../product-clinic-detail-context';

const Shipping = () => {
  const { productClinicDetail, setProductClinicDetail } = useContext(ProductClinicDetailContext);
  const [shipping, setShipping] = useState({
    isShipped: null,
    weight: '',
    length: '',
    width: '',
    height: ''
  });

  useEffect(() => {
    setShipping((value) => {
      return {
        ...value,
        isShipped: productClinicDetail.isShipped,
        weight: productClinicDetail.weight || '',
        length: productClinicDetail.length || '',
        width: productClinicDetail.width || '',
        height: productClinicDetail.height || ''
      };
    });
  }, [productClinicDetail]);

  const onFieldHandler = (event) => {
    setShipping((value) => {
      return { ...value, [event.target.name]: +event.target.value };
    });
  };

  const onBlurHandler = (event) => {
    setProductClinicDetail((value) => {
      return { ...value, [event.target.name]: +event.target.value };
    });
  };

  const onSelectShipping = (e) => {
    const objStatus = { isShipped: e.target.value };

    setShipping((value) => {
      return { ...value, ...objStatus };
    });

    setProductClinicDetail((value) => {
      return { ...value, ...objStatus };
    });
  };

  return (
    <MainCard title={<FormattedMessage id="shipping" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="shippable">
              <FormattedMessage id="shippable" />
            </InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select id="status" name="status" value={shipping.isShipped || ''} onChange={onSelectShipping} placeholder="Select shippable">
                <MenuItem value="">
                  <em>Select shippable</em>
                </MenuItem>
                <MenuItem value={'1'}>
                  <FormattedMessage id="yes" />
                </MenuItem>
                <MenuItem value={'0'}>
                  <FormattedMessage id="no" />
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="weight">
              <FormattedMessage id="weight" />
            </InputLabel>
            <TextField
              fullWidth
              id="weight"
              name="weight"
              value={shipping.weight}
              onChange={onFieldHandler}
              onBlur={onBlurHandler}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="length">
              <FormattedMessage id="length" />
            </InputLabel>
            <TextField
              fullWidth
              id="length"
              name="length"
              value={shipping.length}
              onChange={onFieldHandler}
              onBlur={onBlurHandler}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="width">
              <FormattedMessage id="width" />
            </InputLabel>
            <TextField
              fullWidth
              id="width"
              name="width"
              value={shipping.width}
              onChange={onFieldHandler}
              onBlur={onBlurHandler}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="height">
              <FormattedMessage id="height" />
            </InputLabel>
            <TextField
              fullWidth
              id="height"
              name="height"
              value={shipping.height}
              onChange={onFieldHandler}
              onBlur={onBlurHandler}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Shipping;
