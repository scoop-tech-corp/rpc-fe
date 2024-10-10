import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { saveStaffDataStatic } from 'pages/staff/static-data/service';
import { createTypeId } from 'pages/customer/service';
import { createMessageBackend } from 'service/service-global';

import ModalC from './ModalC';
import PropTypes from 'prop-types';

const FormTypeId = (props) => {
  const [typeId, setTypeId] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const moduleEndpoint = (module = 'customer') => {
      if (module == 'staff') {
        return saveStaffDataStatic({ keyword: 'Type id', name: typeId });
      } else if (module == 'customer') {
        return createTypeId(typeId);
      }
    };

    await moduleEndpoint(props.module)
      .then((resp) => {
        if (resp && resp.status === 200) {
          setTypeId('');
          dispatch(snackbarSuccess(`${typeId} has been created successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    setTypeId('');
    props.onClose(false);
  };

  return (
    <ModalC
      title={<FormattedMessage id="add-type-id" />}
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
            <TextField fullWidth id="typeId" name="typeId" value={typeId} onChange={(event) => setTypeId(event.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormTypeId.propTypes = {
  open: PropTypes.bool,
  module: PropTypes.string,
  onClose: PropTypes.func
};

export default FormTypeId;
