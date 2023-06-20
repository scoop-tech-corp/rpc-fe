import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarSuccess, snackbarError } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createProductSupplierMessenger, createProductSupplierPhone, createProductSupplierUsage } from '../../service';
import { createMessageBackend } from 'service/service-global';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormDataStaticProductSupplier = (props) => {
  const [dataStatic, setDataStatic] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const catchSuccessResp = (resp) => {
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(`${dataStatic} ${props.procedure} has been created successfully`));
        setDataStatic('');
        props.onClose(true);
      }
    };

    const catchErrorResp = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    };

    if (props.typeValue == 'telephone') {
      await createProductSupplierPhone({ typeName: dataStatic }).then(catchSuccessResp).catch(catchErrorResp);
    } else if (props.typeValue == 'messenger') {
      await createProductSupplierMessenger({ typeName: dataStatic }).then(catchSuccessResp).catch(catchErrorResp);
    } else if (props.typeValue == 'usage') {
      await createProductSupplierUsage({ usageName: dataStatic }).then(catchSuccessResp).catch(catchErrorResp);
    }
  };

  const onCancel = () => {
    setDataStatic('');
    props.onClose(false);
  };
  const renderTitle = () => {
    switch (props.procedure) {
      case 'usage':
        return 'add-usage';
      case 'type':
        return 'add-type';
      default:
        return '';
    }
  };

  return (
    <ModalC
      title={renderTitle() ? <FormattedMessage id={renderTitle()} /> : ''}
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
              id="dataStatic"
              name="dataStatic"
              value={dataStatic}
              onChange={(event) => setDataStatic(event.target.value)}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormDataStaticProductSupplier.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  procedure: PropTypes.string, // usage, type
  typeValue: PropTypes.string // telephone, messenger
};

export default FormDataStaticProductSupplier;
