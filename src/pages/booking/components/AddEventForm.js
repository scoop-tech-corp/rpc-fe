import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';

import { FormattedMessage } from 'react-intl';

// material-ui
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import { createBooking, getBookingDetail, updateBooking, deleteBooking, acceptBooking, rejectBooking } from '../service';

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
  emergencyPhoneNumber: '',
  inventoryProducts: '',
  hotelPhotos: [],
  hotelImageUrls: [],

  // Case Pet Salon
  furCondition: '',
  skinSensitivity: '',
  salonPhotos: [],
  salonImageUrls: [],

  // Case Breeding
  stambum: '',
  healthClearance: '',
  breedingPhotos: [],
  breedingImageUrls: []
};

const getInitialValues = () => ({ ...CONSTANT_FORM });

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

const AddEventFrom = ({ onCancel, onCreated, mode = 'add', eventId = null, bookingStatus = null }) => {
  const dispatch = useDispatch();
  const isEdit = mode === 'edit';
  const [formValue, setFormValue] = useState(getInitialValues());
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const isReadOnly = Number(bookingStatus) === 1 || Number(bookingStatus) === 2;
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
            clinicImageUrls: booking.serviceType === 'Pet Clinic' ? imageUrls : [],
            // Case Pet Hotel
            petName: detail.petName || booking.petName || '',
            socializationType: detail.socializationType || '',
            emergencyContactName: detail.emergencyContactName || '',
            emergencyPhoneNumber: detail.emergencyPhoneNumber || '',
            inventoryProducts: detail.inventoryProducts || '',
            hotelImageUrls: booking.serviceType === 'Pet Hotel' ? imageUrls : [],
            // Case Pet Salon
            furCondition: detail.furCondition || '',
            skinSensitivity: detail.skinSensitivity || '',
            salonImageUrls: booking.serviceType === 'Pet Salon' ? imageUrls : [],
            // Case Breeding
            breedingImageUrls: booking.serviceType === 'Breeding' ? imageUrls : [],
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
        emergencyPhoneNumber: formValue.emergencyPhoneNumber,
        inventoryProducts: formValue.inventoryProducts,
        // Case Pet Salon
        furCondition: formValue.furCondition,
        skinSensitivity: formValue.skinSensitivity,
        // Case Breeding
        stambum: formValue.stambum,
        healthClearance: formValue.healthClearance,
        // Images
        images:
          selectedService === 'Pet Clinic'
            ? formValue.clinicPhotos
            : selectedService === 'Pet Hotel'
            ? formValue.hotelPhotos
            : selectedService === 'Pet Salon'
            ? formValue.salonPhotos
            : selectedService === 'Breeding'
            ? formValue.breedingPhotos
            : []
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

  const handleAccept = () => {
    setConfirmAcceptOpen(true);
  };

  const confirmAccept = async () => {
    setConfirmAcceptOpen(false);
    setIsAccepting(true);
    try {
      await acceptBooking(eventId);
      dispatch(snackbarSuccess('Booking accepted successfully.'));
      onCancel();
      onCreated?.();
    } catch (error) {
      dispatch(snackbarError(error?.message || 'Failed to accept booking'));
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = () => {
    setRejectReason('');
    setConfirmRejectOpen(true);
  };

  const confirmReject = async () => {
    setConfirmRejectOpen(false);
    setIsRejecting(true);
    try {
      await rejectBooking(eventId, rejectReason.trim());
      dispatch(snackbarSuccess('Booking rejected successfully.'));
      onCancel();
      onCreated?.();
    } catch (error) {
      dispatch(snackbarError(error?.message || 'Failed to reject booking'));
    } finally {
      setIsRejecting(false);
    }
  };

  const selectedService = formValue.service?.value;
  const serviceColor = getServiceColor();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DialogTitle sx={{ backgroundColor: serviceColor || undefined, color: serviceColor ? '#000' : undefined }}>
        {isReadOnly ? 'Detail Booking' : isEdit ? 'Edit Booking' : 'Add Booking'}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                disabled={isReadOnly}
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
                    <Select name="consultationType" value={formValue.consultationType} onChange={onFieldHandler} displayEmpty disabled={isReadOnly}>
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
                  <TextField fullWidth name="drugAllergy" value={formValue.drugAllergy} onChange={onFieldHandler} placeholder="Text" disabled={isReadOnly} />
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
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Upload Foto */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="upload-photo" />
                  </InputLabel>
                  {isEdit && formValue.clinicImageUrls.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {formValue.clinicImageUrls.map((imgPath, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={`${config.apiUrl}/${imgPath}`}
                          alt={`clinic-${idx}`}
                          onClick={() => setLightboxSrc(`${config.apiUrl}/${imgPath}`)}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ multiple: true }}
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const files = Array.from(event.target.files);
                      setFormValue((prev) => ({ ...prev, clinicPhotos: files }));
                    }}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* ============ Case Pet Hotel ============ */}
          {selectedService === 'Pet Hotel' && (
            <>
              {/* Emergency Contact Name */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="emergency-contact-name" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    name="emergencyContactName"
                    value={formValue.emergencyContactName}
                    onChange={onFieldHandler}
                    placeholder="Text"
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Emergency Phone Number */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="emergency-phone-number" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    name="emergencyPhoneNumber"
                    value={formValue.emergencyPhoneNumber}
                    onChange={onFieldHandler}
                    placeholder="Text"
                    inputProps={{ min: 0 }}
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Socialization Level */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="socialization-level" />
                  </InputLabel>
                  <FormControl fullWidth>
                    <Select name="socializationType" value={formValue.socializationType} onChange={onFieldHandler} displayEmpty disabled={isReadOnly}>
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Upload Foto */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="upload-photo" />
                  </InputLabel>
                  {isEdit && formValue.hotelImageUrls.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {formValue.hotelImageUrls.map((imgPath, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={`${config.apiUrl}/${imgPath}`}
                          alt={`hotel-${idx}`}
                          onClick={() => setLightboxSrc(`${config.apiUrl}/${imgPath}`)}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ multiple: true }}
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const files = Array.from(event.target.files);
                      setFormValue((prev) => ({ ...prev, hotelPhotos: files }));
                    }}
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
                    <Select name="furCondition" value={formValue.furCondition} onChange={onFieldHandler} displayEmpty disabled={isReadOnly}>
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
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Emergency Contact Name */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="emergency-contact-name" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    name="emergencyContactName"
                    value={formValue.emergencyContactName}
                    onChange={onFieldHandler}
                    placeholder="Text"
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Emergency Phone Number */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="emergency-phone-number" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    name="emergencyPhoneNumber"
                    value={formValue.emergencyPhoneNumber}
                    onChange={onFieldHandler}
                    placeholder="Text"
                    inputProps={{ min: 0 }}
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Upload Foto */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="upload-photo" />
                  </InputLabel>
                  {isEdit && formValue.salonImageUrls.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {formValue.salonImageUrls.map((imgPath, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={`${config.apiUrl}/${imgPath}`}
                          alt={`salon-${idx}`}
                          onClick={() => setLightboxSrc(`${config.apiUrl}/${imgPath}`)}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ multiple: true }}
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const files = Array.from(event.target.files);
                      setFormValue((prev) => ({ ...prev, salonPhotos: files }));
                    }}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* ============ Case Breeding ============ */}
          {selectedService === 'Breeding' && (
            <>
              {/* Stambum / Stamboom */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="stambum-stamboom" />
                  </InputLabel>
                  <TextField fullWidth name="stambum" value={formValue.stambum} onChange={onFieldHandler} placeholder="Text" disabled={isReadOnly} />
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
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Emergency Contact Name */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="emergency-contact-name" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    name="emergencyContactName"
                    value={formValue.emergencyContactName}
                    onChange={onFieldHandler}
                    placeholder="Text"
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Emergency Phone Number */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="emergency-phone-number" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    name="emergencyPhoneNumber"
                    value={formValue.emergencyPhoneNumber}
                    onChange={onFieldHandler}
                    placeholder="Text"
                    inputProps={{ min: 0 }}
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                </Stack>
              </Grid>

              {/* Upload Foto */}
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel>
                    <FormattedMessage id="upload-photo" />
                  </InputLabel>
                  {isEdit && formValue.breedingImageUrls.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {formValue.breedingImageUrls.map((imgPath, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={`${config.apiUrl}/${imgPath}`}
                          alt={`breeding-${idx}`}
                          onClick={() => setLightboxSrc(`${config.apiUrl}/${imgPath}`)}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ multiple: true }}
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const files = Array.from(event.target.files);
                      setFormValue((prev) => ({ ...prev, breedingPhotos: files }));
                    }}
                  />
                </Stack>
              </Grid>
            </>
          )}
          {/* Status */}
          {isEdit && (
            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel>
                  <FormattedMessage id="status" />
                </InputLabel>
                <TextField
                  fullWidth
                  disabled
                  value={
                    Number(bookingStatus) === 1
                      ? 'Accepted'
                      : Number(bookingStatus) === 2
                      ? 'Rejected'
                      : 'Pending'
                  }
                />
              </Stack>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          {isEdit && !isReadOnly && (
            <Button color="error" variant="outlined" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 'auto' }}>
            <Button color="error" variant="contained" onClick={onCancel}>
              <FormattedMessage id="close" />
            </Button>
            {isEdit && !isReadOnly && (
              <>
                <Button color="success" variant="contained" onClick={handleAccept} disabled={isAccepting}>
                  {isAccepting ? 'Accepting...' : <FormattedMessage id="accept" />}
                </Button>
                <Button color="warning" variant="contained" onClick={handleReject} disabled={isRejecting}>
                  {isRejecting ? 'Rejecting...' : <FormattedMessage id="reject" />}
                </Button>
              </>
            )}
            {!isReadOnly && (
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
                sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}
              >
                {isEdit ? 'Update' : 'Add'}
              </Button>
            )}
          </Stack>
        </Grid>
      </DialogActions>

      {/* Konfirmasi Reject Booking */}
      <Dialog open={confirmRejectOpen} onClose={() => setConfirmRejectOpen(false)}>
        <DialogTitle>
          <FormattedMessage id="reject" /> Booking
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <FormattedMessage id="confirm-reject-booking" />
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={<FormattedMessage id="reason" />}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setConfirmRejectOpen(false)}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" color="warning" onClick={confirmReject} disabled={isRejecting || !rejectReason.trim()}>
            <FormattedMessage id="reject" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Konfirmasi Accept Booking */}
      <Dialog open={confirmAcceptOpen} onClose={() => setConfirmAcceptOpen(false)}>
        <DialogTitle>
          <FormattedMessage id="accept" /> Booking
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage id="confirm-accept-booking" />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setConfirmAcceptOpen(false)}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" color="success" onClick={confirmAccept} disabled={isAccepting}>
            <FormattedMessage id="accept" />
          </Button>
        </DialogActions>
      </Dialog>
      {/* Lightbox */}
      <Dialog open={Boolean(lightboxSrc)} onClose={() => setLightboxSrc(null)} maxWidth="lg">
        <Box
          component="img"
          src={lightboxSrc || ''}
          alt="preview"
          onClick={() => setLightboxSrc(null)}
          sx={{ maxWidth: '90vw', maxHeight: '90vh', display: 'block', cursor: 'zoom-out' }}
        />
      </Dialog>
    </LocalizationProvider>
  );
};

AddEventFrom.propTypes = {
  onCancel: PropTypes.func,
  onCreated: PropTypes.func,
  mode: PropTypes.oneOf(['add', 'edit']),
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  bookingStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default AddEventFrom;
