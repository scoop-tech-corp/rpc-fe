import { FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import { saveTransactionDataStatic } from '../service';

const CONSTANT_FORM_VALUE = {
  category: '',
  name: ''
};

const FormTransactionMaterialData = (props) => {
  const [formValue, setFormValue] = useState(CONSTANT_FORM_VALUE);
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await saveTransactionDataStatic({
      name: formValue.name,
      category: formValue.category
    })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`Material data has been created successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      })
      .finally(() => {
        setFormValue(CONSTANT_FORM_VALUE);
      });
  };

  const onCancel = () => props.onClose(true);

  return (
    <ModalC
      title={<FormattedMessage id="add-material-data" />}
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
          <Stack direction="column" spacing={2}>
            <Stack spacing={1}>
              <InputLabel htmlFor="category">
                <FormattedMessage id="type" />
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  id="category"
                  name="category"
                  value={formValue.category}
                  onChange={(event) => {
                    setFormValue((e) => ({
                      ...e,
                      category: event.target.value
                    }));
                  }}
                  placeholder="Select Category"
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-type" />
                    </em>
                  </MenuItem>
                  <MenuItem value={'weight'}>
                    <FormattedMessage id="weight" />
                  </MenuItem>
                  <MenuItem value={'temperature'}>
                    <FormattedMessage id="temperature-body" />
                  </MenuItem>
                  <MenuItem value={'breath'}>
                    <FormattedMessage id="breath" />
                  </MenuItem>
                  <MenuItem value={'sound'}>
                    <FormattedMessage id="sound" />
                  </MenuItem>
                  <MenuItem value={'heart'}>
                    <FormattedMessage id="heart" />
                  </MenuItem>
                  <MenuItem value={'vaginal'}>
                    <FormattedMessage id="vaginal" />
                  </MenuItem>
                  <MenuItem value={'paymentmethod'}>
                    <FormattedMessage id="payment-method" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack spacing={1}>
              <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                value={formValue.name}
                onChange={(event) => {
                  setFormValue((prevState) => ({ ...prevState, name: event.target.value }));
                }}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormTransactionMaterialData.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormTransactionMaterialData;
