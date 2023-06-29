import { FormattedMessage } from 'react-intl';
import { FormControl, Grid, InputLabel, Stack, TextField, Select, MenuItem, FormHelperText } from '@mui/material';
import { useStaffFormStore } from '../../staff-form-store';
import { useEffect, useState } from 'react';
import { validationFormStaff } from 'pages/staff/staff-list/service';

import MainCard from 'components/MainCard';

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
  const isTouchForm = useStaffFormStore((state) => state.staffFormTouch);

  const [basicDetailErr, setBasicDetailErr] = useState(configCoreErr);

  const onCheckValidation = () => {
    const getRespValidForm = validationFormStaff('basic-detail');

    if (!getRespValidForm) {
      setBasicDetailErr(configCoreErr);
      useStaffFormStore.setState({ staffFormError: false });
    } else {
      setBasicDetailErr({
        firstNameErr: getRespValidForm.getFirstNameError ? getRespValidForm.getFirstNameError.message : '',
        middleNameErr: getRespValidForm.getMiddleNameError ? getRespValidForm.getMiddleNameError.message : '',
        lastNameErr: getRespValidForm.getLastNameError ? getRespValidForm.getLastNameError.message : '',
        nickNameErr: getRespValidForm.getNickNameError ? getRespValidForm.getNickNameError.message : '',
        statusErr: getRespValidForm.getStatusError ? getRespValidForm.getStatusError.message : ''
      });

      useStaffFormStore.setState({ staffFormError: true });
    }
  };

  const onFieldHandler = (event) => {
    useStaffFormStore.setState({ [event.target.name]: event.target.value, staffFormTouch: true });
    onCheckValidation();
  };

  useEffect(() => {
    if (isTouchForm) onCheckValidation();
  }, [isTouchForm]);

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
                    <em>
                      <FormattedMessage id="select-status" />
                    </em>
                  </MenuItem>
                  <MenuItem value={'1'}>
                    <FormattedMessage id="active" />
                  </MenuItem>
                  <MenuItem value={'0'}>
                    <FormattedMessage id="inactive" />
                  </MenuItem>
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
