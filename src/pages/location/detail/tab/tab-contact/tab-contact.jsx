import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { FormattedMessage } from 'react-intl';
import { useContext, useEffect, useState } from 'react';
import LocationDetailContext from '../../location-detail-context';
import { jsonCentralized } from 'utils/json-centralized';

const TabContact = () => {
  const { locationDetail, setLocationDetail } = useContext(LocationDetailContext);
  const [phone, setPhone] = useState([]); // { phoneUsage: '', phoneNumber: '', phoneType: '' }
  const [email, setEmail] = useState([]); // { emailUsage: '', emailAddress: '' }
  const [messenger, setMessenger] = useState([]); // { messengerUsage: '', messengerUsageName: '', messengerType: '' }

  const phoneUsageList = locationDetail.usageList;
  const phoneTypeList = locationDetail.telephoneType;

  useEffect(() => {
    // fill context telephone to phone
    if (locationDetail.telephone.length) {
      const getDetailTelephone = jsonCentralized(locationDetail.telephone);
      const newTelephone = getDetailTelephone.map((tp) => {
        return { phoneUsage: tp.usage || '', phoneNumber: tp.phoneNumber, phoneType: tp.type || '' };
      });
      setPhone(newTelephone);
    }

    // fill context email to email
    if (locationDetail.email.length) {
      const getDetailEmail = jsonCentralized(locationDetail.email);
      const newEmail = getDetailEmail.map((em) => {
        return { emailUsage: em.usage || '', emailAddress: em.username };
      });
      setEmail(newEmail);
    }

    // fill context messenger to messenger
    if (locationDetail.messenger.length) {
      const getDetailMessenger = jsonCentralized(locationDetail.messenger);
      const newMessenger = getDetailMessenger.map((ms) => {
        return { messengerUsage: ms.usage || '', messengerUsageName: ms.messengerNumber, messengerType: ms.type || '' };
      });
      setMessenger(newMessenger);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSetLocationDetail = (data, procedure) => {
    let newData = [...data];
    newData = newData.map((dt) => {
      let setObj = {};
      if (procedure === 'telephone') {
        setObj = { phoneNumber: dt.phoneNumber, type: dt.phoneType, usage: dt.phoneUsage };
      } else if (procedure === 'email') {
        setObj = { username: dt.emailAddress, usage: dt.emailUsage };
      } else if (procedure === 'messenger') {
        setObj = {
          messengerNumber: dt.messengerUsageName,
          type: dt.messengerType,
          usage: dt.messengerUsage
        };
      }

      return setObj;
    });

    const assignObject = { [procedure]: newData };

    setLocationDetail((value) => {
      return { ...value, ...assignObject };
    });
  };

  // Start Phone
  const onPhoneUsage = (event, idx) => {
    setPhone((value) => {
      const getPhones = [...value];
      getPhones[idx].phoneUsage = event.target.value;

      onSetLocationDetail(getPhones, 'telephone');
      return getPhones;
    });
  };

  const onPhoneNumber = (event, idx) => {
    setPhone((value) => {
      const getPhones = [...value];
      getPhones[idx].phoneNumber = event.target.value;

      onSetLocationDetail(getPhones, 'telephone');
      return getPhones;
    });
  };

  const onPhoneType = (event, idx) => {
    setPhone((value) => {
      const getPhones = [...value];
      getPhones[idx].phoneType = event.target.value;

      onSetLocationDetail(getPhones, 'telephone');
      return getPhones;
    });
  };

  const onAddPhone = () => {
    setPhone((value) => {
      const setNewData = [...value, { phoneUsage: '', phoneNumber: '', phoneType: '' }];

      onSetLocationDetail(setNewData, 'telephone');
      return setNewData;
    });
  };

  const onDeletePhone = (i) => {
    setPhone((value) => {
      let getPhone = [...value];
      getPhone.splice(i, 1);

      onSetLocationDetail(getPhone, 'telephone');
      return [...getPhone];
    });
  };
  // End Phone

  // Start Email
  const emailUsageList = locationDetail.usageList;

  const onEmailUsage = (event, idx) => {
    setEmail((value) => {
      const getEmails = [...value];
      getEmails[idx].emailUsage = event.target.value;

      onSetLocationDetail(getEmails, 'email');
      return getEmails;
    });
  };

  const onEmailAddress = (event, idx) => {
    setEmail((value) => {
      const getEmails = [...value];
      getEmails[idx].emailAddress = event.target.value;

      onSetLocationDetail(getEmails, 'email');
      return getEmails;
    });
  };

  const onAddEmail = () => {
    setEmail((value) => {
      const setNewData = [...value, { emailUsage: '', emailAddress: '' }];

      onSetLocationDetail(setNewData, 'email');
      return setNewData;
    });
  };

  const onDeleteEmail = (i) => {
    setEmail((value) => {
      let getEmails = [...value];
      getEmails.splice(i, 1);

      onSetLocationDetail(getEmails, 'email');
      return [...getEmails];
    });
  };
  // End Email

  // Start Messenger
  const messengerUsageList = locationDetail.usageList;
  const messengerTypeList = locationDetail.messengerType;

  const onMessengerUsage = (event, idx) => {
    setMessenger((value) => {
      const getMessengers = [...value];
      getMessengers[idx].messengerUsage = event.target.value;

      onSetLocationDetail(getMessengers, 'messenger');
      return getMessengers;
    });
  };

  const onMessengerUsageName = (event, idx) => {
    setMessenger((value) => {
      const getMessengers = [...value];
      getMessengers[idx].messengerUsageName = event.target.value;

      onSetLocationDetail(getMessengers, 'messenger');
      return getMessengers;
    });
  };

  const onMessengerType = (event, idx) => {
    setMessenger((value) => {
      const getMessengers = [...value];
      getMessengers[idx].messengerType = event.target.value;

      onSetLocationDetail(getMessengers, 'messenger');
      return getMessengers;
    });
  };

  const onAddMessenger = () => {
    setMessenger((value) => {
      const setNewData = [...value, { messengerUsage: '', messengerUsageName: '', messengerType: '' }];

      onSetLocationDetail(setNewData, 'messenger');
      return setNewData;
    });
  };

  const onDeleteMessenger = (i) => {
    setMessenger((value) => {
      let getMessengers = [...value];
      getMessengers.splice(i, 1);

      onSetLocationDetail(getMessengers, 'messenger');
      return [...getMessengers];
    });
  };
  // End Messenger

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6}>
        <MainCard title={<FormattedMessage id="phone" />}>
          {phone.map((dt, i) => (
            <Grid container spacing={3} key={i}>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel htmlFor="status">
                    <FormattedMessage id="usage" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`phoneUsage${i}`}
                      name={`phoneUsage${i}`}
                      value={dt.phoneUsage}
                      onChange={(event) => onPhoneUsage(event, i)}
                    >
                      <MenuItem value="">
                        <em>Select usage</em>
                      </MenuItem>
                      {phoneUsageList.map((dt, idxPhoneUsage) => (
                        <MenuItem value={dt.value} key={idxPhoneUsage}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* {basicInfo.statusError.length > 0 && <FormHelperText error> {basicInfo.statusError} </FormHelperText>} */}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>Nomor</InputLabel>
                  <TextField
                    fullWidth
                    id="phoneNumber"
                    name="phoneNumber"
                    type="number"
                    placeholder="Enter nomor"
                    value={dt.phoneNumber}
                    onChange={(event) => onPhoneNumber(event, i)}
                    onBlur={(event) => onPhoneNumber(event, i)}
                    // error={formBasicInfo.touched.locationName && Boolean(formBasicInfo.errors.locationName)}
                    // helperText={formBasicInfo.touched.locationName && formBasicInfo.errors.locationName}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel htmlFor="type">
                    <FormattedMessage id="type" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`phoneType${i}`}
                      name={`phoneType${i}`}
                      defaultValue=""
                      value={dt.phoneType}
                      onChange={(event) => onPhoneType(event, i)}
                    >
                      <MenuItem value="">
                        <em>Select type</em>
                      </MenuItem>
                      {phoneTypeList.map((dt, idxPhoneType) => (
                        <MenuItem value={dt.value} key={idxPhoneType}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* {basicInfo.statusError.length > 0 && <FormHelperText error> {basicInfo.statusError} </FormHelperText>} */}
                  </FormControl>
                </Stack>
              </Grid>

              {phone.length > 1 && (
                <Grid item xs={12} sm={3} display="flex" alignItems="flex-end">
                  <IconButton size="large" color="error" onClick={() => onDeletePhone(i)}>
                    <DeleteFilled />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}

          <Button variant="contained" onClick={onAddPhone} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </MainCard>
      </Grid>

      <Grid item xs={12} sm={6}>
        <MainCard title="Email">
          {email.map((dt, i) => (
            <Grid container spacing={4} key={i}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel htmlFor="usage">
                    <FormattedMessage id="usage" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`emailUsage${i}`}
                      name={`emailUsage${i}`}
                      value={dt.emailUsage}
                      onChange={(event) => onEmailUsage(event, i)}
                    >
                      <MenuItem value="">
                        <em>Select usage</em>
                      </MenuItem>
                      {emailUsageList.map((dt, idxEmailUsage) => (
                        <MenuItem value={dt.value} key={idxEmailUsage}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* {basicInfo.statusError.length > 0 && <FormHelperText error> {basicInfo.statusError} </FormHelperText>} */}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="address" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="emailAddress"
                    name="emailAddress"
                    value={dt.emailAddress}
                    onChange={(event) => onEmailAddress(event, i)}
                    onBlur={(event) => onEmailAddress(event, i)}
                    // error={formBasicInfo.touched.locationName && Boolean(formBasicInfo.errors.locationName)}
                    // helperText={formBasicInfo.touched.locationName && formBasicInfo.errors.locationName}
                  />
                </Stack>
              </Grid>

              {email.length > 1 && (
                <Grid item xs={12} sm={4} display="flex" alignItems="flex-end">
                  <IconButton size="large" color="error" onClick={() => onDeleteEmail(i)}>
                    <DeleteFilled />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}

          <Button variant="contained" onClick={onAddEmail} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Messenger">
          {messenger.map((dt, i) => (
            <Grid container spacing={5} key={i}>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="usage" />
                  </InputLabel>
                  {/* <Autocomplete
                    id={`messengerUsage${i}`}
                    disablePortal
                    options={messengerUsageList}
                    value={dt.messengerUsage}
                    onChange={(event, value) => onMessengerUsage(event, value, i)}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    renderInput={(params) => <TextField {...params} />}
                  /> */}
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`messengerUsage${i}`}
                      name={`messengerUsage${i}`}
                      value={dt.messengerUsage}
                      onChange={(event) => onMessengerUsage(event, i)}
                    >
                      <MenuItem value="">
                        <em>Select usage</em>
                      </MenuItem>
                      {messengerUsageList.map((dt, idxMessengerUsage) => (
                        <MenuItem value={dt.value} key={idxMessengerUsage}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* {basicInfo.statusError.length > 0 && <FormHelperText error> {basicInfo.statusError} </FormHelperText>} */}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="usage-name" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id={`messengerUsageName${i}`}
                    name={`messengerUsageName${i}`}
                    value={dt.messengerUsageName}
                    onChange={(event) => onMessengerUsageName(event, i)}
                    onBlur={(event) => onMessengerUsageName(event, i)}
                    // error={formBasicInfo.touched.locationName && Boolean(formBasicInfo.errors.locationName)}
                    // helperText={formBasicInfo.touched.locationName && formBasicInfo.errors.locationName}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>Type</InputLabel>
                  {/* <Autocomplete
                    id="type"
                    options={messengerTypeList}
                    inputValue={dt.messengerType}
                    getOptionLabel={(option) => (option ? option.name : '')}
                    renderInput={(params) => <TextField {...params} />}
                  /> */}
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`messengerType${i}`}
                      name={`messengerType${i}`}
                      value={dt.messengerType}
                      onChange={(event) => onMessengerType(event, i)}
                    >
                      <MenuItem value="">
                        <em>Select type</em>
                      </MenuItem>
                      {messengerTypeList.map((dt, idxMessengerType) => (
                        <MenuItem value={dt.value} key={idxMessengerType}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* {basicInfo.statusError.length > 0 && <FormHelperText error> {basicInfo.statusError} </FormHelperText>} */}
                  </FormControl>
                </Stack>
              </Grid>

              {messenger.length > 1 && (
                <Grid item xs={12} sm={3} display="flex" alignItems="flex-end">
                  <IconButton size="large" color="error" onClick={() => onDeleteMessenger(i)}>
                    <DeleteFilled />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}

          <Button variant="contained" onClick={onAddMessenger} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default TabContact;
