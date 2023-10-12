import { Grid } from '@mui/material';
import Settings from './settings';
import Followup from './followup';

const TabBooking = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <Settings />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Followup />
      </Grid>
    </Grid>
  );
};

export default TabBooking;
