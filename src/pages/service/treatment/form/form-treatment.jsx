import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTreatment } from '../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, generateUniqueIdByDate } from 'service/service-global';
import { useTreatmentStore } from '../treatment-form-store';
import { useNavigate } from 'react-router-dom';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const FormServiceCategory = (props) => {
  let navigate = useNavigate();

  const [inputValue, setInputValue] = useState('');
  const locationList = useTreatmentStore((state) => state.dataSupport.locationList);
  const diagnoseList = useTreatmentStore((state) => state.dataSupport.diagnoseList);
  const [form, setForm] = useState({
    diagnose_id: '',
    location_id: '',
    name: 'Draft'
  });

  const dispatch = useDispatch();

  const onCancel = () => {
    props.onClose(false);
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
    // if (props.data.id) {
    //   await updateTreatment({ id: props.data.id, categoryName }).then(catchSuccess).catch(catchError);
    // } else {
    await createTreatment(form)
      .then((e) => {
        navigate(`/service/treatment/${e.data.id}`);
        catchSuccess(e);
      })
      .catch(catchError);
    // }
  };

  return (
    <ModalC
      title={<FormattedMessage id="create-treatment" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={form.name === '' || form.location_id === '' || form.diagnose_id === ''}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: 650 } }}
      maxWidth="md"
      positionButton="left"
      styleButtonContainer={{ padding: '0 17px 25px', flexDirection: 'row-reverse', gap: 20 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="treatment-name">{<FormattedMessage id="treatment-name" />} *</InputLabel>
            <TextField
              fullWidth
              id="name"
              name="name"
              className="form__input"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value
                })
              }
            />

            <InputLabel htmlFor="location">{<FormattedMessage id="location" />} *</InputLabel>
            <Autocomplete
              id="location"
              options={locationList}
              sx={{ height: '100%' }}
              value={form.location_id}
              // isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(e, val) => setForm({ ...form, location_id: val })}
              renderInput={(params) => <TextField {...params} />}
            />
            <InputLabel htmlFor="diagnose">{<FormattedMessage id="diagnose" />} *</InputLabel>
            <Autocomplete
              fullWidth
              id="diagnose"
              noOptionsText="Enter to create a new option"
              options={diagnoseList}
              value={form.diagnose_id}
              sx={{ height: '100%' }}
              // isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(e, val) => setForm({ ...form, diagnose_id: val })}
              onInputChange={(e, newValue) => {
                setInputValue(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && diagnoseList.findIndex((o) => o.label === inputValue) === -1) {
                      useTreatmentStore.setState((state) => ({
                        dataSupport: {
                          ...state.dataSupport,
                          diagnoseList: [
                            ...state.dataSupport.diagnoseList,
                            { label: inputValue, value: generateUniqueIdByDate(), isNew: true }
                          ]
                        }
                      }));
                    }
                  }}
                />
              )}
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
