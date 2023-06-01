import { FormattedMessage } from 'react-intl';
import { createStaffLeave, getLeaveTypeList, getWorkingDaysList } from './service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { Autocomplete, Grid, InputLabel, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const configCoreErr = {
  leaveTypeErr: '',
  fromDateErr: '',
  toDateErr: '',
  workingDaysErr: '',
  remarkErr: ''
};

const coreValidation = [
  { code: 0, message: 'From Date must be filled' },
  { code: 1, message: 'To Date must be filled' },
  { code: 2, message: 'From Date must be smaller then To Date' },
  { code: 3, message: 'To Date must be greater then From Date' },
  { code: 4, message: 'Remark must be filled' },
  { code: 5, message: 'Leave Type must be filled' },
  { code: 6, message: 'Working days must be selected' }
];

const FormRequestLeave = (props) => {
  const dispatch = useDispatch();
  const [leaveType, setLeaveType] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  // const [duration, setDuration] = useState('');
  const [workingDays, setWorkingDays] = useState([]);
  const [remark, setRemark] = useState('');
  const [totalDays, setTotalDays] = useState('');
  const [disabledOk, setDisabledOk] = useState(true);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [workingDaysList, setWorkingDaysList] = useState([]);

  const [formErr, setFormErr] = useState(configCoreErr);
  const firstRender = useRef(true);

  const onSubmit = async () => {
    await createStaffLeave({ userId: props.userId, leaveType, fromDate, toDate, workingDays, remark, totalDays })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Success create request leave'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose(false);

  const checkValidation = () => {
    let getLeaveTypeError = '';
    let getFromDateError = '';
    let getToDateError = '';
    let getWorkingDaysError = '';
    let getRemarkError = '';

    if (!leaveType) {
      getLeaveTypeError = coreValidation.find((d) => d.code === 5);
    }

    if (!fromDate) {
      getFromDateError = coreValidation.find((d) => d.code === 0);
    } else if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
      getFromDateError = coreValidation.find((d) => d.code === 2);
    }

    if (!toDate) {
      getToDateError = coreValidation.find((d) => d.code === 1);
    } else if (new Date(toDate).getTime() < new Date(fromDate).getTime()) {
      getToDateError = coreValidation.find((d) => d.code === 3);
    }

    if (!workingDays || !workingDays.length) {
      getWorkingDaysError = coreValidation.find((d) => d.code === 6);
    }

    if (!remark) {
      getRemarkError = coreValidation.find((d) => d.code === 4);
    }

    if (getLeaveTypeError || getFromDateError || getToDateError || getWorkingDaysError || getRemarkError) {
      setFormErr({
        leaveTypeErr: getLeaveTypeError ? getLeaveTypeError.message : '',
        fromDateErr: getFromDateError ? getFromDateError.message : '',
        toDateErr: getToDateError ? getToDateError.message : '',
        workingDaysErr: getWorkingDaysError ? getWorkingDaysError.message : '',
        remarkErr: getRemarkError ? getRemarkError.message : ''
      });
      setDisabledOk(true);
    } else {
      setFormErr(configCoreErr);
      setDisabledOk(false);
    }
  };

  const onChangeDate = (selectedDate, procedure) => {
    if (procedure === 'from') setFromDate(selectedDate);
    else if (procedure === 'to') setToDate(selectedDate);
    setWorkingDays([]);
  };

  const getLeaveType = async () => {
    // hit get leave type based user id
    const resp = await getLeaveTypeList(props.userId);
    const getData = resp.data;
    let newMapping = [];

    if (getData && getData.length) {
      newMapping = getData.map((dt) => ({
        label: dt.value,
        value: dt.leaveType
      }));
    }
    setLeaveTypeList(newMapping);
  };

  const getWorkingDays = async () => {
    const resp = await getWorkingDaysList({ fromDate, toDate });
    const getData = resp.data;

    setTotalDays(getData.totalDays);

    if (getData.workingDays && getData.workingDays.length) {
      setWorkingDaysList(getData.workingDays.map((dt) => ({ label: dt.name, value: dt.name })));
    }
  };

  const getPreparationData = () => {
    return new Promise((resolve) => {
      getLeaveType();
      resolve(true);
    });
  };

  const getData = async () => await getPreparationData();

  useEffect(() => {
    if (!props.userId) return;

    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) {
      checkValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveType, fromDate, toDate, remark, workingDays]);

  useEffect(() => {
    if (fromDate && toDate) {
      getWorkingDays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  return (
    <ModalC
      title={<FormattedMessage id="request-leave" />}
      okText="Submit"
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOk}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: 650 } }}
      maxWidth="md"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={5}>
          <InputLabel htmlFor="leave-type">{<FormattedMessage id="leave-type" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Autocomplete
            id="leave-type"
            options={leaveTypeList}
            value={leaveType}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => setLeaveType(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                error={Boolean(formErr.leaveTypeErr && formErr.leaveTypeErr.length > 0)}
                helperText={formErr.leaveTypeErr}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={5}>
          <InputLabel htmlFor="from">{<FormattedMessage id="from" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={7}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              value={fromDate}
              onChange={(date) => onChangeDate(date, 'from')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formErr.fromDateErr && formErr.fromDateErr.length > 0)}
                  helperText={formErr.fromDateErr}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={5}>
          <InputLabel htmlFor="to">{<FormattedMessage id="to" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={7}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              value={toDate}
              onChange={(date) => onChangeDate(date, 'to')}
              renderInput={(params) => (
                <TextField {...params} error={Boolean(formErr.toDateErr && formErr.toDateErr.length > 0)} helperText={formErr.toDateErr} />
              )}
            />
          </LocalizationProvider>
        </Grid>

        {/* <Grid item xs={12} sm={5}>
          <InputLabel htmlFor="duration">{<FormattedMessage id="duration" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={7}>
          <TextField fullWidth type="number" id="duration" name="duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Grid> */}

        {fromDate && toDate && (
          <>
            <Grid item xs={12} sm={5}>
              <InputLabel htmlFor="working-days">{<FormattedMessage id="working-days" />}</InputLabel>
            </Grid>
            <Grid item xs={12} sm={7}>
              <Autocomplete
                id="workingDays"
                multiple
                limitTags={2}
                options={workingDaysList}
                value={workingDays}
                sx={{ width: 360 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => setWorkingDays(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(formErr.workingDaysErr && formErr.workingDaysErr.length > 0)}
                    helperText={formErr.workingDaysErr}
                  />
                )}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12} sm={5}>
          <InputLabel htmlFor="remark">{<FormattedMessage id="remark" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={7}>
          <TextField
            multiline
            fullWidth
            id="remark"
            name="remark"
            value={remark}
            rows={5}
            inputProps={{ maxLength: 500 }}
            onChange={(e) => setRemark(e.target.value)}
            error={Boolean(formErr.remarkErr && formErr.remarkErr.length > 0)}
            helperText={formErr.remarkErr}
          />
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormRequestLeave.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default FormRequestLeave;
