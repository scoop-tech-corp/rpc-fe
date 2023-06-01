import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createPetCategory } from 'pages/customer/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormPetCategory = (props) => {
  const [categoryName, setCategoryName] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await createPetCategory(categoryName)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${categoryName} has been created successfully`));
          props.onClose(true);
          setCategoryName('');
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => {
    props.onClose(false);
    setCategoryName('');
  };

  return (
    <ModalC
      title={<FormattedMessage id="add-pet-category" />}
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
              id="categoryName"
              name="categoryName"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormPetCategory.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormPetCategory;
