import { FormattedMessage, useIntl } from 'react-intl';
import { Autocomplete, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTimeKeeperAbsent, updateTimeKeeperAbsent } from '../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getStaffJobTitleList } from 'service/service-global';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const configCoreErr = {
  jobTitleIdErr: '',
  shiftIdErr: '',
  timeErr: ''
};

const FormTimeKeeperAbsent = (props) => {
  const [formValue, setFormValue] = useState({
    jobTitleId: null,
    shiftId: props.data.id ? props.data.shiftId : '',
    time: dayjs()
  });
  const [formErr, setFormErr] = useState(configCoreErr);
  const [disabledOk, setDisabledOk] = useState(true);
  const [dropdownJobTitle, setDropdownJobTitle] = useState([]);

  const firstRender = useRef(true);
  const dispatch = useDispatch();
  const intl = useIntl();

  const checkValidation = () => {
    let jobTitleIdError = '';
    let shiftIdError = '';
    let timeError = '';

    if (!formValue.jobTitleId) {
      jobTitleIdError = intl.formatMessage({ id: 'job-title-is-required' });
    }

    if (!formValue.shiftId) {
      shiftIdError = intl.formatMessage({ id: 'shift-is-required' });
    }

    if (!formValue.time) {
      timeError = intl.formatMessage({ id: 'time-is-required' });
    }

    setFormErr({
      jobTitleIdErr: jobTitleIdError ? jobTitleIdError : '',
      shiftIdErr: shiftIdError ? shiftIdError : '',
      timeErr: timeError ? timeError : ''
    });

    setDisabledOk(Boolean(jobTitleIdError || shiftIdError || timeError));
  };

  const clearForm = () => {
    setFormValue({ jobTitleId: null, shiftId: '', time: dayjs() });
  };

  const onCancel = () => {
    props.onClose(false);
    clearForm();
  };

  const onDropdownHandler = (selected, procedure) => {
    setFormValue((prevState) => ({ ...prevState, [procedure]: selected || null }));
  };

  const onSubmit = async () => {
    const catchError = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    };

    const catchSuccess = (resp) => {
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(`Success ${props.data.id ? 'update' : 'create'} data`));
        props.onClose(true);
      }
    };

    if (props.data.id) {
      await updateTimeKeeperAbsent({ id: props.data.id, ...formValue })
        .then(catchSuccess)
        .catch(catchError);
    } else {
      await createTimeKeeperAbsent(formValue).then(catchSuccess).catch(catchError);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch dropdown staff job
      const jobTitleData = await getStaffJobTitleList();
      setDropdownJobTitle(jobTitleData);
      if (props.data.id) {
        const new_time = dayjs(`${new Date().toISOString().split('T')[0]}T${props.data.time}`);

        setFormValue((prevState) => ({
          ...prevState,
          time: new_time,
          jobTitleId: jobTitleData.find((dt) => dt.value === props.data.jobTitleId)
        }));
      }
    } catch (err) {
      // setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) checkValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue]);

  return (
    <ModalC
      title={<FormattedMessage id={(props.data.id ? 'update' : 'create') + '-time-keeper-absent'} />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOk}
      onCancel={onCancel}
      otherDialogAction={
        <>
          <Button variant="outlined" onClick={clearForm}>
            {<FormattedMessage id="clear" />}
          </Button>
        </>
      }
      sx={{ '& .MuiDialog-paper': { width: '40%', maxHeight: 650 } }}
      maxWidth="md"
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="job-title">{<FormattedMessage id="job-title" />}</InputLabel>
            <Autocomplete
              id="job-title"
              options={dropdownJobTitle}
              value={formValue.jobTitleId}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => onDropdownHandler(value, 'jobTitleId')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formErr.jobTitleIdErr && formErr.jobTitleIdErr.length > 0)}
                  helperText={formErr.jobTitleIdErr}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="shift">
              <FormattedMessage id="shift" />
            </InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                id="shiftId"
                name="shiftId"
                value={formValue.shiftId}
                onChange={(event) => {
                  setFormValue((prevState) => ({ ...prevState, shiftId: event.target.value }));
                  // checkValidation();
                }}
                placeholder="Select status"
              >
                <MenuItem value="">
                  <em>Select shift</em>
                </MenuItem>
                <MenuItem value={'1'}>Shift 1</MenuItem>
                <MenuItem value={'2'}>Shift 2</MenuItem>
                <MenuItem value={'0'}>Tidak ada shift</MenuItem>
              </Select>
              {formErr.shiftIdErr.length > 0 && <FormHelperText error> {formErr.shiftIdErr} </FormHelperText>}
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="time">
              <FormattedMessage id="time" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                // label="Time"
                value={formValue.time}
                onChange={(value) => {
                  setFormValue((prevState) => ({ ...prevState, time: value }));
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormTimeKeeperAbsent.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormTimeKeeperAbsent;
