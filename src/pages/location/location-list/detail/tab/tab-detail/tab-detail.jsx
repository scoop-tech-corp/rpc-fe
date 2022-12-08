import { Grid } from '@mui/material';
import BasicInfo from './basic-info';
import OperatingHour from './operating-hour';

const TabDetail = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <BasicInfo />
      </Grid>
      <Grid item xs={12} sm={12}>
        <OperatingHour />
      </Grid>
    </Grid>
  );
};

export default TabDetail;
