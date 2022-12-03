import { FormattedMessage } from 'react-intl';
import MainCard from 'components/MainCard';
import { useContext, useEffect, useState } from 'react';
import { Grid, Stack, InputLabel, Select, MenuItem, FormHelperText, FormControl, TextField } from '@mui/material';
import LocationDetailContext from '../../location-detail-context';

const locationNameValidation = [
  { code: 0, message: 'Name is required' },
  { code: 1, message: 'Name minimum 5 characters length' },
  { code: 2, message: 'Name maximum 25 characters length' }
];

const locationStatusValidation = [{ code: 0, message: 'Status is required' }];

const BasicInfo = () => {
  const { locationDetail, setLocationDetail, setLocationDetailError } = useContext(LocationDetailContext);
  const [basicInfo, setBasicInfo] = useState({ name: '', nameError: '', status: null, statusError: '' });

  useEffect(() => {
    setBasicInfo((val) => {
      return { ...val, name: locationDetail.locationName, status: locationDetail.status };
    });
  }, [locationDetail.locationName, locationDetail.status]);

  const onLocationName = (event) => {
    setBasicInfo((value) => {
      return { ...value, name: event.target.value };
    });

    setLocationDetail((value) => {
      return { ...value, locationName: event.target.value };
    });

    onCheckValidation(event.target.value);
  };

  const onLocationStatus = (event) => {
    setBasicInfo((value) => {
      return { ...value, status: event.target.value };
    });

    setLocationDetail((value) => {
      return { ...value, status: event.target.value };
    });

    onCheckValidation(null, event.target.value);
  };

  const onCheckValidation = (name = '', status = null) => {
    let getName = name ? name : basicInfo.name;
    let getStatus = status !== null ? status : basicInfo.status;
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
      if (getLocationNameError) {
        setBasicInfo((value) => {
          return { ...value, nameError: getLocationNameError.message };
        });
      } else {
        setBasicInfo((value) => {
          return { ...value, nameError: '' };
        });
      }
      if (getLocationStatusError) {
        setBasicInfo((value) => {
          return { ...value, statusError: getLocationStatusError.message };
        });
      } else {
        setBasicInfo((value) => {
          return { ...value, statusError: '' };
        });
      }

      setLocationDetailError(true);
    } else {
      setBasicInfo((value) => {
        return { ...value, nameError: '', statusError: '' };
      });
      setLocationDetailError(false);
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
              // placeholder="Enter location name"
              value={basicInfo.name || ''}
              onChange={onLocationName}
              onBlur={onLocationName}
              error={basicInfo.nameError && basicInfo.nameError.length > 0}
              helperText={basicInfo.nameError}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="status">Status</InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select id="status" name="status" value={basicInfo.status || ''} onChange={onLocationStatus} placeholder="Select status">
                <MenuItem value="">
                  <em>Select status</em>
                </MenuItem>
                <MenuItem value={'1'}>Active</MenuItem>
                <MenuItem value={'0'}>Non Active</MenuItem>
              </Select>
              {basicInfo.statusError.length > 0 && <FormHelperText error> {basicInfo.statusError} </FormHelperText>}
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default BasicInfo;
