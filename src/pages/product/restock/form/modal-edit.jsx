import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grid, InputLabel, Stack, TextField } from '@mui/material'; // Autocomplete, Chip, FormControl, MenuItem, Select
// import { getProductClinicDropdown, getProductSellDropdown } from 'pages/product/product-list/service';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { formateDateYYYMMDD } from 'utils/func';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const configCoreErr = {
  requireDateErr: '',
  restockQuantityErr: '',
  costPerItemErr: ''
};

const ModalEditProductRestock = (props) => {
  const { open, data } = props;

  // const [productType, setProductType] = useState(data.productType);
  // const [productNameList, setProductNameList] = useState([]);
  // const [productId, setProductId] = useState();
  // const [supplierList] = useState(data.supplierList);
  // const [supplierId, setSupplierId] = useState(supplierList.find((dt) => +dt.value == data.supplierId));
  const [requireDate, setRequireDate] = useState(data.requireDate);
  // const [currentStock, setCurrentStock] = useState(data.currentStock);
  // const [statusStock, setStatusStock] = useState();
  const [restockQuantity, setRestockQuantity] = useState(data.restockQuantity);
  const [costPerItem, setCostPerItem] = useState(data.costPerItem);
  const [total, setTotal] = useState(data.total);
  const [remark, setRemark] = useState(data.remark);
  const [isDisabledForm, setIsDisabledForm] = useState(true);
  const intl = useIntl();

  // const [images] = useState();
  // const images = useFormRestockStore((state) => state.images);

  const [productRestockErr, setProductRestockErr] = useState(configCoreErr);

  const onCancel = () => {
    props.onClose('');
  };

  // const getProductNameList = async () => {
  //   setProductId(null);

  //   if (data.productLocationId) {
  //     let getList = [];
  //     if (productType === 'productClinic') {
  //       getList = await getProductClinicDropdown(data.productLocationId);
  //     } else if (productType === 'productSell') {
  //       getList = await getProductSellDropdown(data.productLocationId);
  //     }
  //     setProductNameList(getList);
  //     const findProduct = getList.find((dt) => +dt.value == +data.productId);
  //     if (findProduct) {
  //       console.log('findProduct', findProduct);
  //       setProductId(findProduct);
  //       setStatusStock(findProduct.data.status.toLowerCase());
  //     }
  //   }
  // };

  // const onSelectDropdown = (selected, procedure) => {
  //   if (procedure === 'supplierId') {
  //     setSupplierId(selected);
  //   } else if (procedure === 'productId' && selected) {
  //     setProductId(selected);
  //     const getInfoProduct = productNameList.find((list) => list.value === selected.value);
  //     setCurrentStock(getInfoProduct.data.inStock);
  //     setStatusStock(getInfoProduct.data.status.toLowerCase());
  //   }
  // };

  // const onProductType = async (event) => {
  //   const getValue = event.target.value;
  //   setProductType(getValue);
  //   getProductNameList(getValue);
  // };

  const onChangeRestockQuantity = (e) => {
    // useFormRestockStore.setState({ reStockQuantity: e.target.value, formRestockTouch: true });
    setRestockQuantity(e.target.value);
    calculateTotal({ restockQuantity: e.target.value });
  };

  const onChangeCostPerItem = (e) => {
    // useFormRestockStore.setState({ costPerItem: e.target.value, formRestockTouch: true });
    setCostPerItem(e.target.value);
    calculateTotal({ costPerItem: e.target.value });
  };

  const calculateTotal = (property) => {
    let result = '';
    const getRestockQuantity = !isNaN(property.restockQuantity) ? property.restockQuantity : restockQuantity;
    const getCostPerItem = !isNaN(property.costPerItem) ? property.costPerItem : costPerItem;

    result = getRestockQuantity * getCostPerItem;

    setTotal(result);
  };

  const onSubmit = () => {
    const newRequireDate = requireDate ? formateDateYYYMMDD(new Date(requireDate)) : '';

    const finalData = {
      id: data.id,
      // productType,
      // productId,
      // supplierId,
      requireDate: newRequireDate,
      // currentStock,
      // statusStock,
      restockQuantity,
      costPerItem,
      total,
      remark,
      status: ''
    };

    props.onClose(finalData);
  };

  const onCheckValidation = () => {
    let getRequireDateErr = '';
    let getRestockQtyErr = '';
    let getCostPerItemErr = '';

    if (!requireDate) {
      getRequireDateErr = intl.formatMessage({ id: 'require-date-is-required' });
    }

    if (!restockQuantity) {
      getRestockQtyErr = intl.formatMessage({ id: 'restock-quantity-is-required' });
    } else if (+restockQuantity <= 0) {
      getRestockQtyErr = intl.formatMessage({ id: 'restock-quantity-cannot-input-last-than-or-equal-zero' });
    }

    if (!costPerItem) {
      getCostPerItemErr = intl.formatMessage({ id: 'cost-per-item-is-required' });
    }

    if (getRequireDateErr || getRestockQtyErr || getCostPerItemErr) {
      setProductRestockErr({
        requireDateErr: getRequireDateErr ?? '',
        restockQuantityErr: getRestockQtyErr ?? '',
        costPerItemErr: getCostPerItemErr ?? ''
      });
      setIsDisabledForm(true);
    } else {
      setProductRestockErr(configCoreErr);
      setIsDisabledForm(false);
    }
  };

  useEffect(() => {
    onCheckValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireDate, restockQuantity, costPerItem, total]);

  return (
    <ModalC
      title={<FormattedMessage id="form-edit" />}
      okText="Save"
      cancelText="Cancel"
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      disabledOk={isDisabledForm}
      fullWidth
      maxWidth="lg"
    >
      <Grid container spacing={2}>
        {/* <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="productType">
              <FormattedMessage id="product-type" />
            </InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select id="productType" name="productType" value={productType} onChange={onProductType} placeholder="Select type">
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
        </Grid> */}

        {/* <Grid item xs={12} md={12}>
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
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid> */}

        {/* <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="supplier">
              <FormattedMessage id="supplier" />
            </InputLabel>
            <Autocomplete
              id="dropdown-supplier"
              options={supplierList}
              value={supplierId}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => onSelectDropdown(value, 'supplierId')}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid> */}

        <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="require-date">
              <FormattedMessage id="require-date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                value={requireDate}
                onChange={(value) => {
                  // useFormRestockStore.setState({ requireDate: value });
                  setRequireDate(value);
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

        {/* <Grid item xs={12} md={12}>
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
        </Grid> */}

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
              onChange={(e) => setRemark(e.target.value)}
              inputProps={{ maxLength: 400 }}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

ModalEditProductRestock.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ModalEditProductRestock;
