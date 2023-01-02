import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductClinicDetailStore } from '../product-clinic-detail-store';

import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

const TabReminders = () => {
  const reminders = useProductClinicDetailStore((state) => state.reminders);
  const timingList = [
    { label: 'Days', value: 'Days' },
    { label: 'Hours', value: 'Hours' },
    { label: 'Minutes', value: 'Minutes' },
    { label: 'Weeks', value: 'Weeks' }
  ];

  const onChangeHandler = (i, newObjReminder) => {
    useProductClinicDetailStore.setState((prevState) => {
      const getReminders = [...prevState.reminders];
      getReminders[i] = newObjReminder;
      return { reminders: getReminders, productClinicDetailTouch: true };
    });
  };

  const onDeleteReminders = (i) => {
    useProductClinicDetailStore.setState((prevState) => {
      let newData = [...prevState.reminders];
      newData.splice(i, 1);

      return { reminders: newData, productClinicDetailTouch: true };
    });
  };

  const onAddReminders = () => {
    useProductClinicDetailStore.setState((s) => ({
      reminders: [...s.reminders, { unit: '', timing: '', status: 'After Add On' }],
      productClinicDetailTouch: true
    }));
  };

  return (
    <MainCard title={<FormattedMessage id="follow-up-reminders" />}>
      {reminders.map((dt, i) => (
        <Grid container spacing={3} key={i}>
          <Grid item xs={12} sm={3}>
            <Stack spacing={1} style={{ marginTop: '5px' }}>
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
            <Stack spacing={1} style={{ marginTop: '5px' }}>
              <InputLabel htmlFor="timing">
                <FormattedMessage id="timing" />
              </InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  id={`timing${i}`}
                  name={`timing${i}`}
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
          <Grid item xs={12} sm={3}>
            <Stack spacing={1} style={{ marginTop: '5px' }}>
              <InputLabel style={{ color: 'transparent' }}>
                <FormattedMessage id="blank" />
              </InputLabel>
              <TextField fullWidth id={`status${i}`} name={`status${i}`} value={dt.status} inputProps={{ readOnly: true }} />
            </Stack>
          </Grid>

          {reminders.length > 1 && (
            <Grid item xs={12} sm={3} display="flex" alignItems="flex-end">
              <IconButton size="large" color="error" onClick={() => onDeleteReminders(i)}>
                <DeleteFilled />
              </IconButton>
            </Grid>
          )}
        </Grid>
      ))}

      <Button variant="contained" onClick={onAddReminders} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
        Add
      </Button>
    </MainCard>
  );
};

export default TabReminders;
