import { PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ErrorContainer from 'components/@extended/ErrorContainer';
import IconButton from 'components/@extended/IconButton';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import ModalC from 'components/ModalC';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';
import { getCustomerPetList, getPetCategoryList } from 'pages/customer/service';
import { ServiceCategory, getKeyServiceCategoryByValue, getLocationTransactionList } from 'pages/transaction/service';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getCustomerByLocationList, getDoctorStaffByLocationList } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';
import FormPet from '../../form-pet';
import { createTransactionPetHotel, getTransactionPetHotelDetail, updateTransactionPetHotel } from './service';
import { getBookingDetail, getBookingListTransaction } from 'pages/booking/service';

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

const STEPS = ['Asal Kunjungan', 'Pasien & Hewan', 'Detail Kunjungan'];

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

const FormTransaction = (props) => {
  const { id } = props;
  const customerList = dropdownList((state) => state.customerList);
  const customerPetList = dropdownList((state) => state.customerPetList);

  const [isEditForm, setIsEditForm] = useState(false);
  const [formValue, setFormValue] = useState({ ...CONSTANT_FORM_VALUE });
  const [formPetConfig, setFormPetConfig] = useState({ isOpen: false });
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  const [visitSource, setVisitSource] = useState('');
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [files, setFiles] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const dispatch = useDispatch();

  const validateStep = (step) => {
    if (step === 0) {
      if (!visitSource) return 'Pilih asal kunjungan terlebih dahulu';
      if (visitSource === 'booking' && !selectedBooking) return 'Pilih nomor booking terlebih dahulu';
      return '';
    }
    if (step === 1) {
      if (!formValue.customer) return 'Pilih tipe customer terlebih dahulu';
      if (!formValue.location) return 'Pilih lokasi terlebih dahulu';
      if (formValue.customer === 'old' && !formValue.customerName) return 'Pilih nama customer';
      if (formValue.customer === 'old' && !formValue.pets) return 'Pilih hewan peliharaan';
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

  const onSubmit = async () => {
    const responseError = (err) => {
      dispatch(snackbarError(createMessageBackend(err)));
      const { msg, detail } = createMessageBackend(err, true);
      setErrContent({ title: msg, detail: detail });
    };
    const responseSuccess = (resp) => {
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(`Transaction has been ${id ? 'updated' : 'created'} successfully`));
        props.onClose(true);
      }
    };

    if (isEditForm) {
      await updateTransactionPetHotel({ id, ...formValue })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      try {
        const image = files && files[0] ? files[0] : null;
        const response = await createTransactionPetHotel({ ...formValue, image });
        responseSuccess(response);
      } catch (error) {
        responseError(error);
      }
    }
  };

  const clearForm = () => {
    setFormValue((prev) => ({ ...CONSTANT_FORM_VALUE, configTransaction: prev.configTransaction }));
    setSelectedBooking(null);
    setFiles(null);
    setVisitSource('');
    setActiveStep(0);
    setStepError('');
  };

  const onCancel = () => props.onClose(false);

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
        endDate: detail.endDate || null,
        treatingDoctor,
        notes: detail.additionalInfo || ''
      }));
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      loaderGlobalConfig.setLoader(false);
    }
  };

  const getDropdownList = async () => {
    const getPetCategory = await getPetCategoryList();
    const getLocation = await getLocationTransactionList();
    dropdownList.setState((prev) => ({ ...prev, petCategoryList: getPetCategory, locationList: getLocation }));
  };

  const getDetail = async () => {
    if (id) {
      const respDetail = await getTransactionPetHotelDetail({ id });
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
        configTransaction: getKeyServiceCategoryByValue(ServiceCategory.pacak),
        startDate: data.startDate,
        endDate: data.endDate,
        treatingDoctor,
        notes: data.note
      });
    }
  };

  const decideFormTransactionType = () => {
    setFormValue((prev) => ({ ...prev, configTransaction: getKeyServiceCategoryByValue(ServiceCategory.pacak) }));
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
      getBookingListTransaction({ locationId: userStorage?.locations, serviceType: 'Pet Hotel' })
        .then(setBookingList)
        .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitSource]);

  // ─── Birth date fields ───────────────────────────────────────────────────
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
            onChange={(e) =>
              setFormValue((prev) => ({ ...prev, petBirthDateType: e.target.value, petDateOfBirth: null, petMonth: '', petYear: '' }))
            }
          >
            <FormControlLabel value="birthDate" control={<Radio size="small" />} label="Tanggal Lahir" />
            <FormControlLabel value="monthAndYear" control={<Radio size="small" />} label="Bulan &amp; Tahun" />
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
                label="Tahun"
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
                <InputLabel>Bulan</InputLabel>
                <Select id="petMonth" name="petMonth" value={formValue.petMonth} onChange={(event) => onFieldHandler(event)} label="Bulan">
                  <MenuItem value="">
                    <em>Pilih Bulan</em>
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

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 0 — Asal Kunjungan
  // ══════════════════════════════════════════════════════════════════════════
  const renderStep0 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={1.5}>
          <InputLabel required>Asal Kunjungan</InputLabel>
          <RadioGroup
            row
            value={visitSource}
            onChange={(e) => {
              setVisitSource(e.target.value);
              setSelectedBooking(null);
              setFormValue((prev) => ({ ...CONSTANT_FORM_VALUE, configTransaction: prev.configTransaction }));
            }}
          >
            <FormControlLabel value="booking" control={<Radio />} label="Dari Booking" />
            <FormControlLabel value="walkIn" control={<Radio />} label="Datang Langsung (Walk-in)" />
          </RadioGroup>
        </Stack>
      </Grid>
      {visitSource === 'booking' && (
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel required>Pilih Booking</InputLabel>
            <Autocomplete
              options={bookingList}
              value={selectedBooking}
              isOptionEqualToValue={(option, val) => option.value === val.value}
              onChange={(_, selected) => handleBookingSelect(selected)}
              renderInput={(params) => <TextField {...params} placeholder="Cari nomor atau nama booking..." />}
              noOptionsText="Tidak ada data booking tersedia"
            />
            {selectedBooking && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Booking terpilih — data pasien &amp; kunjungan akan terisi otomatis.
              </Alert>
            )}
          </Stack>
        </Grid>
      )}
      {visitSource === 'walkIn' && (
        <Grid item xs={12}>
          <Alert severity="info">Silakan isi data pasien dan detail kunjungan di langkah berikutnya.</Alert>
        </Grid>
      )}
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Pasien & Hewan
  // ══════════════════════════════════════════════════════════════════════════
  const renderStep1 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel required>Tipe Customer</InputLabel>
          <RadioGroup
            row
            value={formValue.customer}
            onChange={(e) => {
              setFormValue((prev) => ({ ...prev, customer: e.target.value, customerName: null, pets: null, ...CONSTANT_PET_FORM }));
              dropdownList.setState((prev) => ({ ...prev, customerPetList: [] }));
            }}
          >
            <FormControlLabel value="old" control={<Radio />} label="Customer Lama (sudah terdaftar)" />
            <FormControlLabel value="new" control={<Radio />} label="Customer Baru (pertama kali)" />
          </RadioGroup>
        </Stack>
      </Grid>

      {formValue.customer && (
        <>
          <SectionLabel>Lokasi</SectionLabel>
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
                renderInput={(params) => <TextField {...params} placeholder="Pilih lokasi..." />}
              />
            </Stack>
          </Grid>
        </>
      )}

      {formValue.customer === 'old' && (
        <>
          <SectionLabel>Informasi Customer</SectionLabel>
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
                  <TextField {...params} placeholder={formValue.location ? 'Cari nama customer...' : 'Pilih lokasi dulu'} />
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
                placeholder="Nama yang mendaftarkan (opsional)"
              />
            </Stack>
          </Grid>
          <SectionLabel>Hewan Peliharaan</SectionLabel>
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
                      <TextField {...params} placeholder={formValue.customerName ? 'Pilih hewan peliharaan...' : 'Pilih customer dulu'} />
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

      {formValue.customer === 'new' && (
        <>
          <SectionLabel>Informasi Customer Baru</SectionLabel>
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
                placeholder="Nama lengkap customer"
              />
            </Stack>
          </Grid>
          <SectionLabel>Data Hewan Peliharaan</SectionLabel>
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
                placeholder="Nama hewan"
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
                renderInput={(params) => <TextField {...params} placeholder="Misal: Kucing, Anjing..." />}
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
                placeholder="Misal: Sehat, Demam, Luka..."
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
      <SectionLabel>Dokter &amp; Periode</SectionLabel>
      <Grid item xs={12} sm={6}>
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
            renderInput={(params) => <TextField {...params} placeholder="Pilih dokter penanggung jawab..." />}
          />
        </Stack>
      </Grid>
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
      <SectionLabel>Catatan &amp; Foto</SectionLabel>
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
            placeholder="Catatan tambahan untuk kunjungan ini (opsional)..."
          />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="upload-image" />
          </InputLabel>
          <SingleFileUpload file={files} setFieldValue={(_, value) => setFiles(value)} sx={{ height: 'auto' }} />
        </Stack>
      </Grid>
    </Grid>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT MODE — Sectioned form tanpa stepper
  // ══════════════════════════════════════════════════════════════════════════
  const renderEditForm = () => (
    <Grid container spacing={3}>
      <SectionLabel>Informasi Pasien</SectionLabel>
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
      <SectionLabel>Data Hewan</SectionLabel>
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
                label="Tahun"
                id="petYear"
                name="petYear"
                value={formValue.petYear}
                onChange={(event) => onFieldHandler(event)}
                inputProps={{ min: 0, max: 9999 }}
                sx={{ width: '50%' }}
              />
              <FormControl sx={{ width: '50%' }}>
                <InputLabel>Bulan</InputLabel>
                <Select id="petMonth" name="petMonth" value={formValue.petMonth} onChange={(event) => onFieldHandler(event)} label="Bulan">
                  <MenuItem value="">
                    <em>Pilih Bulan</em>
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
      <SectionLabel>Detail Kunjungan</SectionLabel>
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
      <Grid item xs={12} sm={6}>
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
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="upload-image" />
          </InputLabel>
          <SingleFileUpload file={files} setFieldValue={(_, value) => setFiles(value)} sx={{ height: 'auto' }} />
        </Stack>
      </Grid>
    </Grid>
  );

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
                Reset Form
              </Button>
            </Stack>
          </>
        )}

        {stepError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {stepError}
          </Alert>
        )}

        {isEditForm ? (
          renderEditForm()
        ) : (
          <>
            {activeStep === 0 && renderStep0()}
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
          </>
        )}

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
                  ← Kembali
                </Button>
              )}
            </Box>
            <Box>
              {!isLastStep ? (
                <Button variant="contained" onClick={handleNext}>
                  Lanjut →
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={onSubmit}>
                  💾 Simpan Transaksi
                </Button>
              )}
            </Box>
          </Stack>
        )}
      </ModalC>

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
  onClose: PropTypes.func
};

export default FormTransaction;
