import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from 'components/@extended/IconButton';
import FacilityDetailContext from '../../facility-detail-context';

const UnitsAvailable = () => {
  const { facilityDetail, setFacilityDetail } = useContext(FacilityDetailContext);
  const [unitsAvailable, setUnitsAvailable] = useState([]); // { name: '', status: '', notes: '' }

  useEffect(() => {
    if (facilityDetail.detailUnitAvailable.length) {
      setUnitsAvailable(facilityDetail.detailUnitAvailable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTextField = (e, idx, procedure) => {
    setUnitsAvailable((value) => {
      const getUnits = [...value];
      getUnits[idx][procedure] = e.target.value;

      setFacilityDetail((value) => {
        return { ...value, ...{ detailUnitAvailable: getUnits } };
      });
      return getUnits;
    });
  };

  const onStatus = (event, idx) => {
    setUnitsAvailable((value) => {
      const getUnits = [...value];
      getUnits[idx].status = event.target.value;

      setFacilityDetail((value) => {
        return { ...value, ...{ detailUnitAvailable: getUnits } };
      });
      return getUnits;
    });
  };

  const onAddUnit = () => {
    setUnitsAvailable((value) => {
      const setNewData = [...value, { name: '', status: '', notes: '' }];

      setFacilityDetail((value) => {
        return { ...value, ...{ detailUnitAvailable: setNewData } };
      });

      return setNewData;
    });
  };

  const onDeleteUnit = (i) => {
    setUnitsAvailable((value) => {
      let getUnits = [...value];
      getUnits.splice(i, 1);

      setFacilityDetail((value) => {
        return { ...value, ...{ detailUnitAvailable: getUnits } };
      });
      return [...getUnits];
    });
  };

  return (
    <MainCard title={<FormattedMessage id="units-available" />}>
      {unitsAvailable.map((dt, i) => (
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
                    id={`name-${i}`}
                    name={`name-${i}`}
                    value={dt.name}
                    onChange={(event) => onTextField(event, i, 'name')}
                    onBlur={(event) => onTextField(event, i, 'name')}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel htmlFor="status">Status</InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select id="status" name="status" value={dt.status} onChange={(event) => onStatus(event, i)}>
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
                    onChange={(event) => onTextField(event, i, 'capacity')}
                    onBlur={(event) => onTextField(event, i, 'capacity')}
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
                    onChange={(event) => onTextField(event, i, 'amount')}
                    onBlur={(event) => onTextField(event, i, 'amount')}
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
                    onChange={(event) => onTextField(event, i, 'notes')}
                    onBlur={(event) => onTextField(event, i, 'notes')}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          {unitsAvailable.length > 1 && (
            <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
              <IconButton size="large" color="error" onClick={() => onDeleteUnit(i)}>
                <DeleteFilled />
              </IconButton>
            </Grid>
          )}
        </Grid>
      ))}

      <Button variant="contained" onClick={onAddUnit} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
        Add
      </Button>
    </MainCard>
  );
};

export default UnitsAvailable;
