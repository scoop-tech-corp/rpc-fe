import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useStaffFormStore } from '../../staff-form-store';

import MainCard from 'components/MainCard';
import { Fragment } from 'react';

const SecurityGroups = () => {
  const roleId = useStaffFormStore((state) => state.roleId);
  const rolesIdList = useStaffFormStore((state) => state.rolesIdList);

  const onRadioChange = (e) => {
    useStaffFormStore.setState({ [e.target.name]: e.target.value, staffFormTouch: true });
  };

  return (
    <MainCard title="Security Groups">
      <RadioGroup name="roleId" value={roleId} onChange={onRadioChange}>
        {rolesIdList.map((r, idx) => (
          <Fragment key={idx}>
            <FormControlLabel value={r.value} control={<Radio />} label={r.label} />
          </Fragment>
        ))}
      </RadioGroup>
    </MainCard>
  );
};

export default SecurityGroups;
