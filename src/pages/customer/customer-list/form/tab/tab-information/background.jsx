import { FormattedMessage, useIntl } from 'react-intl';
import { useCustomerFormStore } from '../../customer-form-store'; // getAllState
import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PlusOutlined } from '@ant-design/icons';
import { getOccupationList } from 'pages/customer/service';
import { useState, useEffect } from 'react';
import { getTypeIdList } from 'pages/customer/service';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormOccupation from '../../components/FormOccupation';
import FormTypeId from 'components/FormTypeId';

// const configCoreErr = { nomorIdErr: '' };

const Background = () => {
  const joinDate = useCustomerFormStore((state) => state.joinDate);
  const numberId = useCustomerFormStore((state) => state.numberId);
  const gender = useCustomerFormStore((state) => state.gender);
  const birthDate = useCustomerFormStore((state) => state.birthDate);

  const [openFormTypeId, setOpenFormTypeId] = useState(false);
  const [openFormOccupation, setOpenFormOccupation] = useState(false);

  const typeIdList = useCustomerFormStore((state) => state.typeIdList);
  const typeId = useCustomerFormStore((state) => state.typeId);
  const typeIdValue = typeIdList.find((tl) => tl.value === typeId) || null;

  const occupationList = useCustomerFormStore((state) => state.occupationList);
  const occupationId = useCustomerFormStore((state) => state.occupationId);
  const occupationValue = occupationList.find((tl) => tl.value === occupationId) || null;

  // const [backgroundErr, setBackgroundErr] = useState(configCoreErr);
  const isTouchForm = useCustomerFormStore((state) => state.customerFormTouch);
  const intl = useIntl();

  const onCheckValidation = () => {
    // let getNumberId = getAllState().numberId;
    // let getNumberIdError = '';
    // if (!getNumberId) {
    //   getNumberIdError = intl.formatMessage({ id: 'id-number-is-required' });
    // }
    // if (getNumberIdError) {
    //   setBackgroundErr({
    //     nomorIdErr: getNumberIdError ? getNumberIdError : ''
    //   });
    // } else {
    //   setBackgroundErr(configCoreErr);
    // }
  };

  const onDateChange = (selectedDate, procedure) => {
    useCustomerFormStore.setState({ [procedure]: selectedDate, customerFormTouch: true });
    onCheckValidation();
  };

  const onDropdownHandler = (selected, procedure) => {
    useCustomerFormStore.setState({ [procedure]: selected ? selected.value : null, customerFormTouch: true });
    onCheckValidation();
  };

  const onFieldHandler = (event) => {
    useCustomerFormStore.setState({ [event.target.name]: event.target.value, customerFormTouch: true });
    onCheckValidation();
  };

  const onAddFormTypeId = () => setOpenFormTypeId(true);

  const onCloseFormTypeId = async (val) => {
    if (val) {
      const getList = await getTypeIdList();
      useCustomerFormStore.setState({ typeIdList: getList });
    }
    setOpenFormTypeId(false);
  };

  const onAddFormOccupation = () => setOpenFormOccupation(true);

  const onCloseFormOccupation = async (val) => {
    if (val) {
      const getList = await getOccupationList();
      useCustomerFormStore.setState({ occupationList: getList });
    }
    setOpenFormOccupation(false);
  };

  useEffect(() => {
    if (isTouchForm) {
      onCheckValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouchForm, intl]);

  return (
    <>
      <MainCard title={<FormattedMessage id="background" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="join-date">
                <FormattedMessage id="join-date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  value={joinDate}
                  onChange={(selected) => onDateChange(selected, 'joinDate')}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="id-type" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddFormTypeId}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="typeId"
                      options={typeIdList}
                      value={typeIdValue}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onDropdownHandler(value, 'typeId')}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="id-number">{<FormattedMessage id="id-number" />}</InputLabel>
              <TextField
                fullWidth
                id="numberId"
                name="numberId"
                value={numberId}
                onChange={onFieldHandler}
                inputProps={{ maxLength: 50 }}
                // error={Boolean(backgroundErr.nomorIdErr && backgroundErr.nomorIdErr.length > 0)}
                // helperText={backgroundErr.nomorIdErr}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="gender">{<FormattedMessage id="gender" />}</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id="gender" name="gender" value={gender} onChange={onFieldHandler} placeholder="Select gender">
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-gender" />
                    </em>
                  </MenuItem>
                  <MenuItem value={'P'}>{<FormattedMessage id="male" />}</MenuItem>
                  <MenuItem value={'W'}>{<FormattedMessage id="female" />}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="occupation" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddFormOccupation}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="occupation"
                      options={occupationList}
                      value={occupationValue}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onDropdownHandler(value, 'occupationId')}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="birth-date">
                <FormattedMessage id="birth-date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  value={birthDate}
                  onChange={(selected) => onDateChange(selected, 'birthDate')}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      <FormTypeId open={openFormTypeId} onClose={onCloseFormTypeId} module="customer" />
      <FormOccupation open={openFormOccupation} onClose={onCloseFormOccupation} />
    </>
  );
};

export default Background;
