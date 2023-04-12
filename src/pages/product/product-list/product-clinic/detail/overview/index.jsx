import { Button, CardActions, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useState } from 'react';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';
import ProductClinicDetailOverviewDetails from './details';
import ProductClinicDetailOverviewSettings from './settings';
import ProductClinicDetailOverviewShipping from './shipping';
import ProductClinicDetailOverviewDescription from './description';
import ProductClinicDetailOverviewPricing from './pricing';
import ProductClinicDetailOverviewDosage from './dosage';

import FormTransfer from 'pages/product/product-list/components/FormTransfer';
import FormAdjustment from 'pages/product/product-list/components/FormAdjustment';
import FormRestock from 'pages/product/product-list/components/FormRestock';

const ProductClinicDetailOverview = (props) => {
  const { data } = props;
  const [openFormTransfer, setOpenFormTransfer] = useState(false);
  const [openFormAdjustment, setOpenFormAdjustment] = useState(false);
  const [openFormRestock, setOpenFormRestock] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();

  const onCloseForm = (val) => {
    setOpenFormAdjustment(false);
    setOpenFormTransfer(false);
    setOpenFormRestock(false);

    if (val) {
      props.output('closeOverview');
    }
  };

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
            <Button color="primary" size="medium" onClick={() => setOpenFormAdjustment(true)}>
              <FormattedMessage id="adjust" />
            </Button>
            <Button color="primary" size="medium" onClick={() => setOpenFormTransfer(true)}>
              <FormattedMessage id="transfer" />
            </Button>
            <Button color="primary" size="medium" onClick={() => setOpenFormRestock(true)}>
              <FormattedMessage id="restock" />
            </Button>
            <Button
              color="warning"
              size="medium"
              onClick={() => navigate(`/product/product-list/clinic/form/${data.id}`, { replace: true })}
            >
              <FormattedMessage id="edit" />
            </Button>
            <Button color="error" size="medium">
              <FormattedMessage id="delete" />
            </Button>
          </Stack>
        </Stack>
      </CardActions>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <ProductClinicDetailOverviewDetails data={data.details} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <ProductClinicDetailOverviewDosage data={data.dosages} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <ProductClinicDetailOverviewShipping data={data.shipping} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <ProductClinicDetailOverviewDescription data={data.description} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <ProductClinicDetailOverviewSettings data={data.settings} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <ProductClinicDetailOverviewPricing data={data.pricing} />
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
      {openFormAdjustment && (
        <FormAdjustment data={{ ...data, productType: 'productClinic' }} open={openFormAdjustment} onClose={onCloseForm} />
      )}
      {openFormTransfer && <FormTransfer data={{ ...data, productType: 'productClinic' }} open={openFormTransfer} onClose={onCloseForm} />}
      {openFormRestock && <FormRestock data={{ ...data, productType: 'productClinic' }} open={openFormRestock} onClose={onCloseForm} />}
    </>
  );
};

ProductClinicDetailOverview.propTypes = {
  data: PropTypes.object,
  output: PropTypes.func
};

export default ProductClinicDetailOverview;
