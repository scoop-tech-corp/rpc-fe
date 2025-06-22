import { Autocomplete, Button, Grid, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getDoctorStaffByLocationList, getLocationList } from 'service/service-global';

import MainCard from 'components/MainCard';

const CONST_FILTER = { location: [], doctor: null };

const FilterBooking = () => {
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

  const onResetFilter = () => setFilter({ ...CONST_FILTER });
  const onAppliedFilter = () => {};

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
        <Grid item xs={12} md={5}>
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
        <Grid item xs={12} md={5}>
          <Autocomplete
            id="location"
            options={dropdownFilter.doctorList}
            value={filter.doctor}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => onHandlerFilter(value, 'doctor')}
            renderInput={(params) => <TextField {...params} label={<FormattedMessage id="doctor" />} />}
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
