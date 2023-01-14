import {
  Grid,
  Container,
  Stack,
  InputLabel,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  Button,
  FormHelperText
} from '@mui/material';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useProductInventoryDetailStore, getAllState } from './product-inventory-detail-store';
import { getProductClinicDropdown, getProductSellDropdown, getProductUsage } from '../../service';
import { DeleteFilled, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import { ReactTable } from 'components/third-party/ReactTable';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormUsage from './components/FormUsage';

const FormProductInventory = () => {
  const requirementName = useProductInventoryDetailStore((state) => state.requirementName);
  const productLocation = useProductInventoryDetailStore((state) => state.productLocation);
  const listProduct = useProductInventoryDetailStore((state) => state.listProduct);

  const productType = useProductInventoryDetailStore((state) => state.productType);
  const productName = useProductInventoryDetailStore((state) => state.productName);
  const productUsage = useProductInventoryDetailStore((state) => state.productUsage);
  const productBrand = useProductInventoryDetailStore((state) => state.productBrand);
  const dateCondition = useProductInventoryDetailStore((state) => state.dateCondition);
  const itemCondition = useProductInventoryDetailStore((state) => state.itemCondition);

  const quantity = useProductInventoryDetailStore((state) => state.quantity);

  const productLocationList = useProductInventoryDetailStore((state) => state.locationList);
  const productNameList = useProductInventoryDetailStore((state) => state.productNameList);
  const productUsageList = useProductInventoryDetailStore((state) => state.productUsageList);
  const productBrandList = useProductInventoryDetailStore((state) => state.brandList);

  const [isModalUsage, setModalUsage] = useState(false);
  const [formError, setFormError] = useState({ nameErr: '', productLocationErr: '' });

  const onCheckValidation = () => {
    const getReqName = getAllState().requirementName;
    const getProductLocation = getAllState().productLocation;
    let reqNameErr = '';
    let productLocationErr = '';

    if (!getReqName) reqNameErr = 'Requirement name is required';
    if (!getProductLocation) productLocationErr = 'Product location is required';

    if (reqNameErr || productLocationErr) {
      setFormError((prevState) => ({ ...prevState, nameErr: reqNameErr, productLocationErr }));
      useProductInventoryDetailStore.setState({ productInventoryDetailError: true });
    } else {
      setFormError((prevState) => ({ ...prevState, nameErr: '', productLocationErr: '' }));
      useProductInventoryDetailStore.setState({ productInventoryDetailError: false });
    }
  };

  const onFieldHandler = (event) => {
    useProductInventoryDetailStore.setState({ [event.target.name]: event.target.value, productInventoryDetailTouch: true });
    onCheckValidation();
  };

  const onSelectDropdown = async (newValue, procedure) => {
    useProductInventoryDetailStore.setState({ [procedure]: newValue ? newValue : null, productInventoryDetailTouch: true });
    onCheckValidation();

    if (procedure === 'productLocation') {
      useProductInventoryDetailStore.setState({ productType: '', productName: null, productNameList: [], productBrand: null });
    }

    if (procedure === 'productBrand' && newValue) {
      if (productType === 'productClinic') {
        const getList = await getProductClinicDropdown(productLocation.value, newValue.value); // productBrand.value
        useProductInventoryDetailStore.setState({ productNameList: getList });
      } else if (productType === 'productSell') {
        const getList = await getProductSellDropdown(productLocation.value, newValue.value); // productBrand.value
        useProductInventoryDetailStore.setState({ productNameList: getList });
      }
    }
  };

  const onProductType = async (event) => {
    const getValue = event.target.value;
    useProductInventoryDetailStore.setState({ productType: getValue, productBrand: null, productInventoryDetailTouch: true });
  };

  const onAddUsage = () => setModalUsage(true);

  const onCloseUsage = async (resp) => {
    setModalUsage(false);
    if (resp) {
      const productUsageList = await getProductUsage();
      useProductInventoryDetailStore.setState({ productUsageList });
    }
  };

  const isDisabledBtnProductList = () => {
    return !productType || !productName || !productUsage || !dateCondition || !itemCondition || !quantity;
  };

  const onSelectedPhoto = (e) => {
    const getFile = e.target.files[0];
    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        useProductInventoryDetailStore.setState((prevState) => {
          const objFile = { selectedFile: getFile, label: '', status: '' };

          return { imagePath: this.result, images: [...prevState.images, objFile], productInventoryDetailTouch: true };
        });
      };
      reader.readAsDataURL(getFile);
    } else {
      document.getElementById('importImage').value = '';
      useProductInventoryDetailStore.setState({ imagePath: '' });
    }
  };

  const onAddFormAdditional = () => {
    const getData = getAllState();
    const newObj = {
      productType: getData.productType,
      productId: getData.productName.value,
      productName: getData.productName.label,
      usageId: getData.productUsage.value,
      usageName: getData.productUsage.label,
      dateCondition: new Date(getData.dateCondition).toLocaleDateString('en-CA'),
      itemCondition: getData.itemCondition,
      imagePath: getData.imagePath,
      isAnyImage: getData.imagePath ? 1 : 0,
      quantity: +getData.quantity
    };

    useProductInventoryDetailStore.setState((prevState) => ({ listProduct: [...prevState.listProduct, newObj] }));

    document.getElementById('importImage').value = '';
    useProductInventoryDetailStore.setState({
      productType: '',
      productName: null,
      productUsage: null,
      productBrand: null,
      dateCondition: null,
      itemCondition: '',
      imagePath: '',
      quantity: ''
    });
  };

  const onDeleteProductList = (data) => {
    useProductInventoryDetailStore.setState((prevState) => {
      let newData = [...prevState.listProduct];
      newData.splice(data.row.index, 1);

      let newImages = [...prevState.images];
      newImages.splice(data.row.index, 1);

      return { listProduct: newData, images: newImages };
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product-type" />,
        accessor: 'productType',
        isNotSorting: true,
        Cell: (data) => {
          if (data.value) {
            return data.value
              .split('product')
              .map((dt) => (!dt ? 'Product' : dt))
              .join(' ');
          } else {
            return '-';
          }
        }
      },
      { Header: <FormattedMessage id="product-name" />, accessor: 'productName', isNotSorting: true },
      { Header: <FormattedMessage id="usage" />, accessor: 'usageName', isNotSorting: true },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="date-condition" />, accessor: 'dateCondition', isNotSorting: true },
      { Header: <FormattedMessage id="item-condition" />, accessor: 'itemCondition', isNotSorting: true },
      {
        Header: <FormattedMessage id="image" />,
        accessor: 'imagePath',
        isNotSorting: true,
        style: {
          width: '150px'
        },
        Cell: (data) => {
          return (
            <a href="#">
              <img alt={data.value} src={data.value} width="80%" />
            </a>
          );
        }
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          return (
            <IconButton size="large" color="error" onClick={() => onDeleteProductList(data)}>
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  return (
    <>
      <MainCard border={false} boxShadow>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
                <TextField
                  fullWidth
                  id="requirementName"
                  name="requirementName"
                  value={requirementName}
                  onChange={onFieldHandler}
                  error={Boolean(formError.nameErr && formError.nameErr.length > 0)}
                  helperText={formError.nameErr}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="product-location">
                  <FormattedMessage id="product-location" />
                </InputLabel>
                <Autocomplete
                  id="product-location"
                  disablePortal
                  options={productLocationList}
                  value={productLocation}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onSelectDropdown(value, 'productLocation')}
                  renderInput={(params) => <TextField {...params} />}
                />
                {formError.productLocationErr.length > 0 && (
                  <FormHelperText error style={{ marginLeft: '14px' }}>
                    {' '}
                    {formError.productLocationErr}{' '}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productType">
                  <FormattedMessage id="product-type" />
                </InputLabel>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <Select
                    id="productType"
                    name="productType"
                    value={productType}
                    onChange={onProductType}
                    placeholder="Select type"
                    disabled={!productLocation}
                  >
                    <MenuItem value="">
                      <em>Select type</em>
                    </MenuItem>
                    <MenuItem value={'productClinic'}>
                      <FormattedMessage id="product-clinic" />
                    </MenuItem>
                    <MenuItem value={'productSell'}>
                      <FormattedMessage id="product-sell" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="brand">
                  <FormattedMessage id="brand" />
                </InputLabel>
                <Autocomplete
                  id="brand"
                  name="brand"
                  options={productBrandList}
                  value={productBrand}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onSelectDropdown(value, 'productBrand')}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productName">
                  <FormattedMessage id="product-name" />
                </InputLabel>
                <Autocomplete
                  id="product-name"
                  disablePortal
                  options={productNameList}
                  value={productName}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onSelectDropdown(value, 'productName')}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <InputLabel htmlFor="usage">
                    <FormattedMessage id="usage" />
                  </InputLabel>
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button variant="contained" startIcon={<PlusOutlined />} onClick={onAddUsage}>
                    <FormattedMessage id="add" />
                  </Button>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Autocomplete
                    id="usage"
                    disablePortal
                    options={productUsageList}
                    value={productUsage}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, value) => onSelectDropdown(value, 'productUsage')}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="date-condition">
                  <FormattedMessage id="date-condition" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    value={dateCondition}
                    onChange={(selectedDate) =>
                      useProductInventoryDetailStore.setState({ dateCondition: selectedDate, productInventoryDetailTouch: true })
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="item-condition">{<FormattedMessage id="item-condition" />}</InputLabel>
                <TextField fullWidth id="itemCondition" name="itemCondition" value={itemCondition} onChange={onFieldHandler} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="import-image">{<FormattedMessage id="import-image" />}</InputLabel>
                <input type="file" id="importImage" onChange={onSelectedPhoto} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={12}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <InputLabel htmlFor="quantity">
                    <FormattedMessage id="quantity" />
                  </InputLabel>
                </Grid>
                <Grid item xs={12} md={11}>
                  <TextField
                    fullWidth
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={onFieldHandler}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton color="primary" size="large" onClick={onAddFormAdditional} disabled={isDisabledBtnProductList()}>
                    <PlusCircleFilled />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12}>
              <ReactTable columns={columns} data={listProduct} />
            </Grid>
          </Grid>
        </Container>
      </MainCard>
      <FormUsage open={isModalUsage} onClose={onCloseUsage} />
    </>
  );
};

export default FormProductInventory;
