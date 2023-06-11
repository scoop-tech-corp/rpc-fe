import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { createProductRestockTracking } from '../../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const FormTracking = (props) => {
  const [todayProgress, setTodayProgress] = useState('');
  const [isDisabledOk, setIsDisabledOk] = useState(true);
  const dispatch = useDispatch();

  const onOk = async () => {
    // try {
    //   const resp = await createProductRestockTracking({ id: data.id, progress: todayProgress });
    //   if (resp.status === 200) {
    //     setTodayProgress('');
    //     dispatch(snackbarSuccess('Success created data'));
    //     props.output('trigerData');
    //   }
    // } catch (error) {
    //   if (error) {
    //     dispatch(snackbarError(createMessageBackend(error)));
    //   }
    // }

    await createProductRestockTracking({ id: props.id, progress: todayProgress })
      .then((resp) => {
        if (resp.status === 200) {
          setTodayProgress('');
          dispatch(snackbarSuccess('Success created data'));
          props.output('trigerData');
        }
      })
      .catch((error) => {
        if (error) {
          dispatch(snackbarError(createMessageBackend(error)));
        }
      });
  };

  return (
    <ModalC
      title={<FormattedMessage id="form-tracking" />}
      open={props.open}
      onOk={onOk}
      onCancel={() => {
        setTodayProgress('');
        props.output('closeForm');
      }}
      disabledOk={isDisabledOk}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="today-progress">{<FormattedMessage id="today-progress" />}</InputLabel>
            <TextField
              multiline
              fullWidth
              id="today-progress"
              name="today-progress"
              value={todayProgress}
              rows={5}
              onChange={(event) => {
                setTodayProgress(event.target.value);
                setIsDisabledOk(Boolean(event.target.value === ''));
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormTracking.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  output: PropTypes.func
};

export default FormTracking;
