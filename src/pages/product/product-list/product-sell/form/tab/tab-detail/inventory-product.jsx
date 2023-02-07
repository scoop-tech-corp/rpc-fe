import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useProductSellFormStore } from '../../product-sell-form-store';

import MainCard from 'components/MainCard';

const InventoryProduct = () => {
  const selectedSellingPrice = useProductSellFormStore((state) => state.selectedSellingPrice);
  const locations = useProductSellFormStore((state) => state.locations);
  const locationDropdown = useProductSellFormStore((state) => state.dataSupport.locationList);

  const onSelectedSellingPrice = (_, val) => {
    const getSelectSellingPrice = val;
    const tempLocation = [];

    getSelectSellingPrice.forEach((sp) => {
      const findObj = locations.find((l) => l.locationId === sp.value);

      tempLocation.push({
        locationName: sp.label,
        locationId: sp.value,
        inStock: findObj ? findObj.inStock : '',
        lowStock: findObj ? findObj.lowStock : '',
        reStockLimit: findObj ? findObj.reStockLimit : ''
      });
    });

    const setNewObj = { selectedSellingPrice: val, locations: tempLocation, productSellFormTouch: true };

    useProductSellFormStore.setState(setNewObj);
  };

  const onFieldHandler = (event, idx) => {
    useProductSellFormStore.setState((prevState) => {
      const getData = [...prevState.locations];
      getData[idx][event.target.name] = +event.target.value;

      return { locations: getData, productSellFormTouch: true };
    });
  };

  return (
    <MainCard title={<FormattedMessage id="inventory-product" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="selling-location" />
            </InputLabel>
            <Autocomplete
              id="selling-location"
              multiple
              limitTags={3}
              options={locationDropdown}
              value={selectedSellingPrice}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={onSelectedSellingPrice}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12}>
          {locations.map((dt, i) => (
            <Grid container spacing={3} key={i}>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="location" />
                  </InputLabel>
                  <TextField fullWidth id={`location${i}`} name={`location${i}`} value={dt.locationName} inputProps={{ readOnly: true }} />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="in-stock" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id={`inStock${i}`}
                    name="inStock"
                    value={dt.inStock}
                    onChange={(e) => onFieldHandler(e, i)}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="low-stock" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id={`lowStock${i}`}
                    name="lowStock"
                    value={dt.lowStock}
                    onChange={(e) => onFieldHandler(e, i)}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="restock-limit" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id={`reStockLimit${i}`}
                    name="reStockLimit"
                    value={dt.reStockLimit}
                    onChange={(e) => onFieldHandler(e, i)}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Stack>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default InventoryProduct;
