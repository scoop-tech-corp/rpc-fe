import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import FacilityDetailContext from '../../facility-detail-context';

const locationList = [
  { label: 'Location A', value: 'Location A' },
  { label: 'Location B', value: 'Location B' },
  { label: 'Location C', value: 'Location C' },
  { label: 'Location D', value: 'Location D' }
];

const BasicInfo = () => {
  // setFacilityDetailError
  const { facilityDetail, setFacilityDetail } = useContext(FacilityDetailContext);
  const [basicInfo, setBasicInfo] = useState({ name: '', nameError: '', capacity: '', status: '1', statusError: '', locationName: '' });

  useEffect(() => {
    // fill context to form
    setBasicInfo(() => {
      return {
        name: facilityDetail.facilityName,
        nameError: '',
        capacity: facilityDetail.capacity,
        status: facilityDetail.status,
        statusError: '',
        locationName: locationList.find((val) => val.value === facilityDetail.locationName) || null
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFacilityName = (event) => {
    setBasicInfo((value) => {
      return { ...value, name: event.target.value };
    });

    setFacilityDetail((value) => {
      return { ...value, facilityName: event.target.value };
    });
  };

  const onFacilityStatus = (event) => {
    console.log('event.target.value', event.target.value);

    setBasicInfo((value) => {
      return { ...value, status: event.target.value };
    });

    setFacilityDetail((value) => {
      return { ...value, status: event.target.value };
    });
  };

  const onCapacity = (event) => {
    setBasicInfo((value) => {
      return { ...value, capacity: +event.target.value };
    });

    setFacilityDetail((value) => {
      return { ...value, capacity: +event.target.value };
    });
  };

  const onLocation = (event, val) => {
    console.log('value', val);

    setBasicInfo((value) => {
      return { ...value, locationName: val };
    });
    setFacilityDetail((value) => {
      return { ...value, locationName: val ? val.value : '' };
    });
  };

  return (
    <MainCard title={<FormattedMessage id="basic-info" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
            <TextField
              fullWidth
              id="facilityName"
              name="facilityName"
              inputProps={{ maxLength: 5, minLength: 0 }}
              value={basicInfo.name}
              onChange={onFacilityName}
              onBlur={onFacilityName}
              // error={basicInfo.nameError && basicInfo.nameError.length > 0}
              // helperText={basicInfo.nameError}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="capacity">{<FormattedMessage id="capacity" />}</InputLabel>
            <TextField
              fullWidth
              type="number"
              id="capacity"
              name="capacity"
              value={basicInfo.capacity}
              onChange={onCapacity}
              onBlur={onCapacity}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="status">Status</InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select id="status" name="status" value={basicInfo.status} onChange={onFacilityStatus} placeholder="Select status">
                <MenuItem value="">
                  <em>Select status</em>
                </MenuItem>
                <MenuItem value={'1'}>Active</MenuItem>
                <MenuItem value={'0'}>Non Active</MenuItem>
              </Select>
              {/* {basicInfo.statusError.length > 0 && <FormHelperText error> {basicInfo.statusError} </FormHelperText>} */}
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="location" />
            </InputLabel>
            <Autocomplete
              disablePortal
              id="location"
              value={basicInfo.locationName}
              onChange={onLocation}
              options={locationList}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default BasicInfo;
