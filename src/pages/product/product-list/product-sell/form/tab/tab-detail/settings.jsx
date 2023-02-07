import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductSellFormStore } from '../../product-sell-form-store';

import MainCard from 'components/MainCard';

const Settings = () => {
  const isCustomerPurchase = useProductSellFormStore((state) => state.isCustomerPurchase);
  const isCustomerPurchaseOnline = useProductSellFormStore((state) => state.isCustomerPurchaseOnline);
  const isCustomerPurchaseOutStock = useProductSellFormStore((state) => state.isCustomerPurchaseOutStock);
  const isStockLevelCheck = useProductSellFormStore((state) => state.isStockLevelCheck);
  const isNonChargeable = useProductSellFormStore((state) => state.isNonChargeable);
  const isOfficeApproval = useProductSellFormStore((state) => state.isOfficeApproval);
  const isAdminApproval = useProductSellFormStore((state) => state.isAdminApproval);

  const handleChange = (e) => useProductSellFormStore.setState({ [e.target.name]: e.target.checked, productSellFormTouch: true });

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
