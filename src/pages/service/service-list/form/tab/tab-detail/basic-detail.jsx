import { FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useServiceFormStore } from '../../service-form-store';

import MainCard from 'components/MainCard';
import MultiSelectAll from 'components/MultiSelectAll';
import { useEffect } from 'react';

const TabDescription = () => {
  const type = useServiceFormStore((state) => state.type);
  const isDetail = useServiceFormStore((state) => state.isDetail);
  const color = useServiceFormStore((state) => state.color);
  const fullName = useServiceFormStore((state) => state.fullName);
  const simpleName = useServiceFormStore((state) => state.simpleName);
  const status = useServiceFormStore((state) => state.status);
  const location = useServiceFormStore((state) => state.location);
  const locationList = useServiceFormStore((state) => state.dataSupport.locationList);

  const handleSelectionChange = (result) => {
    useServiceFormStore.setState({ location: result });
  };

  useEffect(() => {
    if (type && color && fullName && (status == 0 || status == 1)) useServiceFormStore.setState({ serviceFormError: false });
    else useServiceFormStore.setState({ serviceFormError: true });
  }, [type, color, fullName, status]);

  if (isDetail) {
    return (
      <MainCard title={<FormattedMessage id="basic-info" />}>
        <Grid container spacing={isDetail ? 2 : 3}>
          <Grid item xs={12} sm={11}>
            <p style={{ fontWeight: 900 }}> {type == 1 ? 'Petshop' : type == 2 ? 'Grooming' : 'Klinik'}</p>
          </Grid>
          <Grid item xs={12} sm={1}>
            <div style={{ textAlign: 'end' }}>
              <TextField
                fullWidth
                id="color"
                name="color"
                type="color"
                disabled={isDetail}
                sx={{ width: '50px' }}
                value={color}
                onChange={(event) => useServiceFormStore.setState({ color: event.target.value })}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="name">
                <FormattedMessage id="name" />
              </InputLabel>
              <TextField
                fullWidth
                id="fullName"
                disabled={isDetail}
                inputProps={{ readOnly: isDetail }}
                name="fullName"
                value={fullName}
                onChange={(event) => useServiceFormStore.setState({ fullName: event.target.value })}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="simpleName">
                <FormattedMessage id="simple-name" />
              </InputLabel>
              <TextField
                fullWidth
                id="simpleName"
                name="simpleName"
                value={simpleName}
                disabled={isDetail}
                inputProps={{ readOnly: isDetail }}
                onChange={(event) => useServiceFormStore.setState({ simpleName: event.target.value })}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={2}>
              <InputLabel id="status-input-label">
                <FormattedMessage id="status" />
              </InputLabel>
              {isDetail ? (
                <div style={{ marginTop: 5 }}>{status == 0 ? <FormattedMessage id="non-active" /> : <FormattedMessage id="active" />}</div>
              ) : (
                <FormControl fullWidth>
                  <Select
                    labelId="status-input-label"
                    id="status-input"
                    key={status}
                    readOnly={isDetail}
                    value={status}
                    onChange={(event) => useServiceFormStore.setState({ status: event.target.value })}
                  >
                    <MenuItem value={1}>
                      <FormattedMessage id="active" />
                    </MenuItem>
                    <MenuItem value={0}>
                      <FormattedMessage id="non-active" />
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="location">
                <FormattedMessage id="location" />
              </InputLabel>
              <MultiSelectAll
                items={locationList}
                isDetail={isDetail}
                limitTags={100}
                value={location || []}
                key={locationList?.length}
                selectAllLabel="Select All"
                onChange={handleSelectionChange}
              />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    );
  }
  return (
    <MainCard title={<FormattedMessage id="basic-info" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={11}>
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={type}
              onChange={(event) => useServiceFormStore.setState({ type: event.target.value })}
            >
              <FormControlLabel value="1" control={<Radio />} label="Petshop" />
              <FormControlLabel value="2" control={<Radio />} label="Grooming" />
              <FormControlLabel value="3" control={<Radio />} label="Klinik" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={1}>
          <div style={{ textAlign: 'end' }}>
            <TextField
              fullWidth
              id="color"
              name="color"
              type="color"
              sx={{ width: '50px' }}
              value={color}
              onChange={(event) => useServiceFormStore.setState({ color: event.target.value })}
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="name">
              <FormattedMessage id="name" />
            </InputLabel>
            <TextField
              fullWidth
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(event) => useServiceFormStore.setState({ fullName: event.target.value })}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel htmlFor="simpleName">
              <FormattedMessage id="simple-name" />
            </InputLabel>
            <TextField
              fullWidth
              id="simpleName"
              name="simpleName"
              value={simpleName}
              onChange={(event) => useServiceFormStore.setState({ simpleName: event.target.value })}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <InputLabel id="status-input-label">
              <FormattedMessage id="status" />
            </InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="status-input-label"
                id="status-input"
                key={status}
                value={status}
                onChange={(event) => useServiceFormStore.setState({ status: event.target.value })}
              >
                <MenuItem value={1}>
                  <FormattedMessage id="active" />
                </MenuItem>
                <MenuItem value={0}>
                  <FormattedMessage id="non-active" />
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="location">
              <FormattedMessage id="location" />
            </InputLabel>
            <MultiSelectAll
              items={locationList}
              limitTags={100}
              value={location || []}
              key={locationList?.length}
              selectAllLabel="Select All"
              onChange={handleSelectionChange}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabDescription;
