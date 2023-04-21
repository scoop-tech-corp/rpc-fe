import {
  Autocomplete,
  Button,
  CardActions,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import { CheckCircleOutlined, DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { defaultDetailAddress, useCustomerFormStore } from '../customer-form-store';
import { getCityList } from 'pages/location/location-list/detail/service';
import { jsonCentralized } from 'utils/func';

import MainCard from 'components/MainCard';

const TabAddress = () => {
  const theme = useTheme();
  const intl = useIntl();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const detailAddresses = useCustomerFormStore((state) => state.detailAddresses);
  const provinceList = useCustomerFormStore((state) => state.provinceList);
  const countryList = [{ label: 'Indonesia', value: 'Indonesia' }];

  let address = [];

  if (detailAddresses.length) {
    const getDetailAddress = jsonCentralized(detailAddresses);

    const newAddress = getDetailAddress.map((dt) => {
      const getCityList = dt.cityList;

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
        isPrimary: dt.isPrimary,
        streetAddress: dt.streetAddress,
        additionalInfo: dt.additionalInfo,
        country: dt.country?.value,
        province: dt.province?.value,
        city: dt.city?.value,
        postalCode: dt.postalCode,
        cityList: dt.cityList
      };
    });
    useCustomerFormStore.setState({ detailAddresses: newData, customerFormTouch: true });
  };

  const onAddAddress = () => {
    const newObj = { ...defaultDetailAddress };
    const initialFormAddress = {
      ...newObj,
      country: countryList.find((cl) => cl.value === newObj.country) || null,
      province: provinceList.find((cl) => cl.value === newObj.province) || null,
      city: null,
      cityList: [],
      isPrimary: false
    };

    const setNewData = [...address, initialFormAddress];
    onSetLocationDetail(setNewData);
  };

  const onDeleteAddress = (i) => {
    let getAddress = [...address];
    getAddress.splice(i, 1);

    onSetLocationDetail(getAddress);
  };

  const onSetPrimary = (indexSelected) => {
    const getAddress = [...address];
    getAddress.map((dt, idx) => {
      dt.isPrimary = idx === indexSelected ? true : false;
      return dt;
    });

    onSetLocationDetail(getAddress);
  };

  const onTextField = (event, idx, procedure) => {
    const getAddress = [...address];
    getAddress[idx][procedure] = event.target.value;
    onSetLocationDetail(getAddress);
  };

  const onActionRegion = async (newValue, action, idx) => {
    let getCity = [];
    if (action === 'province' && newValue) {
      getCity = await getCityList(newValue.value);
    }
    const newAddress = jsonCentralized(address);

    newAddress[idx][action] = newValue ? newValue : '';

    if (action === 'province') {
      newAddress[idx].cityList = getCity;
    }

    onSetLocationDetail(newAddress);
  };

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
        <Grid item xs={12} sm={12} key={i}>
          <MainCard
            title={`Address ${i + 1}`}
            content={false}
            secondary={
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <IconButton color={dt.isPrimary ? 'primary' : 'secondary'} size="small" onClick={() => onSetPrimary(i)}>
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
                      placeholder={intl.formatMessage({ id: 'street-address' })}
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
                      placeholder={intl.formatMessage({ id: 'additional-info' })}
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

            {address.length > 1 && !dt.isPrimary && (
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

export default TabAddress;
