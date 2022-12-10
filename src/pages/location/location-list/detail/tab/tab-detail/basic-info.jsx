import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import MainCard from 'components/MainCard';
import { Grid, Stack, InputLabel, Select, MenuItem, FormHelperText, FormControl, TextField } from '@mui/material';
import { getAllState, useLocationDetailStore } from '../../location-detail-store';

const locationNameValidation = [
  { code: 0, message: 'Name is required' },
  { code: 1, message: 'Name minimum 5 characters length' },
  { code: 2, message: 'Name maximum 25 characters length' }
];

const locationStatusValidation = [{ code: 0, message: 'Status is required' }];

const BasicInfo = () => {
  const locationName = useLocationDetailStore((state) => state.locationName);
  const locationStatus = useLocationDetailStore((state) => state.status);
  const [basicInfoErr, setBasicInfoErr] = useState({ nameError: '', statusError: '' });

  const onFieldHandler = (event) => {
    useLocationDetailStore.setState({ locationName: event.target.value, locataionTouch: true });
    onCheckValidation();
  };

  const onLocationStatus = (event) => {
    useLocationDetailStore.setState({ status: event.target.value, locataionTouch: true });
    onCheckValidation();
  };

  const onCheckValidation = () => {
    let getName = getAllState().locationName; // name ? name : locationName;
    let getStatus = getAllState().status;
    let getLocationNameError = null;
    let getLocationStatusError = null;

    if (!getName) {
      getLocationNameError = locationNameValidation.find((d) => d.code === 0);
    } else if (getName.length < 5) {
      getLocationNameError = locationNameValidation.find((d) => d.code === 1);
    } else if (getName.length > 25) {
      getLocationNameError = locationNameValidation.find((d) => d.code === 2);
    }

    if (!getStatus) {
      getLocationStatusError = locationStatusValidation.find((d) => d.code === 0);
    }

    if (getLocationNameError || getLocationStatusError) {
      setBasicInfoErr({
        nameError: getLocationNameError ? getLocationNameError.message : '',
        statusError: getLocationStatusError ? getLocationStatusError.message : ''
      });

      useLocationDetailStore.setState({ locationDetailError: true });
    } else {
      setBasicInfoErr({
        nameError: '',
        statusError: ''
      });
      useLocationDetailStore.setState({ locationDetailError: false });
    }
  };

  return (
    <MainCard title={<FormattedMessage id="basic-info" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
            <TextField
              fullWidth
              id="locationName"
              name="locationName"
              value={locationName}
              onChange={onFieldHandler}
              error={Boolean(basicInfoErr.nameError && basicInfoErr.nameError.length > 0)}
              helperText={basicInfoErr.nameError}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="status">Status</InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select id="status" name="status" value={locationStatus} onChange={onLocationStatus} placeholder="Select status">
                <MenuItem value="">
                  <em>Select status</em>
                </MenuItem>
                <MenuItem value={'1'}>Active</MenuItem>
                <MenuItem value={'0'}>Non Active</MenuItem>
              </Select>
              {basicInfoErr.statusError.length > 0 && <FormHelperText error> {basicInfoErr.statusError} </FormHelperText>}
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default BasicInfo;
