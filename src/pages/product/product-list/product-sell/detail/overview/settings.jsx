import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
// import { useState } from 'react';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';

const ProductSellDetailOverviewSettings = (props) => {
  const { data } = props;
  // const [isCustomerPurchase] = useState(false);
  // const [isCustomerPurchaseOnline] = useState(false);
  // const [isCustomerPurchaseOutStock] = useState(false);
  // const [isStockLevelCheck] = useState(false);
  // const [isNonChargeable] = useState(false);

  // const [isOfficeApproval] = useState(false);
  // const [isAdminApproval] = useState(false);

  return (
    <MainCard title={<FormattedMessage id="settings" />}>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={data.isCustomerPurchase} readOnly={true} name="isCustomerPurchase" />}
          label={<FormattedMessage id="allow-customers-to-purchase-this-product" />}
        />
        <FormControlLabel
          control={<Checkbox checked={data.isCustomerPurchaseOnline} readOnly={true} name="isCustomerPurchaseOnline" />}
          label={<FormattedMessage id="allow-customers-to-purchase-this-product-online" />}
        />
        <FormControlLabel
          control={<Checkbox checked={data.isCustomerPurchaseOutStock} readOnly={true} name="isCustomerPurchaseOutStock" />}
          label={<FormattedMessage id="allow-customers-to-purchase-this-product-when-its-out-of-stock" />}
        />

        <FormControlLabel
          control={<Checkbox checked={data.isStockLevelCheck} readOnly={true} name="isStockLevelCheck" />}
          label={<FormattedMessage id="apply-stock-level-checks-during-add-on-prescription" />}
        />

        <FormControlLabel
          control={<Checkbox checked={data.isNonChargeable} readOnly={true} name="isNonChargeable" />}
          label={<FormattedMessage id="non-chargeable" />}
        />
        <FormControlLabel
          control={<Checkbox checked={data.isOfficeApproval} readOnly={true} name="isOfficeApproval" />}
          label={<FormattedMessage id="need-office-approval" />}
        />
        <FormControlLabel
          control={<Checkbox checked={data.isAdminApproval} readOnly={true} name="isAdminApproval" />}
          label={<FormattedMessage id="need-admin-approval" />}
        />
      </FormGroup>
    </MainCard>
  );
};

ProductSellDetailOverviewSettings.propTypes = {
  data: PropTypes.object
};

export default ProductSellDetailOverviewSettings;
