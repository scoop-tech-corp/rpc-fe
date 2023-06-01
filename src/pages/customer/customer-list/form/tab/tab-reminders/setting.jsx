import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useCustomerFormStore } from '../../customer-form-store';

import MainCard from 'components/MainCard';

const Setting = () => {
  const isReminderBooking = useCustomerFormStore((state) => state.isReminderBooking);
  const isReminderPayment = useCustomerFormStore((state) => state.isReminderPayment);

  const handleChange = (e) => useCustomerFormStore.setState({ [e.target.name]: e.target.checked, customerFormTouch: true });

  return (
    <MainCard title={<FormattedMessage id="settings" />}>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={isReminderBooking} onChange={handleChange} name="isReminderBooking" />}
          label={<FormattedMessage id="use-the-booking-reminder-configuration-for-services" />}
        />
        <FormControlLabel
          control={<Checkbox checked={isReminderPayment} onChange={handleChange} name="isReminderPayment" />}
          label={<FormattedMessage id="use-payment-reminder-configuration-for-finance" />}
        />
      </FormGroup>
    </MainCard>
  );
};

export default Setting;
