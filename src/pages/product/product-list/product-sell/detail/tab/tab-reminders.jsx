import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { useState, useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import ProductSellDetailContext from '../product-sell-detail-context';

const TabReminders = () => {
  const { productSellDetail, setProductSellDetail } = useContext(ProductSellDetailContext);
  const [reminders, setReminders] = useState([]);
  const timingList = [
    { label: 'Days', value: 'Days' },
    { label: 'Hours', value: 'Hours' },
    { label: 'Minutes', value: 'Minutes' },
    { label: 'Weeks', value: 'Weeks' }
  ];

  useEffect(() => {
    setReminders(productSellDetail.reminders);
  }, [productSellDetail]);

  const onFieldHandler = (event, idx) => {
    setReminders((value) => {
      const getData = [...value];
      getData[idx][event.target.name] = +event.target.value;

      return getData;
    });
  };

  const onBlurHandler = (event, idx) => {
    setProductSellDetail((value) => {
      const getData = [...value.reminders];
      getData[idx][event.target.name] = +event.target.value;

      return { ...value, reminders: getData };
    });
  };

  const onSelectTiming = (event, idx) => {
    setReminders((value) => {
      const getData = [...value];
      getData[idx].timing = event.target.value;

      setProductSellDetail((value) => {
        return { ...value, reminders: getData };
      });
      return getData;
    });
  };

  const onDeleteReminders = (i) => {
    setReminders((value) => {
      let getData = [...value];
      getData.splice(i, 1);

      setProductSellDetail((value) => {
        return { ...value, reminders: getData };
      });

      return getData;
    });
  };

  const onAddReminders = () => {
    setReminders((value) => {
      const setNewData = [...value, { unit: '', timing: '', status: 'After Add On' }];

      setProductSellDetail((value) => {
        return { ...value, reminders: setNewData };
      });

      return setNewData;
    });
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
                onChange={(e) => onFieldHandler(e, i)}
                onBlur={(e) => onBlurHandler(e, i)}
                type="number"
                inputProps={{ min: 0 }}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack spacing={1} style={{ marginTop: '5px' }}>
              <InputLabel htmlFor="timing">
                <FormattedMessage id="timing" />
              </InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id={`timing${i}`} name={`timing${i}`} value={dt.timing} onChange={(event) => onSelectTiming(event, i)}>
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
