import { Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductClinicDetailStore } from '../../../product-clinic-detail-store';

import MainCard from 'components/MainCard';
import PricingBasic from './pricing-basic';
import PricingCustomer from './pricing-customer';
import PricingLocation from './pricing-location';
import PricingQuantity from './pricing-quantity';

const Pricing = () => {
  const pricingStatus = useProductClinicDetailStore((state) => state.pricingStatus);

  const onChangePricing = (e) => useProductClinicDetailStore.setState({ pricingStatus: e.target.value, productClinicDetailTouch: true });

  const renderContentPricing = () => {
    switch (pricingStatus) {
      case 'CustomerGroups':
        return <PricingCustomer />;
      case 'PriceLocations':
        return <PricingLocation />;
      case 'Quantities':
        return <PricingQuantity />;
    }
  };

  return (
    <MainCard title={<FormattedMessage id="pricing" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <PricingBasic />
        </Grid>
        <Grid item xs={12} sm={12} textAlign="center">
          <ToggleButtonGroup value={pricingStatus} exclusive onChange={onChangePricing} aria-label="pricing-status">
            <ToggleButton value="Basic" aria-label="basic">
              <FormattedMessage id="basic" />
            </ToggleButton>
            <ToggleButton value="CustomerGroups" aria-label="customer">
              <FormattedMessage id="customer" />
            </ToggleButton>
            <ToggleButton value="PriceLocations" aria-label="location">
              <FormattedMessage id="location" />
            </ToggleButton>
            <ToggleButton value="Quantities" aria-label="quantity">
              <FormattedMessage id="quantity" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12} sm={12}>
          {renderContentPricing()}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Pricing;
