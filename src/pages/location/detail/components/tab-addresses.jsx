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
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useContext, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import LocationDetailContext, { defaultDetailAddress } from '../location-detail-context';
import { jsonCentralized } from 'utils/json-centralized';
import { getCityList } from '../location-detail-header';

const TabAddresses = () => {
  // , setLocationDetailError
  const { locationDetail, setLocationDetail } = useContext(LocationDetailContext);

  const [address, setAddress] = useState([]);
  const [provinceList] = useState(locationDetail.provinceList);
  const countryList = [{ label: 'Indonesia', value: 'Indonesia' }];

  useEffect(() => {
    // fill context detail address to address
    if (locationDetail.detailAddress.length) {
      const getDetailAddress = jsonCentralized(locationDetail.detailAddress);
      console.log('getDetailAddress', getDetailAddress);

      const newAddress = getDetailAddress.map((dt) => {
        const getCityList = dt.cityList;

        dt.streetAddressError = '';
        dt.country = countryList.find((cl) => cl.value === dt.country) || null;
        dt.province = provinceList.find((cl) => cl.value === +dt.province) || null;
        dt.city = getCityList.find((cl) => cl.value === +dt.city) || null;

        return dt;
      });

      setAddress(newAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    setLocationDetail((value) => {
      return { ...value, detailAddress: newData };
    });
  };

  const onSetPrimary = (index) => {
    setAddress((value) => {
      const getAddress = [...value];
      getAddress.map((dt, idx) => {
        dt.usage = idx === index ? true : false;
        return dt;
      });

      onSetLocationDetail(getAddress);
      return getAddress;
    });
  };

  const onStreetAddress = (event, idx) => {
    setAddress((value) => {
      const getAddress = [...value];
      getAddress[idx].streetAddress = event.target.value;

      onSetLocationDetail(getAddress);
      return getAddress;
    });

    // onCheckValidation(event.target.value);
  };

  const onAdditionalInfo = (event, idx) => {
    setAddress((value) => {
      const getAddress = [...value];
      getAddress[idx].additionalInfo = event.target.value;

      onSetLocationDetail(getAddress);
      return getAddress;
    });
  };

  const onActionRegion = async (e, newValue, action, idx) => {
    let getCity = [];
    if (action === 'province' && newValue) {
      getCity = await getCityList(newValue.value);
      console.log('getCity', getCity);
    }

    setAddress((value) => {
      const getAddress = [...value];
      const newAddress = jsonCentralized(value);

      getAddress[idx][action] = newValue;
      newAddress[idx][action] = newValue ? newValue : '';

      if (action === 'province') {
        getAddress[idx].cityList = getCity;
        newAddress[idx].cityList = getCity;
      }

      console.log('newAddress', newAddress);
      onSetLocationDetail(newAddress);

      return getAddress;
    });
  };

  const onPostalCode = (event, idx) => {
    setAddress((value) => {
      const getAddress = [...value];
      getAddress[idx].postalCode = event.target.value;

      onSetLocationDetail(getAddress);
      return getAddress;
    });
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

    setAddress((value) => {
      const setNewData = [...value, initialFormAddress];

      onSetLocationDetail(setNewData);
      return setNewData;
    });
  };

  const onDeleteAddress = (i) => {
    setAddress((value) => {
      let getAddress = [...value];
      getAddress.splice(i, 1);

      onSetLocationDetail(getAddress);
      return [...getAddress];
    });
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
                      onChange={(event) => onStreetAddress(event, i)}
                      onBlur={(event) => onStreetAddress(event, i)}
                      error={dt.streetAddressError && dt.streetAddressError.length > 0}
                      helperText={dt.streetAddressError}
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
                      onChange={(event) => onAdditionalInfo(event, i)}
                      onBlur={(event) => onAdditionalInfo(event, i)}
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
                      // inputValue={dt.countryInput}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(event, value) => onActionRegion(event, value, 'country', i)}
                      // onInputChange={(event, newValue) => {
                      //   setAddress((value) => {
                      //     const getAddress = [...value];
                      //     getAddress[i].countryInput = newValue;

                      //     return getAddress;
                      //   });
                      // }}
                      // getOptionLabel={(option) => option.name || ''}
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
                      // inputValue={dt.provinceInput}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(event, value) => onActionRegion(event, value, 'province', i)}
                      // onInputChange={(event, newValue) => {
                      //   setAddress((value) => {
                      //     const getAddress = [...value];
                      //     getAddress[i].provinceInput = newValue;

                      //     return getAddress;
                      //   });
                      // }}
                      // getOptionLabel={(option) => (option ? option.name : '')}
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
                      // inputValue={dt.cityInput}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(event, value) => onActionRegion(event, value, 'city', i)}
                      // onInputChange={(event, newValue) => {
                      //   setAddress((value) => {
                      //     const getAddress = [...value];
                      //     getAddress[i].cityInput = newValue;

                      //     return getAddress;
                      //   });
                      // }}
                      // getOptionLabel={(option) => (option ? option.name : '')}
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
                      // placeholder="Postal code"
                      value={dt.postalCode}
                      onChange={(event) => onPostalCode(event, i)}
                      onBlur={(event) => onPostalCode(event, i)}
                      // error={formBasicInfo.touched.locationName && Boolean(formBasicInfo.errors.locationName)}
                      // helperText={formBasicInfo.touched.locationName && formBasicInfo.errors.locationName}
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
