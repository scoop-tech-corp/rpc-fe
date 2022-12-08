import { useContext, useEffect, useState } from 'react';
import MainCard from 'components/MainCard';
import { Grid, Stack, InputLabel, Select, MenuItem, FormControl, TextField, Autocomplete, Button } from '@mui/material';
import ProductSellDetailContext from '../../product-sell-detail-context';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormattedMessage } from 'react-intl';
import { PlusOutlined } from '@ant-design/icons';
import { getBrandList, getSupplierList } from 'pages/product/product-list/service';
import FormBrand from 'components/FormBrand';
import FormSupplier from 'components/FormSupplier';

const BasicDetail = () => {
  const { productSellDetail, setProductSellDetail } = useContext(ProductSellDetailContext);
  const [basicDetail, setBasicDetail] = useState({
    fullName: '',
    simpleName: '',
    productBrand: null,
    productSupplier: null,
    status: null,
    sku: '',
    expiredDate: null
  });
  const [productBrandList] = useState(productSellDetail.dataSupport.brandList);
  const [productSupplierList] = useState(productSellDetail.dataSupport.supplierList);
  const [openFormBrand, setOpenFormBrand] = useState(false);
  const [openFormSupplier, setOpenFormSupplier] = useState(false);

  useEffect(() => {
    setBasicDetail((val) => {
      return {
        ...val,
        fullName: productSellDetail.fullName || '',
        simpleName: productSellDetail.simpleName || '',
        productBrand: productBrandList.find((pb) => pb.value === productSellDetail.productBrandId) || null,
        productSupplier: productSupplierList.find((ps) => ps.value === productSellDetail.productSupplierId) || null,
        status: productSellDetail.status,
        sku: productSellDetail.sku || '',
        expiredDate: productSellDetail.expiredDate ? new Date(productSellDetail.expiredDate) : null
      };
    });
  }, [productSellDetail, productBrandList, productSupplierList]);

  const onFieldHandler = (event) => {
    setBasicDetail((value) => {
      return { ...value, [event.target.name]: event.target.value };
    });
  };

  const onBlurHandler = (event) => {
    setProductSellDetail((value) => {
      return { ...value, [event.target.name]: event.target.value };
    });
  };

  const onSelectStatus = (e) => {
    const objStatus = { status: e.target.value };

    setBasicDetail((value) => {
      return { ...value, ...objStatus };
    });

    setProductSellDetail((value) => {
      return { ...value, ...objStatus };
    });
  };

  const onDropdownHandler = (e, selected, procedure) => {
    const keyObjectBasicInfo = procedure === 'brand' ? 'productBrand' : 'productSupplier';
    const keyObjectProductSell = procedure === 'brand' ? 'productBrandId' : 'productSupplierId';

    setBasicDetail((value) => {
      return { ...value, [keyObjectBasicInfo]: selected };
    });

    setProductSellDetail((value) => {
      return { ...value, [keyObjectProductSell]: selected ? selected.value : '' };
    });
  };

  const onExpiredDate = (selectedDate) => {
    setBasicDetail((value) => {
      return { ...value, expiredDate: selectedDate };
    });

    setProductSellDetail((value) => {
      return { ...value, expiredDate: new Date(selectedDate).toLocaleDateString('en-CA') };
    });
  };

  const onAddBrand = () => setOpenFormBrand(true);

  const onAddSupplier = () => setOpenFormSupplier(true);

  const onCloseFormBrand = async (val) => {
    if (val) {
      setOpenFormBrand(false);
      const getBrand = await getBrandList();
      setProductSellDetail((value) => {
        return {
          ...value,
          dataSupport: {
            customerGroupsList: value.dataSupport.customerGroupsList,
            locationList: value.dataSupport.locationList,
            brandList: getBrand,
            supplierList: value.dataSupport.supplierList,
            productCategoryList: value.dataSupport.productCategoryList
          }
        };
      });
    }
  };

  const onCloseFormSupplier = async (val) => {
    if (val) {
      setOpenFormSupplier(false);
      const getSupplier = await getSupplierList();
      setProductSellDetail((value) => {
        return {
          ...value,
          dataSupport: {
            customerGroupsList: value.dataSupport.customerGroupsList,
            locationList: value.dataSupport.locationList,
            brandList: value.dataSupport.brandList,
            supplierList: getSupplier,
            productCategoryList: value.dataSupport.productCategoryList
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
              <TextField
                fullWidth
                id="fullName"
                name="fullName"
                value={basicDetail.fullName}
                onChange={onFieldHandler}
                onBlur={onBlurHandler}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="simpleName">{<FormattedMessage id="simple-name" />}</InputLabel>
              <TextField
                fullWidth
                id="simpleName"
                name="simpleName"
                value={basicDetail.simpleName}
                onChange={onFieldHandler}
                onBlur={onBlurHandler}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="sku">SKU</InputLabel>
              <TextField fullWidth id="sku" name="sku" value={basicDetail.sku} onChange={onFieldHandler} onBlur={onBlurHandler} />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="brand" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onAddBrand}>
                  <FormattedMessage id="add" />
                </Button>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Autocomplete
                  id="brand"
                  name="brand"
                  options={productBrandList}
                  value={basicDetail.productBrand}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(e, value) => onDropdownHandler(e, value, 'brand')}
                  renderInput={(params) => <TextField {...params} />}
                />
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
              <Grid item xs={12} sm={3}>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onAddSupplier}>
                  <FormattedMessage id="add" />
                </Button>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Autocomplete
                  id="supplier"
                  name="supplier"
                  options={productSupplierList}
                  value={basicDetail.productSupplier}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(e, value) => onDropdownHandler(e, value, 'supplier')}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="status">Status</InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select id="status" name="status" value={basicDetail.status || ''} onChange={onSelectStatus} placeholder="Select status">
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
                <DesktopDatePicker
                  value={basicDetail.expiredDate}
                  onChange={onExpiredDate}
                  renderInput={(params) => <TextField {...params} />}
                />
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
