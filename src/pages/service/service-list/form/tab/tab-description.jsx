import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useServiceFormStore } from '../service-form-store';

import MainCard from 'components/MainCard';

const TabDescription = () => {
  const introduction = useServiceFormStore((state) => state.introduction);
  const description = useServiceFormStore((state) => state.description);
  const isDetail = useServiceFormStore((state) => state.isDetail);

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
              disabled={isDetail}
              inputProps={{ readOnly: isDetail }}
              name="introduction"
              value={introduction}
              onChange={(event) => useServiceFormStore.setState({ introduction: event.target.value, productSellFormTouch: true })}
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
              disabled={isDetail}
              inputProps={{ readOnly: isDetail }}
              multiline
              rows={4}
              maxRows={10}
              onChange={(event) => useServiceFormStore.setState({ description: event.target.value, productSellFormTouch: true })}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabDescription;
