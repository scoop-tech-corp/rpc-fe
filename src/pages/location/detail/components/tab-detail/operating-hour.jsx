import { Grid, TextField, Stack, Typography, Checkbox } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import MainCard from 'components/MainCard';
import LocationDetailContext from '../../location-detail-context';

const OperatingHour = () => {
  const { locationDetail, setLocationDetail } = useContext(LocationDetailContext);

  const [toggleAll, setToggleAll] = useState(false);
  const [allDay, setAllDay] = useState(false);
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
    if (locationDetail.operationalHour.length) {
      const setOperatingHour = [];

      operatingHours.forEach((operatingHr) => {
        const findDaySelected = locationDetail.operationalHour.find((dt) => dt.dayName === operatingHr.dayName);
        const getDateNow = new Date().toISOString().split('T')[0];
        setOperatingHour.push({
          selectedDay: findDaySelected ? true : false,
          dayName: findDaySelected ? findDaySelected.dayName : operatingHr.dayName,
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

    setLocationDetail((value) => {
      return { ...value, operationalHour: data };
    });
  };

  const setCheckedToggleAll = (checked) => {
    const isIndeterminate = operatingHours.filter((dt) => dt.selectedDay === true).length > 0;

    setOperatingHours((value) => {
      let getOperationHour = [...value];
      getOperationHour = getOperationHour.map((dt) => {
        dt.selectedDay = isIndeterminate ? false : checked;
        return dt;
      });

      return getOperationHour;
    });
    setToggleAll(isIndeterminate ? false : checked);
  };

  const setCheckedParentAllDay = (checked) => {
    const isIndeterminate = operatingHours.filter((dt) => dt.allDay === true).length > 0;

    setOperatingHours((value) => {
      let getOperationHour = [...value];
      getOperationHour = getOperationHour.map((dt) => {
        dt.allDay = isIndeterminate ? false : checked;
        return dt;
      });
      setOperationalHourToDetail(getOperationHour);

      return getOperationHour;
    });
    setAllDay(isIndeterminate ? false : checked);
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
              checked={toggleAll}
              name="checked"
              color="primary"
              size="small"
              indeterminate={operatingHours.filter((dt) => dt.selectedDay === true).length > 0}
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
              checked={allDay}
              name="checked"
              color="primary"
              size="small"
              indeterminate={operatingHours.filter((dt) => dt.allDay === true).length > 0}
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
