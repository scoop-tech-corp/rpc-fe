import { useState } from 'react';
import { Grid, Stack, InputLabel, Select, MenuItem, FormControl, TextField, Autocomplete } from '@mui/material';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormattedMessage } from 'react-intl';
import { PlusOutlined } from '@ant-design/icons';
import { getBrandList, getSupplierList } from 'pages/product/product-list/service';
import { useProductSellDetailStore } from '../../product-sell-detail-store';

import MainCard from 'components/MainCard';
import FormBrand from 'components/FormBrand';
import FormSupplier from 'components/FormSupplier';
import IconButton from 'components/@extended/IconButton';

const BasicDetail = () => {
  const fullName = useProductSellDetailStore((state) => state.fullName);
  const simpleName = useProductSellDetailStore((state) => state.simpleName);
  const productBrand = useProductSellDetailStore((state) => state.productBrand);
  const productSupplier = useProductSellDetailStore((state) => state.productSupplier);
  const status = useProductSellDetailStore((state) => state.status);
  const sku = useProductSellDetailStore((state) => state.sku);
  const expiredDate = useProductSellDetailStore((state) => state.expiredDate);

  const productBrandList = useProductSellDetailStore((state) => state.dataSupport.brandList);
  const productSupplierList = useProductSellDetailStore((state) => state.dataSupport.supplierList);

  const [openFormBrand, setOpenFormBrand] = useState(false);
  const [openFormSupplier, setOpenFormSupplier] = useState(false);

  const onFieldHandler = (event) => {
    useProductSellDetailStore.setState({ [event.target.name]: event.target.value, productSellDetailTouch: true });
  };

  const onDropdownHandler = (selected, procedure) => {
    if (procedure === 'brand') {
      useProductSellDetailStore.setState({ productBrand: selected ? selected : '', productSellDetailTouch: true });
    } else if (procedure === 'supplier') {
      useProductSellDetailStore.setState({ productSupplier: selected ? selected : '', productSellDetailTouch: true });
    }
  };

  const onExpiredDate = (selectedDate) => {
    useProductSellDetailStore.setState({ expiredDate: selectedDate, productSellDetailTouch: true });
  };

  const onAddBrand = () => setOpenFormBrand(true);

  const onAddSupplier = () => setOpenFormSupplier(true);

  const onCloseFormBrand = async (val) => {
    if (val) {
      setOpenFormBrand(false);
      const getBrand = await getBrandList();
      useProductSellDetailStore.setState((prevState) => {
        return {
          ...prevState,
          dataSupport: {
            customerGroupsList: prevState.dataSupport.customerGroupsList,
            locationList: prevState.dataSupport.locationList,
            brandList: getBrand,
            supplierList: prevState.dataSupport.supplierList,
            productCategoryList: prevState.dataSupport.productCategoryList
          }
        };
      });
    }
  };

  const onCloseFormSupplier = async (val) => {
    if (val) {
      setOpenFormSupplier(false);
      const getSupplier = await getSupplierList();
      useProductSellDetailStore.setState((prevState) => {
        return {
          ...prevState,
          dataSupport: {
            customerGroupsList: prevState.dataSupport.customerGroupsList,
            locationList: prevState.dataSupport.locationList,
            brandList: prevState.dataSupport.brandList,
            supplierList: getSupplier,
            productCategoryList: prevState.dataSupport.productCategoryList
          }
        };
      });
    }
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="basic-detail" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
              <TextField fullWidth id="fullName" name="fullName" value={fullName} onChange={onFieldHandler} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="simpleName">{<FormattedMessage id="simple-name" />}</InputLabel>
              <TextField fullWidth id="simpleName" name="simpleName" value={simpleName} onChange={onFieldHandler} />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="sku">SKU</InputLabel>
              <TextField fullWidth id="sku" name="sku" value={sku} onChange={onFieldHandler} />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="brand" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddBrand}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="brand"
                      name="brand"
                      options={productBrandList}
                      value={productBrand}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onDropdownHandler(value, 'brand')}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="supplier" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddSupplier}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="supplier"
                      name="supplier"
                      options={productSupplierList}
                      value={productSupplier}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, value) => onDropdownHandler(value, 'supplier')}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="status">Status</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id="status" name="status" value={status || ''} onChange={onFieldHandler} placeholder="Select status">
                  <MenuItem value="">
                    <em>Select status</em>
                  </MenuItem>
                  <MenuItem value={'1'}>Active</MenuItem>
                  <MenuItem value={'0'}>Non Active</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="expired-date">
                <FormattedMessage id="expired-date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker value={expiredDate} onChange={onExpiredDate} renderInput={(params) => <TextField {...params} />} />
              </LocalizationProvider>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      <FormBrand open={openFormBrand} onClose={onCloseFormBrand} />
      <FormSupplier open={openFormSupplier} onClose={onCloseFormSupplier} />
    </>
  );
};

export default BasicDetail;
