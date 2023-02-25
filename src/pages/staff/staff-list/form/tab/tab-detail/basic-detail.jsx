import { FormattedMessage } from 'react-intl';
import { FormControl, Grid, InputLabel, Stack, TextField, Select, MenuItem, FormHelperText } from '@mui/material';
import { getAllState, useStaffFormStore } from '../../staff-form-store';
import { useState } from 'react';

import MainCard from 'components/MainCard';

const coreValidation = [
  { code: 0, message: 'First Name is required' },
  { code: 1, message: 'Status is required' },
  { code: 7, message: 'First Name minimum 3 characters and maximum 20 characters' },
  { code: 8, message: 'Middle Name minimum 3 characters and maximum 20 characters' },
  { code: 9, message: 'Last Name minimum 3 characters and maximum 20 characters' },
  { code: 10, message: 'Nick Name minimum 3 characters and maximum 20 characters' }
];
const configCoreErr = {
  firstNameErr: '',
  middleNameErr: '',
  lastNameErr: '',
  nickNameErr: '',
  statusErr: ''
};

const BasicDetail = () => {
  const firstName = useStaffFormStore((state) => state.firstName);
  const middleName = useStaffFormStore((state) => state.middleName);
  const lastName = useStaffFormStore((state) => state.lastName);
  const nickName = useStaffFormStore((state) => state.nickName);
  const gender = useStaffFormStore((state) => state.gender);
  const status = useStaffFormStore((state) => state.status);

  const [basicDetailErr, setBasicDetailErr] = useState(configCoreErr);

  const onCheckValidation = () => {
    let getFirstName = getAllState().firstName;
    let getMiddleName = getAllState().middleName;
    let getLastName = getAllState().lastName;
    let getNickName = getAllState().nickName;
    let getStatus = getAllState().status;

    let getFirstNameError = '';
    let getMiddleNameError = '';
    let getLastNameError = '';
    let getNickNameError = '';
    let getStatusError = '';

    if (!getFirstName) {
      getFirstNameError = coreValidation.find((d) => d.code === 0);
    } else if (getFirstName.length < 3 || getFirstName.length > 20) {
      getFirstNameError = coreValidation.find((d) => d.code === 7);
    }

    if (getMiddleName.length < 3 || getMiddleName.length > 20) {
      getMiddleNameError = coreValidation.find((d) => d.code === 8);
    }

    if (getLastName.length < 3 || getLastName.length > 20) {
      getLastNameError = coreValidation.find((d) => d.code === 9);
    }

    if (getNickName.length < 3 || getNickName.length > 20) {
      getNickNameError = coreValidation.find((d) => d.code === 10);
    }

    if (!getStatus) {
      getStatusError = coreValidation.find((d) => d.code === 1);
    }

    if (getFirstNameError || getMiddleNameError || getLastNameError || getNickNameError || getStatusError) {
      setBasicDetailErr({
        firstNameErr: getFirstNameError ? getFirstNameError.message : '',
        middleNameErr: getMiddleNameError ? getMiddleNameError.message : '',
        lastNameErr: getLastNameError ? getLastNameError.message : '',
        nickNameErr: getNickNameError ? getNickNameError.message : '',
        statusErr: getStatusError ? getStatusError.message : ''
      });

      useStaffFormStore.setState({ staffFormError: true });
    } else {
      setBasicDetailErr(configCoreErr);
      useStaffFormStore.setState({ staffFormError: false });
    }
  };

  const onFieldHandler = (event) => {
    useStaffFormStore.setState({ [event.target.name]: event.target.value, staffFormTouch: true });
    onCheckValidation();
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="basic-detail" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="first-name">{<FormattedMessage id="first-name" />}</InputLabel>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={onFieldHandler}
                error={Boolean(basicDetailErr.firstNameErr && basicDetailErr.firstNameErr.length > 0)}
                helperText={basicDetailErr.firstNameErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="middle-name">{<FormattedMessage id="middle-name" />}</InputLabel>
              <TextField
                fullWidth
                id="middleName"
                name="middleName"
                value={middleName}
                onChange={onFieldHandler}
                error={Boolean(basicDetailErr.middleNameErr && basicDetailErr.middleNameErr.length > 0)}
                helperText={basicDetailErr.middleNameErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="last-name">{<FormattedMessage id="last-name" />}</InputLabel>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={onFieldHandler}
                error={Boolean(basicDetailErr.lastNameErr && basicDetailErr.lastNameErr.length > 0)}
                helperText={basicDetailErr.lastNameErr}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="nick-name">{<FormattedMessage id="nick-name" />}</InputLabel>
              <TextField
                fullWidth
                id="nickName"
                name="nickName"
                value={nickName}
                onChange={onFieldHandler}
                error={Boolean(basicDetailErr.nickNameErr && basicDetailErr.nickNameErr.length > 0)}
                helperText={basicDetailErr.nickNameErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="gender">{<FormattedMessage id="gender" />}</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id="gender" name="gender" value={gender} onChange={onFieldHandler} placeholder="Select gender">
                  <MenuItem value="">
                    <em>Select gender</em>
                  </MenuItem>
                  <MenuItem value={'Male'}>{<FormattedMessage id="male" />}</MenuItem>
                  <MenuItem value={'Female'}>{<FormattedMessage id="female" />}</MenuItem>
                  <MenuItem value={'Unknown'}>{<FormattedMessage id="unknown" />}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="status">Status</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id="status" name="status" value={status} onChange={onFieldHandler} placeholder="Select status">
                  <MenuItem value="">
                    <em>Select status</em>
                  </MenuItem>
                  <MenuItem value={'1'}>Active</MenuItem>
                  <MenuItem value={'0'}>Non Active</MenuItem>
                </Select>
                {basicDetailErr.statusErr.length > 0 && <FormHelperText error> {basicDetailErr.statusErr} </FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default BasicDetail;
