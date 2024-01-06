import { DeleteFilled, MoreOutlined, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Menu } from '@mui/material';
import { getProductSupplierMessenger, getProductSupplierPhone, getProductSupplierUsage } from '../../service';
import { jsonCentralized } from 'utils/func';
import { useProductSupplierFormStore } from '../product-supplier-form-store';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState } from 'react';

import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import FormDataStaticProductSupplier from './FormDataStaticProductSupplier';

const TabContacts = () => {
  const locationEmail = useProductSupplierFormStore((state) => state.email);
  const locationTelephone = useProductSupplierFormStore((state) => state.telephone);
  const locationMessenger = useProductSupplierFormStore((state) => state.messenger);

  const usageList = useProductSupplierFormStore((state) => state.usageList);
  const phoneTypeList = useProductSupplierFormStore((state) => state.telephoneType);
  const messengerTypeList = useProductSupplierFormStore((state) => state.messengerType);
  const intl = useIntl();

  let phone = [];
  let email = [];
  let messenger = [];

  if (locationTelephone.length) {
    const getDetailTelephone = jsonCentralized(locationTelephone);
    const newTelephone = getDetailTelephone.map((tp) => {
      return {
        phoneUsage: tp.usage || '',
        phoneNumber: tp.phoneNumber,
        phoneType: tp.type || '',
        id: +tp.id,
        productSupplierId: +tp.productSupplierId,
        status: tp.status
      };
    });
    phone = newTelephone;
  }

  if (locationEmail.length) {
    const getDetailEmail = jsonCentralized(locationEmail);
    const newEmail = getDetailEmail.map((em) => {
      return {
        emailUsage: em.usage || '',
        emailAddress: em.email,
        id: +em.id,
        productSupplierId: +em.productSupplierId,
        status: em.status
      };
    });
    email = newEmail;
  }

  if (locationMessenger.length) {
    const getDetailMessenger = jsonCentralized(locationMessenger);
    const newMessenger = getDetailMessenger.map((ms) => {
      return {
        messengerUsage: ms.usage || '',
        messengerUsageName: ms.messengerNumber,
        messengerType: ms.type || '',
        id: +ms.id,
        productSupplierId: +ms.productSupplierId,
        status: ms.status
      };
    });
    messenger = newMessenger;
  }

  const onSetContactDetail = (data, procedure) => {
    let newData = [...data];
    newData = newData.map((dt) => {
      let setObj = {};
      if (procedure === 'telephone') {
        setObj = {
          phoneNumber: dt.phoneNumber,
          type: dt.phoneType,
          usage: dt.phoneUsage,
          id: dt.id,
          productSupplierId: dt.productSupplierId,
          status: dt.status
        };
      } else if (procedure === 'email') {
        setObj = { email: dt.emailAddress, usage: dt.emailUsage, id: dt.id, productSupplierId: dt.productSupplierId, status: dt.status };
      } else if (procedure === 'messenger') {
        setObj = {
          id: dt.id,
          productSupplierId: dt.productSupplierId,
          status: dt.status,
          messengerNumber: dt.messengerUsageName,
          type: dt.messengerType,
          usage: dt.messengerUsage
        };
      }

      return setObj;
    });

    const assignObject = { [procedure]: newData, productSupplierFormTouch: true };

    useProductSupplierFormStore.setState({ ...assignObject });
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

    onSetContactDetail(data, procedure);
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

    onSetContactDetail(data, procedure);
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

    onSetContactDetail(data, procedure);
  };

  // Start Phone
  const onAddPhone = () => {
    const setNewData = [...phone, { id: '', productSupplierId: '', status: '', phoneUsage: '', phoneNumber: '', phoneType: '' }];
    onSetContactDetail(setNewData, 'telephone');
  };

  const onDeletePhone = (i) => {
    let getPhone = [...phone];
    getPhone[i].status = 'del';
    // getPhone.splice(i, 1);

    onSetContactDetail(getPhone, 'telephone');
  };
  // End Phone

  // Start Email
  const onAddEmail = () => {
    const setNewData = [...email, { id: '', productSupplierId: '', status: '', emailUsage: '', emailAddress: '' }];
    onSetContactDetail(setNewData, 'email');
  };

  const onDeleteEmail = (i) => {
    let getEmails = [...email];
    getEmails[i].status = 'del';
    // getEmails.splice(i, 1);

    onSetContactDetail(getEmails, 'email');
  };
  // End Email

  // Start Messenger
  const onAddMessenger = () => {
    const setNewData = [
      ...messenger,
      { id: '', productSupplierId: '', status: '', messengerUsage: '', messengerUsageName: '', messengerType: '' }
    ];
    onSetContactDetail(setNewData, 'messenger');
  };

  const onDeleteMessenger = (i) => {
    let getMessengers = [...messenger];
    getMessengers[i].status = 'del';
    // getMessengers.splice(i, 1);

    onSetContactDetail(getMessengers, 'messenger');
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
      const getUsageList = await getProductSupplierUsage();
      const getPhoneList = await getProductSupplierPhone();
      const getMessengerList = await getProductSupplierMessenger();

      useProductSupplierFormStore.setState({
        usageList: getUsageList,
        telephoneType: getPhoneList,
        messengerType: getMessengerList
      });
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

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6}>
        <MainCard title={<FormattedMessage id="phone" />} secondary={renderExtendedMenu('telephone')}>
          {phone.map((dt, i) => {
            if (dt.status === '') {
              return (
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
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
                      <InputLabel>Nomor</InputLabel>
                      <TextField
                        fullWidth
                        id="phoneNumber"
                        name="phoneNumber"
                        type="number"
                        placeholder={intl.formatMessage({ id: 'enter-nomor' })}
                        value={dt.phoneNumber}
                        onChange={(event) => onFieldHandler(event, i, 'telephone')}
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
                    <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                      <IconButton size="large" color="error" onClick={() => onDeletePhone(i)}>
                        <DeleteFilled />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              );
            }
          })}

          <Button variant="contained" onClick={onAddPhone} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </MainCard>
      </Grid>

      <Grid item xs={12} sm={6}>
        <MainCard title="Email">
          {email.map((dt, i) => {
            if (dt.status === '') {
              return (
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
                        onChange={(event) => onFieldHandler(event, i, 'email')}
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
              );
            }
          })}

          <Button variant="contained" onClick={onAddEmail} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Messenger" secondary={renderExtendedMenu('messenger')}>
          {messenger.map((dt, i) => {
            if (dt.status === '') {
              return (
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
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
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
                  <Grid item xs={12} sm={4}>
                    <Stack spacing={1} style={{ marginTop: '10px' }}>
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
                    <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                      <IconButton size="large" color="error" onClick={() => onDeleteMessenger(i)}>
                        <DeleteFilled />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              );
            }
          })}

          <Button variant="contained" onClick={onAddMessenger} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </MainCard>
      </Grid>
      <FormDataStaticProductSupplier
        open={valueOpenMenu.modalUsage || valueOpenMenu.modalType}
        onClose={onCloseFormDataStatic}
        procedure={valueOpenMenu.modalUsage ? 'usage' : valueOpenMenu.modalType ? 'type' : ''}
        typeValue={valueOpenMenu.typeValue}
      />
    </Grid>
  );
};

export default TabContacts;
