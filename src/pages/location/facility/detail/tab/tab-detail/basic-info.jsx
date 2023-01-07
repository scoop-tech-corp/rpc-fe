import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { FormattedMessage } from 'react-intl';
import { useFacilityDetailStore } from '../../facility-detail-store';

const BasicInfo = () => {
  const locationId = useFacilityDetailStore((state) => state.locationId);
  const locationList = useFacilityDetailStore((state) => state.facilityLocationList);
  const locationValue = locationList.find((val) => val.value === locationId) || null;

  const onLocation = (val) => {
    useFacilityDetailStore.setState({ locationId: val ? val.value : '', facilityDetailTouch: true });
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
              value={locationValue}
              onChange={(_, v) => onLocation(v)}
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
