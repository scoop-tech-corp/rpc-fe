import { Button, CardActions, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';
import ProductSellDetailOverviewDetails from './details';
import ProductSellDetailOverviewSettings from './settings';
import ProductSellDetailOverviewShipping from './shipping';
import ProductSellDetailOverviewDescription from './description';
import ProductSellDetailOverviewPricing from './pricing';

const ProductSellDetailOverview = (props) => {
  const { data } = props;
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <CardActions
        sx={{
          position: 'sticky',
          top: '0px',
          bgcolor: theme.palette.background.default,
          zIndex: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
        style={{ marginBottom: '10px' }}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ width: 1 }}>
          <Stack direction="row" spacing={1} style={{ overflowX: 'auto' }}>
            <Button color="primary" size="medium">
              Split
            </Button>
            <Button color="primary" size="medium">
              Adjust
            </Button>
            <Button color="primary" size="medium">
              Transfer
            </Button>
            <Button color="primary" size="medium">
              Buy
            </Button>
            <Button color="warning" size="medium" onClick={() => navigate(`/product/product-list/sell/form/${data.id}`, { replace: true })}>
              Edit
            </Button>
            <Button color="error" size="medium">
              Delete
            </Button>
          </Stack>
        </Stack>
      </CardActions>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <ProductSellDetailOverviewDetails data={data.details} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <ProductSellDetailOverviewShipping data={data.shipping} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <ProductSellDetailOverviewDescription data={data.description} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <ProductSellDetailOverviewSettings data={data.settings} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <ProductSellDetailOverviewPricing data={data.pricing} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <MainCard title={<FormattedMessage id="inventory" />}>
                <Typography variant="subtitle1">{<FormattedMessage id="stock" />}</Typography>
                <Divider style={{ margin: '10px 0px' }} />
                <Grid container spacing={1}>
                  <Grid item xs={12} md={5} lg={5}>
                    <Typography variant="subtitle2">{data.inventory.locationName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2} lg={2} textAlign="center">
                    <Typography variant="subtitle2">{data.inventory.stock}</Typography>
                  </Grid>
                  <Grid item xs={12} md={5} lg={5} textAlign="right">
                    {data.inventory.status === 'no stock' ? (
                      <Chip color="error" label="No Stock" size="small" variant="light" />
                    ) : data.inventory.status === 'low stock' ? (
                      <Chip color="warning" label="Low Stock" size="small" variant="light" />
                    ) : (
                      ''
                    )}
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

ProductSellDetailOverview.propTypes = {
  data: PropTypes.object
};

export default ProductSellDetailOverview;