import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useStaffFormStore } from '../../staff-form-store';

import MainCard from 'components/MainCard';

const Reminders = () => {
  const reminderEmail = useStaffFormStore((state) => state.reminderEmail);
  const reminderWhatsapp = useStaffFormStore((state) => state.reminderWhatsapp);

  const handleChange = (e) => useStaffFormStore.setState({ [e.target.name]: e.target.checked, staffFormTouch: true });

  return (
    <MainCard title={<FormattedMessage id="reminders" />}>
      <FormGroup>
        <FormControlLabel control={<Checkbox checked={reminderEmail} onChange={handleChange} name="reminderEmail" />} label="Email" />
        <FormControlLabel
          control={<Checkbox checked={reminderWhatsapp} onChange={handleChange} name="reminderWhatsapp" />}
          label="Whatsapp"
        />
      </FormGroup>
    </MainCard>
  );
};

export default Reminders;
