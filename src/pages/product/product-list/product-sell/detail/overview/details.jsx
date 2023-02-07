import { Chip, Grid, InputLabel, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';

const ProductSellDetailOverviewDetails = (props) => {
  const { data } = props;

  return (
    <MainCard title="Details">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="name">Status</InputLabel>:&nbsp;{' '}
            {data.status ? (
              <Chip color="success" label="Active" size="small" variant="light" />
            ) : (
              <Chip color="error" label="Non Active" size="small" variant="light" />
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="category">{<FormattedMessage id="category" />}</InputLabel>:&nbsp; asd
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="supplier">{<FormattedMessage id="supplier" />}</InputLabel>:&nbsp; {data.supplierName || '-'}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="reminders">{<FormattedMessage id="reminders" />}</InputLabel>:&nbsp; asd
          </Stack>
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="sku">Sku</InputLabel>:&nbsp; {data.sku}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Stack spacing={1} direction="row">
            <InputLabel htmlFor="brand">{<FormattedMessage id="brand" />}</InputLabel>:&nbsp; {data.brandName || '-'}
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

ProductSellDetailOverviewDetails.propTypes = {
  data: PropTypes.object
};

export default ProductSellDetailOverviewDetails;
