import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createBrand } from 'pages/product/product-list/service';
import { createMessageBackend } from 'service/service-global';

import ModalC from './ModalC';
import PropTypes from 'prop-types';

const FormBrand = (props) => {
  const [brandName, setBrandName] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createBrand(brandName)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${brandName} brand has been created successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose(true);

  return (
    <ModalC
      title={<FormattedMessage id="add-brand" />}
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
            <TextField fullWidth id="brandName" name="brandName" value={brandName} onChange={(event) => setBrandName(event.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormBrand.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormBrand;
