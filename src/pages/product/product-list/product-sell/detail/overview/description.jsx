import { Grid, InputLabel, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';

const ProductSellDetailOverviewDescription = (props) => {
  const { data } = props;

  return (
    <MainCard title={<FormattedMessage id="description" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="introduction">{<FormattedMessage id="introduction" />}</InputLabel>
            {data.introduction}
          </Stack>
        </Grid>
        <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="description">{<FormattedMessage id="description" />}</InputLabel>
            {data.description}
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

ProductSellDetailOverviewDescription.propTypes = {
  data: PropTypes.object
};

export default ProductSellDetailOverviewDescription;
