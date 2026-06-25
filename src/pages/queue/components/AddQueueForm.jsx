import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputLabel,
  Stack,
  TextField
} from '@mui/material';

import { getLocationList, getDoctorStaffByLocationList, getCustomerByLocationList } from 'service/service-global';
import { getCustomerPetList } from 'pages/customer/service';
import { createQueue, convertFromBooking, getBookingCandidates } from '../service';

const SERVICE_OPTIONS = [
  { label: 'Pet Clinic', value: 'Pet Clinic' },
  { label: 'Pet Hotel', value: 'Pet Hotel' },
  { label: 'Pet Salon', value: 'Pet Salon' },
  { label: 'Breeding', value: 'Breeding' }
];

const INITIAL_FORM = {
  location: null,
  customer: null,
  pet: null,
  doctor: null,
  serviceType: null,
  chiefComplaint: '',
  // for booking convert mode
  booking: null
};

const AddQueueForm = ({ open, onClose, onSuccess, mode = 'walkin' }) => {
  // mode: 'walkin' | 'booking'
  const intl = useIntl();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    locationList: [],
    customerList: [],
    petList: [],
    doctorList: [],
    bookingList: []
  });

  useEffect(() => {
    if (!open) return;
    setForm(INITIAL_FORM);

    getLocationList().then((locations) => {
      setDropdowns((prev) => ({ ...prev, locationList: locations }));
    });
  }, [open]);

  // Load booking candidates when mode=booking and location changes
  useEffect(() => {
    if (mode !== 'booking' || !form.location) return;
    getBookingCandidates({ locationId: form.location.value }).then((res) => {
      const list = (res.data?.data || []).map((b) => ({
        label: `[${b.serviceType}] ${b.customerName} - ${b.petName} (${b.bookingTime?.slice(0, 16)})`,
        value: b.id,
        raw: b
      }));
      setDropdowns((prev) => ({ ...prev, bookingList: list }));
    });
  }, [form.location, mode]);

  const handleLocationChange = async (selected) => {
    setForm((prev) => ({ ...prev, location: selected, customer: null, pet: null, doctor: null, booking: null }));
    setDropdowns((prev) => ({ ...prev, customerList: [], petList: [], doctorList: [], bookingList: [] }));
    if (!selected) return;

    const [customers, doctors] = await Promise.all([
      getCustomerByLocationList(selected.value),
      getDoctorStaffByLocationList(selected.value)
    ]);
    setDropdowns((prev) => ({ ...prev, customerList: customers, doctorList: doctors }));
  };

  const handleCustomerChange = async (selected) => {
    setForm((prev) => ({ ...prev, customer: selected, pet: null }));
    setDropdowns((prev) => ({ ...prev, petList: [] }));
    if (!selected) return;
    const pets = await getCustomerPetList(selected.value);
    setDropdowns((prev) => ({ ...prev, petList: pets }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'booking') {
        await convertFromBooking({
          bookingId: form.booking?.value,
          chiefComplaint: form.chiefComplaint
        });
      } else {
        await createQueue({
          locationId: form.location?.value,
          customerId: form.customer?.value,
          petId: form.pet?.value,
          doctorId: form.doctor?.value || null,
          serviceType: form.serviceType?.value,
          chiefComplaint: form.chiefComplaint
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isBookingMode = mode === 'booking';

  const isSubmitDisabled =
    loading || (isBookingMode ? !form.location || !form.booking : !form.location || !form.customer || !form.pet || !form.serviceType);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isBookingMode ? <FormattedMessage id="queue-convert-from-booking" /> : <FormattedMessage id="queue-add-walkin" />}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* Lokasi */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="select-location" />
              </InputLabel>
              <Autocomplete
                options={dropdowns.locationList}
                value={form.location}
                onChange={(_, v) => handleLocationChange(v)}
                isOptionEqualToValue={(o, v) => o.value === v.value}
                renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'select-location' })} />}
              />
            </Stack>
          </Grid>

          {isBookingMode ? (
            /* Mode Booking: pilih booking yang sudah Accepted */
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel required>
                  <FormattedMessage id="queue-select-booking" />
                </InputLabel>
                <Autocomplete
                  options={dropdowns.bookingList}
                  value={form.booking}
                  onChange={(_, v) => setForm((prev) => ({ ...prev, booking: v }))}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  disabled={!form.location}
                  renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'queue-select-booking' })} />}
                />
              </Stack>
            </Grid>
          ) : (
            <>
              {/* Mode Walk-in: pilih layanan, customer, pet, dokter */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel required>
                    <FormattedMessage id="service-layanan" />
                  </InputLabel>
                  <Autocomplete
                    options={SERVICE_OPTIONS}
                    value={form.serviceType}
                    onChange={(_, v) => setForm((prev) => ({ ...prev, serviceType: v }))}
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'service-layanan' })} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel required>
                    <FormattedMessage id="customer-name" />
                  </InputLabel>
                  <Autocomplete
                    options={dropdowns.customerList}
                    value={form.customer}
                    onChange={(_, v) => handleCustomerChange(v)}
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    disabled={!form.location}
                    renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'customer-name' })} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel required>
                    <FormattedMessage id="pet-animal" />
                  </InputLabel>
                  <Autocomplete
                    options={dropdowns.petList}
                    value={form.pet}
                    onChange={(_, v) => setForm((prev) => ({ ...prev, pet: v }))}
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    disabled={!form.customer}
                    renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'pet-animal' })} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="doctor" />
                  </InputLabel>
                  <Autocomplete
                    options={dropdowns.doctorList}
                    value={form.doctor}
                    onChange={(_, v) => setForm((prev) => ({ ...prev, doctor: v }))}
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    disabled={!form.location}
                    renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'doctor' })} />}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* Keluhan */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="queue-chief-complaint" />
              </InputLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={form.chiefComplaint}
                onChange={(e) => setForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
                placeholder={intl.formatMessage({ id: 'queue-chief-complaint-placeholder' })}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="error" onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitDisabled}>
          {loading ? '...' : <FormattedMessage id="save" />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddQueueForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  mode: PropTypes.oneOf(['walkin', 'booking'])
};

export default AddQueueForm;
