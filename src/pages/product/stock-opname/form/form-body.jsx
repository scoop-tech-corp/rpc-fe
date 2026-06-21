import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStockOpnameFormStore, getAllState } from './form-store';
import { LocalizationProvider, DesktopDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getStaffScheduleUser } from 'pages/staff/schedule/service';
import { generateSoNumber } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import MainCard from 'components/MainCard';

const StockOpnameFormBody = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const stockOpnameNumber = useStockOpnameFormStore((state) => state.stockOpnameNumber);
  const title = useStockOpnameFormStore((state) => state.title);
  const startTime = useStockOpnameFormStore((state) => state.startTime);
  const locationId = useStockOpnameFormStore((state) => state.locationId);
  const users = useStockOpnameFormStore((state) => state.users);
  const locationList = useStockOpnameFormStore((state) => state.locationList);
  const staffList = useStockOpnameFormStore((state) => state.staffList);

  const checkFormError = () => {
    const state = getAllState();
    const hasError = !state.title || !state.startTime || !state.locationId;
    useStockOpnameFormStore.setState({ isFormError: hasError });
  };

  const onFieldChange = (field, value) => {
    useStockOpnameFormStore.setState({ [field]: value, isFormTouch: true });
    checkFormError();
  };

  const onLocationChange = async (value) => {
    useStockOpnameFormStore.setState({ locationId: value, users: [], staffList: [], stockOpnameNumber: '', isFormTouch: true });
    checkFormError();
    if (!value) return;
    await Promise.all([getStaffScheduleUser(value.value).catch(() => []), generateSoNumber(value.value).catch(() => null)])
      .then(([staffList, soResp]) => {
        useStockOpnameFormStore.setState({
          staffList,
          stockOpnameNumber: soResp?.data?.stockOpnameNumber ?? ''
        });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  return (
    <MainCard>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="stockOpnameNumber">
              <FormattedMessage id="stock-opname-number" />
            </InputLabel>
            <TextField
              fullWidth
              id="stockOpnameNumber"
              name="stockOpnameNumber"
              value={stockOpnameNumber}
              disabled
              placeholder={intl.formatMessage({ id: 'stock-opname-number' })}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="title" required>
              <FormattedMessage id="title" />
            </InputLabel>
            <TextField
              fullWidth
              id="title"
              name="title"
              value={title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              placeholder={intl.formatMessage({ id: 'title' })}
              error={!title}
              helperText={!title ? intl.formatMessage({ id: 'title-is-required' }) : ''}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="startTime" required>
              <FormattedMessage id="start-time" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDateTimePicker
                value={startTime}
                onChange={(value) => onFieldChange('startTime', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!startTime}
                    helperText={!startTime ? intl.formatMessage({ id: 'start-time-is-required' }) : ''}
                    variant="outlined"
                  />
                )}
              />
            </LocalizationProvider>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="locationId" required>
              <FormattedMessage id="location" />
            </InputLabel>
            <Autocomplete
              id="locationId"
              options={locationList}
              value={locationId}
              isOptionEqualToValue={(option, val) => option.value === val.value}
              onChange={(_, value) => onLocationChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!locationId}
                  helperText={!locationId ? intl.formatMessage({ id: 'location-is-required' }) : ''}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="users">
              <FormattedMessage id="users" />
            </InputLabel>
            <Autocomplete
              id="users"
              multiple
              limitTags={3}
              options={staffList}
              value={users}
              isOptionEqualToValue={(option, val) => option.value === val.value}
              onChange={(_, value) => onFieldChange('users', value)}
              renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'select-users' })} />}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default StockOpnameFormBody;
