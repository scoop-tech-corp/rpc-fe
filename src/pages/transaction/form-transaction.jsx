import { FormattedMessage, useIntl } from 'react-intl';
import {
  Button,
  Grid,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Stack,
  Autocomplete,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PlusOutlined } from '@ant-design/icons';
import { getCustomerPetList, getPetCategoryList } from 'pages/customer/service';
import { createMessageBackend, getCustomerByLocationList, getDoctorStaffByLocationList } from 'service/service-global';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import {
  createTransaction,
  getKeyServiceCategoryByValue,
  getLocationTransactionList,
  getTransactionDetail,
  TransactionType,
  updateTransaction
} from './service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { create } from 'zustand';
import { jsonCentralized } from 'utils/func';
import { createTransactionPetClinic, getTransactionPetClinicDetail } from './pages/pet-clinic/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import FormPet from './form-pet';
import ErrorContainer from 'components/@extended/ErrorContainer';
import { createTransactionPetHotel, getTransactionPetHotelDetail, updateTransactionPetHotel } from './pages/pet-hotel/service';
import { getBookingDetail, getBookingListTransaction } from 'pages/booking/service';
import configGlobal from 'config';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

// STEPS defined inside component to support i18n

const CONSTANT_PET_FORM = {
  petId: '',
  petName: '',
  petCategory: null,
  petCondition: '',
  petGender: '',
  petSterile: '',
  petBirthDateType: '',
  petDateOfBirth: null,
  petMonth: '',
  petYear: ''
};

const CONSTANT_FORM_VALUE = {
  registrationNo: '',
  customer: '',
  location: null,
  customerId: '',
  customerName: null,
  registrantName: '',
  pets: null,
  configTransaction: '',
  typeOfCare: '',
  startDate: null,
  endDate: null,
  treatingDoctor: null,
  notes: '',
  ...CONSTANT_PET_FORM
};

export const dropdownList = create(() =>
  jsonCentralized({ locationList: [], petCategoryList: [], customerList: [], doctorList: [], customerPetList: [] })
);
export const getDropdownAll = () => dropdownList.getState();

// ─── Sub-component: Section label with divider ─────────────────────────────
const SectionLabel = ({ children }) => (
  <Grid item xs={12}>
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
      <Typography variant="subtitle2" color="primary.dark" fontWeight="bold">
        {children}
      </Typography>
      <Divider />
    </Stack>
  </Grid>
);
SectionLabel.propTypes = { children: PropTypes.node };

// ─── Main component ────────────────────────────────────────────────────────
const FormTransaction = (props) => {
  const { id, type, defaultTypeOfCare, queueId } = props;
  const intl = useIntl();
  const STEPS = [
    intl.formatMessage({ id: 'visit-origin' }),
    intl.formatMessage({ id: 'patient-and-pet' }),
    intl.formatMessage({ id: 'visit-detail' })
  ];
  const customerList = dropdownList((state) => state.customerList);
  const customerPetList = dropdownList((state) => state.customerPetList);

  const [isEditForm, setIsEditForm] = useState(false);
  const [formValue, setFormValue] = useState({ ...CONSTANT_FORM_VALUE });
  const [formPetConfig, setFormPetConfig] = useState({ isOpen: false });
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  const [visitSource, setVisitSource] = useState('');
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingImageUrl, setBookingImageUrl] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const dispatch = useDispatch();

  const isClinic = ['clinic'].includes(formValue.configTransaction);
  const hasDateFields = ['hotel', 'pacak', 'clinic'].includes(formValue.configTransaction);

  // ─── Validation per step ────────────────────────────────────────────────
  const validateStep = (step) => {
    if (step === 0) {
      if (!visitSource) return intl.formatMessage({ id: 'validation-select-visit-origin' });
      if (visitSource === 'booking' && !selectedBooking) return intl.formatMessage({ id: 'validation-select-booking' });
      return '';
    }
    if (step === 1) {
      if (!formValue.customer) return intl.formatMessage({ id: 'validation-select-customer-type' });
      if (!formValue.location) return intl.formatMessage({ id: 'validation-select-clinic-location' });
      if (formValue.customer === 'old' && !formValue.customerName) return intl.formatMessage({ id: 'validation-select-customer' });
      if (formValue.customer === 'old' && !formValue.pets) return intl.formatMessage({ id: 'validation-select-pet' });
      if (formValue.customer === 'new' && !formValue.petName?.trim()) return 'Isi nama hewan peliharaan';
      return '';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep(activeStep);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError('');
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepError('');
    setActiveStep((s) => s - 1);
  };

  // ─── Submit ─────────────────────────────────────────────────────────────
  const onSubmit = async () => {
    const responseError = (err) => {
      dispatch(snackbarError(createMessageBackend(err)));
      const { msg, detail } = createMessageBackend(err, true);
      setErrContent({ title: msg, detail: detail });
    };
    const responseSuccess = (resp) => {
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(`Transaction has been ${id ? 'updated' : 'created'} successfully`));
        resetAllState();
        props.onClose(true);
      }
    };

    if (isEditForm) {
      if (type === 'pet-hotel') {
        await updateTransactionPetHotel({ id, ...formValue })
          .then(responseSuccess)
          .catch(responseError);
      } else {
        await updateTransaction({ id, ...formValue })
          .then(responseSuccess)
          .catch(responseError);
      }
    } else {
      try {
        let apiCall = createTransaction;
        if (formValue.configTransaction === 'clinic') apiCall = createTransactionPetClinic;
        else if (type === 'pet-hotel') apiCall = createTransactionPetHotel;
        const response = await apiCall({ ...formValue, queueId });
        responseSuccess(response);
      } catch (error) {
        responseError(error);
      }
    }
  };

  const clearForm = () => {
    setFormValue((prev) => ({ ...CONSTANT_FORM_VALUE, configTransaction: prev.configTransaction }));
    setSelectedBooking(null);
    setVisitSource('');
    setActiveStep(0);
    setStepError('');
  };

  const resetAllState = () => {
    setIsEditForm(false);
    setFormValue({ ...CONSTANT_FORM_VALUE });
    setFormPetConfig({ isOpen: false });
    setErrContent({ title: '', detail: '' });
    setVisitSource('');
    setBookingList([]);
    setSelectedBooking(null);
    setBookingImageUrl(null);
    setBookingDetail(null);
    setActiveStep(0);
    setStepError('');
  };

  const onCancel = () => {
    resetAllState();
    props.onClose(false);
  };

  const onFieldHandler = (event) => {
    if (event.target.name === 'petYear' && +event.target.value > 9999) return;
    setFormValue((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onDropdownHandler = (selected, procedure) => {
    setFormValue((prevState) => {
      let returnNewFormValue = { ...prevState, [procedure]: selected ? selected : null };
      if (procedure === 'pets') {
        if (selected?.formPetValue) {
          returnNewFormValue = { ...returnNewFormValue, ...selected.formPetValue };
        } else {
          returnNewFormValue = { ...returnNewFormValue, ...CONSTANT_PET_FORM };
        }
      }
      return returnNewFormValue;
    });
  };

  // ─── Data loading helpers ───────────────────────────────────────────────
  const getDoctorStaffByLocation = async (locationId) => {
    const doctors = await getDoctorStaffByLocationList(locationId);
    dropdownList.setState((prev) => ({ ...prev, doctorList: doctors }));
  };

  const getCustomerByLocation = async (locationId) => {
    const customers = await getCustomerByLocationList(locationId);
    dropdownList.setState((prev) => ({ ...prev, customerList: customers }));
  };

  const getCustomerPet = async (customerId) => {
    const pets = await getCustomerPetList(customerId);
    dropdownList.setState((prev) => ({ ...prev, customerPetList: pets }));
  };

  const handleLocationChange = (selected) => {
    const locationValue = selected ? selected : null;
    setFormValue((e) => ({ ...e, location: locationValue, customerName: null, treatingDoctor: null, pets: null }));
    dropdownList.setState((prev) => ({ ...prev, customerList: [], doctorList: [], customerPetList: [] }));
    if (locationValue) {
      getCustomerByLocation(locationValue.value);
      getDoctorStaffByLocation(locationValue.value);
    }
  };

  // ─── Booking select ─────────────────────────────────────────────────────
  const handleBookingSelect = async (selected) => {
    if (!selected) {
      setSelectedBooking(null);
      setFormValue((prev) => ({ ...CONSTANT_FORM_VALUE, configTransaction: prev.configTransaction }));
      return;
    }
    loaderGlobalConfig.setLoader(true);
    try {
      const resp = await getBookingDetail(selected.value);
      const apiData = resp.data?.data || resp.data || {};
      const booking = apiData.booking || {};
      const detail = apiData.detail || {};

      const locationList = getDropdownAll().locationList;
      const petCategoryList = getDropdownAll().petCategoryList;
      const location = locationList.find((l) => l.value === Number(booking.locationId)) || null;
      const petCategory = petCategoryList.find((c) => c.value === Number(booking.petCategoryId || detail.petCategoryId)) || null;

      let treatingDoctor = null;
      let customerName = null;
      let pets = null;

      if (location) {
        const [doctors, customers] = await Promise.all([
          getDoctorStaffByLocationList(location.value),
          getCustomerByLocationList(location.value)
        ]);
        dropdownList.setState((prev) => ({ ...prev, doctorList: doctors, customerList: customers }));
        treatingDoctor = doctors.find((d) => d.value === Number(booking.doctorId)) || null;
        customerName = customers.find((c) => c.value === Number(booking.customerId)) || null;

        if (customerName) {
          const petList = await getCustomerPetList(customerName.value);
          dropdownList.setState((prev) => ({ ...prev, customerPetList: petList }));
          pets = petList.find((p) => p.value === Number(booking.petId)) || null;
        }
      }

      setSelectedBooking(selected);
      // Set gambar booking jika ada
      if (booking.imagePath) {
        setBookingImageUrl(`${configGlobal.apiUrl}${booking.imagePath}`);
      } else {
        setBookingImageUrl(null);
      }
      // Simpan detail inputan customer dari booking
      setBookingDetail(detail ? { ...detail, serviceType: booking.serviceType } : null);
      setFormValue((prev) => ({
        ...prev,
        customer: 'old',
        location,
        customerId: booking.customerId || '',
        customerName,
        registrantName: '',
        pets,
        petId: Number(booking.petId) || '',
        petName: booking.petName || pets?.label || '',
        petCategory,
        startDate: booking.bookingTime || null,
        treatingDoctor,
        notes: detail.additionalInfo || ''
      }));
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      loaderGlobalConfig.setLoader(false);
    }
  };

  // ─── Init data ──────────────────────────────────────────────────────────
  const getDropdownList = async () => {
    const getPetCategory = await getPetCategoryList();
    const getLocation = await getLocationTransactionList();
    dropdownList.setState((prev) => ({ ...prev, petCategoryList: getPetCategory, locationList: getLocation }));
  };

  const getDetail = async () => {
    if (id) {
      let apiGetDetail = null;
      if (type === 'pet-hotel') apiGetDetail = getTransactionPetHotelDetail;
      else if (type === 'pet-clinic') apiGetDetail = getTransactionPetClinicDetail;
      else apiGetDetail = getTransactionDetail;

      const respDetail = await apiGetDetail({ id });
      const data = respDetail.data.detail;
      setIsEditForm(true);

      const getDoctorList = await getDoctorStaffByLocationList(+data.locationId);
      dropdownList.setState((prev) => ({ ...prev, doctorList: getDoctorList }));

      const getLocationList = getDropdownAll().locationList;
      const getPetCategoryListState = getDropdownAll().petCategoryList;
      const locations = getLocationList.length ? getLocationList.find((dt) => dt.value === +data.locationId) : null;
      const petCategory = getPetCategoryListState.length ? getPetCategoryListState.find((dt) => dt.value === +data.petCategoryId) : null;
      const treatingDoctor = getDoctorList.length ? getDoctorList.find((dt) => dt.value === +data.doctorId) : null;

      setFormValue({
        registrationNo: data.registrationNo,
        customer: +data.isNewCustomer ? 'new' : 'old',
        location: locations,
        customerId: data.customerId,
        customerName: data.customerName,
        registrantName: data.registrant,
        pets: +data.petId,
        petId: +data.petId,
        petName: data.petName,
        petCategory,
        petCondition: data.condition,
        petGender: data.petGender,
        petSterile: data.petSterile,
        petBirthDateType: data.petMonth || data.petYear ? 'monthAndYear' : 'birthDate',
        petDateOfBirth: data.dateOfBirth,
        petMonth: data.petMonth,
        petYear: data.petYear,
        configTransaction: getKeyServiceCategoryByValue(TransactionType[type]),
        startDate: data.startDate,
        endDate: data.endDate,
        treatingDoctor: treatingDoctor || null,
        typeOfCare: +data.typeOfCare,
        notes: data.note
      });
    }
  };

  const decideFormTransactionType = () => {
    setFormValue((prev) => ({ ...prev, configTransaction: getKeyServiceCategoryByValue(TransactionType[type]) }));
  };

  useEffect(() => {
    const init = async () => {
      loaderGlobalConfig.setLoader(true);
      await getDropdownList();
      await getDetail();
      loaderGlobalConfig.setLoader(false);
      loaderService.setManualLoader(false);
    };
    init();
    decideFormTransactionType();

    // Pre-fill typeOfCare dari tab yang aktif
    if (defaultTypeOfCare) {
      setFormValue((prev) => ({ ...prev, typeOfCare: defaultTypeOfCare }));
    }

    return () => {
      dropdownList.setState(
        jsonCentralized({ locationList: [], petCategoryList: [], customerList: [], doctorList: [], customerPetList: [] })
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (visitSource === 'booking' && bookingList.length === 0) {
      const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
      getBookingListTransaction({ locationId: userStorage?.locations?.map((l) => l.id), serviceType: TransactionType[type] })
        .then(setBookingList)
        .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitSource]);

  // ─── Birth date section (shared between step 1 new & edit) ──────────────
  const renderBirthDateFields = () => (
    <Grid item xs={12}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <InputLabel sx={{ mb: 0, minWidth: 'max-content' }}>
            <FormattedMessage id="birth-date" />
          </InputLabel>
          <RadioGroup
            row
            name="petBirthDateType"
            value={formValue.petBirthDateType}
            onChange={(e) => {
              setFormValue((prev) => ({
                ...prev,
                petBirthDateType: e.target.value,
                petDateOfBirth: null,
                petMonth: '',
                petYear: ''
              }));
            }}
          >
            <FormControlLabel value="birthDate" control={<Radio size="small" />} label={<FormattedMessage id="birth-date-type" />} />
            <FormControlLabel value="monthAndYear" control={<Radio size="small" />} label={<FormattedMessage id="month-and-year" />} />
          </RadioGroup>
        </Stack>

        {formValue.petBirthDateType === 'birthDate' && (
          <Fragment>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                inputFormat="DD/MM/YYYY"
                value={formValue.petDateOfBirth}
                onChange={(selected) => onDropdownHandler(selected, 'petDateOfBirth')}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Fragment>
        )}

        {formValue.petBirthDateType === 'monthAndYear' && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="number"
                fullWidth
                label={intl.formatMessage({ id: 'year' })}
                id="petYear"
                name="petYear"
                value={formValue.petYear}
                onChange={(event) => onFieldHandler(event)}
                inputProps={{ min: 0, max: 9999 }}
                placeholder="2020"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>
                  <FormattedMessage id="month" />
                </InputLabel>
                <Select
                  id="petMonth"
                  name="petMonth"
                  value={formValue.petMonth}
                  onChange={(event) => onFieldHandler(event)}
                  label={intl.formatMessage({ id: 'month' })}
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-month" />
                    </em>
                  </MenuItem>
                  {MONTH_NAMES.map((name, idx) => (
                    <MenuItem value={idx + 1} key={idx}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Grid>
  );

  // ─── Type of Care toggle (reusable) ─────────────────────────────────────
  const renderTypeOfCareToggle = () =>
    isClinic ? (
      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel required>
            <FormattedMessage id="care-type" />
          </InputLabel>
          <ToggleButtonGroup
            exclusive
            value={formValue.typeOfCare}
            onChange={(_, val) => {
              if (val !== null) setFormValue((prev) => ({ ...prev, typeOfCare: val }));
            }}
            fullWidth
            sx={{ height: 56 }}
          >
            <ToggleButton value={1} sx={{ flex: 1, fontSize: 13 }}>
              🏥 <FormattedMessage id="outpatient" />
            </ToggleButton>
            <ToggleButton value={2} sx={{ flex: 1, fontSize: 13 }}>
              🛏️ <FormattedMessage id="inpatient" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Grid>
    ) : null;

  // ─── Date fields (reusable) ──────────────────────────────────────────────
  const renderDateFields = (showSection = true) =>
    hasDateFields ? (
      <>
        {showSection && (
          <SectionLabel>
            <FormattedMessage id="section-visit-period" />
          </SectionLabel>
        )}
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="start-date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                inputFormat="DD/MM/YYYY"
                value={formValue.startDate}
                onChange={(value) => setFormValue((prev) => ({ ...prev, startDate: value }))}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="end-date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                inputFormat="DD/MM/YYYY"
                value={formValue.endDate}
                onChange={(value) => setFormValue((prev) => ({ ...prev, endDate: value }))}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Stack>
        </Grid>
      </>
    ) : null;

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 0 — Asal Kunjungan
  // ══════════════════════════════════════════════════════════════════════════
  const renderStep0 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={1.5}>
          <InputLabel required>
            <FormattedMessage id="visit-origin" />
          </InputLabel>
          <RadioGroup
            row
            name="visitSource"
            value={visitSource}
            onChange={(e) => {
              setVisitSource(e.target.value);
              setSelectedBooking(null);
              setBookingImageUrl(null);
              setBookingDetail(null);
              setFormValue((prev) => ({ ...CONSTANT_FORM_VALUE, configTransaction: prev.configTransaction }));
            }}
          >
            <FormControlLabel value="booking" control={<Radio />} label={<FormattedMessage id="from-booking" />} />
            <FormControlLabel value="walkIn" control={<Radio />} label={<FormattedMessage id="walk-in" />} />
          </RadioGroup>
        </Stack>
      </Grid>

      {visitSource === 'booking' && (
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel required>
              <FormattedMessage id="pick-booking" />
            </InputLabel>
            <Autocomplete
              options={bookingList}
              value={selectedBooking}
              isOptionEqualToValue={(option, val) => option.value === val.value}
              onChange={(_, selected) => handleBookingSelect(selected)}
              renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'search-booking' })} />}
              noOptionsText={intl.formatMessage({ id: 'no-data-found' })}
            />
            {selectedBooking && (
              <Alert severity="success" sx={{ mt: 1 }}>
                <FormattedMessage id="booking" /> terpilih — <FormattedMessage id="patient-and-pet" /> akan terisi otomatis.
              </Alert>
            )}
            {/* Gambar dari booking */}
            {bookingImageUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  <FormattedMessage id="booking-photo" />:
                </Typography>
                <Box
                  component="img"
                  src={bookingImageUrl}
                  alt={intl.formatMessage({ id: 'booking-photo' })}
                  onClick={() => window.open(bookingImageUrl, '_blank')}
                  sx={{
                    width: 160,
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.85 }
                  }}
                />
              </Box>
            )}
            {/* Detail inputan customer dari booking */}
            {bookingDetail && (
              <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
                  <FormattedMessage id="booking-detail-customer" />
                </Typography>
                <Grid container spacing={1.5}>
                  {/* Pet Clinic */}
                  {bookingDetail.serviceType === 'Pet Clinic' && (
                    <>
                      {bookingDetail.consultationType && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="consultation-type" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.consultationType}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.drugAllergy && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="drug-allergy" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.drugAllergy}</Typography>
                        </Grid>
                      )}
                    </>
                  )}
                  {/* Pet Hotel */}
                  {bookingDetail.serviceType === 'Pet Hotel' && (
                    <>
                      {bookingDetail.socializationType && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="socialization-type" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.socializationType}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.emergencyContactName && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="emergency-contact-name" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.emergencyContactName}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.emergencyPhoneNumber && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="emergency-phone-number" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.emergencyPhoneNumber}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.inventoryProducts && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="inventory-products" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.inventoryProducts}</Typography>
                        </Grid>
                      )}
                    </>
                  )}
                  {/* Pet Salon */}
                  {bookingDetail.serviceType === 'Pet Salon' && (
                    <>
                      {bookingDetail.furCondition && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="fur-condition" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.furCondition}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.skinSensitivity && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="skin-sensitivity" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.skinSensitivity}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.emergencyContactName && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="emergency-contact-name" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.emergencyContactName}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.emergencyPhoneNumber && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="emergency-phone-number" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.emergencyPhoneNumber}</Typography>
                        </Grid>
                      )}
                    </>
                  )}
                  {/* Breeding */}
                  {bookingDetail.serviceType === 'Breeding' && (
                    <>
                      {bookingDetail.stambum && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="stambum" />
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              bookingDetail.stambum === '1' || bookingDetail.stambum === true
                                ? intl.formatMessage({ id: 'available' })
                                : intl.formatMessage({ id: 'not-available' })
                            }
                            color={bookingDetail.stambum === '1' || bookingDetail.stambum === true ? 'success' : 'default'}
                          />
                        </Grid>
                      )}
                      {bookingDetail.healthClearance && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="health-clearance" />
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              bookingDetail.healthClearance === '1' || bookingDetail.healthClearance === true
                                ? intl.formatMessage({ id: 'available' })
                                : intl.formatMessage({ id: 'not-available' })
                            }
                            color={bookingDetail.healthClearance === '1' || bookingDetail.healthClearance === true ? 'success' : 'default'}
                          />
                        </Grid>
                      )}
                      {bookingDetail.emergencyContactName && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="emergency-contact-name" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.emergencyContactName}</Typography>
                        </Grid>
                      )}
                      {bookingDetail.emergencyPhoneNumber && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="emergency-phone-number" />
                          </Typography>
                          <Typography variant="body2">{bookingDetail.emergencyPhoneNumber}</Typography>
                        </Grid>
                      )}
                    </>
                  )}
                  {/* Catatan tambahan (semua tipe) */}
                  {bookingDetail.additionalInfo && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        <FormattedMessage id="additional-info" />
                      </Typography>
                      <Typography variant="body2">{bookingDetail.additionalInfo}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
          </Stack>
        </Grid>
      )}

      {visitSource === 'walkIn' && (
        <Grid item xs={12}>
          <Alert severity="info">
            <FormattedMessage id="visit-detail" /> — <FormattedMessage id="patient-and-pet" />
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Pasien & Hewan
  // ══════════════════════════════════════════════════════════════════════════
  const renderStep1 = () => (
    <Grid container spacing={3}>
      {/* Tipe Customer */}
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel required>
            <FormattedMessage id="customer-type" />
          </InputLabel>
          <RadioGroup
            row
            name="customer"
            value={formValue.customer}
            onChange={(e) => {
              setFormValue((prev) => ({
                ...prev,
                customer: e.target.value,
                customerName: null,
                pets: null,
                ...CONSTANT_PET_FORM
              }));
              dropdownList.setState((prev) => ({ ...prev, customerPetList: [] }));
            }}
          >
            <FormControlLabel value="old" control={<Radio />} label={<FormattedMessage id="existing-customer" />} />
            <FormControlLabel value="new" control={<Radio />} label={<FormattedMessage id="new-customer-first-time" />} />
          </RadioGroup>
        </Stack>
      </Grid>

      {/* Lokasi — diperlukan untuk load customer list */}
      {formValue.customer && (
        <>
          <SectionLabel>
            <FormattedMessage id="section-clinic-location" />
          </SectionLabel>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="location" />
              </InputLabel>
              <Autocomplete
                id="location"
                options={getDropdownAll().locationList}
                value={formValue.location}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => handleLocationChange(selected)}
                renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'search-location' })} />}
              />
            </Stack>
          </Grid>
        </>
      )}

      {/* ── Customer lama ──────────────────────────────────────────────── */}
      {formValue.customer === 'old' && (
        <>
          <SectionLabel>
            <FormattedMessage id="section-customer-info" />
          </SectionLabel>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="customer-name" />
              </InputLabel>
              <Autocomplete
                id="customer-name"
                options={customerList}
                value={formValue.customerName}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                disabled={!formValue.location}
                onChange={(_, selected) => {
                  const customerValue = selected ? selected : null;
                  setFormValue((e) => ({ ...e, customerName: customerValue, pets: null }));
                  dropdownList.setState((prev) => ({ ...prev, customerPetList: [] }));
                  if (customerValue) getCustomerPet(customerValue.value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={
                      formValue.location
                        ? intl.formatMessage({ id: 'search-customer-name' })
                        : intl.formatMessage({ id: 'select-location-first' })
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="registrant-name" />
              </InputLabel>
              <TextField
                fullWidth
                id="registrantName"
                name="registrantName"
                value={formValue.registrantName}
                onChange={(event) => setFormValue((e) => ({ ...e, registrantName: event.target.value }))}
                placeholder={intl.formatMessage({ id: 'registrant-name-optional' })}
              />
            </Stack>
          </Grid>

          <SectionLabel>
            <FormattedMessage id="section-pet" />
          </SectionLabel>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="pets" />
              </InputLabel>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box flex={1}>
                  <Autocomplete
                    id="pets"
                    options={customerPetList}
                    value={formValue.pets}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    disabled={!formValue.customerName}
                    onChange={(_, value) => onDropdownHandler(value, 'pets')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          formValue.customerName
                            ? intl.formatMessage({ id: 'select-pet' })
                            : intl.formatMessage({ id: 'select-customer-first' })
                        }
                      />
                    )}
                  />
                </Box>
                <IconButton
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={() => setFormPetConfig((e) => ({ ...e, isOpen: true }))}
                  sx={{ mt: 0.5, flexShrink: 0 }}
                >
                  <PlusOutlined />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>
        </>
      )}

      {/* ── Customer baru ──────────────────────────────────────────────── */}
      {formValue.customer === 'new' && (
        <>
          <SectionLabel>
            <FormattedMessage id="section-new-customer-info" />
          </SectionLabel>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="customer-name" />
              </InputLabel>
              <TextField
                fullWidth
                id="customerName"
                name="customerName"
                value={formValue.customerName || ''}
                onChange={(event) => onFieldHandler(event)}
                placeholder={intl.formatMessage({ id: 'full-name' })}
              />
            </Stack>
          </Grid>

          <SectionLabel>
            <FormattedMessage id="section-pet-data" />
          </SectionLabel>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel required>
                <FormattedMessage id="pet-name" />
              </InputLabel>
              <TextField
                fullWidth
                id="petName"
                name="petName"
                value={formValue.petName}
                onChange={(event) => onFieldHandler(event)}
                inputProps={{ maxLength: 100 }}
                placeholder={intl.formatMessage({ id: 'pet-name' })}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="pet-category" />
              </InputLabel>
              <Autocomplete
                id="pet-category"
                options={getDropdownAll().petCategoryList}
                value={formValue.petCategory}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onDropdownHandler(value, 'petCategory')}
                renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'pet-category' })} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="gender" />
              </InputLabel>
              <FormControl>
                <Select id="petGender" name="petGender" value={formValue.petGender} onChange={(event) => onFieldHandler(event)}>
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-gender" />
                    </em>
                  </MenuItem>
                  <MenuItem value="J">
                    <FormattedMessage id="male" />
                  </MenuItem>
                  <MenuItem value="B">
                    <FormattedMessage id="female" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="sterile" />
              </InputLabel>
              <FormControl>
                <Select id="petSterile" name="petSterile" value={formValue.petSterile} onChange={(event) => onFieldHandler(event)}>
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select" />
                    </em>
                  </MenuItem>
                  <MenuItem value="1">
                    <FormattedMessage id="yes" />
                  </MenuItem>
                  <MenuItem value="0">
                    <FormattedMessage id="no" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="condition" />
              </InputLabel>
              <TextField
                fullWidth
                id="petCondition"
                name="petCondition"
                value={formValue.petCondition}
                onChange={(event) => onFieldHandler(event)}
                inputProps={{ maxLength: 100 }}
                placeholder={intl.formatMessage({ id: 'condition' })}
              />
            </Stack>
          </Grid>

          {renderBirthDateFields()}
        </>
      )}
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2 — Detail Kunjungan
  // ══════════════════════════════════════════════════════════════════════════
  const renderStep2 = () => (
    <Grid container spacing={3}>
      <SectionLabel>
        <FormattedMessage id="section-type-doctor" />
      </SectionLabel>

      {/* Tipe Perawatan */}
      {renderTypeOfCareToggle()}

      {/* Dokter */}
      <Grid item xs={12} sm={isClinic ? 6 : 12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="treating-doctor" />
          </InputLabel>
          <Autocomplete
            id="treating-doctor"
            options={getDropdownAll().doctorList}
            value={formValue.treatingDoctor}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, selected) => setFormValue((e) => ({ ...e, treatingDoctor: selected ? selected : null }))}
            renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'treating-doctor' })} />}
          />
        </Stack>
      </Grid>

      {/* Tanggal */}
      {renderDateFields(true)}

      {/* Catatan */}
      <SectionLabel>
        <FormattedMessage id="section-additional-notes" />
      </SectionLabel>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="notes" />
          </InputLabel>
          <TextField
            multiline
            fullWidth
            rows={2}
            id="notes"
            name="notes"
            value={formValue.notes}
            onChange={(event) => setFormValue((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder={intl.formatMessage({ id: 'additional-info' })}
          />
        </Stack>
      </Grid>
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT MODE — Sectioned form tanpa stepper
  // ══════════════════════════════════════════════════════════════════════════
  const renderEditForm = () => (
    <Grid container spacing={3}>
      <SectionLabel>
        <FormattedMessage id="section-patient-info" />
      </SectionLabel>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="customer-name" />
          </InputLabel>
          {formValue.customer === 'old' ? (
            <Autocomplete
              id="customer-name"
              options={customerList}
              value={formValue.customerName}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, selected) => {
                const customerValue = selected ? selected : null;
                setFormValue((e) => ({ ...e, customerName: customerValue, pets: null }));
                dropdownList.setState((prev) => ({ ...prev, customerPetList: [] }));
                if (customerValue) getCustomerPet(customerValue.value);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          ) : (
            <TextField
              fullWidth
              id="customerName"
              name="customerName"
              value={formValue.customerName || ''}
              onChange={(event) => onFieldHandler(event)}
            />
          )}
        </Stack>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="registrant-name" />
          </InputLabel>
          <TextField
            fullWidth
            id="registrantName"
            name="registrantName"
            value={formValue.registrantName}
            onChange={(event) => setFormValue((e) => ({ ...e, registrantName: event.target.value }))}
          />
        </Stack>
      </Grid>

      <SectionLabel>
        <FormattedMessage id="section-pet-health-data" />
      </SectionLabel>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="pet-name" />
          </InputLabel>
          <TextField fullWidth id="petName" name="petName" value={formValue.petName} onChange={(event) => onFieldHandler(event)} />
        </Stack>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="pet-category" />
          </InputLabel>
          <Autocomplete
            id="pet-category"
            options={getDropdownAll().petCategoryList}
            value={formValue.petCategory}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => onDropdownHandler(value, 'petCategory')}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="gender" />
          </InputLabel>
          <FormControl>
            <Select id="petGender" name="petGender" value={formValue.petGender} onChange={(event) => onFieldHandler(event)}>
              <MenuItem value="">
                <em>
                  <FormattedMessage id="select-gender" />
                </em>
              </MenuItem>
              <MenuItem value="J">Jantan</MenuItem>
              <MenuItem value="B">Betina</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="sterile" />
          </InputLabel>
          <FormControl>
            <Select id="petSterile" name="petSterile" value={formValue.petSterile} onChange={(event) => onFieldHandler(event)}>
              <MenuItem value="">
                <em>
                  <FormattedMessage id="select" />
                </em>
              </MenuItem>
              <MenuItem value="1">
                <FormattedMessage id="yes" />
              </MenuItem>
              <MenuItem value="0">
                <FormattedMessage id="no" />
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="condition" />
          </InputLabel>
          <TextField
            fullWidth
            id="petCondition"
            name="petCondition"
            value={formValue.petCondition}
            onChange={(event) => onFieldHandler(event)}
            inputProps={{ maxLength: 100 }}
          />
        </Stack>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="birth-date" />
          </InputLabel>
          {formValue.petBirthDateType === 'birthDate' ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                inputFormat="DD/MM/YYYY"
                value={formValue.petDateOfBirth}
                onChange={(selected) => onDropdownHandler(selected, 'petDateOfBirth')}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          ) : (
            <Stack direction="row" spacing={1}>
              <TextField
                type="number"
                label={intl.formatMessage({ id: 'year' })}
                id="petYear"
                name="petYear"
                value={formValue.petYear}
                onChange={(event) => onFieldHandler(event)}
                inputProps={{ min: 0, max: 9999 }}
                sx={{ width: '50%' }}
              />
              <FormControl sx={{ width: '50%' }}>
                <InputLabel>
                  <FormattedMessage id="month" />
                </InputLabel>
                <Select
                  id="petMonth"
                  name="petMonth"
                  value={formValue.petMonth}
                  onChange={(event) => onFieldHandler(event)}
                  label={intl.formatMessage({ id: 'month' })}
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-month" />
                    </em>
                  </MenuItem>
                  {MONTH_NAMES.map((name, idx) => (
                    <MenuItem value={idx + 1} key={idx}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </Stack>
      </Grid>

      <SectionLabel>
        <FormattedMessage id="visit-detail" />
      </SectionLabel>

      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="location" />
          </InputLabel>
          <Autocomplete
            id="location"
            options={getDropdownAll().locationList}
            value={formValue.location}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, selected) => {
              const locationValue = selected ? selected : null;
              setFormValue((e) => ({ ...e, location: locationValue, treatingDoctor: null }));
              dropdownList.setState((prev) => ({ ...prev, doctorList: [] }));
              if (locationValue) getDoctorStaffByLocation(locationValue.value);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </Grid>

      {renderTypeOfCareToggle()}

      <Grid item xs={12} sm={isClinic ? 12 : 6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="treating-doctor" />
          </InputLabel>
          <Autocomplete
            id="treating-doctor"
            options={getDropdownAll().doctorList}
            value={formValue.treatingDoctor}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, selected) => setFormValue((e) => ({ ...e, treatingDoctor: selected ? selected : null }))}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </Grid>

      {renderDateFields(false)}

      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="notes" />
          </InputLabel>
          <TextField
            multiline
            fullWidth
            rows={2}
            id="notes"
            name="notes"
            value={formValue.notes}
            onChange={(event) => setFormValue((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </Stack>
      </Grid>
    </Grid>
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  const isLastStep = activeStep === STEPS.length - 1;

  return (
    <>
      <ModalC
        title={<FormattedMessage id={(isEditForm ? 'edit' : 'add') + '-transaction'} />}
        open={props.open}
        onOk={isEditForm ? onSubmit : undefined}
        onCancel={onCancel}
        fullWidth
        maxWidth="md"
        isModalAction={isEditForm}
        otherDialogAction={
          isEditForm ? (
            <Button variant="outlined" onClick={clearForm}>
              <FormattedMessage id="clear" />
            </Button>
          ) : undefined
        }
      >
        <ErrorContainer open={Boolean(errContent.title || errContent.detail)} content={errContent} />

        {/* ── Stepper (add mode only) ──────────────────────────────────── */}
        {!isEditForm && (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <Button size="small" variant="text" color="inherit" onClick={clearForm} sx={{ color: 'text.secondary' }}>
                <FormattedMessage id="reset-form" />
              </Button>
            </Stack>
          </>
        )}

        {/* ── Step error ────────────────────────────────────────────────── */}
        {stepError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {stepError}
          </Alert>
        )}

        {/* ── Content ──────────────────────────────────────────────────── */}
        {isEditForm ? (
          renderEditForm()
        ) : (
          <>
            {activeStep === 0 && renderStep0()}
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
          </>
        )}

        {/* ── Step navigation (add mode only) ──────────────────────────── */}
        {!isEditForm && (
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Box>
              {activeStep > 0 && (
                <Button variant="outlined" onClick={handleBack}>
                  ← <FormattedMessage id="back" />
                </Button>
              )}
            </Box>
            <Box>
              {!isLastStep ? (
                <Button variant="contained" onClick={handleNext}>
                  <FormattedMessage id="next" /> →
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={onSubmit}>
                  💾 <FormattedMessage id="save-transaction" />
                </Button>
              )}
            </Box>
          </Stack>
        )}
      </ModalC>

      {/* FormPet modal */}
      {formPetConfig.isOpen && (
        <FormPet
          open={formPetConfig.isOpen}
          onClose={(e) => {
            setFormPetConfig({ isOpen: false });
            if (e) {
              const newPet = {
                petName: e.name,
                petCategory: e.category,
                petCondition: e.condition,
                petGender: e.gender,
                petSterile: e.sterile,
                petBirthDateType: e.birthDateType,
                petDateOfBirth: e.dateOfBirth,
                petMonth: e.petMonth,
                petYear: e.petYear
              };
              const selectedPet = {
                label: newPet.petName,
                value: `${newPet.petName}-${customerPetList.length}`,
                formPetValue: newPet
              };
              dropdownList.setState((prev) => ({ ...prev, customerPetList: [selectedPet, ...prev.customerPetList] }));
              setFormValue((prev) => ({ ...prev, ...newPet, pets: selectedPet }));
            }
          }}
        />
      )}
    </>
  );
};

FormTransaction.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  type: PropTypes.string,
  onClose: PropTypes.func,
  defaultTypeOfCare: PropTypes.number,
  queueId: PropTypes.number
};

export default FormTransaction;
