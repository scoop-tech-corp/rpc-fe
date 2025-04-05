import { useState } from 'react';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { reassignTransaction } from '../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const ReassignModalC = (props) => {
  const [doctor, setDoctor] = useState(null);
  const dispatch = useDispatch();

  const onOk = async () => {
    await reassignTransaction({ transactionId: props.data.transactionId, doctorId: doctor.value })
      .then((resp) => {
        if (resp.status === 200) {
          props.onClose(true);
          dispatch(snackbarSuccess('Success reassign data'));
        }
      })
      .catch((err) => {
        if (err) {
          props.onClose(false);
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  return (
    <ModalC
      title={'Reassign'}
      okText="Save"
      cancelText="Cancel"
      open={props.open}
      onOk={onOk}
      onCancel={() => props.onClose(false)}
      disabledOk={!doctor}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="doctor">
              <FormattedMessage id="doctor" />
            </InputLabel>
            <Autocomplete
              id="doctor"
              options={props.data.listDoctor || []}
              value={doctor}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, selected) => setDoctor(selected ? selected : null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!doctor}
                  helperText={!doctor ? <FormattedMessage id="doctor-is-required" /> : ''}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

ReassignModalC.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.any,
  onClose: PropTypes.func
};

export default ReassignModalC;
