import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useProductClinicDetailStore } from '../../../product-clinic-detail-store';

import IconButton from 'components/@extended/IconButton';
import NumberFormatCustom from 'utils/number-format';

const PricingLocation = () => {
  const priceLocations = useProductClinicDetailStore((state) => state.priceLocations);
  const locationDropdown = useProductClinicDetailStore((state) => state.dataSupport.locationList);

  const onSelectLocation = (event, i) => {
    useProductClinicDetailStore.setState((prevState) => {
      const getData = [...prevState.priceLocations];
      getData[i].locationId = event.target.value;

      return { priceLocations: getData, productClinicDetailTouch: true };
    });
  };

  const onPriceChange = (event, i) => {
    const getPrice = +event.target.value.replaceAll(',', '');

    useProductClinicDetailStore.setState((prevState) => {
      const getData = [...prevState.priceLocations];
      getData[i].price = getPrice;

      return { priceLocations: getData, productClinicDetailTouch: true };
    });
  };

  const onAddLocation = () => {
    useProductClinicDetailStore.setState((prevState) => {
      const setNewData = [...prevState.priceLocations, { locationId: '', price: '' }];
      return { priceLocations: setNewData, productClinicDetailTouch: true };
    });
  };

  const onDeleteLocation = (i) => {
    useProductClinicDetailStore.setState((prevState) => {
      const setNewData = [...prevState.priceLocations];
      setNewData.splice(i, 1);
      return { priceLocations: setNewData, productClinicDetailTouch: true };
    });
  };

  return (
    <>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={10}>
          {priceLocations.map((dt, i) => (
            <Grid container spacing={4} key={i}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel htmlFor="location">
                    <FormattedMessage id="location" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`location${i}`}
                      name={`location${i}`}
                      value={dt.locationId}
                      onChange={(event) => onSelectLocation(event, i)}
                    >
                      <MenuItem value="">
                        <em>Select location</em>
                      </MenuItem>
                      {locationDropdown.map((dt, idx) => (
                        <MenuItem value={dt.value} key={idx}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="price" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id={`price${i}`}
                    name={`price${i}`}
                    value={dt.price}
                    onChange={(event) => onPriceChange(event, i)}
                    InputProps={{
                      startAdornment: 'Rp',
                      inputComponent: NumberFormatCustom
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                <IconButton size="large" color="error" onClick={() => onDeleteLocation(i)}>
                  <DeleteFilled />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button variant="contained" onClick={onAddLocation} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default PricingLocation;
