import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { useState, useEffect, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import ProductSellDetailContext from '../../product-sell-detail-context';

const InventoryProduct = () => {
  const { productSellDetail, setProductSellDetail } = useContext(ProductSellDetailContext);
  const [inventoryProduct, setInventoryProduct] = useState({ selectedSellingPrice: [], locations: [] });
  const locationDropdown = productSellDetail.dataSupport.locationList;

  useEffect(() => {
    setInventoryProduct((value) => {
      return {
        ...value,
        selectedSellingPrice: productSellDetail.selectedSellingPrice,
        locations: productSellDetail.locations
      };
    });
  }, [productSellDetail]);

  const onSelectedSellingPrice = (e, val) => {
    const getSelectSellingPrice = val;
    const tempLocation = [];

    getSelectSellingPrice.forEach((sp) => {
      const findObj = inventoryProduct.locations.find((l) => l.locationId === sp.value);

      tempLocation.push({
        locationName: sp.label,
        locationId: sp.value,
        inStock: findObj ? findObj.inStock : '',
        lowStock: findObj ? findObj.lowStock : ''
      });
    });

    const setNewObj = { selectedSellingPrice: val, locations: tempLocation };

    setInventoryProduct((value) => {
      return { ...value, ...setNewObj };
    });

    setProductSellDetail((value) => {
      return { ...value, ...setNewObj };
    });
  };

  const onFieldHandler = (event, idx) => {
    setInventoryProduct((value) => {
      const getData = [...value.locations];
      getData[idx][event.target.name] = +event.target.value;

      return { ...value, locations: getData };
    });
  };

  const onBlurHandler = (event, idx) => {
    setProductSellDetail((value) => {
      const getData = [...value.locations];
      getData[idx][event.target.name] = +event.target.value;

      return { ...value, locations: getData };
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
              value={inventoryProduct.selectedSellingPrice}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={onSelectedSellingPrice}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12}>
          {inventoryProduct.locations.map((dt, i) => (
            <Grid container spacing={3} key={i}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel>
                    <FormattedMessage id="location" />
                  </InputLabel>
                  <TextField fullWidth id={`location${i}`} name={`location${i}`} value={dt.locationName} inputProps={{ readOnly: true }} />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
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
                    onBlur={(e) => onBlurHandler(e, i)}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
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
                    onBlur={(e) => onBlurHandler(e, i)}
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
