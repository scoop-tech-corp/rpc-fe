import { Grid, InputLabel, Stack, TextField, Autocomplete } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { getAllState, useCustomerFormStore } from '../../customer-form-store';
import { PlusOutlined } from '@ant-design/icons';
import { getCustomerGroupList, getTitleList } from 'pages/customer/service';
import { useState, useEffect } from 'react';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormTitle from '../../components/FormTitle';
import FormCustomerGroup from '../../components/FormCustomerGroup';

const configCoreErr = {
  memberNoErr: '',
  firstNameErr: '',
  branchErr: ''
};

const GeneralInfo = () => {
  const memberNo = useCustomerFormStore((state) => state.memberNo);
  const firstName = useCustomerFormStore((state) => state.firstName);
  const middleName = useCustomerFormStore((state) => state.middleName);
  const lastName = useCustomerFormStore((state) => state.lastName);
  const nickName = useCustomerFormStore((state) => state.nickName);
  const notes = useCustomerFormStore((state) => state.notes);

  const titleList = useCustomerFormStore((state) => state.titleCustomerList);
  const titleCustomerId = useCustomerFormStore((state) => state.titleCustomerId);
  const titleCustomerValue = titleList.find((tl) => tl.value === titleCustomerId) || null;

  const customerGroupList = useCustomerFormStore((state) => state.customerGroupList);
  const customerGroupId = useCustomerFormStore((state) => state.customerGroupId);
  const customerGroupValue = customerGroupList.find((tl) => tl.value === customerGroupId) || null;

  const locationId = useCustomerFormStore((state) => state.locationId);
  const locationList = useCustomerFormStore((state) => state.locationList);
  const locationValue = locationList.find((val) => val.value === locationId) || null;

  const [generalInfoErr, setGeneralInfoErr] = useState(configCoreErr);
  const [openFormTitle, setOpenFormTitle] = useState(false);
  const [openFormCustomerGroup, setOpenFormCustomerGroup] = useState(false);

  const isTouchForm = useCustomerFormStore((state) => state.customerFormTouch);
  const intl = useIntl();

  const onCheckValidation = () => {
    let getMemberNo = getAllState().memberNo;
    let getFirstName = getAllState().firstName;
    let getLocation = getAllState().locationId;

    let getMemberNoError = '';
    let getFirstNameError = '';
    let getLocationError = '';

    if (!getMemberNo) {
      getMemberNoError = intl.formatMessage({ id: 'member-no-is-required' });
    }

    if (!getFirstName) {
      getFirstNameError = intl.formatMessage({ id: 'first-name-is-required' });
    }

    if (!getLocation) {
      getLocationError = intl.formatMessage({ id: 'branch-is-required' });
    }

    if (getMemberNoError || getFirstNameError || getLocationError) {
      setGeneralInfoErr({
        memberNoErr: getMemberNoError ? getMemberNoError : '',
        firstNameErr: getFirstNameError ? getFirstNameError : '',
        branchErr: getLocationError ? getLocationError : ''
      });
    } else {
      setGeneralInfoErr(configCoreErr);
    }
  };

  const onFieldHandler = (event) => {
    useCustomerFormStore.setState({ [event.target.name]: event.target.value, customerFormTouch: true });
    onCheckValidation();
  };

  const onDropdownHandler = (selected, procedure) => {
    useCustomerFormStore.setState({ [procedure]: selected ? selected.value : null, customerFormTouch: true });
    onCheckValidation();
  };

  const onAddFormTitle = () => setOpenFormTitle(true);

  const onCloseFormTitle = async (val) => {
    if (val) {
      const getTitle = await getTitleList();
      useCustomerFormStore.setState({ titleCustomerList: getTitle });
    }
    setOpenFormTitle(false);
  };

  const onAddFormCustomerGroup = () => setOpenFormCustomerGroup(true);

  const onCloseFormCustomerGroup = async (val) => {
    if (val) {
      const getCustomerGroup = await getCustomerGroupList();
      useCustomerFormStore.setState({ customerGroupList: getCustomerGroup });
    }
    setOpenFormCustomerGroup(false);
  };

  useEffect(() => {
    if (isTouchForm) {
      onCheckValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouchForm, intl]);

  return (
    <>
      <MainCard title={<FormattedMessage id="general-info" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="no-member">{<FormattedMessage id="no-member" />}</InputLabel>
              <TextField
                fullWidth
                id="memberNo"
                name="memberNo"
                value={memberNo}
                onChange={onFieldHandler}
                // inputProps={{ maxLength: 100 }}
                error={Boolean(generalInfoErr.memberNoErr && generalInfoErr.memberNoErr.length > 0)}
                helperText={generalInfoErr.memberNoErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="first-name">{<FormattedMessage id="first-name" />}</InputLabel>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={onFieldHandler}
                inputProps={{ maxLength: 100 }}
                error={Boolean(generalInfoErr.firstNameErr && generalInfoErr.firstNameErr.length > 0)}
                helperText={generalInfoErr.firstNameErr}
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
                inputProps={{ maxLength: 100 }}
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
                inputProps={{ maxLength: 100 }}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="title" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddFormTitle}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="title"
                      options={titleList}
                      value={titleCustomerValue}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onDropdownHandler(value, 'titleCustomerId')}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
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
                inputProps={{ maxLength: 100 }}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="customer-group" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddFormCustomerGroup}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="customer-group"
                      options={customerGroupList}
                      value={customerGroupValue}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onDropdownHandler(value, 'customerGroupId')}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="branch">{<FormattedMessage id="branch" />}</InputLabel>
              <Autocomplete
                id="branch"
                options={locationList}
                value={locationValue}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onDropdownHandler(value, 'locationId')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(generalInfoErr.branchErr && generalInfoErr.branchErr.length > 0)}
                    helperText={generalInfoErr.branchErr}
                    variant="outlined"
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="notes">{<FormattedMessage id="notes" />}</InputLabel>
              <TextField fullWidth id="notes" name="notes" value={notes} onChange={onFieldHandler} inputProps={{ maxLength: 100 }} />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      <FormTitle open={openFormTitle} onClose={onCloseFormTitle} />
      <FormCustomerGroup open={openFormCustomerGroup} onClose={onCloseFormCustomerGroup} />
    </>
  );
};

export default GeneralInfo;
