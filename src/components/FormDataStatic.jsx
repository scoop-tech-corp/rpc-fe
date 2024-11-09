import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarSuccess, snackbarError } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { saveDataStaticLocation } from 'pages/location/location-list/detail/service';
import { createMessageBackend } from 'service/service-global';
import { saveStaffDataStatic } from 'pages/staff/static-data/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { savePromotionDataStaticType, savePromotionDataStaticUsage } from 'pages/promotion/static-data/service';

const FormDataStatic = (props) => {
  const [dataStatic, setDataStatic] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const capitalizeFirstLetter = (word) => {
      if (!word) return;

      return word.charAt(0).toUpperCase() + word.slice(1);
    };

    const moduleEndpoint = (module = 'location') => {
      if (module == 'location') {
        return saveDataStaticLocation({ keyword: capitalizeFirstLetter(props.typeValue), name: dataStatic });
      } else if (module == 'staff') {
        return saveStaffDataStatic({ keyword: capitalizeFirstLetter(props.typeValue), name: dataStatic });
      } else if (module == 'promotion-partner') {
        if (props.procedure == 'usage') {
          return savePromotionDataStaticUsage({ name: dataStatic });
        } else if (props.procedure.includes('type')) {
          return savePromotionDataStaticType({ name: dataStatic }, props.procedure.split('-')[1]);
        }
      }
    };

    await moduleEndpoint(props.module)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${dataStatic} ${props.procedure} has been created successfully`));
          setDataStatic('');
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
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

FormDataStatic.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  procedure: PropTypes.string, // usage, type
  typeValue: PropTypes.string, // telephone, messenger
  module: PropTypes.string
};

export default FormDataStatic;
