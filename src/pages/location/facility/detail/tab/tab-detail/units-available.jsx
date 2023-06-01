import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { FormattedMessage } from 'react-intl';
import IconButton from 'components/@extended/IconButton';
import { useFacilityDetailStore } from '../../facility-detail-store';

const UnitsAvailable = () => {
  const detailUnitAvailable = useFacilityDetailStore((state) => state.detailUnitAvailable);

  const onAddUnit = () => {
    useFacilityDetailStore.setState((s) => ({
      detailUnitAvailable: [
        ...s.detailUnitAvailable,
        { id: '', unitName: '', status: '', capacity: '', amount: '', notes: '', command: '' }
      ],
      facilityDetailTouch: true
    }));
  };

  const onDeleteUnit = (i, unit) => {
    useFacilityDetailStore.setState((state) => {
      let newData = [...state.detailUnitAvailable];
      newData[i] = unit;

      return { detailUnitAvailable: newData, facilityDetailTouch: true };
    });
  };

  const onChangeHandler = (i, unit) => {
    useFacilityDetailStore.setState((state) => {
      const getUnits = [...state.detailUnitAvailable];
      getUnits[i] = unit;
      return { detailUnitAvailable: getUnits, facilityDetailTouch: true };
    });
  };

  return (
    <MainCard title={<FormattedMessage id="units-available" />}>
      {detailUnitAvailable.map((dt, i) => {
        if (dt.command === '') {
          return (
            <Grid container spacing={2} key={i}>
              <Grid item xs={12} sm={11}>
                <Grid container spacing={3} key={i}>
                  <Grid item xs={12} sm={3}>
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
                      <InputLabel>
                        <FormattedMessage id="name" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        inputProps={{ maxLength: 25 }}
                        id={`unitName-${i}`}
                        name={`unitName-${i}`}
                        value={dt.unitName}
                        onChange={(e) => onChangeHandler(i, { ...dt, unitName: e.target.value })}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
                      <InputLabel htmlFor="status">Status</InputLabel>
                      <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <Select
                          id="status"
                          name="status"
                          value={dt.status}
                          onChange={(e) => onChangeHandler(i, { ...dt, status: e.target.value })}
                        >
                          <MenuItem value="">
                            <em>Select status</em>
                          </MenuItem>
                          <MenuItem value={'1'}>Active</MenuItem>
                          <MenuItem value={'0'}>Non Active</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
                      <InputLabel>
                        <FormattedMessage id="capacity" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        type="number"
                        id={`capacity-${i}`}
                        name={`capacity-${i}`}
                        value={dt.capacity}
                        onChange={(e) => onChangeHandler(i, { ...dt, capacity: e.target.value })}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
                      <InputLabel>
                        <FormattedMessage id="amount" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        type="number"
                        id={`amount-${i}`}
                        name={`amount-${i}`}
                        value={dt.amount}
                        onChange={(e) => onChangeHandler(i, { ...dt, amount: e.target.value })}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
                      <InputLabel>
                        <FormattedMessage id="notes" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        inputProps={{ maxLength: 300 }}
                        id={`notes-${i}`}
                        name={`notes-${i}`}
                        value={dt.notes}
                        onChange={(e) => onChangeHandler(i, { ...dt, notes: e.target.value })}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
              {detailUnitAvailable.length > 1 && (
                <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                  <IconButton size="large" color="error" onClick={() => onDeleteUnit(i, { ...dt, command: 'del' })}>
                    <DeleteFilled />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          );
        }
      })}

      <Button variant="contained" onClick={onAddUnit} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
        Add
      </Button>
    </MainCard>
  );
};

export default UnitsAvailable;
