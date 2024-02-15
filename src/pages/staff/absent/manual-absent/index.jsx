import { useState } from 'react';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import FormAbsent from 'components/FormAbsent';

const StaffManualAbsent = () => {
  const [isFormValid, setFormValid] = useState(false);
  const [onFiredSubmit, setFiredSubmit] = useState(false);

  return (
    <>
      <FormAbsent setFormValid={setFormValid} firedSubmit={onFiredSubmit} />

      <Button
        variant="contained"
        style={{ marginTop: '10px' }}
        className="button__primary button__submit"
        onClick={() => setFiredSubmit(true)}
        disabled={!isFormValid}
      >
        {<FormattedMessage id="submit" />}
      </Button>
    </>
  );
};

export default StaffManualAbsent;
