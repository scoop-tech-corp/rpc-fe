import { Grid } from '@mui/material';
import BasicDetail from './basic-detail';
import Prices from './prices';
import ProductRequired from './product-required';

const TabDetail = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <BasicDetail />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Prices />
      </Grid>
      <Grid item xs={12} sm={12}>
        <ProductRequired />
      </Grid>
    </Grid>
  );
};

export default TabDetail;
