import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProductCategory, updateProductCategory } from './service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const configCoreErr = {
  categoryNameErr: '',
  expiredDaysErr: ''
};

const FormProductCategory = (props) => {
  const [categoryName, setCategoryName] = useState(props.data.id ? props.data.categoryName : '');
  const [expiredDays, setExpiredDays] = useState(props.data.id ? props.data.expiredDay : '');
  const [formErr, setFormErr] = useState(configCoreErr);
  const [disabledOk, setDisabledOk] = useState(true);

  const firstRender = useRef(true);
  const dispatch = useDispatch();
  const intl = useIntl();

  const checkValidation = () => {
    let getCategoryNameError = '';
    let getExpiredDaysError = '';

    if (!categoryName) {
      getCategoryNameError = intl.formatMessage({ id: 'category-name-is-required' });
    }

    if (!expiredDays) {
      getExpiredDaysError = intl.formatMessage({ id: 'expired-days-is-required' });
    }

    setFormErr({
      categoryNameErr: getCategoryNameError ? getCategoryNameError : '',
      expiredDaysErr: getExpiredDaysError ? getExpiredDaysError : ''
    });

    setDisabledOk(Boolean(getCategoryNameError || getExpiredDaysError));
  };

  const clearForm = () => {
    setCategoryName('');
    setExpiredDays('');
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
        props.onClose(true);
      }
    };

    if (props.data.id) {
      await updateProductCategory({ id: props.data.id, categoryName, expiredDay: expiredDays }).then(catchSuccess).catch(catchError);
    } else {
      await createProductCategory({ categoryName, expiredDay: expiredDays }).then(catchSuccess).catch(catchError);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName, expiredDays]);

  return (
    <ModalC
      title={<FormattedMessage id="create-category" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOk}
      onCancel={onCancel}
      otherDialogAction={
        <>
          <Button variant="outlined" onClick={clearForm}>
            {<FormattedMessage id="clear" />}
          </Button>
        </>
      }
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: 650 } }}
      maxWidth="md"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="category-name">{<FormattedMessage id="category-name" />}</InputLabel>
            <TextField
              fullWidth
              id="categoryName"
              name="categoryName"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              error={Boolean(formErr.categoryNameErr && formErr.categoryNameErr.length > 0)}
              helperText={formErr.categoryNameErr}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="expired-days">{<FormattedMessage id="expired-days" />}</InputLabel>
            <TextField
              fullWidth
              id="expiredDays"
              name="expiredDays"
              value={expiredDays}
              type="number"
              onChange={(event) => setExpiredDays(event.target.value)}
              inputProps={{ min: 0 }}
              error={Boolean(formErr.expiredDaysErr && formErr.expiredDaysErr.length > 0)}
              helperText={formErr.expiredDaysErr}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormProductCategory.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormProductCategory;
