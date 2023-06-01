import { Grid } from '@mui/material';

import GeneralInfo from './general-info';
import Background from './background';
import Reference from './reference';

const TabInformation = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <GeneralInfo />
      </Grid>
      <Grid item xs={12}>
        <Background />
      </Grid>
      <Grid item xs={12}>
        <Reference />
      </Grid>
    </Grid>
  );
};

export default TabInformation;
