import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useStaffFormStore } from '../../staff-form-store';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useEffect, useState } from 'react';
import { getJobTitleList, validationFormStaff } from 'pages/staff/staff-list/service';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormJobTitle from 'components/FormJobTitle';

const configCoreErr = {
  jobTitleErr: '',
  startDateErr: '',
  endDateErr: '',
  locationErr: ''
};

const Position = () => {
  const jobTitleList = useStaffFormStore((state) => state.jobTitleList);
  const jobTitleId = useStaffFormStore((state) => state.jobTitleId);
  const jobTitleValue = jobTitleList.find((jt) => jt.value === jobTitleId) || null;

  const startDate = useStaffFormStore((state) => state.startDate);
  const endDate = useStaffFormStore((state) => state.endDate);

  const registrationNo = useStaffFormStore((state) => state.registrationNo);
  const designation = useStaffFormStore((state) => state.designation);

  const locationId = useStaffFormStore((state) => state.locationId);
  const locationList = useStaffFormStore((state) => state.locationList);

  const isTouchForm = useStaffFormStore((state) => state.staffFormTouch);

  const [positionErr, setPositonErr] = useState(configCoreErr);
  const [openFormJobTitle, setOpenFormJobTitle] = useState(false);

  const onCheckValidation = () => {
    const getRespValidForm = validationFormStaff('position');
    if (!getRespValidForm) {
      setPositonErr(configCoreErr);
      useStaffFormStore.setState({ staffFormError: false });
    } else {
      setPositonErr({
        jobTitleErr: getRespValidForm.getJobTitleError ? getRespValidForm.getJobTitleError.message : '',
        startDateErr: getRespValidForm.getStartDateError ? getRespValidForm.getStartDateError.message : '',
        endDateErr: getRespValidForm.getEndDateError ? getRespValidForm.getEndDateError.message : '',
        locationErr: getRespValidForm.getLocationError ? getRespValidForm.getLocationError.message : ''
      });
      useStaffFormStore.setState({ staffFormError: true });
    }
  };

  const onDropdownHandler = (selected, procedure) => {
    const setValue = procedure === 'locationId' ? (selected.length ? selected : []) : selected ? selected.value : null;

    useStaffFormStore.setState({ [procedure]: setValue, staffFormTouch: true });
    onCheckValidation();
  };

  const onDateChange = (selectedDate, procedure) => {
    useStaffFormStore.setState({ [procedure]: selectedDate, staffFormTouch: true });
    onCheckValidation();
  };

  const onFieldHandler = (event) => {
    useStaffFormStore.setState({ [event.target.name]: event.target.value, staffFormTouch: true });
  };

  const onAddJobTitle = () => setOpenFormJobTitle(true);

  const onCloseFormJobTitle = async (val) => {
    if (val) {
      setOpenFormJobTitle(false);
      const getJobTitle = await getJobTitleList();
      useStaffFormStore.setState({ jobTitleList: getJobTitle });
    }
  };

  useEffect(() => {
    if (isTouchForm) onCheckValidation();
  }, [isTouchForm]);

  return (
    <>
      <MainCard title={<FormattedMessage id="position" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="job-title" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddJobTitle}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="job-title"
                      options={jobTitleList}
                      value={jobTitleValue}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onDropdownHandler(value, 'jobTitleId')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(positionErr.jobTitleErr && positionErr.jobTitleErr.length > 0)}
                          helperText={positionErr.jobTitleErr}
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="start-date">
                <FormattedMessage id="start-date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  value={startDate}
                  onChange={(selected) => onDateChange(selected, 'startDate')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(positionErr.startDateErr && positionErr.startDateErr.length > 0)}
                      helperText={positionErr.startDateErr}
                      variant="outlined"
                    />
                  )}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="end-date">
                <FormattedMessage id="end-date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  value={endDate}
                  onChange={(selected) => onDateChange(selected, 'endDate')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(positionErr.endDateErr && positionErr.endDateErr.length > 0)}
                      helperText={positionErr.endDateErr}
                      variant="outlined"
                    />
                  )}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="registration-no">{<FormattedMessage id="registration-no" />}</InputLabel>
              <TextField fullWidth id="registrationNo" name="registrationNo" value={registrationNo} onChange={onFieldHandler} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="designation">{<FormattedMessage id="designation" />}</InputLabel>
              <TextField fullWidth id="designation" name="designation" value={designation} onChange={onFieldHandler} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="location" />
              </InputLabel>
              <Autocomplete
                id="location"
                multiple
                limitTags={1}
                options={locationList}
                value={locationId}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onDropdownHandler(value, 'locationId')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(positionErr.locationErr && positionErr.locationErr.length > 0)}
                    helperText={positionErr.locationErr}
                    variant="outlined"
                  />
                )}
              />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      <FormJobTitle open={openFormJobTitle} onClose={onCloseFormJobTitle} />
    </>
  );
};

export default Position;
