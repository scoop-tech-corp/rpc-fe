import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductSellDetailStore } from '../../product-sell-detail-store';

import MainCard from 'components/MainCard';

const Settings = () => {
  const isCustomerPurchase = useProductSellDetailStore((state) => state.isCustomerPurchase);
  const isCustomerPurchaseOnline = useProductSellDetailStore((state) => state.isCustomerPurchaseOnline);
  const isCustomerPurchaseOutStock = useProductSellDetailStore((state) => state.isCustomerPurchaseOutStock);
  const isStockLevelCheck = useProductSellDetailStore((state) => state.isStockLevelCheck);
  const isNonChargeable = useProductSellDetailStore((state) => state.isNonChargeable);
  const isOfficeApproval = useProductSellDetailStore((state) => state.isOfficeApproval);
  const isAdminApproval = useProductSellDetailStore((state) => state.isAdminApproval);

  const handleChange = (e) => useProductSellDetailStore.setState({ [e.target.name]: e.target.checked, productSellDetailTouch: true });

  return (
    <MainCard title={<FormattedMessage id="settings" />}>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={isCustomerPurchase} onChange={handleChange} name="isCustomerPurchase" />}
          label={<FormattedMessage id="allow-customers-to-purchase-this-product" />}
        />
        <FormControlLabel
          control={<Checkbox checked={isCustomerPurchaseOnline} onChange={handleChange} name="isCustomerPurchaseOnline" />}
          label={<FormattedMessage id="allow-customers-to-purchase-this-product-online" />}
        />
        <FormControlLabel
          control={<Checkbox checked={isCustomerPurchaseOutStock} onChange={handleChange} name="isCustomerPurchaseOutStock" />}
          label={<FormattedMessage id="allow-customers-to-purchase-this-product-when-its-out-of-stock" />}
        />

        <FormControlLabel
          control={<Checkbox checked={isStockLevelCheck} onChange={handleChange} name="isStockLevelCheck" />}
          label={<FormattedMessage id="apply-stock-level-checks-during-add-on-prescription" />}
        />

        <FormControlLabel
          control={<Checkbox checked={isNonChargeable} onChange={handleChange} name="isNonChargeable" />}
          label={<FormattedMessage id="non-chargeable" />}
        />
        <FormControlLabel
          control={<Checkbox checked={isOfficeApproval} onChange={handleChange} name="isOfficeApproval" />}
          label={<FormattedMessage id="need-office-approval" />}
        />
        <FormControlLabel
          control={<Checkbox checked={isAdminApproval} onChange={handleChange} name="isAdminApproval" />}
          label={<FormattedMessage id="need-admin-approval" />}
        />
      </FormGroup>
    </MainCard>
  );
};

export default Settings;
