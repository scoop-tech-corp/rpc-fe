import ModalC from './ModalC';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarSuccess, snackbarError } from 'store/reducers/snackbar';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { saveDataStaticLocation } from 'pages/location/location-list/detail/service';

const FormDataStatic = (props) => {
  const [dataStatic, setDataStatic] = useState('');
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const capitalizeFirstLetter = (word) => {
      if (!word) return;

      return word.charAt(0).toUpperCase() + word.slice(1);
    };

    await saveDataStaticLocation({ keyword: capitalizeFirstLetter(props.typeValue), name: dataStatic })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`${dataStatic} ${props.procedure} has been created successfully`));
          setDataStatic('');
          props.onClose(true);
        }
      })
      .catch((err) => {
        const msg = err.message ? err.message : 'Something when wrong';
        if (err) dispatch(snackbarError(msg));
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
  typeValue: PropTypes.string // telephone, messenger
};

export default FormDataStatic;
