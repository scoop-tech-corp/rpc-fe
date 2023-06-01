import { Chip, Grid, InputLabel, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';

const ProductSellDetailOverviewShipping = (props) => {
  const { data } = props;

  return (
    <MainCard title={<FormattedMessage id="shipping" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="shippable">{<FormattedMessage id="shippable" />}</InputLabel>:&nbsp;
            {data.isShipped ? (
              <Chip color="success" label="Yes" size="small" variant="light" />
            ) : (
              <Chip color="error" label="No" size="small" variant="light" />
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="weight">{<FormattedMessage id="weight" />}</InputLabel>:&nbsp; {data.weight}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="length">{<FormattedMessage id="length" />}</InputLabel>:&nbsp; {data.length}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="width">{<FormattedMessage id="width" />}</InputLabel>:&nbsp; {data.width}
          </Stack>
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="height">{<FormattedMessage id="height" />}</InputLabel>:&nbsp; {data.height}
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

ProductSellDetailOverviewShipping.propTypes = {
  data: PropTypes.object
};

export default ProductSellDetailOverviewShipping;
