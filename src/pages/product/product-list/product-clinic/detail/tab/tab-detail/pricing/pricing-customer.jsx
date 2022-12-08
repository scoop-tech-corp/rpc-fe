import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import IconButton from 'components/@extended/IconButton';
import NumberFormatCustom from 'utils/number-format';
import ProductClinicDetailContext from '../../../product-clinic-detail-context';

const PricingCustomer = () => {
  const { productClinicDetail, setProductClinicDetail } = useContext(ProductClinicDetailContext);
  const [customerGroup, setCustomGroup] = useState([]);
  const customerGroupDropdown = productClinicDetail.dataSupport.customerGroupsList;

  useEffect(() => {
    setCustomGroup(productClinicDetail.customerGroups);
  }, [productClinicDetail.customerGroups]);

  const onSelectCustomerGroup = (event, i) => {
    setCustomGroup((value) => {
      const getCustomGroup = [...value];
      getCustomGroup[i].customerGroupId = event.target.value;

      setProductClinicDetail((val) => {
        return { ...val, customerGroups: getCustomGroup };
      });

      return getCustomGroup;
    });
  };

  const onPrice = (event, i) => {
    const getPrice = +event.target.value.replace(',', '');

    setCustomGroup((value) => {
      const getCustomGroup = [...value];
      getCustomGroup[i].price = getPrice;

      setProductClinicDetail((val) => {
        return { ...val, customerGroups: getCustomGroup };
      });

      return getCustomGroup;
    });
  };

  const onAddCustomer = () => {
    setCustomGroup((value) => {
      const setNewData = [...value, { customerGroupId: '', price: '' }];

      setProductClinicDetail((val) => {
        return { ...val, customerGroups: setNewData };
      });
      return setNewData;
    });
  };

  const onDeleteCustomer = (i) => {
    setCustomGroup((value) => {
      const setNewData = [...value];
      setNewData.splice(i, 1);

      setProductClinicDetail((val) => {
        return { ...val, customerGroups: setNewData };
      });
      return setNewData;
    });
  };

  return (
    <>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={10}>
          {customerGroup.map((dt, i) => (
            <Grid container spacing={4} key={i}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1} style={{ marginTop: '5px' }}>
                  <InputLabel htmlFor="customer-group">
                    <FormattedMessage id="customer-group" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id={`customerGroup${i}`}
                      name={`customerGroup${i}`}
                      value={dt.customerGroupId}
                      onChange={(event) => onSelectCustomerGroup(event, i)}
                    >
                      <MenuItem value="">
                        <em>Select customer group</em>
                      </MenuItem>
                      {customerGroupDropdown.map((dt, idx) => (
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
                    onChange={(event) => onPrice(event, i)}
                    InputProps={{
                      startAdornment: 'Rp',
                      inputComponent: NumberFormatCustom
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                <IconButton size="large" color="error" onClick={() => onDeleteCustomer(i)}>
                  <DeleteFilled />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button variant="contained" onClick={onAddCustomer} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
            Add
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default PricingCustomer;
