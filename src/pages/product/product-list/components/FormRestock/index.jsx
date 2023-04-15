import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField, Autocomplete, Chip } from '@mui/material';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createMessageBackend } from 'service/service-global';
import { createProductRestock, getSupplierList } from '../../service';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import PhotoC from 'components/PhotoC';

const FormRestock = (props) => {
  const [productName] = useState(props.data.fullName);
  const [currentStock, setCurrentStock] = useState(props.data.inventory.stock);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [total, setTotal] = useState('');
  const [remark, setRemark] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierList, setSupplierList] = useState([]);
  const [date, setDate] = useState(new Date());
  const [photos, setPhotos] = useState([
    {
      id: null,
      label: '',
      imagePath: '',
      status: '',
      selectedFile: null
    }
  ]);

  const dispatch = useDispatch();

  const onSubmit = async () => {
    const parameter = {
      productId: props.data.id,
      productType: props.data.productType,
      supplierId: selectedSupplier.value,
      requireDate: date,
      reStockQuantity: restockQuantity,
      costPerItem: costPerItem,
      total: total,
      remark: remark,
      photos
    };

    await createProductRestock(parameter)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`adjustment stock product successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  const clearForm = () => {
    setCurrentStock('');
    setSelectedSupplier(null);
    setRestockQuantity('');
    setCostPerItem('');

    setTotal('');
    setRemark('');
  };

  const onCancel = () => {
    props.onClose(false);
    clearForm();
  };

  const onChangeRestockQuantity = (e) => {
    setRestockQuantity(e.target.value);
    calculateTotal({ restockQuantity: e.target.value });
  };

  const onChangeCostPerItem = (e) => {
    setCostPerItem(e.target.value);
    calculateTotal({ costPerItem: e.target.value });
  };

  const calculateTotal = (property) => {
    const getRestockQuantity = !isNaN(property.restockQuantity) ? property.restockQuantity : restockQuantity;
    const getCostPerItem = !isNaN(property.costPerItem) ? property.costPerItem : costPerItem;
    let result = '';

    result = getRestockQuantity * getCostPerItem;

    setTotal(result);
  };

  const onChangeSupplier = () => {};

  const isDisabled = () => {
    return isNaN(restockQuantity) || isNaN(costPerItem) || !date || !remark;
  };

  const getData = async () => {
    const getSupplier = await getSupplierList();
    setSupplierList(getSupplier);
    setSelectedSupplier(getSupplier && getSupplier.length ? getSupplier.find((s) => s.value === props.data.details.supplierId) : null);
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="restock-product" />}
      okText={<FormattedMessage id="save" />}
      cancelText={<FormattedMessage id="cancel" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={isDisabled()}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="md"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="product-name">{<FormattedMessage id="product-name" />}</InputLabel>
            <TextField
              fullWidth
              id="productName"
              name="productName"
              value={productName}
              inputProps={{ readOnly: true }}
              placeholder="Whiskas food 20kg"
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
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
              {props.data.inventory.status === 'no stock' ? (
                <Chip color="error" label="No Stock" size="small" variant="light" />
              ) : props.data.inventory.status === 'low stock' ? (
                <Chip color="warning" label="Low Stock" size="small" variant="light" />
              ) : (
                <Chip color="default" label="-" size="small" variant="light" />
              )}
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="supplier">
              <FormattedMessage id="supplier" />
            </InputLabel>
            <Autocomplete
              id="dropdown-supplier"
              limitTags={1}
              options={supplierList}
              value={selectedSupplier}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => onChangeSupplier(value)}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="require-date">
              <FormattedMessage id="require-date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker value={date} onChange={(value) => setDate(value)} renderInput={(params) => <TextField {...params} />} />
            </LocalizationProvider>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
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
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
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
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="total">Total</InputLabel>
            <TextField fullWidth type="number" id="total" name="total" value={total} inputProps={{ readOnly: true }} />
          </Stack>
        </Grid>
        <Grid item xs={12}>
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
        <Grid item xs={12}>
          <InputLabel htmlFor="image" style={{ marginBottom: '10px' }}>
            {<FormattedMessage id="image" />}
          </InputLabel>
          <PhotoC photoValue={photos} photoOutput={(event) => setPhotos(event)} />
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormRestock.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormRestock;
