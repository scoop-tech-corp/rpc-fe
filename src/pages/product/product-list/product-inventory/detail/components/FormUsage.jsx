import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPrductUsage } from '../../../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormUsage = (props) => {
  const [usage, setUsage] = useState('');

  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createPrductUsage(usage)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success created usage'));
          setUsage('');
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    setUsage('');
    props.onClose(false);
  };

  return (
    <ModalC
      title={<FormattedMessage id="add-usage" />}
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
            <TextField fullWidth id="usage" name="usage" value={usage} onChange={(event) => setUsage(event.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormUsage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormUsage;
