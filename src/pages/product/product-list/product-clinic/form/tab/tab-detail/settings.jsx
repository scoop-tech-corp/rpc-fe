import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductClinicFormStore } from '../../product-clinic-form-store';

import MainCard from 'components/MainCard';

const Settings = () => {
  const isCustomerPurchase = useProductClinicFormStore((state) => state.isCustomerPurchase);
  const isCustomerPurchaseOnline = useProductClinicFormStore((state) => state.isCustomerPurchaseOnline);
  const isCustomerPurchaseOutStock = useProductClinicFormStore((state) => state.isCustomerPurchaseOutStock);
  const isStockLevelCheck = useProductClinicFormStore((state) => state.isStockLevelCheck);
  const isNonChargeable = useProductClinicFormStore((state) => state.isNonChargeable);
  const isOfficeApproval = useProductClinicFormStore((state) => state.isOfficeApproval);
  const isAdminApproval = useProductClinicFormStore((state) => state.isAdminApproval);

  const handleChange = (e) => useProductClinicFormStore.setState({ [e.target.name]: e.target.checked, productClinicFormTouch: true });

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
