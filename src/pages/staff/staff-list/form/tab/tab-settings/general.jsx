import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useStaffFormStore } from '../../staff-form-store';

import MainCard from 'components/MainCard';

const General = () => {
  const generalCustomerCanSchedule = useStaffFormStore((state) => state.generalCustomerCanSchedule);
  const generalCustomerReceiveDailyEmail = useStaffFormStore((state) => state.generalCustomerReceiveDailyEmail);
  const generalAllowMemberToLogUsingEmail = useStaffFormStore((state) => state.generalAllowMemberToLogUsingEmail);

  const handleChange = (e) => useStaffFormStore.setState({ [e.target.name]: e.target.checked, staffFormTouch: true });

  return (
    <MainCard title={<FormattedMessage id="general" />}>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={generalCustomerCanSchedule} onChange={handleChange} name="generalCustomerCanSchedule" />}
          label={<FormattedMessage id="customers-can-schedule-this-staff-member-online" />}
        />
        <FormControlLabel
          control={<Checkbox checked={generalCustomerReceiveDailyEmail} onChange={handleChange} name="generalCustomerReceiveDailyEmail" />}
          label={<FormattedMessage id="receive-a-daily-email-containing-their-scheduled-appointments" />}
        />
        <FormControlLabel
          control={
            <Checkbox checked={generalAllowMemberToLogUsingEmail} onChange={handleChange} name="generalAllowMemberToLogUsingEmail" />
          }
          label={<FormattedMessage id="allow-this-staff-member-to-login-using-their-email-address" />}
        />
      </FormGroup>
    </MainCard>
  );
};

export default General;
