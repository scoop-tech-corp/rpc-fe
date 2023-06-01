import { Grid } from '@mui/material';
import BasicDetail from './basic-detail';
import Pricing from './pricing';
import Shipping from './shipping';
import InventoryProduct from './inventory-product';
import Settings from './settings';

const TabDetail = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <BasicDetail />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Pricing />
      </Grid>
      <Grid item xs={12} sm={12}>
        <InventoryProduct />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Shipping />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Settings />
      </Grid>
    </Grid>
  );
};

export default TabDetail;
