import { FormattedMessage } from 'react-intl';
import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Button } from '@mui/material';
import { Fragment } from 'react';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useCustomerFormStore } from '../../customer-form-store';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

const Reminders = (props) => {
  const reminderBooking = useCustomerFormStore((state) => state.reminderBooking);
  const reminderPayment = useCustomerFormStore((state) => state.reminderPayment);
  const reminderLatePayment = useCustomerFormStore((state) => state.reminderLatePayment);
  const sourceList = useCustomerFormStore((state) => state.sourceList);

  let coreDataReminders = [];

  const timingList = [
    { label: 'Days', value: 'Days' },
    { label: 'Hours', value: 'Hours' },
    { label: 'Minutes', value: 'Minutes' },
    { label: 'Weeks', value: 'Weeks' }
  ];

  if (props.type === 'booking') {
    coreDataReminders = reminderBooking;
  } else if (props.type === 'payment') {
    coreDataReminders = reminderPayment;
  } else if (props.type === 'latePayment') {
    coreDataReminders = reminderLatePayment;
  }

  const getKeyReminders = () => {
    let newKey = '';
    if (props.type === 'booking') {
      newKey = 'reminderBooking';
    } else if (props.type === 'payment') {
      newKey = 'reminderPayment';
    } else if (props.type === 'latePayment') {
      newKey = 'reminderLatePayment';
    }

    return newKey;
  };

  const onDeleteReminders = (i) => {
    useCustomerFormStore.setState((prevState) => {
      let newData = [...prevState[getKeyReminders()]];
      // newData[i].statusData = 'del';
      newData.splice(i, 1);

      return { [getKeyReminders()]: newData, customerFormTouch: true };
    });
  };

  const onChangeHandler = (i, newObjReminder) => {
    useCustomerFormStore.setState((prevState) => {
      const getReminders = [...prevState[getKeyReminders()]];
      getReminders[i] = newObjReminder;

      return { [getKeyReminders()]: getReminders, customerFormTouch: true };
    });
  };

  const onAddReminders = () => {
    useCustomerFormStore.setState((prevState) => {
      const notes =
        getKeyReminders() === 'reminderBooking'
          ? 'Sebelum memulai'
          : getKeyReminders() === 'reminderPayment'
          ? 'Sebelum jatuh tempo'
          : 'Setelah jatuh tempo';

      return {
        [getKeyReminders()]: [...prevState[getKeyReminders()], { id: '', sourceId: null, unit: '', timing: '', status: notes }], // statusData: 'new'
        customerFormTouch: true
      };
    });
  };

  return (
    <MainCard title={<FormattedMessage id={props.title} />}>
      <Grid container spacing={3}>
        {coreDataReminders.map((dt, i) => (
          <Fragment key={i}>
            <Grid item xs={12} sm={3}>
              <Stack spacing={1}>
                <InputLabel>
                  <FormattedMessage id="source" />
                </InputLabel>
                <Autocomplete
                  id="source"
                  options={sourceList}
                  value={dt.sourceId}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, selected) => onChangeHandler(i, { ...dt, sourceId: selected ? selected : null })}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Stack spacing={1}>
                <InputLabel htmlFor="unit">Unit</InputLabel>
                <TextField
                  fullWidth
                  id={`unit${i}`}
                  name="unit"
                  value={dt.unit}
                  type="number"
                  inputProps={{ min: 0 }}
                  onChange={(e) => onChangeHandler(i, { ...dt, unit: e.target.value })}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Stack spacing={1}>
                <InputLabel htmlFor="timing">
                  <FormattedMessage id="timing" />
                </InputLabel>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <Select
                    id={`timing${i}`}
                    name="timing"
                    value={dt.timing}
                    onChange={(e) => onChangeHandler(i, { ...dt, timing: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Select timing</em>
                    </MenuItem>
                    {timingList.map((dt, idxTiming) => (
                      <MenuItem value={dt.value} key={idxTiming}>
                        {dt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Stack spacing={1}>
                <InputLabel style={{ color: 'transparent' }}>
                  <FormattedMessage id="blank" />
                </InputLabel>
                <TextField fullWidth id={`status${i}`} name="status" value={dt.status} inputProps={{ readOnly: true }} />
              </Stack>
            </Grid>
            {coreDataReminders.length > 1 && (
              <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                <IconButton size="large" color="error" onClick={() => onDeleteReminders(i)}>
                  <DeleteFilled />
                </IconButton>
              </Grid>
            )}
          </Fragment>
        ))}
      </Grid>
      <Button variant="contained" onClick={onAddReminders} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
        Add
      </Button>
    </MainCard>
  );
};

Reminders.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string
};

export default Reminders;
