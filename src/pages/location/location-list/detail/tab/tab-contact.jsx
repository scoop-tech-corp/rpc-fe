import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { FormattedMessage } from 'react-intl';
import { jsonCentralized } from 'utils/json-centralized';
import { useLocationDetailStore } from '../location-detail-store';

const TabContact = () => {
  const locationEmail = useLocationDetailStore((state) => state.email);
  const locationTelephone = useLocationDetailStore((state) => state.telephone);
  const locationMessenger = useLocationDetailStore((state) => state.messenger);

  const usageList = useLocationDetailStore((state) => state.usageList);
  const phoneTypeList = useLocationDetailStore((state) => state.telephoneType);
  const messengerTypeList = useLocationDetailStore((state) => state.messengerType);

  let phone = [];
  let email = [];
  let messenger = [];

  if (locationTelephone.length) {
    const getDetailTelephone = jsonCentralized(locationTelephone);
    const newTelephone = getDetailTelephone.map((tp) => {
      return { phoneUsage: tp.usage || '', phoneNumber: tp.phoneNumber, phoneType: tp.type || '' };
    });
    phone = newTelephone;
  }

  if (locationEmail.length) {
    const getDetailEmail = jsonCentralized(locationEmail);
    const newEmail = getDetailEmail.map((em) => {
      return { emailUsage: em.usage || '', emailAddress: em.username };
    });
    email = newEmail;
  }

  if (locationMessenger.length) {
    const getDetailMessenger = jsonCentralized(locationMessenger);
    const newMessenger = getDetailMessenger.map((ms) => {
      return { messengerUsage: ms.usage || '', messengerUsageName: ms.messengerNumber, messengerType: ms.type || '' };
    });
    messenger = newMessenger;
  }

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

    useLocationDetailStore.setState({ ...assignObject });
  };

  const onUsageHandler = (event, idx, procedure) => {
    let data = [];

    switch (procedure) {
      case 'telephone':
        data = [...phone];
        data[idx].phoneUsage = event.target.value;
        break;
      case 'email':
        data = [...email];
        data[idx].emailUsage = event.target.value;
        break;
      case 'messenger':
        data = [...messenger];
        data[idx].messengerUsage = event.target.value;
        break;
    }

    onSetLocationDetail(data, procedure);
  };

  const onFieldHandler = (event, idx, procedure) => {
    let data = [];

    switch (procedure) {
      case 'telephone':
        data = [...phone];
        data[idx].phoneNumber = event.target.value;
        break;
      case 'email':
        data = [...email];
        data[idx].emailAddress = event.target.value;
        break;
      case 'messenger':
        data = [...messenger];
        data[idx].messengerUsageName = event.target.value;
        break;
    }

    onSetLocationDetail(data, procedure);
  };

  const onTypeHandler = (event, idx, procedure) => {
    let data = [];

    switch (procedure) {
      case 'telephone':
        data = [...phone];
        data[idx].phoneType = event.target.value;
        break;
      case 'messenger':
        data = [...messenger];
        data[idx].messengerType = event.target.value;
        break;
    }

    onSetLocationDetail(data, procedure);
  };

  // Start Phone
  const onAddPhone = () => {
    const setNewData = [...phone, { phoneUsage: '', phoneNumber: '', phoneType: '' }];
    onSetLocationDetail(setNewData, 'telephone');
  };

  const onDeletePhone = (i) => {
    let getPhone = [...phone];
    getPhone.splice(i, 1);

    onSetLocationDetail(getPhone, 'telephone');
  };
  // End Phone

  // Start Email
  const onAddEmail = () => {
    const setNewData = [...email, { emailUsage: '', emailAddress: '' }];
    onSetLocationDetail(setNewData, 'email');
  };

  const onDeleteEmail = (i) => {
    let getEmails = [...email];
    getEmails.splice(i, 1);

    onSetLocationDetail(getEmails, 'email');
  };
  // End Email

  // Start Messenger
  const onAddMessenger = () => {
    const setNewData = [...messenger, { messengerUsage: '', messengerUsageName: '', messengerType: '' }];
    onSetLocationDetail(setNewData, 'messenger');
  };

  const onDeleteMessenger = (i) => {
    let getMessengers = [...messenger];
    getMessengers.splice(i, 1);

    onSetLocationDetail(getMessengers, 'messenger');
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
                      onChange={(event) => onUsageHandler(event, i, 'telephone')}
                    >
                      <MenuItem value="">
                        <em>Select usage</em>
                      </MenuItem>
                      {usageList.map((dt, idxPhoneUsage) => (
                        <MenuItem value={dt.value} key={idxPhoneUsage}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
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
                    onChange={(event) => onFieldHandler(event, i, 'telephone')}
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
                      onChange={(event) => onTypeHandler(event, i, 'telephone')}
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
                      onChange={(event) => onUsageHandler(event, i, 'email')}
                    >
                      <MenuItem value="">
                        <em>Select usage</em>
                      </MenuItem>
                      {usageList.map((dt, idxEmailUsage) => (
                        <MenuItem value={dt.value} key={idxEmailUsage}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
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
                    onChange={(event) => onFieldHandler(event, i, 'email')}
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
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`messengerUsage${i}`}
                      name={`messengerUsage${i}`}
                      value={dt.messengerUsage}
                      onChange={(event) => onUsageHandler(event, i, 'messenger')}
                    >
                      <MenuItem value="">
                        <em>Select usage</em>
                      </MenuItem>
                      {usageList.map((dt, idxMessengerUsage) => (
                        <MenuItem value={dt.value} key={idxMessengerUsage}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
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
                    onChange={(event) => onFieldHandler(event, i, 'messenger')}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>Type</InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`messengerType${i}`}
                      name={`messengerType${i}`}
                      value={dt.messengerType}
                      onChange={(event) => onTypeHandler(event, i, 'messenger')}
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
