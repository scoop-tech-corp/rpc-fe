import { FormattedMessage } from 'react-intl';
import { useState } from 'react';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import FormAbsent from 'components/FormAbsent';

const ModalAbsent = (props) => {
  const { open } = props;
  const [isFormValid, setFormValid] = useState(false);
  const [onFiredSubmit, setFiredSubmit] = useState(false);
  const [onFiredCancel, setFiredCancel] = useState(false);

  return (
    <ModalC
      title={<FormattedMessage id="absent" />}
      open={open}
      onOk={() => setFiredSubmit(true)}
      onCancel={() => setFiredCancel(true)}
      fullWidth
      maxWidth="md"
      disabledOk={!isFormValid}
    >
      <FormAbsent setFormValid={setFormValid} firedSubmit={onFiredSubmit} firedCancel={onFiredCancel} onClose={(e) => props.onClose(e)} />
    </ModalC>
  );
};

ModalAbsent.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ModalAbsent;
