import { Fragment, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getPetCategoryList } from 'pages/customer/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const CONSTANT_FORM_ERROR = {
  petNameErr: '',
  petCategoryErr: '',
  petConditionErr: '',
  petGenderErr: '',
  petSterileErr: '',
  petBirthDateType: '',
  petDateOfBirthErr: '',
  petMonthErr: '',
  petYearErr: ''
};

const FormPet = (props) => {
  const [formValue, setFormValue] = useState({
    name: '',
    category: null,
    condition: '',
    gender: '',
    sterile: '',
    birthDateType: '',
    dateOfBirth: null,
    petMonth: '',
    petYear: ''
  });
  const [formError, setFormError] = useState({ ...CONSTANT_FORM_ERROR });
  const [disabledOke, setDisabledOk] = useState(false);
  const [dropdownList, setDropdownList] = useState({ petCategoryList: [] });
  const isFirstRender = useRef(true);
  const intl = useIntl();

  const onFieldHandler = (event) => {
    if (event.target.name === 'petYear' && +event.target.value > 20) return;

    setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  };

  const onDropdownHandler = (selected, procedure) => {
    setFormValue((prevState) => ({ ...prevState, [procedure]: selected ? selected : null }));
  };

  const getDropdownList = async () => {
    const getData = await getPetCategoryList();

    setDropdownList((prevState) => ({ ...prevState, petCategoryList: getData }));
  };

  const onSubmit = () => props.onClose(formValue);
  const onCancel = () => props.onClose(false);

  useEffect(() => getDropdownList(), []);

  useEffect(() => {
    if (!isFirstRender.current) {
      const set_obj_err = { ...CONSTANT_FORM_ERROR };
      if (!formValue.name) set_obj_err.petNameErr = intl.formatMessage({ id: 'pet-name-is-required' });
      if (!formValue.category) set_obj_err.petCategoryErr = intl.formatMessage({ id: 'pet-category-is-required' });
      if (!formValue.condition) set_obj_err.petConditionErr = intl.formatMessage({ id: 'condition-is-required' });
      if (!formValue.gender) set_obj_err.petGenderErr = intl.formatMessage({ id: 'gender-is-required' });
      if (!formValue.sterile) set_obj_err.petSterileErr = intl.formatMessage({ id: 'sterile-is-required' });
      setFormError((prevState) => ({ ...prevState, ...set_obj_err }));
    }
    if (isFirstRender.current) isFirstRender.current = false;
  }, [formValue, intl]);

  useEffect(() => {
    setDisabledOk(Boolean(Object.values(formError).filter((dt) => dt).length));
  }, [formError]);

  return (
    <ModalC
      title={<FormattedMessage id="pet-information" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOke}
      onCancel={onCancel}
      fullWidth
      maxWidth="sm"
    >
      <Grid container spacing={3}>
        <Grid item xs={6} md={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
            <TextField
              fullWidth
              id="name"
              name="name"
              value={formValue.name}
              onChange={(event) => onFieldHandler(event)}
              inputProps={{ maxLength: 100 }}
              error={Boolean(formError.petNameErr && formError.petNameErr.length > 0)}
              helperText={formError.petNameErr}
            />
          </Stack>
        </Grid>
        <Grid item xs={6} md={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="pet-category" />
            </InputLabel>
            <Autocomplete
              id="pet-category"
              options={dropdownList.petCategoryList}
              value={formValue.category}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => onDropdownHandler(value, 'category')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formError.petCategoryErr && formError.petCategoryErr.length > 0)}
                  helperText={formError.petCategoryErr}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} md={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="condition">{<FormattedMessage id="condition" />}</InputLabel>
            <TextField
              fullWidth
              id="condition"
              name="condition"
              value={formValue.condition}
              onChange={(event) => onFieldHandler(event)}
              inputProps={{ maxLength: 100 }}
              error={Boolean(formError.petConditionErr && formError.petConditionErr.length > 0)}
              helperText={formError.petConditionErr}
            />
          </Stack>
        </Grid>

        <Grid item xs={6} md={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="gender">
              <FormattedMessage id="gender" />
            </InputLabel>
            <FormControl>
              <Select id={'gender'} name="gender" value={formValue.gender} onChange={(event) => onFieldHandler(event)}>
                <MenuItem value="">
                  <em>
                    <FormattedMessage id="select-gender" />
                  </em>
                </MenuItem>
                <MenuItem value={'J'}>Jantan</MenuItem>
                <MenuItem value={'B'}>Betina</MenuItem>
              </Select>
              {formError.petGenderErr.length > 0 && <FormHelperText error> {formError.petGenderErr} </FormHelperText>}
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="sterile">
              <FormattedMessage id="sterile" />
            </InputLabel>
            <FormControl>
              <Select id={'sterile'} name="sterile" value={formValue.sterile} onChange={(event) => onFieldHandler(event)}>
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
              {formError.petSterileErr.length > 0 && <FormHelperText error> {formError.petSterileErr} </FormHelperText>}
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <Stack spacing={1} flexDirection="row" alignItems="center">
              <InputLabel htmlFor="birth-date">
                <FormattedMessage id="birth-date" />
              </InputLabel>
              <RadioGroup
                name="birthDateType"
                value={formValue.birthDateType} // birthDate || monthAndYear
                style={{ flexDirection: 'row', height: '20px', marginLeft: '16px', marginTop: '0px' }}
                onChange={(e) => {
                  setFormValue((prevState) => {
                    return {
                      ...prevState,
                      birthDateType: e.target.value,
                      dateOfBirth: null,
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

            {formValue.birthDateType === 'birthDate' && (
              <Fragment>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    value={formValue.dateOfBirth}
                    onChange={(selected) => onDropdownHandler(selected, 'dateOfBirth')}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Fragment>
            )}

            {formValue.birthDateType === 'monthAndYear' && (
              <Fragment>
                <Stack spacing={1} flexDirection={'row'} sx={{ width: '100%' }} gap={'10px'}>
                  <TextField
                    fullWidth
                    type="number"
                    label={<FormattedMessage id="year" />}
                    id={'petYear'}
                    name="petYear"
                    value={formValue.petYear}
                    onChange={(event) => onFieldHandler(event)}
                    inputProps={{ min: 0, max: 20 }}
                    sx={{ width: '50%' }}
                  />
                  <FormControl style={{ marginTop: 'unset' }} sx={{ width: '50%' }}>
                    <InputLabel>
                      <FormattedMessage id="select-month" />
                    </InputLabel>
                    <Select id={'petMonth'} name="petMonth" value={formValue.petMonth} onChange={(event) => onFieldHandler(event)}>
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
      </Grid>
    </ModalC>
  );
};

FormPet.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormPet;
