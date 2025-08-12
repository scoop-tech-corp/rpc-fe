import { Grid, Stack, InputLabel, TextField, FormControl, MenuItem, Select, Typography, Button, Autocomplete } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Fragment, useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { updateProfile, uploadImageProfile } from '../../service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { DeleteFilled } from '@ant-design/icons';
import { defaultIdentification } from 'pages/staff/staff-list/form/staff-form-store';
import { uploadImageStaff } from 'pages/staff/staff-list/service';

import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import avatarUnknown from 'assets/images/users/avatar-unknown.jpg';
import PropTypes from 'prop-types';
import configGlobal from '../../../../../config';
import useAuth from 'hooks/useAuth';

const configCoreErr = {
  firstNameErr: '',
  middleNameErr: '',
  lastNameErr: '',
  nickNameErr: '',
  phoneNumberErr: '',
  messengerErr: '',
  addressErr: '',
  usernameErr: '',
  emailErr: ''
};

const TabPersonal = (props) => {
  const { dataProfile } = props;
  const [errorForm, setErrorForm] = useState(false);
  const [formErr, setFormErr] = useState(configCoreErr);
  const intl = useIntl();
  const dispatch = useDispatch();
  const firstRender = useRef(true);
  const { init } = useAuth();

  const [formProfile, setFormProfile] = useState({
    id: dataProfile?.id,
    firstName: dataProfile?.firstName,
    middleName: dataProfile?.middleName,
    lastName: dataProfile?.lastName,
    nickName: dataProfile?.nickName,
    gender: dataProfile?.gender,
    phoneNumberId: dataProfile?.phoneNumberId,
    phoneNumber: dataProfile?.phoneNumber,
    messengerNumberId: dataProfile?.messengerNumberId,
    messenger: dataProfile?.messengerNumber,
    detailAddressId: dataProfile?.detailAddressId,
    address: dataProfile?.addressName,
    username: dataProfile?.userName,
    emailId: dataProfile?.emailId,
    email: dataProfile?.email,
    typeIdentifications: [],
    photo: {
      selectedFile: null,
      imagePath: dataProfile?.imagePath ? `${configGlobal.apiUrl}${dataProfile?.imagePath}` : '',
      originalName: '',
      isChange: false,
      isDelete: false
    }
  });

  const onCheckValidation = () => {
    let getFirstNameError = '';
    let getMiddleNameError = '';
    let getLastNameError = '';
    let getNickNameError = '';

    let getUsernameError = '';
    let getEmailError = '';

    if (!formProfile.firstName) {
      getFirstNameError = intl.formatMessage({ id: 'first-name-is-required' });
    } else if (formProfile.firstName.length < 3 || formProfile.firstName.length > 20) {
      getFirstNameError = intl.formatMessage({ id: 'first-name-minimum-3-char-and-max-20-char' });
    }

    if (formProfile.middleName && (formProfile.middleName.length < 3 || formProfile.middleName.length > 20)) {
      getMiddleNameError = intl.formatMessage({ id: 'middle-name-minimum-3-char-and-max-20-char' });
    }

    if (formProfile.lastName && (formProfile.lastName.length < 3 || formProfile.lastName.length > 20)) {
      getLastNameError = intl.formatMessage({ id: 'last-name-minimum-3-char-and-max-20-char' });
    }

    if (formProfile.nickName && (formProfile.nickName.length < 3 || formProfile.nickName.length > 20)) {
      getNickNameError = intl.formatMessage({ id: 'nick-name-minimum-3-char-and-max-20-char' });
    }

    if (!formProfile.username) {
      getUsernameError = intl.formatMessage({ id: 'username-is-required' });
    }

    if (!formProfile.email) {
      getEmailError = intl.formatMessage({ id: 'email-is-required' });
    }

    if (getFirstNameError || getMiddleNameError || getLastNameError || getNickNameError || getUsernameError || getEmailError) {
      setFormErr({
        firstNameErr: getFirstNameError,
        middleNameErr: getMiddleNameError,
        lastNameErr: getLastNameError,
        nickNameErr: getNickNameError,
        usernameErr: getUsernameError,
        emailErr: getEmailError
      });
      setErrorForm(true);
      return true;
    } else {
      setFormErr(configCoreErr);
      setErrorForm(false);
    }
  };

  const onSubmit = async () => {
    console.log('submit edit', formProfile);
    const checkValidationForm = onCheckValidation();

    const responseError = (err) => {
      if (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    };

    if (!checkValidationForm) {
      if (formProfile.typeIdentifications.find((dt) => dt.image.isChange)) {
        await uploadImageStaff({ typeIdentifications: formProfile.typeIdentifications, id: dataProfile?.id }).catch(responseError);
      }

      await updateProfile(formProfile)
        .then(async (resp) => {
          if (resp && resp.status === 200) {
            if (formProfile.photo.isChange || formProfile.photo.isDelete) {
              await uploadImageProfile(formProfile)
                .then(async (res) => {
                  let prevUserLogin = JSON.parse(localStorage.getItem('user'));
                  prevUserLogin.avatar = res.data.imagePath;
                  localStorage.setItem('user', JSON.stringify(prevUserLogin));
                  init();

                  if (res && res.status === 200) {
                    dispatch(snackbarSuccess('Success update profile'));
                  }
                })
                .catch(responseError);
            } else {
              dispatch(snackbarSuccess('Success update profile'));
            }
          }
        })
        .catch(responseError);
    }
  };

  const onSelectedPhoto = (e) => {
    const getFile = e.target.files[0];
    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        setFormProfile((prevState) => ({
          ...prevState,
          photo: {
            selectedFile: getFile,
            imagePath: this.result,
            originalName: getFile.name,
            isChange: true
          }
        }));
      };
      reader.readAsDataURL(getFile);
    }
  };

  const onDeleteProfileImage = () => {
    setFormProfile((prevState) => ({
      ...prevState,
      photo: {
        ...prevState.photo,
        imagePath: '',
        isDelete: true
      }
    }));
  };

  const onDropdownHandler = (selected, procedure, i) => {
    setFormProfile((prevState) => {
      let newData = [...prevState.typeIdentifications];
      newData[i][procedure] = selected ? selected : null;

      return { ...prevState, typeIdentifications: newData };
    });
  };

  const onDeleteTypeIdentification = (i) => {
    setFormProfile((prevState) => {
      let newData = [...prevState.typeIdentifications];
      newData.splice(i, 1);
      // newData[i].command = 'del';

      return { ...prevState, typeIdentifications: newData };
    });
  };

  const clearImage = (i) => {
    document.getElementById(`importImage-${i}`).value = '';

    setFormProfile((prevState) => {
      let newData = [...prevState.typeIdentifications];

      newData[i].imagePath = '';
      newData[i].image = {
        id: '',
        selectedFile: '',
        isChange: true
      };
      return { ...prevState, typeIdentifications: newData };
    });
  };

  const onSelectedIdentificationNumberPhoto = (e, index) => {
    const getFile = e.target.files[0];

    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        setFormProfile((prevState) => {
          let newData = [...prevState.typeIdentifications];

          const objFile = {
            id: newData[index].image?.id || '',
            selectedFile: getFile,
            isChange: true
          };

          newData[index].imagePath = this.result;
          newData[index].image = objFile;

          return { ...prevState, typeIdentifications: newData };
        });
      };
      reader.readAsDataURL(getFile);
    } else {
      clearImage();
    }
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) {
      onCheckValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProfile]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={errorForm || firstRender.current}>
          <FormattedMessage id="save" />
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} display={'flex'} justifyContent={'center'}>
            <div style={{ position: 'relative' }}>
              <Avatar
                alt="profile user default men"
                src={formProfile.photo.imagePath || avatarUnknown}
                size="xl"
                iscustomsize={'true'}
                width={150}
                height={150}
              />
              {formProfile.photo.imagePath && (
                <IconButton
                  size="medium"
                  color="error"
                  style={{
                    bottom: -10,
                    right: -10,
                    position: 'absolute'
                  }}
                  onClick={onDeleteProfileImage}
                >
                  <DeleteFilled />
                </IconButton>
              )}
              <input
                type="file"
                onChange={(event) => onSelectedPhoto(event)}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '150px',
                  height: '150px',
                  opacity: '0',
                  cursor: 'pointer',
                  borderRadius: '50%'
                }}
              />
            </div>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={'bold'}>
              <FormattedMessage id="personal-information" />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="first-name">{<FormattedMessage id="first-name" />}</InputLabel>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                value={formProfile.firstName}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, firstName: e.target.value }))}
                error={Boolean(formErr.firstNameErr && formErr.firstNameErr.length > 0)}
                helperText={formErr.firstNameErr}
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
                value={formProfile.middleName}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, middleName: e.target.value }))}
                error={Boolean(formErr.middleNameErr && formErr.middleNameErr.length > 0)}
                helperText={formErr.middleNameErr}
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
                value={formProfile.lastName}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, lastName: e.target.value }))}
                error={Boolean(formErr.lastNameErr && formErr.lastNameErr.length > 0)}
                helperText={formErr.lastNameErr}
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
                value={formProfile.nickName}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, nickName: e.target.value }))}
                error={Boolean(formErr.nickNameErr && formErr.nickNameErr.length > 0)}
                helperText={formErr.nickNameErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="gender">{<FormattedMessage id="gender" />}</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  id="gender"
                  name="gender"
                  value={formProfile.gender}
                  onChange={(e) => setFormProfile((prevState) => ({ ...prevState, gender: e.target.value }))}
                  placeholder="Select gender"
                >
                  <MenuItem value="">
                    <em>Select gender</em>
                  </MenuItem>
                  <MenuItem value={'male'}>{<FormattedMessage id="male" />}</MenuItem>
                  <MenuItem value={'female'}>{<FormattedMessage id="female" />}</MenuItem>
                  <MenuItem value={'unknown'}>{<FormattedMessage id="unknown" />}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={'bold'}>
              <FormattedMessage id="contact-information" />
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="phone-number">{<FormattedMessage id="phone-number" />}</InputLabel>
              <TextField
                fullWidth
                type="number"
                id="phoneNumber"
                name="phoneNumber"
                value={formProfile.phoneNumber}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, phoneNumber: e.target.value }))}
                placeholder={intl.formatMessage({ id: 'enter-nomor' })}
                error={Boolean(formErr.phoneNumberErr && formErr.phoneNumberErr.length > 0)}
                helperText={formErr.phoneNumberErr}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="messenger">Messenger</InputLabel>
              <TextField
                fullWidth
                id="messenger"
                name="messenger"
                value={formProfile.messenger}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, messenger: e.target.value }))}
                placeholder={'Messenger'}
                error={Boolean(formErr.messengerErr && formErr.messengerErr.length > 0)}
                helperText={formErr.messengerErr}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="address">{<FormattedMessage id="address" />}</InputLabel>
              <TextField
                fullWidth
                id="address"
                name="address"
                value={formProfile.address}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, address: e.target.value }))}
                placeholder={'Address'}
                error={Boolean(formErr.addressErr && formErr.addressErr.length > 0)}
                helperText={formErr.addressErr}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={'bold'}>
              <FormattedMessage id="general-setting" />
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="username">Username</InputLabel>
              <TextField
                fullWidth
                id="username"
                name="username"
                value={formProfile.username}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, username: e.target.value }))}
                placeholder={'Username'}
                error={Boolean(formErr.usernameErr && formErr.usernameErr.length > 0)}
                helperText={formErr.usernameErr}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="email">Email</InputLabel>
              <TextField
                fullWidth
                id="email"
                name="email"
                value={formProfile.email}
                onChange={(e) => setFormProfile((prevState) => ({ ...prevState, email: e.target.value }))}
                placeholder={'Email'}
                error={Boolean(formErr.emailErr && formErr.emailErr.length > 0)}
                helperText={formErr.emailErr}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={'bold'}>
              Upload Personal Data
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <IconButton
              size="medium"
              variant="contained"
              aria-label="add"
              color="primary"
              onClick={() => {
                setFormProfile((prevState) => {
                  const newRow = { ...defaultIdentification };
                  let newData = [...prevState.typeIdentifications, newRow];

                  return { ...prevState, typeIdentifications: newData };
                });
              }}
            >
              <PlusOutlined />
            </IconButton>
          </Grid>
          {formProfile.typeIdentifications.map((dt, i) => (
            <Fragment key={i}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="type-of-id" />
                  </InputLabel>
                  <Autocomplete
                    id="type-of-id"
                    options={dataProfile.typeIdList}
                    value={dt.typeId}
                    onChange={(_, selected) => onDropdownHandler(selected, 'typeId', i)}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="identification">{<FormattedMessage id="identification" />}</InputLabel>
                  <TextField
                    id="identification"
                    name="identificationNumber"
                    fullWidth
                    value={dt.identificationNumber}
                    onChange={(event) => {
                      setFormProfile((prevState) => {
                        let newData = [...prevState.typeIdentifications];
                        newData[i][event.target.name] = event.target.value;

                        return { ...prevState, typeIdentifications: newData };
                      });
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="import-image">{<FormattedMessage id="import-image" />}</InputLabel>
                  <Stack spacing={1} flexDirection="row">
                    {dt.imagePath && (
                      <>
                        <a href={dt.imagePath} target="blank" style={{ flexBasis: '20%', marginRight: '10px' }}>
                          <img alt={dt.imagePath} src={dt.imagePath} width="100%" />
                        </a>
                        <DeleteFilled
                          style={{ fontSize: '14px', color: 'red', cursor: 'pointer', marginRight: '10px' }}
                          onClick={() => clearImage(i)}
                        />
                      </>
                    )}
                    <input
                      type="file"
                      id={`importImage-${i}`}
                      onChange={(event) => onSelectedIdentificationNumberPhoto(event, i)}
                      accept="image/x-png,image/jpeg,image/png,image/heic"
                    />
                  </Stack>
                </Stack>
              </Grid>
              {formProfile.typeIdentifications.length > 1 && (
                <Grid item xs={12} sm={1}>
                  <IconButton size="large" color="error" onClick={() => onDeleteTypeIdentification(i)}>
                    <DeleteFilled />
                  </IconButton>
                </Grid>
              )}
            </Fragment>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

TabPersonal.propTypes = {
  dataProfile: PropTypes.any
};

export default TabPersonal;
