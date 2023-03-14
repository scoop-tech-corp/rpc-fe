import ModalC from './ModalC';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';

const FormReject = (props) => {
  const [reason, setReason] = useState('');
  const [isDisabledOk, setIsDisabledOk] = useState(true);

  const onCancel = () => {
    props.onClose(true);
    setReason('');
  };

  const onOk = () => {
    props.onSubmit(reason);
    setReason('');
  };

  return (
    <ModalC
      title={props.title}
      okText="Save"
      cancelText="Cancel"
      open={props.open}
      onOk={onOk}
      onCancel={onCancel}
      disabledOk={isDisabledOk}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="reason">{<FormattedMessage id="reason" />}</InputLabel>
            <TextField
              multiline
              fullWidth
              id="reason"
              name="reason"
              value={reason}
              rows={5}
              onChange={(event) => {
                setReason(event.target.value);
                setIsDisabledOk(Boolean(event.target.value === ''));
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormReject.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onSubmit: PropTypes.func,
  onClose: PropTypes.func
};

export default FormReject;
