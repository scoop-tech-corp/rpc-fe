import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField, Radio, RadioGroup, FormControlLabel, Autocomplete } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { splitProductSell } from 'pages/product/product-list/service';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const FormSplit = (props) => {
  const [fromProduct] = useState(props.data.fullName);
  const [toProduct, setToProduct] = useState('');
  const [toProductType, setToProductType] = useState('new');
  const [toProductExisting, setToProductExisting] = useState(null);
  const [qtyIncrease, setQtyIncrease] = useState('');
  const [qtyReduction, setQtyReduction] = useState('');
  const [isDisabledSplit, setIsDisabledSplit] = useState(true);

  const dispatch = useDispatch();

  const onSubmit = async () => {
    const productSellId = toProductExisting ? toProductExisting.value : '';
    const parameter = {
      id: props.data.id,
      fullName: toProduct,
      qtyReduction: qtyReduction,
      qtyIncrease: qtyIncrease,
      productSellId
    };
    await splitProductSell(parameter)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`split product sell successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  const clearForm = () => {
    setToProduct('');
    setToProductExisting(null);
    setToProductType('new');
    setQtyIncrease('');
    setQtyReduction('');
    setIsDisabledSplit(true);
  };

  const onCancel = () => {
    props.onClose(false);
    clearForm();
  };

  const onCheckValidation = (e) => setIsDisabledSplit(+e.target.value > +props.data.inventory.stock || !+e.target.value);

  const onChangeQtyReduction = (e) => {
    setQtyReduction(e.target.value);
    onCheckValidation(e);
  };

  return (
    <ModalC
      title={<FormattedMessage id="split-product" />}
      okText="Split"
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      disabledOk={isDisabledSplit}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="sm"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={7}>
          <Stack spacing={1}>
            <InputLabel htmlFor="from-product">{<FormattedMessage id="from-product" />}</InputLabel>
            <TextField
              fullWidth
              id="fromProduct"
              name="fromProduct"
              value={fromProduct}
              inputProps={{ readOnly: true }}
              placeholder="Whiskas food 20kg"
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Stack spacing={1}>
            <InputLabel htmlFor="qty-reduction">{<FormattedMessage id="qty-reduction" />}</InputLabel>
            <Stack spacing={1} flexDirection="row">
              <TextField
                fullWidth
                type="number"
                id="qtyReduction"
                name="qtyReduction"
                value={qtyReduction}
                onChange={onChangeQtyReduction}
                style={{ flexBasis: '60%' }}
              />
              <span style={{ flexBasis: '40%', marginLeft: '10px' }}>{props.data.inventory.stock} unites in stock</span>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Stack spacing={1}>
            <Stack spacing={1} flexDirection="row" alignItems="center">
              <InputLabel htmlFor="to-product">{<FormattedMessage id="to-product" />}</InputLabel>
              <RadioGroup
                name="roleId"
                value={toProductType}
                style={{ flexDirection: 'row', height: '20px', marginLeft: '16px', marginTop: '0px' }}
                onChange={(e) => {
                  setToProductType(e.target.value);
                  setToProduct('');
                }}
              >
                <FormControlLabel value="new" control={<Radio />} label={<FormattedMessage id="new" />} style={{ height: '20px' }} />
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label={<FormattedMessage id="existing-product" />}
                  style={{ height: '20px' }}
                />
              </RadioGroup>
            </Stack>
            {toProductType === 'new' ? (
              <TextField fullWidth id="toProduct" name="toProduct" value={toProduct} onChange={(e) => setToProduct(e.target.value)} />
            ) : (
              <Autocomplete
                id="existing-toproduct"
                options={props.data.sellSplitList}
                value={toProductExisting}
                isOptionEqualToValue={(option, val) => val === '' || +option.value === +val.value}
                onChange={(_, selected) => setToProductExisting(selected)}
                renderInput={(params) => <TextField {...params} />}
              />
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Stack spacing={1}>
            <InputLabel htmlFor="qty-increase">{<FormattedMessage id="qty-increase" />}</InputLabel>
            <TextField
              fullWidth
              id="qtyIncrease"
              name="qtyIncrease"
              value={qtyIncrease}
              type="number"
              onChange={(e) => setQtyIncrease(e.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormSplit.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormSplit;
