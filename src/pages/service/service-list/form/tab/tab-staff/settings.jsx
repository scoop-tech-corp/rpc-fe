import { Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useServiceFormStore } from '../../service-form-store';

import MainCard from 'components/MainCard';

const TabStaffSettings = () => {
  const staffPerBooking = useServiceFormStore((state) => state.staffPerBooking);
  const surcharges = useServiceFormStore((state) => state.surcharges);
  const isDetail = useServiceFormStore((state) => state.isDetail);

  return (
    <MainCard title={<FormattedMessage id="overview" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="staffPerBooking">
              <FormattedMessage id="staffPerBooking" />
            </InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              {isDetail ? (
                <div style={{ marginTop: 5 }}>{staffPerBooking}</div>
              ) : (
                <Select
                  id="staffPerBooking"
                  name="staffPerBooking"
                  value={staffPerBooking || ''}
                  onChange={(event) => useServiceFormStore.setState({ staffPerBooking: event.target.value })}
                  placeholder="Select staffPerBooking"
                >
                  {[1, 2, 3, 4, 5].map((item, index) => (
                    <MenuItem value={`${item}`} key={index}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="surcharges">
              <FormattedMessage id="surcharges" />
            </InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              {isDetail ? (
                <div style={{ marginTop: 5 }}>
                  {surcharges == 0 ? <FormattedMessage id="amount" /> : <FormattedMessage id="percentage" />}
                </div>
              ) : (
                <Select
                  id="surcharges"
                  name="surcharges"
                  value={surcharges}
                  onChange={(event) => useServiceFormStore.setState({ surcharges: event.target.value })}
                  placeholder="Select surcharges"
                >
                  <MenuItem value={1}>
                    <FormattedMessage id="percentage" />
                  </MenuItem>
                  <MenuItem value={0}>
                    <FormattedMessage id="amount" />
                  </MenuItem>
                </Select>
              )}
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabStaffSettings;
