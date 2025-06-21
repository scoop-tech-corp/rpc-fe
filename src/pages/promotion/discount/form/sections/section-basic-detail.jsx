import { FormattedMessage } from 'react-intl';
import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useDiscountFormStore } from '../discount-form-store';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import MainCard from 'components/MainCard';

const SectionBasicDetail = () => {
  const name = useDiscountFormStore((state) => state.name);
  const startDate = useDiscountFormStore((state) => state.startDate);
  const endDate = useDiscountFormStore((state) => state.endDate);
  const status = useDiscountFormStore((state) => state.status);

  const locations = useDiscountFormStore((state) => state.locations);
  const locationList = useDiscountFormStore((state) => state.locationList);

  const customerGroups = useDiscountFormStore((state) => state.customerGroups);
  const customerGroupList = useDiscountFormStore((state) => state.customerGroupList);

  const onFieldHandler = (event) => {
    useDiscountFormStore.setState({ [event.target.name]: event.target.value, discountFormTouch: true });
  };

  const onDateChange = (selectedDate, procedure) => {
    useDiscountFormStore.setState({ [procedure]: selectedDate, discountFormTouch: true });
  };

  const onMultiDropdownHandler = (selected, procedure) => {
    useDiscountFormStore.setState({ [procedure]: selected, discountFormTouch: true });
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="basic-detail" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                value={name}
                onChange={onFieldHandler}
                // error={Boolean(generalInfoErr.firstNameErr && generalInfoErr.firstNameErr.length > 0)}
                // helperText={generalInfoErr.firstNameErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="customerGroup">{<FormattedMessage id="customer-group" />}</InputLabel>
              <Autocomplete
                id="customerGroup"
                multiple
                limitTags={1}
                options={customerGroupList}
                value={customerGroups}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onMultiDropdownHandler(value, 'customerGroups')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // error={Boolean(generalInfoErr.branchErr && generalInfoErr.branchErr.length > 0)}
                    // helperText={generalInfoErr.branchErr}
                    variant="outlined"
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="location">{<FormattedMessage id="location" />}</InputLabel>
              <Autocomplete
                id="location"
                multiple
                limitTags={1}
                options={locationList}
                value={locations}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onMultiDropdownHandler(value, 'locations')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // error={Boolean(generalInfoErr.branchErr && generalInfoErr.branchErr.length > 0)}
                    // helperText={generalInfoErr.branchErr}
                    variant="outlined"
                  />
                )}
              />
            </Stack>
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
                  renderInput={(params) => <TextField {...params} />}
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
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="status">Status</InputLabel>
              <FormControl>
                <Select id="status" name="status" value={status || ''} onChange={onFieldHandler} placeholder="Select status">
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-status" />
                    </em>
                  </MenuItem>
                  <MenuItem value={'1'}>Active</MenuItem>
                  <MenuItem value={'0'}>Non Active</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default SectionBasicDetail;
