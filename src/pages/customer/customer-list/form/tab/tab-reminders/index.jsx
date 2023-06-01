import Reminders from './reminders';
import Setting from './setting';

import { Grid } from '@mui/material';

const TabReminders = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Setting />
      </Grid>
      <Grid item xs={12}>
        <Reminders type="booking" title="reminder-for-extra-booking" />
      </Grid>
      <Grid item xs={12}>
        <Reminders type="payment" title="reminder-for-extra-payment" />
      </Grid>
      <Grid item xs={12}>
        <Reminders type="latePayment" title="reminder-for-late-payment" />
      </Grid>
    </Grid>
  );
};

export default TabReminders;
