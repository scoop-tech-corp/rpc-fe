import { Grid } from '@mui/material';

import Background from './background';
import BasicDetail from './basic-detail';
import Compensation from './compensation';
import Position from './position';

const TabDetail = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <BasicDetail />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Position />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Compensation />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Background />
      </Grid>
    </Grid>
  );
};

export default TabDetail;
