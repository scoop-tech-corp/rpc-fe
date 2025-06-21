import { FormattedMessage } from 'react-intl';
import { Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useDiscountFormStore } from '../../discount-form-store';

import MainCard from 'components/MainCard';
import SettingFreeItem from './setting-free-item';
import SettingDiscount from './setting-discount';
import SettingBundle from './setting-bundle';
import SettingBasedSales from './setting-based-sales';

const SectionSettings = () => {
  // 1 = Free Item, 2 = Discount, 3 = Bundle, 4 = Based Sales
  const type = useDiscountFormStore((state) => state.type);

  const renderContentSettings = () => {
    switch (type) {
      case '1':
        return <SettingFreeItem />;
      case '2':
        return <SettingDiscount />;
      case '3':
        return <SettingBundle />;
      case '4':
        return <SettingBasedSales />;
    }
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="settings" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} textAlign="center">
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(e) => {
                useDiscountFormStore.setState({
                  type: e.target.value,
                  discountFormTouch: true
                });
              }}
              aria-label="discount-type"
            >
              <ToggleButton value="1" aria-label="free-item">
                <FormattedMessage id="free-item" />
              </ToggleButton>
              <ToggleButton value="2" aria-label="discount">
                <FormattedMessage id="discount" />
              </ToggleButton>
              <ToggleButton value="3" aria-label="bundle">
                <FormattedMessage id="bundle" />
              </ToggleButton>
              <ToggleButton value="4" aria-label="based-sales">
                <FormattedMessage id="based-sales" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12}>
            {renderContentSettings()}
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default SectionSettings;
