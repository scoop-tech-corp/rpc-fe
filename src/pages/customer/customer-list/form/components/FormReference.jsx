import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createReference } from 'pages/customer/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormReference = (props) => {
  const [reference, setReference] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createReference(reference)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${reference} has been created successfully`));
          props.onClose(true);
          setReference('');
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    props.onClose(false);
    setReference('');
  };

  return (
    <ModalC
      title={<FormattedMessage id="add-reference" />}
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
            <InputLabel htmlFor="reference-from">{<FormattedMessage id="reference-from" />}</InputLabel>
            <TextField fullWidth id="reference" name="reference" value={reference} onChange={(event) => setReference(event.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormReference.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormReference;
