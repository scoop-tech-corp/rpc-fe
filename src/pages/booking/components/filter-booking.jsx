import { Autocomplete, Box, Button, Grid, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getDoctorStaffByLocationList, getLocationList } from 'service/service-global';

import MainCard from 'components/MainCard';

const TREATMENT_OPTIONS = [
  { label: 'Pet Clinic', value: 'Pet Clinic', color: '#0000FF' },
  { label: 'Pet Hotel', value: 'Pet Hotel', color: '#FF0000' },
  { label: 'Pet Salon', value: 'Pet Salon', color: '#FFFF00' },
  { label: 'Breeding', value: 'Breeding', color: '#008000' }
];

const CONST_FILTER = { location: [], doctor: null, treatment: null };

const FilterBooking = (props) => {
  const [filter, setFilter] = useState(CONST_FILTER);
  const [dropdownFilter, setDropdownFilter] = useState({ locationList: [], doctorList: [] });

  const onHandlerFilter = async (value, procedure) => {
    if (procedure === 'location') {
      const selectedLocations = value ? value.map((dt) => +dt.value) : [];
      const getDoctorList = await getDoctorStaffByLocationList(selectedLocations);
      setDropdownFilter((prevState) => ({ ...prevState, doctorList: getDoctorList }));
    }
    setFilter((prevState) => ({ ...prevState, [procedure]: value }));
  };

  const onResetFilter = () => {
    setFilter({ ...CONST_FILTER });
    if (props.onAppliedFilter) {
      props.onAppliedFilter({ locationId: [], doctorId: [], serviceType: null });
    }
  };

  const onAppliedFilter = () => {
    const locationId = filter.location ? filter.location.map((dt) => +dt.value) : [];
    const doctorId = filter.doctor ? [+filter.doctor.value] : [];
    const serviceType = filter.treatment ? filter.treatment.value : null;

    if (props.onAppliedFilter) {
      props.onAppliedFilter({ locationId, doctorId, serviceType });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const getLocations = await getLocationList();
      setDropdownFilter((prevState) => ({ ...prevState, locationList: getLocations }));
    };

    fetchData();
  }, []);

  return (
    <MainCard content={true} style={{ marginBottom: '20px' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Autocomplete
            id="location"
            multiple
            options={dropdownFilter.locationList}
            value={filter.location}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => onHandlerFilter(value, 'location')}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            id="doctor"
            options={dropdownFilter.doctorList}
            value={filter.doctor}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => onHandlerFilter(value, 'doctor')}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="doctor" />} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            id="treatment"
            options={TREATMENT_OPTIONS}
            value={filter.treatment}
            isOptionEqualToValue={(option, val) => val === null || option.value === val.value}
            onChange={(_, value) => onHandlerFilter(value, 'treatment')}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: option.color, flexShrink: 0 }} />
                {option.label}
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="treatment" />} />}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Stack spacing={1} direction={'row'}>
            <Button variant="contained" color="error" onClick={onResetFilter}>
              <FormattedMessage id="reset" />
            </Button>
            <Button variant="contained" onClick={onAppliedFilter}>
              <FormattedMessage id="filter" />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default FilterBooking;
