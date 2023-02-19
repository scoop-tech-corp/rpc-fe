import { Grid, TextField, Stack, Typography, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import MainCard from 'components/MainCard';
import { useLocationDetailStore } from '../../location-detail-store';

const OperatingHour = () => {
  const locationOperationalHour = useLocationDetailStore((state) => state.operationalHour);
  const [operatingHours, setOperatingHours] = useState([
    { selectedDay: false, dayName: 'Monday', fromTime: dayjs(), toTime: dayjs(), allDay: false },
    { selectedDay: false, dayName: 'Tuesday', fromTime: dayjs(), toTime: dayjs(), allDay: false },
    { selectedDay: false, dayName: 'Wednesday', fromTime: dayjs(), toTime: dayjs(), allDay: false },
    { selectedDay: false, dayName: 'Thursday', fromTime: dayjs(), toTime: dayjs(), allDay: false },
    { selectedDay: false, dayName: 'Friday', fromTime: dayjs(), toTime: dayjs(), allDay: false },
    { selectedDay: false, dayName: 'Saturday', fromTime: dayjs(), toTime: dayjs(), allDay: false },
    { selectedDay: false, dayName: 'Sunday', fromTime: dayjs(), toTime: dayjs(), allDay: false }
  ]);

  useEffect(() => {
    if (locationOperationalHour.length) {
      const setOperatingHour = [];
      operatingHours.forEach((hour) => {
        const findDaySelected = locationOperationalHour.find((dt) => dt.dayName === hour.dayName);
        const getDateNow = new Date().toISOString().split('T')[0];
        setOperatingHour.push({
          selectedDay: findDaySelected ? true : false,
          dayName: findDaySelected ? findDaySelected.dayName : hour.dayName,
          fromTime: findDaySelected ? dayjs(`${getDateNow}T${findDaySelected.fromTime}`) : dayjs(),
          toTime: findDaySelected ? dayjs(`${getDateNow}T${findDaySelected.toTime}`) : dayjs(),
          allDay: findDaySelected ? findDaySelected.allDay : false
        });
      });

      setOperatingHours(setOperatingHour);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setOperationalHourToDetail = (dtOperationalHour = null) => {
    let data = dtOperationalHour ? [...dtOperationalHour] : [...operatingHours];

    data = data
      .filter((dt) => dt.selectedDay === true)
      .map((dt) => {
        const setTime = (time) => {
          return time.toString().length === 1 ? `0${time}` : time;
        };

        return {
          dayName: dt.dayName,
          allDay: dt.allDay,
          fromTime: dt.fromTime ? `${setTime(dt.fromTime.$H)}:${setTime(dt.fromTime.$m)}` : '',
          toTime: dt.toTime ? `${setTime(dt.toTime.$H)}:${setTime(dt.toTime.$m)}` : ''
        };
      });
    useLocationDetailStore.setState({ operationalHour: data, locataionTouch: true });
  };

  const isToggleAll = operatingHours.filter((dt) => dt.selectedDay === true).length === operatingHours.length;
  const indeterminateToggleAll = isToggleAll === false && operatingHours.filter((dt) => dt.selectedDay === true).length > 0;

  const setCheckedToggleAll = (checked) => {
    setOperatingHours((value) => {
      let getOperationHour = [...value];
      getOperationHour = getOperationHour.map((dt) => {
        // dt.selectedDay = indeterminateToggleAll ? false : checked;
        dt.selectedDay = checked;
        return dt;
      });
      setOperationalHourToDetail(getOperationHour);

      return getOperationHour;
    });
  };

  const isAllDay = operatingHours.filter((dt) => dt.allDay === true).length === operatingHours.length;
  const indeterminateAllDay = isAllDay === false && operatingHours.filter((dt) => dt.allDay === true).length > 0;

  const setCheckedParentAllDay = (checked) => {
    setOperatingHours((value) => {
      let getOperationHour = [...value];
      getOperationHour = getOperationHour.map((dt) => {
        // dt.allDay = indeterminateAllDay ? false : checked;
        dt.allDay = checked;
        return dt;
      });
      setOperationalHourToDetail(getOperationHour);

      return getOperationHour;
    });
  };

  const onChangeFrom = (newValue, idx) => {
    setOperatingHours((value) => {
      const getOperationHour = [...value];
      getOperationHour[idx].fromTime = newValue;
      return getOperationHour;
    });
    setOperationalHourToDetail();
  };

  const onChangeTo = (newValue, idx) => {
    setOperatingHours((value) => {
      const getOperationHour = [...value];
      getOperationHour[idx].toTime = newValue;
      return getOperationHour;
    });
    setOperationalHourToDetail();
  };

  const setCheckedDay = (checked, idx) => {
    setOperatingHours((value) => {
      const getOperationHour = [...value];
      getOperationHour[idx].selectedDay = checked;
      setOperationalHourToDetail(getOperationHour);

      return getOperationHour;
    });
  };

  const setCheckedAllDay = (checked, idx) => {
    setOperatingHours((value) => {
      const getOperationHour = [...value];
      getOperationHour[idx].allDay = checked;
      setOperationalHourToDetail(getOperationHour);

      return getOperationHour;
    });
    setOperationalHourToDetail();
  };

  return (
    <MainCard title={<FormattedMessage id="operating-hour" />}>
      <Grid container spacing={1.25}>
        <Grid item xs={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Checkbox
              onChange={(event) => setCheckedToggleAll(event.target.checked)}
              checked={isToggleAll}
              name="checked"
              color="primary"
              size="small"
              indeterminate={indeterminateToggleAll}
            />
            <Typography color="primary">Toggle all</Typography>
          </Stack>
        </Grid>
        <Grid item xs={3}>
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">
            <Typography color="primary">From</Typography>
          </Stack>
        </Grid>
        <Grid item xs={3}>
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">
            <Typography color="primary">To</Typography>
          </Stack>
        </Grid>
        <Grid item xs={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Checkbox
              onChange={(event) => setCheckedParentAllDay(event.target.checked)}
              checked={isAllDay}
              name="checked"
              color="primary"
              size="small"
              indeterminate={indeterminateAllDay}
            />
            <Typography color="primary">All day</Typography>
          </Stack>
        </Grid>
      </Grid>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {operatingHours.map((dt, i) => (
          <Grid container spacing={1.25} key={i}>
            <Grid item xs={3} marginTop="10px">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Checkbox
                  onChange={(event) => setCheckedDay(event.target.checked, i)}
                  checked={dt.selectedDay}
                  name="checked"
                  color="primary"
                  size="small"
                />
                <Typography color="primary">{dt.dayName}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={3} marginTop="10px">
              <TimePicker
                label="Time"
                value={dt.fromTime}
                onChange={(event) => onChangeFrom(event, i)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={3} marginTop="10px">
              <TimePicker
                label="Time"
                value={dt.toTime}
                onChange={(event) => onChangeTo(event, i)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={3} marginTop="10px">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Checkbox
                  onChange={(event) => setCheckedAllDay(event.target.checked, i)}
                  checked={dt.allDay}
                  name="checked"
                  color="primary"
                  size="small"
                />
                <Typography color="primary">All day</Typography>
              </Stack>
            </Grid>
          </Grid>
        ))}
      </LocalizationProvider>
    </MainCard>
  );
};

export default OperatingHour;
