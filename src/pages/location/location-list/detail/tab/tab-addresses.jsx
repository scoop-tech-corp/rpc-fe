import { CheckCircleOutlined, DeleteFilled, PlusOutlined } from '@ant-design/icons';
import {
  Autocomplete,
  Button,
  CardActions,
  CardContent,
  Divider,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { jsonCentralized } from 'utils/json-centralized';
import { getCityList } from '../service';
import { defaultDetailAddress, useLocationDetailStore } from '../location-detail-store';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

const TabAddresses = () => {
  const detailAddress = useLocationDetailStore((state) => state.detailAddress);
  const provinceList = useLocationDetailStore((state) => state.provinceList);
  let address = [];

  const countryList = [{ label: 'Indonesia', value: 'Indonesia' }];

  if (detailAddress.length) {
    const getDetailAddress = jsonCentralized(detailAddress);

    const newAddress = getDetailAddress.map((dt) => {
      const getCityList = dt.cityList;

      dt.streetAddressError = '';
      dt.country = countryList.find((cl) => cl.value === dt.country) || null;
      dt.province = provinceList.find((cl) => cl.value === +dt.province) || null;
      dt.city = getCityList.find((cl) => cl.value === +dt.city) || null;

      return dt;
    });

    address = newAddress;
  }

  const onSetLocationDetail = (data) => {
    let newData = [...data];
    newData = newData.map((dt) => {
      return {
        usage: dt.usage,
        streetAddress: dt.streetAddress,
        additionalInfo: dt.additionalInfo,
        country: dt.country?.value,
        province: dt.province?.value,
        city: dt.city?.value,
        postalCode: dt.postalCode,
        cityList: dt.cityList
      };
    });

    useLocationDetailStore.setState({ detailAddress: newData, locataionTouch: true });
  };

  const onSetPrimary = (index) => {
    const getAddress = [...address];
    getAddress.map((dt, idx) => {
      dt.usage = idx === index ? true : false;
      return dt;
    });

    onSetLocationDetail(getAddress);
  };

  const onTextField = (event, idx, procedure) => {
    // setAddress((value) => {
    //   const getAddress = [...value];
    //   getAddress[idx][procedure] = event.target.value;

    //   return getAddress;
    // });
    const getAddress = [...address];
    getAddress[idx][procedure] = event.target.value;
    onSetLocationDetail(getAddress);
  };

  const onActionRegion = async (newValue, action, idx) => {
    let getCity = [];
    if (action === 'province' && newValue) {
      getCity = await getCityList(newValue.value);
    }

    // const getAddress = [...value];
    const newAddress = jsonCentralized(address);

    // getAddress[idx][action] = newValue;
    newAddress[idx][action] = newValue ? newValue : '';

    if (action === 'province') {
      // getAddress[idx].cityList = getCity;
      newAddress[idx].cityList = getCity;
    }

    onSetLocationDetail(newAddress);

    // setAddress((value) => {
    //   const getAddress = [...value];
    //   const newAddress = jsonCentralized(value);

    //   getAddress[idx][action] = newValue;
    //   newAddress[idx][action] = newValue ? newValue : '';

    //   if (action === 'province') {
    //     getAddress[idx].cityList = getCity;
    //     newAddress[idx].cityList = getCity;
    //   }

    //   onSetLocationDetail(newAddress);

    //   return getAddress;
    // });
  };

  const onAddAddress = () => {
    const newObj = { ...defaultDetailAddress };
    const initialFormAddress = {
      ...newObj,
      country: countryList.find((cl) => cl.value === newObj.country) || null,
      province: provinceList.find((cl) => cl.value === newObj.province) || null,
      city: null,
      cityList: [],
      usage: false,
      streetAddressError: ''
    };

    const setNewData = [...address, initialFormAddress];
    onSetLocationDetail(setNewData);

    // setAddress((value) => {
    //   const setNewData = [...value, initialFormAddress];

    //   onSetLocationDetail(setNewData);
    //   return setNewData;
    // });
  };

  const onDeleteAddress = (i) => {
    let getAddress = [...address];
    getAddress.splice(i, 1);

    onSetLocationDetail(getAddress);

    // setAddress((value) => {
    //   let getAddress = [...value];
    //   getAddress.splice(i, 1);

    //   onSetLocationDetail(getAddress);
    //   return [...getAddress];
    // });
  };

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container justifyContent="flex-start" sx={{ position: 'relative', zIndex: 5 }}>
          <Grid
            item
            sx={{ mx: matchDownSM ? 2 : 3, my: matchDownSM ? 1 : 0, mb: matchDownSM ? 2 : 0 }}
            xs={matchDownSM ? 12 : 'auto'}
            style={{ margin: '0px' }}
          >
            <Button variant="contained" fullWidth={matchDownSM} onClick={onAddAddress} startIcon={<PlusOutlined />}>
              <FormattedMessage id="add" />
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {address.map((dt, i) => (
        <Grid item xs={12} sm={6} key={i}>
          <MainCard
            title={`Address ${i + 1}`}
            content={false}
            secondary={
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <IconButton color={dt.usage ? 'primary' : 'secondary'} size="small" onClick={() => onSetPrimary(i)}>
                  <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                </IconButton>
              </Stack>
            }
          >
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>
                      <FormattedMessage id="street-address" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="streetAddress"
                      name="streetAddress"
                      placeholder="Enter street address"
                      value={dt.streetAddress}
                      onChange={(event) => onTextField(event, i, 'streetAddress')}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>
                      <FormattedMessage id="additional-info" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="additionalInfo"
                      name="additionalInfo"
                      placeholder="Enter additional info"
                      value={dt.additionalInfo}
                      onChange={(event) => onTextField(event, i, 'additionalInfo')}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={1}>
                    <InputLabel>
                      <FormattedMessage id="country" />
                    </InputLabel>
                    <Autocomplete
                      id={`country-${i}`}
                      disablePortal
                      options={countryList}
                      value={dt.country}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onActionRegion(value, 'country', i)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={1}>
                    <InputLabel>
                      <FormattedMessage id="province" />
                    </InputLabel>
                    <Autocomplete
                      id={`province-${i}`}
                      options={provinceList}
                      value={dt.province}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onActionRegion(value, 'province', i)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={1}>
                    <InputLabel>
                      <FormattedMessage id="city" />
                    </InputLabel>
                    <Autocomplete
                      id={`city-${i}`}
                      options={dt.cityList}
                      value={dt.city}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onActionRegion(value, 'city', i)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Stack spacing={1}>
                    <InputLabel>
                      <FormattedMessage id="postal-code" />
                    </InputLabel>
                    <TextField
                      type="number"
                      fullWidth
                      id="postalCode"
                      name="postalCode"
                      value={dt.postalCode}
                      onChange={(event) => onTextField(event, i, 'postalCode')}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>

            {address.length > 1 && !dt.usage && (
              <>
                <Divider />
                <CardActions>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 1 }}>
                    <Tooltip title={`Address ${i + 1}`} placement="top">
                      <IconButton size="large" color="error" onClick={() => onDeleteAddress(i)}>
                        <DeleteFilled />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </>
            )}
          </MainCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default TabAddresses;
