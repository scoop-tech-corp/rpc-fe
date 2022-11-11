import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
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
  const { facilityDetail, setFacilityDetail } = useContext(FacilityDetailContext);
  const [basicInfo, setBasicInfo] = useState({ locationName: '' });

  useEffect(() => {
    setBasicInfo(() => {
      return {
        locationName: locationList.find((val) => val.value === facilityDetail.locationName) || null
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLocation = (event, val) => {
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
            <InputLabel>
              <FormattedMessage id="location" />
            </InputLabel>
            <Autocomplete
              id="location"
              value={basicInfo.locationName}
              onChange={(e, v) => onLocation(e, v)}
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
