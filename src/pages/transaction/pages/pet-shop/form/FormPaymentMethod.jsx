import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import { createPaymentMethod } from 'pages/transaction/service';
import PropTypes from 'prop-types';
import ModalC from '../../../../../components/ModalC';

const FormPaymentMethod = (props) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createPaymentMethod({ name: paymentMethod, category: 'paymentmethod' })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${paymentMethod} payment method has been created successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      })
      .finally(() => {
        setPaymentMethod('');
      });
  };

  const onCancel = () => props.onClose(true);

  return (
    <ModalC
      title={<FormattedMessage id="add-payment-method" />}
      okText="Save"
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
            <TextField
              fullWidth
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormPaymentMethod.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormPaymentMethod;
