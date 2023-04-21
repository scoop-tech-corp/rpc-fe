import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createTitleCustomer } from 'pages/customer/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormTitle = (props) => {
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createTitleCustomer(title)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${title} has been created successfully`));
          props.onClose(true);
          setTitle('');
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    props.onClose(false);
    setTitle('');
  };

  return (
    <ModalC
      title={<FormattedMessage id="add-title" />}
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
            <InputLabel htmlFor="title">{<FormattedMessage id="title" />}</InputLabel>
            <TextField fullWidth id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormTitle.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormTitle;
