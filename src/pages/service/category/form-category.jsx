import { FormattedMessage, useIntl } from 'react-intl';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createServiceCategory, updateServiceCategory } from './service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const configCoreErr = {
  categoryNameErr: ''
};

const FormServiceCategory = (props) => {
  const [categoryName, setCategoryName] = useState(props.data.id ? props.data.categoryName : '');
  const [formErr, setFormErr] = useState(configCoreErr);
  const [disabledOk, setDisabledOk] = useState(true);

  const firstRender = useRef(true);
  const dispatch = useDispatch();
  const intl = useIntl();

  const checkValidation = () => {
    let getCategoryNameError = '';

    if (!categoryName) {
      getCategoryNameError = intl.formatMessage({ id: 'category-name-is-required' });
    }

    setFormErr({
      categoryNameErr: getCategoryNameError ? getCategoryNameError : ''
    });

    setDisabledOk(Boolean(getCategoryNameError));
  };

  const clearForm = () => {
    setCategoryName('');
  };

  const onCancel = () => {
    props.onClose(false);
    clearForm();
  };

  const onSubmit = async () => {
    const catchError = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    };

    const catchSuccess = (resp) => {
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(`Success ${props.data.id ? 'update' : 'create'} data`));
        props.setParams((_params) => ({ ..._params }));
        props.onClose(true);
      }
    };

    if (props.data.id) {
      await updateServiceCategory({ id: props.data.id, categoryName }).then(catchSuccess).catch(catchError);
    } else {
      await createServiceCategory({ categoryName }).then(catchSuccess).catch(catchError);
    }
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) {
      checkValidation();
    }
  }, [categoryName]);

  return (
    <ModalC
      title={<FormattedMessage id="create-category" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOk}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: 650 } }}
      maxWidth="md"
      positionButton="left"
      styleButtonContainer={{ padding: '0 17px 25px', flexDirection: 'row-reverse', gap: 20 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="category-name" style={{ color: 'black' }}>
              {<FormattedMessage id="category-name" />} *
            </InputLabel>
            <TextField
              fullWidth
              id="categoryName"
              name="categoryName"
              className="form__input"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              error={Boolean(formErr.categoryNameErr && formErr.categoryNameErr.length > 0)}
              helperText={formErr.categoryNameErr}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormServiceCategory.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func,
  setParams: PropTypes.func
};

export default FormServiceCategory;
