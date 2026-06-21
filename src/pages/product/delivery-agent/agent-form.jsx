import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { createDeliveryAgent, updateDeliveryAgent } from './service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const defaultForm = {
  locationId: null,
  name: '',
  phone: '',
  identityNumber: '',
  vehicleType: '',
  vehiclePlate: '',
  note: '',
  isActive: true
};

const AgentForm = ({ open, locationList, data, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (data) {
      const loc = locationList.find((l) => l.value === +data.locationId) ?? null;
      setForm({
        locationId: loc,
        name: data.name ?? '',
        phone: data.phone ?? '',
        identityNumber: data.identityNumber ?? '',
        vehicleType: data.vehicleType ?? '',
        vehiclePlate: data.vehiclePlate ?? '',
        note: data.note ?? '',
        isActive: data.isActive ?? true
      });
    } else {
      setForm(defaultForm);
    }
  }, [data, open, locationList]);

  const onChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isDisabledOk = !form.name.trim() || !form.locationId;

  const onSubmit = async () => {
    if (isDisabledOk) return;

    const payload = { ...form, locationId: form.locationId.value };
    const request = data ? updateDeliveryAgent({ ...payload, id: data.id }) : createDeliveryAgent(payload);

    await request
      .then((resp) => {
        if (resp.status === 200 || resp.status === 201) {
          dispatch(snackbarSuccess(`Delivery Agent ${data ? 'updated' : 'created'} successfully`));
          onSuccess();
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  return (
    <ModalC
      open={open}
      title={
        <FormattedMessage
          id={data ? 'edit-delivery-agent' : 'add-delivery-agent'}
          defaultMessage={data ? 'Edit Delivery Agent' : 'Add Delivery Agent'}
        />
      }
      onOk={onSubmit}
      onCancel={onClose}
      disabledOk={isDisabledOk}
      fullWidth
      maxWidth="sm"
    >
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <Autocomplete
            options={locationList}
            value={form.locationId}
            isOptionEqualToValue={(opt, val) => opt.value === val.value}
            onChange={(_, val) => setForm((prev) => ({ ...prev, locationId: val }))}
            renderInput={(params) => (
              <TextField {...params} required label={<FormattedMessage id="location" defaultMessage="Location" />} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={<FormattedMessage id="name" defaultMessage="Name" />}
            value={form.name}
            onChange={onChange('name')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={<FormattedMessage id="phone" defaultMessage="Phone" />}
            value={form.phone}
            onChange={onChange('phone')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={<FormattedMessage id="identity-number" defaultMessage="Identity Number" />}
            value={form.identityNumber}
            onChange={onChange('identityNumber')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>
              <FormattedMessage id="vehicle-type" defaultMessage="Vehicle Type" />
            </InputLabel>
            <Select
              value={form.vehicleType}
              label={<FormattedMessage id="vehicle-type" defaultMessage="Vehicle Type" />}
              onChange={onChange('vehicleType')}
            >
              <MenuItem value="">
                <em>-</em>
              </MenuItem>
              <MenuItem value="motor">Motor</MenuItem>
              <MenuItem value="mobil">Mobil</MenuItem>
              <MenuItem value="sepeda">Sepeda</MenuItem>
              <MenuItem value="lainnya">Lainnya</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={<FormattedMessage id="vehicle-plate" defaultMessage="Vehicle Plate" />}
            value={form.vehiclePlate}
            onChange={onChange('vehiclePlate')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label={<FormattedMessage id="note" defaultMessage="Note" />}
            value={form.note}
            onChange={onChange('note')}
          />
        </Grid>
        {data && (
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />}
              label={<FormattedMessage id="active" defaultMessage="Active" />}
            />
          </Grid>
        )}
      </Grid>
    </ModalC>
  );
};

AgentForm.propTypes = {
  open: PropTypes.bool,
  locationList: PropTypes.array,
  data: PropTypes.object,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

export default AgentForm;
