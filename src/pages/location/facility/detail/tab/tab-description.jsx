import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useFacilityDetailStore } from '../facility-detail-store';

import MainCard from 'components/MainCard';

const TabDescription = () => {
  const introduction = useFacilityDetailStore((state) => state.introduction);
  const description = useFacilityDetailStore((state) => state.description);

  return (
    <MainCard title={<FormattedMessage id="overview" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="introduction">
              <FormattedMessage id="introduction" />
            </InputLabel>
            <TextField
              fullWidth
              id="introduction"
              name="introduction"
              value={introduction}
              onChange={(event) => useFacilityDetailStore.setState({ introduction: event.target.value })}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="description">
              <FormattedMessage id="description" />
            </InputLabel>
            <TextField
              fullWidth
              id="description"
              name="description"
              value={description}
              onChange={(event) => useFacilityDetailStore.setState({ description: event.target.value })}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabDescription;
