import { FormattedMessage } from 'react-intl';
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
  Radio
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
  updateTransaction
} from './service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { create } from 'zustand';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormPet from './form-pet';
import ErrorContainer from 'components/@extended/ErrorContainer';
import { jsonCentralized } from 'utils/func';

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
  registrationNo: '', // used in update form
  customer: '',
  location: null,
  customerId: '',
  customerName: null,
  registrantName: '',
  pets: null, // hewan peliharaan,
  configTransaction: '',
  startDate: null,
  endDate: null,
  treatingDoctor: null,
  notes: '',

  // Pet form
  ...CONSTANT_PET_FORM
};

export const dropdownList = create(() =>
  jsonCentralized({ locationList: [], petCategoryList: [], customerList: [], doctorList: [], customerPetList: [] })
);
export const getDropdownAll = () => dropdownList.getState();

const FormTransaction = (props) => {
  const { id } = props;
  const customerList = dropdownList((state) => state.customerList);

  const [isEditForm, setIsEditForm] = useState(false);
  const [formValue, setFormValue] = useState({ ...CONSTANT_FORM_VALUE });
  const [disabledOk, setDisabledOk] = useState(false);
  const [formPetConfig, setFormPetConfig] = useState({ isOpen: false });
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  const dispatch = useDispatch();

  const onSubmit = async () => {
    const responseError = (err) => {
      dispatch(snackbarError(createMessageBackend(err)));
      const { msg, detail } = createMessageBackend(err, true);
      setErrContent({ title: msg, detail: detail });
    };

    const responseSuccess = (resp) => {
      const message = `Transaction has been ${id ? 'updated' : 'created'} successfully`;
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(message));
        props.onClose(true);
      }
    };

    if (isEditForm) {
      await updateTransaction({ id, ...formValue })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      await createTransaction(formValue).then(responseSuccess).catch(responseError);
    }
  };
  const clearForm = () => setFormValue(() => ({ ...CONSTANT_FORM_VALUE }));
  const onCancel = () => props.onClose(false);

  const onFieldHandler = (event) => {
    if (event.target.name === 'petYear' && +event.target.value > 9999) return;

    setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  };

  const onDropdownHandler = (selected, procedure) => {
    setFormValue((prevState) => {
      let returnNewFormValue = { ...prevState, [procedure]: selected ? selected : null };
      if (procedure === 'pets') {
        if (selected.formPetValue) {
          const newPet = {
            petName: selected.formPetValue.petName,
            petCategory: selected.formPetValue.petCategory,
            petCondition: selected.formPetValue.petCondition,
            petGender: selected.formPetValue.petGender,
            petSterile: selected.formPetValue.petSterile,
            petBirthDateType: selected.formPetValue.petBirthDateType,
            petDateOfBirth: selected.formPetValue.petDateOfBirth,
            petMonth: selected.formPetValue.petMonth,
            petYear: selected.formPetValue.petYear
          };
          returnNewFormValue = { ...returnNewFormValue, ...newPet };
        } else {
          returnNewFormValue = { ...returnNewFormValue, ...CONSTANT_PET_FORM };
        }
      }

      return returnNewFormValue;
    });
  };

  const getDoctorStaffByLocation = async (locationId) => {
    const getDoctor = await getDoctorStaffByLocationList(locationId);
    dropdownList.setState((prevState) => ({ ...prevState, doctorList: getDoctor }));
  };

  const getCustomerByLocation = async (locationId) => {
    const getCustomer = await getCustomerByLocationList(locationId);
    dropdownList.setState((prevState) => ({ ...prevState, customerList: getCustomer }));
  };

  const getCustomerPet = async (customerId) => {
    const getPet = await getCustomerPetList(customerId);
    dropdownList.setState((prevState) => ({ ...prevState, customerPetList: getPet }));
  };

  const getDropdownList = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getPetCategory = await getPetCategoryList();
      const getLocation = await getLocationTransactionList();

      dropdownList.setState((prevState) => ({ ...prevState, petCategoryList: getPetCategory, locationList: getLocation }));

      resolve(true);
    });
  };

  const getData = async () => {
    loaderGlobalConfig.setLoader(true);

    await getDropdownList();
    getDetail();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  const getDetail = async () => {
    if (id) {
      const respDetail = await getTransactionDetail({ id });
      const data = respDetail.data.detail;
      setIsEditForm(true);

      const getDoctorList = await getDoctorStaffByLocationList(+data.locationId);
      dropdownList.setState((prevState) => ({ ...prevState, doctorList: getDoctorList }));

      const getLocationList = getDropdownAll().locationList;
      const getPetCategoryList = getDropdownAll().petCategoryList;
      const locations = getLocationList.length ? getLocationList.find((dt) => dt.value === +data.locationId) : null;
      const petCategory = getPetCategoryList.length ? getPetCategoryList.find((dt) => dt.value === +data.petCategoryId) : null;
      const treatingDoctor = getDoctorList.length ? getDoctorList.find((dt) => dt.value === +data.doctorId) : null;

      setFormValue({
        registrationNo: data.registrationNo,
        customer: +data.isNewCustomer ? 'new' : 'old',
        location: locations, // need id
        customerId: data.customerId,
        customerName: data.customerName,
        registrantName: data.registrant,
        pets: +data.petId, // need pet id
        petId: +data.petId,
        petName: data.petName,
        petCategory, // need id
        petCondition: data.condition,
        petGender: data.petGender, // need J or B
        petSterile: data.petSterile, // need '1' or '0'
        petBirthDateType: data.petMonth || data.petYear ? 'monthAndYear' : 'birthDate', // need 'birthDate' or 'monthAndYear'
        petDateOfBirth: data.dateOfBirth, // belum ada
        petMonth: data.petMonth, // belum ada
        petYear: data.petYear, // belum ada

        configTransaction: getKeyServiceCategoryByValue(data.serviceCategory),
        startDate: data.startDate,
        endDate: data.endDate,
        treatingDoctor, // need id
        notes: data.note
      });
    }
  };

  useEffect(() => {
    getData();

    return () => {
      dropdownList.setState(
        jsonCentralized({ locationList: [], petCategoryList: [], customerList: [], doctorList: [], customerPetList: [] })
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ModalC
        title={<FormattedMessage id={(isEditForm ? 'edit' : 'add') + '-transaction'} />}
        open={props.open}
        onOk={onSubmit}
        disabledOk={disabledOk}
        onCancel={onCancel}
        fullWidth
        maxWidth="md"
        otherDialogAction={
          <>
            <Button variant="outlined" onClick={clearForm}>
              {<FormattedMessage id="clear" />}
            </Button>
          </>
        }
      >
        <ErrorContainer open={Boolean(errContent.title || errContent.detail)} content={errContent} />
        <Grid container spacing={3}>
          {!isEditForm && (
            <>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="customer" />
                  </InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="customer"
                      name="customer"
                      value={formValue.customer}
                      onChange={(event) => {
                        setFormValue((e) => ({
                          ...e,
                          customer: event.target.value,
                          location: null,
                          // reset pet form
                          ...CONSTANT_PET_FORM
                        }));
                      }}
                      placeholder="Select customer"
                    >
                      <MenuItem value="">
                        <em>
                          <FormattedMessage id="select-customer" />
                        </em>
                      </MenuItem>
                      <MenuItem value={'old'}>
                        <FormattedMessage id="customer-old" />
                      </MenuItem>
                      <MenuItem value={'new'}>
                        <FormattedMessage id="customer-new" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="location">
                    <FormattedMessage id="location" />
                  </InputLabel>
                  <Autocomplete
                    id="location"
                    options={getDropdownAll().locationList}
                    value={formValue.location}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, selected) => {
                      const locationValue = selected ? selected : null;
                      setFormValue((e) => ({ ...e, location: locationValue, customerName: null, treatingDoctor: null }));

                      // setDropdownList((prevState) => ({ ...prevState, customerList: [], doctorList: [] }));
                      dropdownList.setState((prevState) => ({ ...prevState, customerList: [], doctorList: [] }));
                      if (locationValue) {
                        getCustomerByLocation(locationValue.value);
                        getDoctorStaffByLocation(locationValue.value);
                      }
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {formValue.customer && (
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="customer-name">
                      <FormattedMessage id="customer-name" />
                    </InputLabel>
                    {formValue.customer === 'old' && (
                      <Autocomplete
                        id="customer-name"
                        options={customerList}
                        value={formValue.customerName}
                        isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                        onChange={(_, selected) => {
                          const customerValue = selected ? selected : null;
                          setFormValue((e) => ({ ...e, customerName: customerValue, pets: null }));

                          // setDropdownList((prevState) => ({ ...prevState, customerPetList: [] }));
                          dropdownList.setState((prevState) => ({ ...prevState, customerPetList: [] }));
                          if (customerValue) getCustomerPet(customerValue.value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // error={Boolean(dt.error.customerNameErr && dt.error.customerNameErr.length > 0)}
                            // helperText={dt.error.customerNameErr}
                            // variant="outlined"
                          />
                        )}
                      />
                    )}
                    {formValue.customer === 'new' && (
                      <TextField
                        fullWidth
                        id="customerName"
                        name="customerName"
                        value={formValue.customerName || ''}
                        onChange={(event) => onFieldHandler(event)}
                        // error={Boolean(dt.error.customerNameErr && dt.error.customerNameErr.length > 0)}
                        // helperText={dt.error.customerNameErr}
                      />
                    )}
                  </Stack>
                </Grid>
              )}

              {formValue.customer === 'old' && (
                <>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>
                        <FormattedMessage id="registrant-name" />
                      </InputLabel>
                      <TextField
                        type="registrant-name"
                        fullWidth
                        id="registrantName"
                        name="registrantName"
                        value={formValue.registrantName}
                        onChange={(event) => {
                          setFormValue((e) => ({ ...e, registrantName: event.target.value }));
                        }}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <InputLabel htmlFor="pets">
                          <FormattedMessage id="pets" />
                        </InputLabel>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={1}>
                          <Grid item xs={11} sm={11} md={11}>
                            <Autocomplete
                              id="pets"
                              options={getDropdownAll().customerPetList}
                              value={formValue.pets}
                              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                              onChange={(_, value) => onDropdownHandler(value, 'pets')}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  // error={Boolean(dt.error.countryErr && dt.error.countryErr.length > 0)}
                                  // helperText={dt.error.countryErr}
                                  // variant="outlined"
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={1} sm={1} md={1} display="flex" justifyContent={'flex-end'}>
                            <IconButton
                              size="medium"
                              variant="contained"
                              color="primary"
                              onClick={() => setFormPetConfig((e) => ({ ...e, isOpen: true }))}
                            >
                              <PlusOutlined />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}

              {formValue.customer === 'new' && (
                <>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="name">{<FormattedMessage id="pet-name" />}</InputLabel>
                      <TextField
                        fullWidth
                        id="petName"
                        name="petName"
                        value={formValue.petName}
                        onChange={(event) => onFieldHandler(event)}
                        inputProps={{ maxLength: 100 }}
                        // error={Boolean(dt.error.petNameErr && dt.error.petNameErr.length > 0)}
                        // helperText={dt.error.petNameErr}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // error={Boolean(dt.error.petCategoryErr && dt.error.petCategoryErr.length > 0)}
                            // helperText={dt.error.petCategoryErr}
                            // variant="outlined"
                          />
                        )}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="petCondition">{<FormattedMessage id="condition" />}</InputLabel>
                      <TextField
                        fullWidth
                        id="petCondition"
                        name="petCondition"
                        value={formValue.petCondition}
                        onChange={(event) => onFieldHandler(event)}
                        inputProps={{ maxLength: 100 }}
                        // error={Boolean(dt.error.conditionErr && dt.error.conditionErr.length > 0)}
                        // helperText={dt.error.conditionErr}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="petGender">
                        <FormattedMessage id="gender" />
                      </InputLabel>
                      <FormControl>
                        <Select id={'petGender'} name="petGender" value={formValue.petGender} onChange={(event) => onFieldHandler(event)}>
                          <MenuItem value="">
                            <em>
                              <FormattedMessage id="select-gender" />
                            </em>
                          </MenuItem>
                          <MenuItem value={'J'}>Jantan</MenuItem>
                          <MenuItem value={'B'}>Betina</MenuItem>
                        </Select>
                        {/* {dt.error.petGenderErr.length > 0 && <FormHelperText error> {dt.error.petGenderErr} </FormHelperText>} */}
                      </FormControl>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="petSterile">
                        <FormattedMessage id="sterile" />
                      </InputLabel>
                      <FormControl>
                        <Select
                          id={'petSterile'}
                          name="petSterile"
                          value={formValue.petSterile}
                          onChange={(event) => onFieldHandler(event)}
                        >
                          <MenuItem value="">
                            <em>
                              <FormattedMessage id="select" />
                            </em>
                          </MenuItem>
                          <MenuItem value={'1'}>
                            <FormattedMessage id="yes" />
                          </MenuItem>
                          <MenuItem value={'0'}>
                            <FormattedMessage id="no" />
                          </MenuItem>
                        </Select>
                        {/* {dt.error.isSterilErr.length > 0 && <FormHelperText error> {dt.error.isSterilErr} </FormHelperText>} */}
                      </FormControl>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <Stack spacing={1}>
                      <Stack spacing={1} flexDirection="row" alignItems="center">
                        <InputLabel htmlFor="pet-birth-date">
                          <FormattedMessage id="birth-date" />
                        </InputLabel>
                        <RadioGroup
                          name="petBirthDateType"
                          value={formValue.petBirthDateType} // birthDate || monthAndYear
                          style={{ flexDirection: 'row', height: '20px', marginLeft: '16px', marginTop: '0px' }}
                          onChange={(e) => {
                            setFormValue((prevState) => {
                              return {
                                ...prevState,
                                petBirthDateType: e.target.value,
                                petDateOfBirth: null,
                                petMonth: '',
                                petYear: ''
                              };
                            });
                          }}
                        >
                          <FormControlLabel
                            value="birthDate"
                            control={<Radio />}
                            label={<FormattedMessage id="birth-date" />}
                            style={{ height: '20px' }}
                          />
                          <FormControlLabel
                            value="monthAndYear"
                            control={<Radio />}
                            label={<FormattedMessage id="month-and-year" />}
                            style={{ height: '20px' }}
                          />
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
                        <Fragment>
                          <Stack spacing={1} flexDirection={'row'} sx={{ width: '100%' }} gap={'10px'}>
                            <TextField
                              type="number"
                              fullWidth
                              label={<FormattedMessage id="year" />}
                              id={'petYear'}
                              name="petYear"
                              value={formValue.petYear}
                              onChange={(event) => onFieldHandler(event)}
                              inputProps={{ min: 0, max: 9999 }}
                              sx={{ width: '50%' }}
                            />
                            <FormControl style={{ marginTop: 'unset' }} sx={{ width: '50%' }}>
                              <InputLabel>
                                <FormattedMessage id="select-month" />
                              </InputLabel>
                              <Select
                                id={'petMonth'}
                                name="petMonth"
                                value={formValue.petMonth}
                                onChange={(event) => onFieldHandler(event)}
                              >
                                <MenuItem value="">
                                  <em>
                                    <FormattedMessage id="select-month" />
                                  </em>
                                </MenuItem>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((dt, idx) => (
                                  <MenuItem value={dt} key={idx}>
                                    {dt}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Stack>
                        </Fragment>
                      )}
                    </Stack>
                  </Grid>
                </>
              )}
            </>
          )}

          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="type-category" />}>
              <RadioGroup
                name="configTransaction"
                value={formValue.configTransaction}
                style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: '20px' }}
                onChange={(e) => {
                  setFormValue((prevState) => ({ ...prevState, configTransaction: e.target.value }));
                }}
              >
                <FormControlLabel value="clinic" control={<Radio />} label={'Pet Clinic'} style={{ height: '20px' }} />
                <FormControlLabel value="hotel" control={<Radio />} label={'Pet Hotel'} style={{ height: '20px' }} />
                <FormControlLabel value="salon" control={<Radio />} label={'Pet Salon'} style={{ height: '20px' }} />
                <FormControlLabel value="pacak" control={<Radio />} label={'Pacak'} style={{ height: '20px' }} />
              </RadioGroup>

              <Grid container spacing={3}>
                {formValue.configTransaction === 'hotel' && (
                  <>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="start-date">
                          <FormattedMessage id="start-date" />
                        </InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopDatePicker
                            inputFormat="DD/MM/YYYY"
                            value={formValue.startDate}
                            onChange={(value) => setFormValue((prevState) => ({ ...prevState, startDate: value }))}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="end-date">
                          <FormattedMessage id="end-date" />
                        </InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopDatePicker
                            inputFormat="DD/MM/YYYY"
                            value={formValue.endDate}
                            onChange={(value) => setFormValue((prevState) => ({ ...prevState, endDate: value }))}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      </Stack>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="treating-doctor">
                      <FormattedMessage id="treating-doctor" />
                    </InputLabel>
                    <Autocomplete
                      id="treating-doctor"
                      options={getDropdownAll().doctorList}
                      value={formValue.treatingDoctor}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, selected) => {
                        setFormValue((e) => ({ ...e, treatingDoctor: selected ? selected : null }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={Boolean(dt.error.countryErr && dt.error.countryErr.length > 0)}
                          // helperText={dt.error.countryErr}
                          // variant="outlined"
                        />
                      )}
                    />
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
                      rows={5}
                      id="notes"
                      name="notes"
                      value={formValue.notes}
                      onChange={(event) => {
                        setFormValue((prevState) => ({ ...prevState, notes: event.target.value }));
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
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
                value: `${newPet.petName}-${dropdownList.customerPetList.length}`,
                formPetValue: newPet
              };
              // setDropdownList((prevState) => ({
              //   ...prevState,
              //   customerPetList: [selectedPet, ...prevState.customerPetList]
              // }));
              dropdownList.setState((prevState) => ({ ...prevState, customerPetList: [selectedPet, ...prevState.customerPetList] }));
              setFormValue((prevState) => ({ ...prevState, ...newPet, pets: selectedPet }));
            }
          }}
        />
      )}
    </>
  );
};

FormTransaction.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormTransaction;
