import { DeleteFilled, MoreOutlined, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Menu, FormHelperText } from '@mui/material';
import { getDataStaticLocation } from 'pages/location/location-list/detail/service';
import { jsonCentralized } from 'utils/func';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCustomerFormStore } from '../customer-form-store';
import { useState, useEffect } from 'react';

import IconButton from 'components/@extended/IconButton';
import FormDataStatic from 'components/FormDataStatic';
import MainCard from 'components/MainCard';

const TabContacts = () => {
  const locationEmail = useCustomerFormStore((state) => state.emails);
  const locationTelephone = useCustomerFormStore((state) => state.telephones);
  const locationMessenger = useCustomerFormStore((state) => state.messengers);

  const usageList = useCustomerFormStore((state) => state.usageList);
  const phoneTypeList = useCustomerFormStore((state) => state.telephoneType);
  const messengerTypeList = useCustomerFormStore((state) => state.messengerType);

  const intl = useIntl();
  const isTouchForm = useCustomerFormStore((state) => state.customerFormTouch);
  const customerFormError = useCustomerFormStore((state) => state.customerFormError);

  let phone = [];
  let email = [];
  let messenger = [];

  if (locationTelephone.length) {
    const getDetailTelephone = jsonCentralized(locationTelephone);
    const newTelephone = getDetailTelephone.map((tp) => {
      return { phoneUsage: tp.usage || '', phoneNumber: tp.phoneNumber, phoneType: tp.type || '', error: tp.error };
    });
    phone = newTelephone;
  }

  if (locationEmail.length) {
    const getDetailEmail = jsonCentralized(locationEmail);
    const newEmail = getDetailEmail.map((em) => {
      return { emailUsage: em.usage || '', emailAddress: em.email, error: em.error };
    });
    email = newEmail;
  }

  if (locationMessenger.length) {
    const getDetailMessenger = jsonCentralized(locationMessenger);
    const newMessenger = getDetailMessenger.map((ms) => {
      return { messengerUsage: ms.usage || '', messengerUsageName: ms.messengerNumber, messengerType: ms.type || '', error: ms.error };
    });
    messenger = newMessenger;
  }

  const onCheckValidation = (coreData, procedure, rowIdx) => {
    const loopTelephone = (arr) => {
      arr.forEach((dt) => {
        dt.error.phoneUsageErr = !dt.phoneUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
        dt.error.phoneNumberErr = !dt.phoneNumber ? intl.formatMessage({ id: 'nomor-is-required' }) : '';
        dt.error.phoneTypeErr = !dt.phoneType ? intl.formatMessage({ id: 'type-is-required' }) : '';
      });
    };

    const loopEmail = (arr) => {
      arr.forEach((dt) => {
        dt.error.emailUsageErr = !dt.emailUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
        dt.error.emailAddressErr = !dt.emailAddress ? intl.formatMessage({ id: 'nomor-is-required' }) : '';
      });
    };

    const loopMessanger = (arr) => {
      arr.forEach((dt) => {
        dt.error.messengerUsageErr = !dt.messengerUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
        dt.error.messengerUsageNameErr = !dt.messengerUsageName ? intl.formatMessage({ id: 'nomor-is-required' }) : '';
        dt.error.messengerTypeErr = !dt.messengerType ? intl.formatMessage({ id: 'type-is-required' }) : '';
      });
    };

    if (coreData) {
      let newData = [...coreData];

      switch (procedure) {
        case 'telephones':
          if (isNaN(rowIdx)) {
            loopTelephone(newData);
            // newData.forEach((dt) => {
            //   dt.error.phoneUsageErr = !dt.phoneUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
            //   dt.error.phoneNumberErr = !dt.phoneNumber ? intl.formatMessage({ id: 'nomor-is-required' }) : '';
            //   dt.error.phoneTypeErr = !dt.phoneType ? intl.formatMessage({ id: 'type-is-required' }) : '';
            // });
          } else {
            newData[rowIdx].error.phoneUsageErr = !newData[rowIdx].phoneUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
            newData[rowIdx].error.phoneNumberErr = !newData[rowIdx].phoneNumber ? intl.formatMessage({ id: 'nomor-is-required' }) : '';
            newData[rowIdx].error.phoneTypeErr = !newData[rowIdx].phoneType ? intl.formatMessage({ id: 'type-is-required' }) : '';
          }
          phone = newData;
          break;
        case 'emails':
          if (isNaN(rowIdx)) {
            loopEmail(newData);
            // newData.forEach((dt) => {
            //   dt.error.emailUsageErr = !dt.emailUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
            //   dt.error.emailAddressErr = !dt.emailAddress ? intl.formatMessage({ id: 'nomor-is-required' }) : '';
            // });
          } else {
            newData[rowIdx].error.emailUsageErr = !newData[rowIdx].emailUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
            newData[rowIdx].error.emailAddressErr = !newData[rowIdx].emailAddress ? intl.formatMessage({ id: 'address-is-required' }) : '';
          }
          email = newData;
          break;
        case 'messengers':
          if (isNaN(rowIdx)) {
            loopMessanger(newData);
            // newData.forEach((dt) => {
            //   dt.error.messengerUsageErr = !dt.messengerUsage ? intl.formatMessage({ id: 'usage-is-required' }) : '';
            //   dt.error.messengerUsageNameErr = !dt.messengerUsageName ? intl.formatMessage({ id: 'nomor-is-required' }) : '';
            //   dt.error.messengerTypeErr = !dt.messengerType ? intl.formatMessage({ id: 'type-is-required' }) : '';
            // });
          } else {
            newData[rowIdx].error.messengerUsageErr = !newData[rowIdx].messengerUsage
              ? intl.formatMessage({ id: 'usage-is-required' })
              : '';
            newData[rowIdx].error.messengerUsageNameErr = !newData[rowIdx].messengerUsageName
              ? intl.formatMessage({ id: 'usage-name-is-required' })
              : '';
            newData[rowIdx].error.messengerTypeErr = !newData[rowIdx].messengerType ? intl.formatMessage({ id: 'type-is-required' }) : '';
          }
          messenger = newData;
          break;
      }
    } else {
      let newTele = [...phone];
      let newEmail = [...email];
      let newMessage = [...messenger];

      loopTelephone(newTele);
      loopEmail(newEmail);
      loopMessanger(newMessage);

      let isFormErr = false;
      for (let combineArr of [newTele, newEmail, newMessage]) {
        const isDetect = Boolean(combineArr.filter((dt) => Object.values(dt.error).join('') !== '').length);
        if (isDetect) {
          isFormErr = isDetect;
          break;
        }
      }

      useCustomerFormStore.setState({ customerFormError: isFormErr });
    }
  };

  const onSetCustomerDetail = (data, procedure) => {
    let newData = [...data];
    newData = newData.map((dt) => {
      let setObj = {};
      if (procedure === 'telephones') {
        setObj = { phoneNumber: dt.phoneNumber, type: dt.phoneType, usage: dt.phoneUsage };
      } else if (procedure === 'emails') {
        setObj = { email: dt.emailAddress, usage: dt.emailUsage };
      } else if (procedure === 'messengers') {
        setObj = {
          messengerNumber: dt.messengerUsageName,
          type: dt.messengerType,
          usage: dt.messengerUsage
        };
      }
      setObj = { ...setObj, error: dt.error };

      return setObj;
    });

    let isFormErr = Boolean(newData.filter((dt) => Object.values(dt.error).join('') !== '').length);
    const assignObject = { [procedure]: newData, customerFormTouch: true, customerFormError: isFormErr };

    useCustomerFormStore.setState({ ...assignObject });
  };

  const onUsageHandler = (event, idx, procedure) => {
    let data = [];

    switch (procedure) {
      case 'telephones':
        data = [...phone];
        data[idx].phoneUsage = event.target.value;
        break;
      case 'emails':
        data = [...email];
        data[idx].emailUsage = event.target.value;
        break;
      case 'messengers':
        data = [...messenger];
        data[idx].messengerUsage = event.target.value;
        break;
    }
    onCheckValidation(data, procedure);
    onSetCustomerDetail(data, procedure);
  };

  const onFieldHandler = (event, idx, procedure) => {
    let data = [];

    switch (procedure) {
      case 'telephones':
        data = [...phone];
        data[idx].phoneNumber = event.target.value;
        break;
      case 'emails':
        data = [...email];
        data[idx].emailAddress = event.target.value;
        break;
      case 'messengers':
        data = [...messenger];
        data[idx].messengerUsageName = event.target.value;
        break;
    }
    onCheckValidation(data, procedure, idx);
    onSetCustomerDetail(data, procedure);
  };

  const onTypeHandler = (event, idx, procedure) => {
    let data = [];

    switch (procedure) {
      case 'telephones':
        data = [...phone];
        data[idx].phoneType = event.target.value;
        break;
      case 'messengers':
        data = [...messenger];
        data[idx].messengerType = event.target.value;
        break;
    }

    onCheckValidation(data, procedure, idx);
    onSetCustomerDetail(data, procedure);
  };

  // Start Phone
  const onAddPhone = () => {
    const setNewData = [
      ...phone,
      { phoneUsage: '', phoneNumber: '', phoneType: '', error: { phoneUsageErr: '', phoneNumberErr: '', phoneTypeErr: '' } }
    ];

    onCheckValidation(setNewData, 'telephones');
    onSetCustomerDetail(setNewData, 'telephones');
  };

  const onDeletePhone = (i) => {
    let getPhone = [...phone];
    getPhone.splice(i, 1);

    onCheckValidation(getPhone, 'telephones');
    onSetCustomerDetail(getPhone, 'telephones');
  };
  // End Phone

  // Start Email
  const onAddEmail = () => {
    const setNewData = [...email, { emailUsage: '', emailAddress: '', error: { emailUsageErr: '', emailAddressErr: '' } }];

    onCheckValidation(setNewData, 'emails');
    onSetCustomerDetail(setNewData, 'emails');
  };

  const onDeleteEmail = (i) => {
    let getEmails = [...email];
    getEmails.splice(i, 1);

    onCheckValidation(getEmails, 'emails');
    onSetCustomerDetail(getEmails, 'emails');
  };
  // End Email

  // Start Messenger
  const onAddMessenger = () => {
    const setNewData = [
      ...messenger,
      {
        messengerUsage: '',
        messengerUsageName: '',
        messengerType: '',
        error: { messengerUsageErr: '', messengerUsageNameErr: '', messengerTypeErr: '' }
      }
    ];

    onCheckValidation(setNewData, 'messengers');
    onSetCustomerDetail(setNewData, 'messengers');
  };

  const onDeleteMessenger = (i) => {
    let getMessengers = [...messenger];
    getMessengers.splice(i, 1);

    onCheckValidation(getMessengers, 'messengers');
    onSetCustomerDetail(getMessengers, 'messengers');
  };
  // End Messenger

  const [openMenu, setOpenMenu] = useState({ el: null, type: '' });
  const [valueOpenMenu, setValueOpenMenu] = useState({ modalUsage: false, modalType: false, typeValue: '' });

  const onOpenMenu = (procedure, typeValue = '') => {
    let modalUsage = false;
    let modalType = false;
    if (procedure === 'usage') {
      modalUsage = true;
      typeValue = 'usage';
    }
    if (procedure === 'type') modalType = true;

    const newObj = { modalUsage, modalType, typeValue };
    setValueOpenMenu(newObj);
  };

  const onCloseFormDataStatic = async (val) => {
    setValueOpenMenu({ modalUsage: false, modalType: false, typeValue: '' });
    if (val) {
      const newConstruct = await getDataStaticLocation();
      useCustomerFormStore.setState({ ...newConstruct });
    }
  };

  const renderExtendedMenu = (typeMenu = '') => {
    const handleClose = () => setOpenMenu({ el: null, type: '' });

    return (
      <Stack direction="row" justifyContent="flex-end">
        <IconButton
          variant="light"
          color="secondary"
          id="basic-button"
          aria-controls={openMenu.el ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openMenu.el ? 'true' : undefined}
          onClick={(e) => setOpenMenu({ el: e?.currentTarget, type: typeMenu })}
        >
          <MoreOutlined />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={openMenu.el}
          open={Boolean(openMenu.el)}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button'
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem onClick={() => onOpenMenu('usage')}>
            <PlusCircleFilled style={{ color: '#1890ff' }} /> &nbsp;Usage
          </MenuItem>
          <MenuItem onClick={() => onOpenMenu('type', openMenu.type)}>
            <PlusCircleFilled style={{ color: '#1890ff' }} /> &nbsp;Type
          </MenuItem>
        </Menu>
      </Stack>
    );
  };

  useEffect(() => {
    if (isTouchForm) {
      onCheckValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouchForm, customerFormError, intl]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6}>
        <MainCard title={<FormattedMessage id="phone" />} secondary={renderExtendedMenu('telephone')}>
          {phone.map((dt, i) => (
            <Grid container spacing={1} key={i}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel htmlFor="status">
                    <FormattedMessage id="usage" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`phoneUsage${i}`}
                      name={`phoneUsage${i}`}
                      value={dt.phoneUsage}
                      onChange={(event) => onUsageHandler(event, i, 'telephones')}
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
                    {dt.error.phoneUsageErr.length > 0 && <FormHelperText error> {dt.error.phoneUsageErr} </FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel>Nomor</InputLabel>
                  <TextField
                    fullWidth
                    id="phoneNumber"
                    name="phoneNumber"
                    type="number"
                    placeholder={intl.formatMessage({ id: 'enter-nomor' })}
                    value={dt.phoneNumber}
                    onChange={(event) => onFieldHandler(event, i, 'telephones')}
                    error={Boolean(dt.error.phoneNumberErr && dt.error.phoneNumberErr.length > 0)}
                    helperText={dt.error.phoneNumberErr}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel htmlFor="type">
                    <FormattedMessage id="type" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`phoneType${i}`}
                      name={`phoneType${i}`}
                      defaultValue=""
                      value={dt.phoneType}
                      onChange={(event) => onTypeHandler(event, i, 'telephones')}
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
                    {dt.error.phoneTypeErr.length > 0 && <FormHelperText error> {dt.error.phoneTypeErr} </FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>

              {phone.length > 1 && (
                <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
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
            <Grid container spacing={2} key={i}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel htmlFor="usage">
                    <FormattedMessage id="usage" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`emailUsage${i}`}
                      name={`emailUsage${i}`}
                      value={dt.emailUsage}
                      onChange={(event) => onUsageHandler(event, i, 'emails')}
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
                    {dt.error.emailUsageErr.length > 0 && <FormHelperText error> {dt.error.emailUsageErr} </FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel>
                    <FormattedMessage id="address" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="emailAddress"
                    name="emailAddress"
                    value={dt.emailAddress}
                    onChange={(event) => onFieldHandler(event, i, 'emails')}
                    error={Boolean(dt.error.emailAddressErr && dt.error.emailAddressErr.length > 0)}
                    helperText={dt.error.emailAddressErr}
                  />
                </Stack>
              </Grid>

              {email.length > 1 && (
                <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
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
        <MainCard title="Messenger" secondary={renderExtendedMenu('messenger')}>
          {messenger.map((dt, i) => (
            <Grid container spacing={2} key={i}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel>
                    <FormattedMessage id="usage" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`messengerUsage${i}`}
                      name={`messengerUsage${i}`}
                      value={dt.messengerUsage}
                      onChange={(event) => onUsageHandler(event, i, 'messengers')}
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
                    {dt.error.messengerUsageErr.length > 0 && <FormHelperText error> {dt.error.messengerUsageErr} </FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel>
                    <FormattedMessage id="usage-name" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id={`messengerUsageName${i}`}
                    name={`messengerUsageName${i}`}
                    value={dt.messengerUsageName}
                    onChange={(event) => onFieldHandler(event, i, 'messengers')}
                    error={Boolean(dt.error.messengerUsageNameErr && dt.error.messengerUsageNameErr.length > 0)}
                    helperText={dt.error.messengerUsageNameErr}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1} style={{ marginTop: '10px' }}>
                  <InputLabel>Type</InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`messengerType${i}`}
                      name={`messengerType${i}`}
                      value={dt.messengerType}
                      onChange={(event) => onTypeHandler(event, i, 'messengers')}
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
                    {dt.error.messengerTypeErr.length > 0 && <FormHelperText error> {dt.error.messengerTypeErr} </FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>

              {messenger.length > 1 && (
                <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
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
      <FormDataStatic
        open={valueOpenMenu.modalUsage || valueOpenMenu.modalType}
        onClose={onCloseFormDataStatic}
        procedure={valueOpenMenu.modalUsage ? 'usage' : valueOpenMenu.modalType ? 'type' : ''}
        typeValue={valueOpenMenu.typeValue}
      />
    </Grid>
  );
};

export default TabContacts;
