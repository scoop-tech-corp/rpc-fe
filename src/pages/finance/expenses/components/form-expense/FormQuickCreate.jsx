import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormQuickCreate = (props) => {
  const [value, setValue] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    if (!value.trim()) return;

    await props
      .createFunc({ [props.fieldName]: value })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${value} has been created successfully`));
          setValue('');
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    setValue('');
    props.onClose(false);
  };

  return (
    <ModalC
      title={props.title}
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
            <InputLabel htmlFor="name">
              <FormattedMessage id="name" />
            </InputLabel>
            <TextField fullWidth id="quickCreateValue" value={value} onChange={(e) => setValue(e.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormQuickCreate.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  fieldName: PropTypes.string,
  createFunc: PropTypes.func
};

export default FormQuickCreate;
