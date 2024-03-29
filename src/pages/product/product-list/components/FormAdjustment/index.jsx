import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createProductAdjustment } from 'pages/product/product-list/service';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const FormAdjustment = (props) => {
  const [productName] = useState(props.data.fullName);
  const [currentStock, setCurrentStock] = useState(props.data.inventory.stock);
  const [totalAdjustment, setTotalAdjustment] = useState('');
  const [remark, setRemark] = useState('');
  const [different, setDifferent] = useState('');

  const dispatch = useDispatch();

  const onSubmit = async () => {
    const parameter = {
      productId: props.data.id,
      productType: props.data.productType,
      different: different,
      totalAdjustment: totalAdjustment,
      remark
    };
    await createProductAdjustment(parameter)
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
    setSelectAdjustment('');
    setTotalAdjustment('');
    setRemark('');
    setDifferent('');
  };

  const onCancel = () => {
    props.onClose(false);
    clearForm();
  };

  const onChangeTotalAdjustment = (e) => {
    setTotalAdjustment(e.target.value);
    calculateTotalAdjustment({ valueTotalAdjustment: e.target.value });
  };

  const calculateTotalAdjustment = (property) => {
    const getTotalAdjustment = !isNaN(property.valueTotalAdjustment) ? property.valueTotalAdjustment : totalAdjustment;
    let result = '';

    if (currentStock && getTotalAdjustment) {
      result = +currentStock - +getTotalAdjustment;
    }

    setDifferent(result);
  };

  const isDisabled = () => {
    return !totalAdjustment || !remark;
  };

  return (
    <ModalC
      title={<FormattedMessage id="stock-adjustment" />}
      okText={<FormattedMessage id="save" />}
      cancelText={<FormattedMessage id="cancel" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={isDisabled()}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="sm"
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
            <TextField fullWidth type="number" id="currentStock" name="currentStock" value={currentStock} inputProps={{ readOnly: true }} />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="total-adjusment">{<FormattedMessage id="total-adjusment" />}</InputLabel>
            <TextField
              fullWidth
              type="number"
              id="totalAdjustment"
              name="totalAdjustment"
              value={totalAdjustment}
              onChange={onChangeTotalAdjustment}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="different">{<FormattedMessage id="different" />}</InputLabel>
            <TextField fullWidth type="number" id="different" name="different" value={different} inputProps={{ readOnly: true }} />
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
              inputProps={{ maxLength: 255 }}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormAdjustment.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormAdjustment;
