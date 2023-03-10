import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useProductSellFormStore } from '../../../product-sell-form-store';

import IconButton from 'components/@extended/IconButton';
import NumberFormatCustom from 'utils/number-format';

const PricingLocation = () => {
  const priceLocations = useProductSellFormStore((state) => state.priceLocations);
  const locationDropdown = useProductSellFormStore((state) => state.dataSupport.locationList);

  const onSelectLocation = (event, i) => {
    useProductSellFormStore.setState((prevState) => {
      const getData = [...prevState.priceLocations];
      getData[i].locationId = event.target.value;

      if (getData[i].id) {
        getData[i].status = 'update';
      }

      return { priceLocations: getData, productSellFormTouch: true };
    });
  };

  const onPriceChange = (event, i) => {
    const getPrice = +event.target.value.replaceAll(',', '');

    useProductSellFormStore.setState((prevState) => {
      const getData = [...prevState.priceLocations];
      getData[i].price = getPrice;

      if (getData[i].id) {
        getData[i].status = 'update';
      }

      return { priceLocations: getData, productSellFormTouch: true };
    });
  };

  const onAddLocation = () => {
    useProductSellFormStore.setState((prevState) => {
      const setNewData = [...prevState.priceLocations, { id: '', locationId: '', price: '', status: 'new' }];
      return { priceLocations: setNewData, productSellFormTouch: true };
    });
  };

  const onDeleteLocation = (i) => {
    useProductSellFormStore.setState((prevState) => {
      const setNewData = [...prevState.priceLocations];
      setNewData[i].status = 'del';
      // setNewData.splice(i, 1);

      return { priceLocations: setNewData, productSellFormTouch: true };
    });
  };

  return (
    <>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={10}>
          {priceLocations.map(
            (dt, i) =>
              dt.status !== 'del' && (
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
              )
          )}

          <Button variant="contained" onClick={onAddLocation} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default PricingLocation;
