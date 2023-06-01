import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductSellFormStore } from '../product-sell-form-store';

import MainCard from 'components/MainCard';

const TabDescription = () => {
  const introduction = useProductSellFormStore((state) => state.introduction);
  const description = useProductSellFormStore((state) => state.description);

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
              onChange={(event) => useProductSellFormStore.setState({ introduction: event.target.value, productSellFormTouch: true })}
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
              onChange={(event) => useProductSellFormStore.setState({ description: event.target.value, productSellFormTouch: true })}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabDescription;
