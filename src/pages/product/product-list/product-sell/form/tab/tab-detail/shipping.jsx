import { FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductSellFormStore } from '../../product-sell-form-store';

import MainCard from 'components/MainCard';

const Shipping = () => {
  const isShipped = useProductSellFormStore((state) => state.isShipped);
  const weight = useProductSellFormStore((state) => state.weight);
  const length = useProductSellFormStore((state) => state.length);
  const width = useProductSellFormStore((state) => state.width);
  const height = useProductSellFormStore((state) => state.height);

  const onFieldHandler = (event) =>
    useProductSellFormStore.setState({ [event.target.name]: +event.target.value, productSellFormTouch: true });

  return (
    <MainCard title={<FormattedMessage id="shipping" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="shippable">
              <FormattedMessage id="shippable" />
            </InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select id="isShipped" name="isShipped" value={isShipped} onChange={onFieldHandler} placeholder="Select shippable">
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
            <TextField fullWidth id="weight" name="weight" value={weight} onChange={onFieldHandler} type="number" inputProps={{ min: 0 }} />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="length">
              <FormattedMessage id="length" />
            </InputLabel>
            <TextField fullWidth id="length" name="length" value={length} onChange={onFieldHandler} type="number" inputProps={{ min: 0 }} />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="width">
              <FormattedMessage id="width" />
            </InputLabel>
            <TextField fullWidth id="width" name="width" value={width} onChange={onFieldHandler} type="number" inputProps={{ min: 0 }} />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="height">
              <FormattedMessage id="height" />
            </InputLabel>
            <TextField fullWidth id="height" name="height" value={height} onChange={onFieldHandler} type="number" inputProps={{ min: 0 }} />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Shipping;
