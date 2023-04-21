import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createCustomerGroup } from 'pages/customer/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormCustomerGroup = (props) => {
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createCustomerGroup(name)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${name} has been created successfully`));
          props.onClose(true);
          setName('');
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    props.onClose(false);
    setName('');
  };

  return (
    <ModalC
      title={<FormattedMessage id="add-customer-group" />}
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
              id="customer-group-name"
              name="customer-group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormCustomerGroup.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormCustomerGroup;
