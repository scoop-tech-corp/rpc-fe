import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createOccupation } from 'pages/customer/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormOccupation = (props) => {
  const [occupation, setOccupation] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createOccupation(occupation)
      .then((resp) => {
        if (resp && resp.status === 200) {
          setOccupation('');
          dispatch(snackbarSuccess(`${occupation} has been created successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    setOccupation('');
    props.onClose(false);
  };

  return (
    <ModalC
      title={<FormattedMessage id="add-occupation" />}
      okText="Save"
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="occupation">{<FormattedMessage id="occupation" />}</InputLabel>
            <TextField
              fullWidth
              id="occupation"
              name="occupation"
              value={occupation}
              onChange={(event) => setOccupation(event.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormOccupation.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormOccupation;
