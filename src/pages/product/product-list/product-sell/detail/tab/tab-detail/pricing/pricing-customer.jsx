import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useProductSellDetailStore } from '../../../product-sell-detail-store';

import IconButton from 'components/@extended/IconButton';
import NumberFormatCustom from 'utils/number-format';

const PricingCustomer = () => {
  const customerGroups = useProductSellDetailStore((state) => state.customerGroups);
  const customerGroupDropdown = useProductSellDetailStore((state) => state.dataSupport.customerGroupsList);

  const onSelectCustomerGroup = (e, i) => {
    useProductSellDetailStore.setState((prevState) => {
      const getCustomGroup = [...prevState.customerGroups];
      getCustomGroup[i].customerGroupId = e.target.value;

      return { customerGroups: getCustomGroup, productSellDetailTouch: true };
    });
  };

  const onPrice = (event, i) => {
    const getPrice = +event.target.value.replace(',', '');

    useProductSellDetailStore.setState((prevState) => {
      const getCustomGroup = [...prevState.customerGroups];
      getCustomGroup[i].price = getPrice;

      return { customerGroups: getCustomGroup, productSellDetailTouch: true };
    });
  };

  const onAddCustomer = () => {
    useProductSellDetailStore.setState((prevState) => {
      const setNewData = [...prevState.customerGroups, { customerGroupId: '', price: '' }];

      return { customerGroups: setNewData, productSellDetailTouch: true };
    });
  };

  const onDeleteCustomer = (i) => {
    useProductSellDetailStore.setState((prevState) => {
      const setNewData = [...prevState.customerGroups];
      setNewData.splice(i, 1);

      return { customerGroups: setNewData, productSellDetailTouch: true };
    });
  };

  return (
    <>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={10}>
          {customerGroups.map((dt, i) => (
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
