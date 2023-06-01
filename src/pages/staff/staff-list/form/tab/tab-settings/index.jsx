import { Grid } from '@mui/material';

import General from './general';
import Reminders from './reminders';
import SecurityGroups from './security-groups';

const TabSettings = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <General />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Reminders />
      </Grid>
      <Grid item xs={12} sm={12}>
        <SecurityGroups />
      </Grid>
    </Grid>
  );
};

export default TabSettings;
