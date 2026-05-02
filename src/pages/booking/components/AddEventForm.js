import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';

import { FormattedMessage } from 'react-intl';

// material-ui
import {
  Autocomplete,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Stack,
  TextField,
  Box
} from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// project imports
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getLocationList, getDoctorStaffByLocationList, getCustomerByLocationList } from 'service/service-global';
import { getCustomerPetList } from 'pages/customer/service';
import config from 'config';

// service
import { createBooking, getBookingDetail, updateBooking, deleteBooking } from '../service';

// constant
const SERVICE_OPTIONS = [
  { label: 'Pet Clinic', value: 'Pet Clinic', color: '#2196F3' },
  { label: 'Pet Hotel', value: 'Pet Hotel', color: '#F44336' },
  { label: 'Pet Salon', value: 'Pet Salon', color: '#FFC107' },
  { label: 'Breeding', value: 'Breeding', color: '#4CAF50' }
];

const VISITING_CATEGORY_OPTIONS = ['Konsultasi Baru', 'Kontrol/Follow-up', 'Vaksinasi Rutin', 'Tindakan Bedah'];
const SOCIALIZATION_LEVEL_OPTIONS = ['Bisa gabung dengan pet lain', 'Tidak bisa (Aggressive)', 'Takut (Shy)'];
const COAT_CONDITION_OPTIONS = ['Normal', 'Gimbal/Matting', 'Banyak Kutu', 'Jamuran'];

const CONSTANT_FORM = {
  location: null,
  doctor: null,
  customer: null,
  pet: null,
  service: null,
  bookingDate: null,

  // Case Pet Clinic
  consultationType: '',
  drugAllergy: '',
  additionalInfo: '',
  clinicPhotos: [],
  clinicImageUrls: [],

  // Case Pet Hotel
  petName: '',
  socializationType: '',
  emergencyContactName: '',
  inventoryProducts: '',

  // Case Pet Salon
  furCondition: '',
  skinSensitivity: '',

  // Case Breeding
  stambum: '',
  healthClearance: ''
};

const getInitialValues = () => ({ ...CONSTANT_FORM });

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

const AddEventFrom = ({ onCancel, onCreated, mode = 'add', eventId = null }) => {
  const dispatch = useDispatch();
  const isEdit = mode === 'edit';
  const [formValue, setFormValue] = useState(getInitialValues());
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    locationList: [],
    doctorList: [],
    customerList: [],
    petList: []
  });

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getLocationList();
      setDropdownData((prev) => ({ ...prev, locationList: locations }));
    };
    fetchLocations();
  }, []);

  // Prefill form when editing
  useEffect(() => {
    if (!isEdit || !eventId) return;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const response = await getBookingDetail(eventId);
        const apiData = response.data?.data || response.data || {};
        const booking = apiData.booking || {};
        const detail = apiData.detail || {};

        // imagePath can be in booking or detail, as a string
        const rawImagePath = booking.imagePath || detail.imagePath || '';
        const imageUrls = rawImagePath
          ? typeof rawImagePath === 'string'
            ? rawImagePath
                .split(',')
                .map((p) => p.trim())
                .filter(Boolean)
            : Array.isArray(rawImagePath)
            ? rawImagePath
            : []
          : [];

        // Convert IDs to numbers for matching
        const locationId = Number(booking.locationId);
        const doctorId = Number(booking.doctorId);
        const customerId = Number(booking.customerId);
        const petId = Number(booking.petId);

        // Find matching location from loaded list
        const locationMatch = dropdownData.locationList.find((l) => l.value === locationId);

        if (locationMatch) {
          // Load dependent dropdowns
          const [doctors, customers] = await Promise.all([
            getDoctorStaffByLocationList(locationMatch.value),
            getCustomerByLocationList(locationMatch.value)
          ]);

          const doctorMatch = doctors.find((d) => d.value === doctorId);
          const customerMatch = customers.find((d) => d.value === customerId);

          let petMatch = null;
          if (customerMatch) {
            const pets = await getCustomerPetList(customerMatch.value);
            petMatch = pets.find((p) => p.value === petId);
            setDropdownData((prev) => ({ ...prev, petList: pets }));
          }

          const serviceMatch = SERVICE_OPTIONS.find((s) => s.value === booking.serviceType);
          const bookingDate = booking.bookingTime ? dayjs(booking.bookingTime) : null;

          setFormValue((prev) => ({
            ...prev,
            location: locationMatch,
            doctor: doctorMatch || null,
            customer: customerMatch || null,
            pet: petMatch || null,
            service: serviceMatch || null,
            bookingDate,
            additionalInfo: detail.additionalInfo || '',
            // Case Pet Clinic
            consultationType: detail.consultationType || '',
            drugAllergy: detail.drugAllergy || '',
            clinicImageUrls: imageUrls,
            // Case Pet Hotel
            petName: detail.petName || booking.petName || '',
            socializationType: detail.socializationType || '',
            emergencyContactName: detail.emergencyContactName || '',
            inventoryProducts: detail.inventoryProducts || '',
            // Case Pet Salon
            furCondition: detail.furCondition || '',
            skinSensitivity: detail.skinSensitivity || '',
            // Case Breeding
            stambum: detail.stambum || '',
            healthClearance: detail.healthClearance || ''
          }));

          setDropdownData((prev) => ({ ...prev, doctorList: doctors, customerList: customers }));
        }
      } catch (error) {
        dispatch(snackbarError(error?.message || 'Failed to load booking detail'));
      } finally {
        setIsLoadingDetail(false);
      }
    };

    // Wait for locationList to be loaded first
    if (dropdownData.locationList.length > 0) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, eventId, dropdownData.locationList.length]);

  const handleLocationChange = async (selected) => {
    setFormValue((prev) => ({
      ...prev,
      location: selected || null,
      doctor: null,
      customer: null,
      pet: null
    }));
    setDropdownData((prev) => ({ ...prev, doctorList: [], customerList: [], petList: [] }));

    if (selected) {
      const [doctors, customers] = await Promise.all([
        getDoctorStaffByLocationList(selected.value),
        getCustomerByLocationList(selected.value)
      ]);
      setDropdownData((prev) => ({ ...prev, doctorList: doctors, customerList: customers }));
    }
  };

  const handleCustomerChange = async (selected) => {
    setFormValue((prev) => ({ ...prev, customer: selected || null, pet: null }));
    setDropdownData((prev) => ({ ...prev, petList: [] }));

    if (selected) {
      const pets = await getCustomerPetList(selected.value);
      setDropdownData((prev) => ({ ...prev, petList: pets }));
    }
  };

  const handleServiceChange = (selected) => {
    setFormValue((prev) => ({ ...prev, service: selected || null }));
  };

  const onFieldHandler = (event) => {
    const { name, value } = event.target;
    setFormValue((prev) => ({ ...prev, [name]: value }));
  };

  const getServiceColor = () => {
    if (!formValue.service) return undefined;
    return SERVICE_OPTIONS.find((s) => s.value === formValue.service.value)?.color;
  };

  const onSubmit = async () => {
    try {
      const color = getServiceColor();

      // Format bookingTime to "YYYY-MM-DD HH:mm"
      const d = formValue.bookingDate;
      const bookingTime = d
        ? `${d.$y}-${String(d.$M + 1).padStart(2, '0')}-${String(d.$D).padStart(2, '0')} ${String(d.$H).padStart(2, '0')}:${String(
            d.$m
          ).padStart(2, '0')}`
        : '';

      const title = `${formValue.service?.label || ''} - ${formValue.customer?.label || ''} - ${formValue.pet?.label || ''}`;

      const payload = {
        locationId: formValue.location?.value,
        doctorId: formValue.doctor?.value,
        customerId: formValue.customer?.value,
        petId: formValue.pet?.value,
        services: formValue.service?.value,
        bookingTime,
        title,
        color,
        additionalInfo: formValue.additionalInfo,
        // Case Pet Clinic
        consultationType: formValue.consultationType,
        drugAllergy: formValue.drugAllergy,
        // Case Pet Hotel
        petName: formValue.petName,
        socializationType: formValue.socializationType,
        emergencyContactName: formValue.emergencyContactName,
        inventoryProducts: formValue.inventoryProducts,
        // Case Pet Salon
        furCondition: formValue.furCondition,
        skinSensitivity: formValue.skinSensitivity,
        // Case Breeding
        stambum: formValue.stambum,
        healthClearance: formValue.healthClearance,
        // Images (Pet Clinic)
        images: selectedService === 'Pet Clinic' ? formValue.clinicPhotos : []
      };

      if (isEdit) {
        await updateBooking({ id: eventId, ...payload });
        dispatch(snackbarSuccess('Booking updated successfully.'));
      } else {
        await createBooking(payload);
        dispatch(snackbarSuccess('Booking created successfully.'));
      }
      onCreated?.();
      onCancel();
    } catch (error) {
      dispatch(snackbarError(error?.message || 'Something went wrong'));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBooking(eventId);
      dispatch(snackbarSuccess('Booking deleted successfully.'));
      onCancel();
      onCreated?.();
    } catch (error) {
      dispatch(snackbarError(error?.message || 'Failed to delete booking'));
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedService = formValue.service?.value;
  const serviceColor = getServiceColor();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DialogTitle sx={{ backgroundColor: serviceColor || undefined, color: serviceColor ? '#000' : undefined }}>
        {isEdit ? 'Edit Booking' : 'Add Booking'}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          {/* Pilih Lokasi */}
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="select-location" />
              </InputLabel>
              <Autocomplete
                id="location"
                options={dropdownData.locationList}
                value={formValue.location}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => handleLocationChange(selected)}
                renderInput={(params) => <TextField {...params} placeholder="Pilih" />}
              />
            </Stack>
          </Grid>

          {/* Dokter */}
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="doctor" />
              </InputLabel>
              <Autocomplete
                id="doctor"
                options={dropdownData.doctorList}
                value={formValue.doctor}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => setFormValue((prev) => ({ ...prev, doctor: selected || null }))}
                renderInput={(params) => <TextField {...params} placeholder="Dokter" />}
              />
            </Stack>
          </Grid>

          {/* Customer Name */}
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="customer-name" />
              </InputLabel>
              <Autocomplete
                id="customer"
                options={dropdownData.customerList}
                value={formValue.customer}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => handleCustomerChange(selected)}
                renderInput={(params) => <TextField {...params} placeholder="Customer" />}
              />
            </Stack>
          </Grid>

          {/* Pet */}
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="pet-animal" />
              </InputLabel>
              <Autocomplete
                id="pet"
                options={dropdownData.petList}
                value={formValue.pet}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => setFormValue((prev) => ({ ...prev, pet: selected || null }))}
                renderInput={(params) => <TextField {...params} placeholder="Pet" />}
              />
            </Stack>
          </Grid>

          {/* Service / Layanan */}
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="service-layanan" />
              </InputLabel>
              <Autocomplete
                id="service"
                options={SERVICE_OPTIONS}
                value={formValue.service}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => handleServiceChange(selected)}
                renderInput={(params) => <TextField {...params} placeholder="Pilih Layanan" />}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: option.color }} />
                    {option.label}
                  </Box>
                )}
              />
            </Stack>
          </Grid>

          {/* Waktu Booking */}
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="booking-time" />
              </InputLabel>
              <MobileDateTimePicker
                value={formValue.bookingDate}
                inputFormat="DD/MM/YYYY HH:mm"
                onChange={(date) => setFormValue((prev) => ({ ...prev, bookingDate: date }))}
                renderInput={(params) => <TextField {...params} placeholder="Format: 20/01/2026 13:00" fullWidth />}
              />
            </Stack>
          </Grid>

          {/* ============ Case Pet Clinic ============ */}
          {selectedService === 'Pet Clinic' && (
            <>
              {/* Jenis Kunjungan */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="visiting-category" />
                  </InputLabel>
                  <FormControl fullWidth>
                    <Select name="consultationType" value={formValue.consultationType} onChange={onFieldHandler} displayEmpty>
                      <MenuItem value="" disabled>
                        Pilih Jenis Kunjungan
                      </MenuItem>
                      {VISITING_CATEGORY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              {/* Riwayat Alergi Obat */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="drug-allergy-history" />
                  </InputLabel>
                  <TextField fullWidth name="drugAllergy" value={formValue.drugAllergy} onChange={onFieldHandler} placeholder="Text" />
                </Stack>
              </Grid>

              {/* Informasi Tambahan */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="additional-info" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="additionalInfo"
                    value={formValue.additionalInfo}
                    onChange={onFieldHandler}
                  />
                </Stack>
              </Grid>

              {/* Upload Foto */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="upload-photo" />
                  </InputLabel>
                  {isEdit ? (
                    formValue.clinicImageUrls.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {formValue.clinicImageUrls.map((imgPath, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={`${config.apiUrl}/${imgPath}`}
                            alt={`clinic-${idx}`}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.300'
                            }}
                          />
                        ))}
                      </Box>
                    )
                  ) : (
                    <TextField
                      fullWidth
                      type="file"
                      inputProps={{ multiple: true }}
                      onChange={(event) => {
                        const files = Array.from(event.target.files);
                        setFormValue((prev) => ({ ...prev, clinicPhotos: files }));
                      }}
                    />
                  )}
                </Stack>
              </Grid>
            </>
          )}

          {/* ============ Case Pet Hotel ============ */}
          {selectedService === 'Pet Hotel' && (
            <>
              {/* Pet Name */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="pet-name" />
                  </InputLabel>
                  <TextField fullWidth name="petName" value={formValue.petName} onChange={onFieldHandler} placeholder="Text" />
                </Stack>
              </Grid>

              {/* Socialization Level */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="socialization-level" />
                  </InputLabel>
                  <FormControl fullWidth>
                    <Select name="socializationType" value={formValue.socializationType} onChange={onFieldHandler} displayEmpty>
                      <MenuItem value="" disabled>
                        Pilih Tingkat Sosialisasi
                      </MenuItem>
                      {SOCIALIZATION_LEVEL_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="emergency-contact" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    name="emergencyContactName"
                    value={formValue.emergencyContactName}
                    onChange={onFieldHandler}
                    placeholder="Text"
                  />
                </Stack>
              </Grid>

              {/* Inventory Product */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="inventory-product" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    name="inventoryProducts"
                    value={formValue.inventoryProducts}
                    onChange={onFieldHandler}
                    placeholder="Text"
                  />
                </Stack>
              </Grid>

              {/* Informasi Tambahan */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="additional-info" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="additionalInfo"
                    value={formValue.additionalInfo}
                    onChange={onFieldHandler}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* ============ Case Pet Salon ============ */}
          {selectedService === 'Pet Salon' && (
            <>
              {/* Kondisi Bulu */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="fur-condition" />
                  </InputLabel>
                  <FormControl fullWidth>
                    <Select name="furCondition" value={formValue.furCondition} onChange={onFieldHandler} displayEmpty>
                      <MenuItem value="" disabled>
                        Pilih Kondisi Bulu
                      </MenuItem>
                      {COAT_CONDITION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              {/* Sensitivitas Kulit */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="skin-sensitivity" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    name="skinSensitivity"
                    value={formValue.skinSensitivity}
                    onChange={onFieldHandler}
                    placeholder="Text"
                  />
                </Stack>
              </Grid>

              {/* Informasi Tambahan */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="additional-info" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="additionalInfo"
                    value={formValue.additionalInfo}
                    onChange={onFieldHandler}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* ============ Case Breeding ============ */}
          {selectedService === 'Breeding' && (
            <>
              {/* Informasi Tambahan */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="additional-info" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="additionalInfo"
                    value={formValue.additionalInfo}
                    onChange={onFieldHandler}
                  />
                </Stack>
              </Grid>

              {/* Stambum / Stamboom */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="stambum-stamboom" />
                  </InputLabel>
                  <TextField fullWidth name="stambum" value={formValue.stambum} onChange={onFieldHandler} placeholder="Text" />
                </Stack>
              </Grid>

              {/* Health Clearance */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="health-clearance" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    name="healthClearance"
                    value={formValue.healthClearance}
                    onChange={onFieldHandler}
                    placeholder="Text"
                  />
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          {isEdit && (
            <Button color="error" variant="outlined" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 'auto' }}>
            <Button color="error" variant="contained" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={onSubmit}
              disabled={
                isLoadingDetail ||
                !formValue.location ||
                !formValue.customer ||
                !formValue.pet ||
                !formValue.service ||
                !formValue.bookingDate
              }
              sx={serviceColor ? { backgroundColor: serviceColor, color: '#000', '&:hover': { backgroundColor: serviceColor } } : {}}
            >
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Grid>
      </DialogActions>
    </LocalizationProvider>
  );
};

AddEventFrom.propTypes = {
  onCancel: PropTypes.func,
  onCreated: PropTypes.func,
  mode: PropTypes.oneOf(['add', 'edit']),
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default AddEventFrom;
