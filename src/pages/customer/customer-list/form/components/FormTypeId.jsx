import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createTypeId } from 'pages/customer/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormTypeId = (props) => {
  const [type, setType] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createTypeId(type)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${type} has been created successfully`));
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
      title={<FormattedMessage id="add-id-type" />}
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
            <InputLabel htmlFor="id-type">{<FormattedMessage id="id-type" />}</InputLabel>
            <TextField fullWidth id="id-type" name="id-type" value={type} onChange={(event) => setType(event.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormTypeId.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormTypeId;
