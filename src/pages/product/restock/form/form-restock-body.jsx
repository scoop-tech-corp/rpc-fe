import {
  Autocomplete,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  FormHelperText,
  Button,
  Chip
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { getAllState, useFormRestockStore } from './form-restock-store';
import { getProductClinicDropdown, getProductSellDropdown, getSupplierList } from 'pages/product/product-list/service';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DeleteFilled, EyeFilled, PlusOutlined, EditFilled } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { formateDateYYYMMDD } from 'utils/func';

import MainCard from 'components/MainCard';
import FormSupplier from 'components/FormSupplier';
import PhotoC from 'components/PhotoC';
import IconButton from 'components/@extended/IconButton';
import ModalImages from './modal-images';
import ModalEditProductRestock from './modal-edit';

const configCoreErr = {
  productLocationErr: '',
  productTypeErr: '',
  productNameErr: '',
  supplierIdErr: '',
  requireDateErr: '',
  restockQuantityErr: '',
  costPerItemErr: '',
  productDetailsErr: ''
};
const FormRestockBody = () => {
  const productLocationList = useFormRestockStore((state) => state.locationList);
  const productLocation = useFormRestockStore((state) => state.productLocation);
  const productType = useFormRestockStore((state) => state.productType);

  const productNameList = useFormRestockStore((state) => state.productNameList);
  const productId = useFormRestockStore((state) => state.productId);

  const supplierList = useFormRestockStore((state) => state.supplierList);
  const supplierId = useFormRestockStore((state) => state.supplierId);

  const requireDate = useFormRestockStore((state) => state.requireDate);
  const currentStock = useFormRestockStore((state) => state.currentStock);
  const statusStock = useFormRestockStore((state) => state.statusStock);
  const restockQuantity = useFormRestockStore((state) => state.reStockQuantity);
  const costPerItem = useFormRestockStore((state) => state.costPerItem);
  const total = useFormRestockStore((state) => state.total);
  const remark = useFormRestockStore((state) => state.remark);

  const images = useFormRestockStore((state) => state.images);
  const productDetails = useFormRestockStore((state) => state.productDetails);
  // const [newProductDetails] = useState(productDetails.filter((pd) => pd.status == ''));
  const newProductDetails = productDetails.filter((pd) => pd.status == '');

  const [openFormSupplier, setOpenFormSupplier] = useState(false);
  const [openImages, setOpenImages] = useState({ isOpen: false, images: [] });
  const [productRestockErr, setProductRestockErr] = useState(configCoreErr);
  const [openEdit, setOpenEdit] = useState({ isOpen: false, data: null });
  const intl = useIntl();

  const checkDuplicateProductAndSupplierExist = () => {
    const getProductDetails = [...getAllState().productDetails];
    const newPD = getProductDetails.filter((pd) => pd.status == '' && pd.productId == productId.value && pd.supplierId == supplierId.value);
    return newPD.length > 0;
  };

  const onCheckValidation = () => {
    const getProductLoc = getAllState().productLocation;
    const getProductType = getAllState().productType;
    const getProductId = getAllState().productId;
    const getSupplierId = getAllState().supplierId;

    const getRequireDate = getAllState().requireDate;
    const getRestockQty = getAllState().reStockQuantity;
    const getCostPerItem = getAllState().costPerItem;

    let getProductDetails = [...getAllState().productDetails];
    const newPD = getProductDetails.filter((pd) => pd.status == '');

    let getProductLocErr = '';
    let getProductTypeErr = '';
    let getProductIdErr = '';
    let getSupplierIdErr = '';
    let getRequireDateErr = '';
    let getRestockQtyErr = '';
    let getCostPerItemErr = '';
    let getProductDetailErr = '';

    if (!getProductLoc) {
      getProductLocErr = intl.formatMessage({ id: 'product-location-is-required' });
    }

    if (!getProductType) {
      getProductTypeErr = intl.formatMessage({ id: 'product-type-is-required' });
    }

    if (!getProductId) {
      getProductIdErr = intl.formatMessage({ id: 'product-name-is-required' });
    }

    if (!getSupplierId) {
      getSupplierIdErr = intl.formatMessage({ id: 'supplier-is-required' });
    }

    if (!getRequireDate) {
      getRequireDateErr = intl.formatMessage({ id: 'require-date-is-required' });
    }

    if (!getRestockQty) {
      getRestockQtyErr = intl.formatMessage({ id: 'restock-quantity-is-required' });
    } else if (+getRestockQty <= 0) {
      getRestockQtyErr = intl.formatMessage({ id: 'restock-quantity-cannot-input-last-than-or-equal-zero' });
    }

    if (!getCostPerItem) {
      getCostPerItemErr = intl.formatMessage({ id: 'cost-per-item-is-required' });
    }

    if (!newPD.length) {
      getProductDetailErr = intl.formatMessage({ id: 'product-details-is-required' });
    }

    if (
      getProductLocErr ||
      getProductTypeErr ||
      getProductIdErr ||
      getSupplierIdErr ||
      getRequireDateErr ||
      getRestockQtyErr ||
      getCostPerItemErr ||
      getProductDetailErr
    ) {
      setProductRestockErr({
        productLocationErr: getProductLocErr ?? '',
        productTypeErr: getProductTypeErr ?? '',
        productNameErr: getProductIdErr ?? '',
        supplierIdErr: getSupplierIdErr ?? '',
        requireDateErr: getRequireDateErr ?? '',
        restockQuantityErr: getRestockQtyErr ?? '',
        costPerItemErr: getCostPerItemErr ?? '',
        productDetailsErr: getProductDetailErr ?? ''
      });
      useFormRestockStore.setState({ formRestockError: true });
    } else {
      setProductRestockErr(configCoreErr);
      useFormRestockStore.setState({ formRestockError: false });
    }
  };

  const onSelectDropdown = (selected, procedure) => {
    useFormRestockStore.setState({ [procedure]: selected ? selected : null, formRestockTouch: true });

    if (procedure === 'productLocation') {
      getProductNameList();
    } else if (procedure === 'productId' && selected) {
      const getInfoProduct = productNameList.find((list) => list.value === selected.value);
      useFormRestockStore.setState({ currentStock: getInfoProduct.data.inStock, statusStock: getInfoProduct.data.status.toLowerCase() });
    }

    onCheckValidation();
  };

  const getProductNameList = async (productTypeValue) => {
    const getProductType = productTypeValue ?? productType;

    if (productLocation) {
      if (getProductType === 'productClinic') {
        const getList = await getProductClinicDropdown(productLocation.value);
        useFormRestockStore.setState({ productNameList: getList });
      } else if (getProductType === 'productSell') {
        const getList = await getProductSellDropdown(productLocation.value);
        useFormRestockStore.setState({ productNameList: getList });
      }
    }
  };

  const onProductType = async (event) => {
    const getValue = event.target.value;
    useFormRestockStore.setState({
      productType: getValue,
      formRestockTouch: true
    });

    getProductNameList(getValue);
    onCheckValidation();
  };

  const onChangeRestockQuantity = (e) => {
    useFormRestockStore.setState({ reStockQuantity: e.target.value, formRestockTouch: true });
    calculateTotal({ restockQuantity: e.target.value });
  };

  const onChangeCostPerItem = (e) => {
    useFormRestockStore.setState({ costPerItem: e.target.value, formRestockTouch: true });
    calculateTotal({ costPerItem: e.target.value });
  };

  const calculateTotal = (property) => {
    let result = '';
    const getRestockQuantity = !isNaN(property.restockQuantity) ? property.restockQuantity : restockQuantity;
    const getCostPerItem = !isNaN(property.costPerItem) ? property.costPerItem : costPerItem;

    result = getRestockQuantity * getCostPerItem;

    useFormRestockStore.setState({ total: result, formRestockTouch: true });
    onCheckValidation();
  };

  const onCloseFormSupplier = async (val) => {
    if (val) {
      setOpenFormSupplier(false);

      const getSupplier = await getSupplierList();
      useFormRestockStore.setState({ supplierList: getSupplier });
      onCheckValidation();
    }
  };

  const isDisabledBtnProductList = () => {
    return !productType || !supplierId || !requireDate || isNaN(restockQuantity) || restockQuantity <= 0 || isNaN(costPerItem);
  };

  const onAddProduct = () => {
    if (checkDuplicateProductAndSupplierExist()) {
      setProductRestockErr((prev) => ({
        ...prev,
        productDetailsErr: intl.formatMessage({ id: 'product-details-duplicate' })
      }));
      useFormRestockStore.setState({ formRestockError: true });
      return;
    }

    const newRequireDate = requireDate ? formateDateYYYMMDD(new Date(requireDate)) : '';

    const tempProductDetail = {
      id: '',
      index: productDetails.length,
      productId: productId.value,
      productType: productType,
      productName: productId.label,
      supplier: supplierId.label,
      supplierId: supplierId.value,
      requireDate: newRequireDate,
      currentStock: currentStock,
      restockQuantity: restockQuantity,
      costPerItem: costPerItem,
      total: total,
      remark: remark,
      images: images,
      totalImage: images.filter((dt) => dt.status !== 'del').length,
      status: ''
    };

    useFormRestockStore.setState((prevState) => {
      return {
        productId: null,
        productType: '',
        supplierId: null,
        requireDate: null,
        reStockQuantity: '',
        costPerItem: '',
        currentStock: '',
        statusStock: '',
        total: '',
        remark: '',
        images: [
          {
            id: null,
            label: '',
            imagePath: '',
            status: '',
            originalName: '',
            selectedFile: null
          }
        ],
        productDetails: [...prevState.productDetails, tempProductDetail]
      };
    });

    const getProductDetails = getAllState().productDetails;
    const newPD = getProductDetails.filter((pd) => pd.status == '');
    let getProductDetailErr = '';

    if (!newPD.length) {
      getProductDetailErr = intl.formatMessage({ id: 'product-details-is-required' });
    }

    setProductRestockErr((prevState) => {
      return { ...prevState, productDetailsErr: getProductDetailErr ?? '' };
    });
    useFormRestockStore.setState({ formRestockError: getProductDetailErr ? true : false });
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
      { Header: <FormattedMessage id="supplier" />, accessor: 'supplier', isNotSorting: true },
      { Header: <FormattedMessage id="require-date" />, accessor: 'requireDate', isNotSorting: true },
      { Header: <FormattedMessage id="current-stock" />, accessor: 'currentStock', isNotSorting: true },
      { Header: <FormattedMessage id="restock-quantity" />, accessor: 'restockQuantity', isNotSorting: true },
      { Header: <FormattedMessage id="cost-per-item" />, accessor: 'costPerItem', isNotSorting: true },
      { Header: 'Total', accessor: 'total', isNotSorting: true },
      { Header: <FormattedMessage id="remark" />, accessor: 'remark', isNotSorting: true },
      {
        Header: <FormattedMessage id="image" />,
        accessor: 'images',
        isNotSorting: true,
        Cell: (data) => {
          return (
            <IconButton
              size="large"
              color="info"
              onClick={() => {
                setOpenImages({ isOpen: true, images: data.row.original.images });
              }}
            >
              <EyeFilled />
            </IconButton>
          );
        }
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const rowData = data.row.original;

          const onDeleteProductList = () => {
            useFormRestockStore.setState((prevState) => {
              const newData = [...prevState.productDetails];
              newData[rowData.index].status = 'del';
              // newData.splice(dt.row.index, 1);

              return { productDetails: newData };
            });

            if (!getAllState().productDetails.filter((pd) => pd.status == '').length) {
              onCheckValidation();
            }
          };
          return (
            <>
              <Stack spacing={1} flexDirection={'row'} alignItems={'baseline'} justifyContent={'center'}>
                {rowData.id && (
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => {
                      const dataForEdit = {
                        ...rowData,
                        productLocationId: getAllState().productLocation.value,
                        productLocationList: getAllState().locationList,
                        supplierList: getAllState().supplierList
                      };
                      setOpenEdit({ isOpen: true, data: dataForEdit });
                    }}
                  >
                    <EditFilled />
                  </IconButton>
                )}
                <IconButton size="large" color="error" onClick={() => onDeleteProductList()}>
                  <DeleteFilled />
                </IconButton>
              </Stack>
            </>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <MainCard border={false} boxShadow>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="product-location">
                  <FormattedMessage id="product-location" />
                </InputLabel>
                <Autocomplete
                  id="product-location"
                  options={productLocationList}
                  value={productLocation}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onSelectDropdown(value, 'productLocation')}
                  disabled={Boolean(productDetails.length)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(productRestockErr.productLocationErr && productRestockErr.productLocationErr.length > 0)}
                      helperText={productRestockErr.productLocationErr}
                      variant="outlined"
                    />
                  )}
                />
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
                  {productRestockErr.productTypeErr.length > 0 && (
                    <FormHelperText error> {productRestockErr.productTypeErr} </FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productName">
                  <FormattedMessage id="product-name" />
                </InputLabel>
                <Autocomplete
                  id="product-name"
                  options={productNameList}
                  value={productId}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onSelectDropdown(value, 'productId')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(productRestockErr.productNameErr && productRestockErr.productNameErr.length > 0)}
                      helperText={productRestockErr.productNameErr}
                      variant="outlined"
                    />
                  )}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <InputLabel htmlFor="supplier">
                    <FormattedMessage id="supplier" />
                  </InputLabel>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenFormSupplier(true)}>
                    <FormattedMessage id="add" />
                  </Button>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Autocomplete
                    id="dropdown-supplier"
                    options={supplierList}
                    value={supplierId}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, value) => onSelectDropdown(value, 'supplierId')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(productRestockErr.supplierIdErr && productRestockErr.supplierIdErr.length > 0)}
                        helperText={productRestockErr.supplierIdErr}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="require-date">
                  <FormattedMessage id="require-date" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    value={requireDate}
                    onChange={(value) => {
                      useFormRestockStore.setState({ requireDate: value });
                      onCheckValidation();
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(productRestockErr.requireDateErr && productRestockErr.requireDateErr.length > 0)}
                        helperText={productRestockErr.requireDateErr}
                        variant="outlined"
                      />
                    )}
                  />
                </LocalizationProvider>
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="currentStock">{<FormattedMessage id="current-stock" />}</InputLabel>
                <Stack spacing={1} flexDirection="row">
                  <TextField
                    fullWidth
                    type="number"
                    id="currentStock"
                    name="currentStock"
                    value={currentStock}
                    inputProps={{ readOnly: true }}
                    style={{ marginRight: '5px' }}
                  />

                  {statusStock === 'no stock' ? (
                    <Chip color="error" label="No Stock" size="small" variant="light" />
                  ) : statusStock === 'low stock' ? (
                    <Chip color="warning" label="Low Stock" size="small" variant="light" />
                  ) : (
                    ''
                  )}
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="restock-quantity">{<FormattedMessage id="restock-quantity" />}</InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="restock-quantity"
                  name="restock-quantity"
                  value={restockQuantity}
                  onChange={onChangeRestockQuantity}
                  inputProps={{ min: 0 }}
                  error={Boolean(productRestockErr.restockQuantityErr && productRestockErr.restockQuantityErr.length > 0)}
                  helperText={productRestockErr.restockQuantityErr}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="cost-per-item">{<FormattedMessage id="cost-per-item" />}</InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="cost-per-item"
                  name="cost-per-item"
                  value={costPerItem}
                  onChange={onChangeCostPerItem}
                  inputProps={{ min: 0 }}
                  error={Boolean(productRestockErr.costPerItemErr && productRestockErr.costPerItemErr.length > 0)}
                  helperText={productRestockErr.costPerItemErr}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="total">Total</InputLabel>
                <TextField fullWidth type="number" id="total" name="total" value={total} inputProps={{ readOnly: true }} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="remark">{<FormattedMessage id="remark" />}</InputLabel>
                <TextField
                  fullWidth
                  id="remark"
                  name="remark"
                  value={remark}
                  onChange={(e) => {
                    useFormRestockStore.setState({ remark: e.target.value, formRestockTouch: true });
                    onCheckValidation();
                  }}
                  inputProps={{ maxLength: 400 }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <InputLabel htmlFor="image" style={{ marginBottom: '10px' }}>
                {<FormattedMessage id="image" />}
              </InputLabel>
              <PhotoC
                photoValue={images}
                photoOutput={(event) => {
                  useFormRestockStore.setState({ images: event, formRestockTouch: true });
                  onCheckValidation();
                }}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack spacing={1} flexDirection={'row'} justifyContent={'space-between'}>
                <FormHelperText error>{productRestockErr.productDetailsErr} </FormHelperText>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onAddProduct} disabled={isDisabledBtnProductList()}>
                  <FormattedMessage id="product" />
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <ReactTable columns={columns} data={newProductDetails} />
            </Grid>
          </Grid>
        </Container>
      </MainCard>
      <FormSupplier open={openFormSupplier} onClose={onCloseFormSupplier} />

      {openImages.isOpen && (
        <ModalImages open={openImages.isOpen} images={openImages.images} onClose={() => setOpenImages({ isOpen: false, images: [] })} />
      )}
      {openEdit.isOpen && (
        <ModalEditProductRestock
          open={openEdit.isOpen}
          data={openEdit.data}
          onClose={(resp) => {
            setOpenEdit({ isOpen: false, data: null });

            if (resp) {
              const currentProductDetails = [...getAllState().productDetails];
              const findIdx = currentProductDetails.findIndex((pd) => +pd.id == resp.id);
              const getObj = { ...currentProductDetails[findIdx] };

              getObj.requireDate = resp.requireDate;
              getObj.restockQuantity = resp.restockQuantity;
              getObj.costPerItem = resp.costPerItem;
              getObj.total = resp.total;
              getObj.remark = resp.remark;
              getObj.status = resp.status;
              currentProductDetails[findIdx] = getObj;

              useFormRestockStore.setState({ productDetails: currentProductDetails, formRestockTouch: true });
            }
          }}
        />
      )}
    </>
  );
};

export default FormRestockBody;
