import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createFullShift, createLongShift, updateFullShift, updateLongShift } from '../service';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const FormShiftComponent = (props) => {
  const { data, type } = props;
  const [formValue, setFormValue] = useState({ date: data.date || null, reason: data.reason || '' });
  const [isDisabledOk, setIsDisabledOk] = useState(true);
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const catchErrorResponse = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    };
    const payload = { date: formValue.date, reason: formValue.reason };

    if (data.id) {
      // update
      payload.id = data.id;
      const updateApi$ = type === 'full' ? updateFullShift : updateLongShift;
      await updateApi$(payload)
        .then((resp) => {
          if (resp && resp.status === 200) {
            dispatch(snackbarSuccess(`Data has been updated successfully`));
            props.onClose(true);
          }
        })
        .catch(catchErrorResponse);
    } else {
      // create
      const createApi$ = type === 'full' ? createFullShift : createLongShift;
      await createApi$(payload)
        .then((resp) => {
          if (resp && resp.status === 200) {
            dispatch(snackbarSuccess(`Data has been created successfully`));
            props.onClose(true);
          }
        })
        .catch(catchErrorResponse);
    }
  };

  useEffect(() => {
    setIsDisabledOk(!formValue.date || !formValue.reason);
  }, [formValue]);

  return (
    <ModalC
      title={`Form ${type === 'full' ? 'Full' : 'Long'} Shift`}
      okText="Save"
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      onCancel={() => props.onClose()}
      disabledOk={isDisabledOk}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="date">
              <FormattedMessage id="date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                inputFormat="DD/MM/YYYY"
                value={formValue.date}
                onChange={(selectedDate) => {
                  setFormValue((prevState) => ({ ...prevState, date: selectedDate }));
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="reason">{<FormattedMessage id="reason" />}</InputLabel>
            <TextField
              fullWidth
              id="reason"
              name="reason"
              value={formValue.reason}
              onChange={(e) => {
                setFormValue((prevState) => ({ ...prevState, reason: e.target.value }));
              }}
              // error={Boolean(backgroundErr.nomorIdErr && backgroundErr.nomorIdErr.length > 0)}
              // helperText={backgroundErr.nomorIdErr}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormShiftComponent.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormShiftComponent;
