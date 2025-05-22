import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
// import { checkHplStatus, checkPetConditionTransaction } from '../../../../service';
import {
  checkPetConditionTransactionPetClinic,
  CONSTANT_CHECK_PET_CONDITION_PET_CLINIC_FORM_VALUE,
  getLoadPetCheckTransactionPetClinic,
  getOrderNumberTransactionPetClinic
} from '../../service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import {
  getTransactionListDataBreath,
  getTransactionListDataHeart,
  getTransactionListDataSound,
  getTransactionListDataTemperature,
  getTransactionListDataVaginal,
  getTransactionListDataWeight
} from 'pages/transaction/service';
// import MainCard from 'components/MainCard';

const CheckPetConditionPetClinic = (props) => {
  const { data } = props;
  const [formValue, setFormValue] = useState({ ...CONSTANT_CHECK_PET_CONDITION_PET_CLINIC_FORM_VALUE });

  const [formDropdown, setFormDropdown] = useState({
    weightList: [],
    temperatureList: [],
    breathList: [],
    breathSoundList: [],
    heartList: [],
    vaginalList: []
  });
  const [disabledOke, setDisabledOk] = useState(false);
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const dispatch = useDispatch();
  const intl = useIntl();

  const onSubmit = async () => {
    console.log('form value', formValue);

    await checkPetConditionTransactionPetClinic(formValue)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Success check pet condition'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose(false);

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);

      Promise.all([
        getOrderNumberTransactionPetClinic(data.transactionId),
        getLoadPetCheckTransactionPetClinic(data.transactionId),
        getTransactionListDataWeight(),
        getTransactionListDataTemperature(),
        getTransactionListDataBreath(),
        getTransactionListDataSound(),
        getTransactionListDataHeart(),
        getTransactionListDataVaginal()
      ])
        .finally(() => {
          loaderGlobalConfig.setLoader(false);
          loaderService.setManualLoader(false);
        })
        .then(([respOrderNumber, respLoadPetCheck, respWeight, respTemperature, respBreath, respSound, respHeart, respVaginal]) => {
          console.log('respLoadPetCheck', respLoadPetCheck);
          setFormValue((prevState) => ({
            ...prevState,
            transactionPetClinicId: data.transactionId,
            petCheckRegistrationNo: respOrderNumber.data,
            ownerName: respLoadPetCheck.data.ownerName,
            noTelp: respLoadPetCheck.data.phoneNumber,
            petType: respLoadPetCheck.data.type
          }));

          setFormDropdown((prevState) => ({
            ...prevState,
            weightList: respWeight,
            temperatureList: respTemperature,
            breathList: respBreath,
            breathSoundList: respSound,
            heartList: respHeart,
            vaginalList: respVaginal
          }));
        });
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFieldHandler = (event) => setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));

  return (
    <>
      <ModalC
        title={<FormattedMessage id="check-pet-condition" />}
        open={props.open}
        onOk={() => onSubmit()}
        disabledOk={disabledOke}
        onCancel={onCancel}
        fullWidth
        maxWidth="xxl"
      >
        <Box marginBottom={'25px'}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={1.25} flexDirection={'row'} alignItems={'center'}>
                    <InputLabel htmlFor="NO" style={{ fontWeight: 'bold' }} sx={{ width: { xs: '100%', sm: '20%' } }}>
                      NO
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="petCheckRegistrationNo"
                      name="petCheckRegistrationNo"
                      value={formValue.petCheckRegistrationNo}
                      sx={{ width: { xs: '100%', sm: '80%' } }}
                      inputProps={{ readOnly: true }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1.25} flexDirection={'row'} alignItems={'center'}>
                    <InputLabel htmlFor="owners-name" style={{ fontWeight: 'bold' }} sx={{ width: { xs: '100%', sm: '20%' } }}>
                      <FormattedMessage id="owners-name" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="ownerName"
                      name="ownerName"
                      value={formValue.ownerName}
                      sx={{ width: { xs: '100%', sm: '80%' } }}
                      inputProps={{ readOnly: true }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1.25} flexDirection={'row'} alignItems={'center'}>
                    <InputLabel htmlFor="no-telp" style={{ fontWeight: 'bold' }} sx={{ width: { xs: '100%', sm: '20%' } }}>
                      No. Telp
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="noTelp"
                      name="noTelp"
                      value={formValue.noTelp}
                      sx={{ width: { xs: '100%', sm: '80%' } }}
                      inputProps={{ readOnly: true }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1.25} flexDirection={'row'} alignItems={'center'}>
                    <InputLabel htmlFor="pet-name-type" style={{ fontWeight: 'bold' }} sx={{ width: { xs: '100%', sm: '20%' } }}>
                      <FormattedMessage id="pet-name-type" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="petType"
                      name="petType"
                      value={formValue.petType}
                      sx={{ width: { xs: '100%', sm: '80%' } }}
                      inputProps={{ readOnly: true }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Box marginBottom={'25px'}>
          <Typography variant="h5">Anamnesa</Typography>
          <Divider style={{ marginTop: 5, marginBottom: 20 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="anthelmintic" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'anthelmintic'} />
                </InputLabel>
                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={2}>
                  <Select
                    value={formValue.isAnthelmintic}
                    name="isAnthelmintic"
                    onChange={(event) => onFieldHandler(event)}
                    fullWidth
                    sx={{ width: { xs: '100%', sm: '33%' } }}
                  >
                    <MenuItem value="1">
                      <FormattedMessage id={'yes'} />
                    </MenuItem>
                    <MenuItem value="0">
                      <FormattedMessage id={'no'} />
                    </MenuItem>
                  </Select>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      value={formValue.anthelminticDate}
                      onChange={(value) => {
                        setFormValue((prevState) => ({
                          ...prevState,
                          anthelminticDate: value
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} sx={{ width: { xs: '100%', sm: '33%' } }} />}
                    />
                  </LocalizationProvider>
                  <TextField
                    fullWidth
                    id="anthelmintic-brand"
                    value={formValue.anthelminticBrand}
                    name="anthelminticBrand"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder="Merk"
                    sx={{ width: { xs: '100%', sm: '33%' } }}
                  />
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="vaksinasi" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'vaccination'} />
                </InputLabel>
                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={2}>
                  <Select
                    value={formValue.isVaccination}
                    name="isVaccination"
                    onChange={(event) => onFieldHandler(event)}
                    fullWidth
                    sx={{ width: { xs: '100%', sm: '33%' } }}
                  >
                    <MenuItem value="1">
                      <FormattedMessage id={'yes'} />
                    </MenuItem>
                    <MenuItem value="0">
                      <FormattedMessage id={'no'} />
                    </MenuItem>
                  </Select>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      value={formValue.vaccinationDate}
                      onChange={(value) => {
                        setFormValue((prevState) => ({
                          ...prevState,
                          vaccinationDate: value
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} sx={{ width: { xs: '100%', sm: '33%' } }} />}
                    />
                  </LocalizationProvider>
                  <TextField
                    fullWidth
                    id="vaccination-brand"
                    value={formValue.vaccinationBrand}
                    name="vaccinationBrand"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder="Merk"
                    sx={{ width: { xs: '100%', sm: '33%' } }}
                  />
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="flea-medicine" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'flea-medicine'} />
                </InputLabel>
                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={2}>
                  <Select
                    value={formValue.isFleaMedicine}
                    name="isFleaMedicine"
                    onChange={(event) => onFieldHandler(event)}
                    fullWidth
                    sx={{ width: { xs: '100%', sm: '33%' } }}
                  >
                    <MenuItem value="1">
                      <FormattedMessage id={'yes'} />
                    </MenuItem>
                    <MenuItem value="0">
                      <FormattedMessage id={'no'} />
                    </MenuItem>
                  </Select>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      value={formValue.fleaMedicineDate}
                      onChange={(value) => {
                        setFormValue((prevState) => ({
                          ...prevState,
                          fleaMedicineDate: value
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} sx={{ width: { xs: '100%', sm: '33%' } }} />}
                    />
                  </LocalizationProvider>
                  <TextField
                    fullWidth
                    id="flea-brand"
                    value={formValue.fleaMedicineBrand}
                    name="fleaMedicineBrand"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder="Merk"
                    sx={{ width: { xs: '100%', sm: '33%' } }}
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}></Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="the-treatment-already-given-previously" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'the-treatment-already-given-previously'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="previous-action"
                  value={formValue.previousAction}
                  name="previousAction"
                  onChange={(event) => onFieldHandler(event)}
                  placeholder=""
                />
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="other-complaints" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'other-complaints'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="others-complaints"
                  value={formValue.othersCompalints}
                  name="othersCompalints"
                  onChange={(event) => onFieldHandler(event)}
                  placeholder=""
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box marginBottom={'25px'}>
          <Typography variant="h5">
            <FormattedMessage id="check-up-result" />
          </Typography>
          <Divider style={{ marginTop: 5, marginBottom: 20 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="weight" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id="weight" />
                </InputLabel>
                <Stack flexDirection={'row'} alignItems={'center'} gap={1}>
                  <TextField
                    fullWidth
                    type="number"
                    id="weight"
                    name="weight"
                    value={formValue.weight}
                    inputProps={{ min: 0 }}
                    onChange={(event) => onFieldHandler(event)}
                  />
                  <span>KG</span>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="weight-category" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id="weight-category" />
                </InputLabel>
                <Select fullWidth name="weightCategory" value={formValue.weightCategory} onChange={(event) => onFieldHandler(event)}>
                  {formDropdown.weightList.map((dt, idx) => (
                    <MenuItem value={dt.value} key={idx}>
                      {dt.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="temperature" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'temperature'} />
                </InputLabel>

                <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} justifyContent="space-between" alignItems="center">
                  <Stack flexDirection={'row'} alignItems={'center'} gap={1} sx={{ width: { xs: '100%', sm: '25%' } }}>
                    <TextField
                      fullWidth
                      type="number"
                      id="temperature"
                      name="temperature"
                      value={formValue.temperature}
                      inputProps={{ min: 0 }}
                      onChange={(event) => onFieldHandler(event)}
                    />
                    <span>°C</span>
                  </Stack>

                  <Stack flexDirection={'row'} alignItems={'center'} gap={1} sx={{ width: { xs: '100%', sm: '25%' } }}>
                    <TextField
                      fullWidth
                      type="number"
                      id="temperatureBottom"
                      name="temperatureBottom"
                      value={formValue.temperatureBottom}
                      inputProps={{ min: 0 }}
                      onChange={(event) => onFieldHandler(event)}
                    />
                    <span>S.D</span>
                  </Stack>

                  <Stack flexDirection={'row'} alignItems={'center'} gap={1} sx={{ width: { xs: '100%', sm: '25%' } }}>
                    <TextField
                      fullWidth
                      type="number"
                      id="temperatureTop"
                      name="temperatureTop"
                      value={formValue.temperatureTop}
                      inputProps={{ min: 0 }}
                      onChange={(event) => onFieldHandler(event)}
                    />
                    <span>°C</span>
                  </Stack>

                  <Select
                    fullWidth
                    name="temperatureCategory"
                    value={formValue.temperatureCategory}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '25%' } }}
                  >
                    {formDropdown.temperatureList.map((dt, idx) => (
                      <MenuItem value={dt.value} key={idx}>
                        {dt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="ectoparasite-findings" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'ectoparasite-findings'} />
                </InputLabel>
                <Stack flexDirection={'row'}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isLice}
                        onChange={(event) => setFormValue((e) => ({ ...e, isLice: event.target.checked }))}
                        name="isLice"
                      />
                    }
                    label={<FormattedMessage id="lice-free" />}
                    sx={{ width: { xs: '100%', sm: '20%' } }}
                  />
                  <TextField
                    fullWidth
                    id="noteLice"
                    name="noteLice"
                    value={formValue.noteLice}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '80%' } }}
                  />
                </Stack>
                <Stack flexDirection={'row'}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isFlea}
                        onChange={(event) => setFormValue((e) => ({ ...e, isFlea: event.target.checked }))}
                        name="isFlea"
                      />
                    }
                    label={<FormattedMessage id="flea" />}
                    sx={{ width: { xs: '100%', sm: '20%' } }}
                  />
                  <TextField
                    fullWidth
                    id="noteFlea"
                    name="noteFlea"
                    value={formValue.noteFlea}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '80%' } }}
                  />
                </Stack>

                <Stack flexDirection={'row'}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isCaplak}
                        onChange={(event) => setFormValue((e) => ({ ...e, isCaplak: event.target.checked }))}
                        name="isCaplak"
                      />
                    }
                    label={'Caplak'}
                    sx={{ width: { xs: '100%', sm: '20%' } }}
                  />
                  <TextField
                    fullWidth
                    id="noteCaplak"
                    name="noteCaplak"
                    value={formValue.noteCaplak}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '80%' } }}
                  />
                </Stack>

                <Stack flexDirection={'row'}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isTungau}
                        onChange={(event) => setFormValue((e) => ({ ...e, isTungau: event.target.checked }))}
                        name="isTungau"
                      />
                    }
                    label={'Tungau'}
                    sx={{ width: { xs: '100%', sm: '20%' } }}
                  />
                  <TextField
                    fullWidth
                    id="noteTungau"
                    name="noteTungau"
                    value={formValue.noteTungau}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '80%' } }}
                  />
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="life-cycle-ectoparasite" style={{ fontWeight: 'bold' }}>
                      <FormattedMessage id={'life-cycle-ectoparasite'} />
                    </InputLabel>
                    <Select
                      fullWidth
                      name="ectoParasitCategory"
                      value={formValue.ectoParasitCategory}
                      onChange={(event) => onFieldHandler(event)}
                    >
                      <MenuItem value="1">Badan Hewan</MenuItem>
                      <MenuItem value="2">Lingkungan</MenuItem>
                    </Select>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="fungi-findings" style={{ fontWeight: 'bold' }}>
                      <FormattedMessage id={'fungi-findings'} />
                    </InputLabel>
                    <Select fullWidth name="isFungiFound" value={formValue.isFungiFound} onChange={(event) => onFieldHandler(event)}>
                      <MenuItem value="1">
                        <FormattedMessage id="yes" />
                      </MenuItem>
                      <MenuItem value="0">
                        <FormattedMessage id="no" />
                      </MenuItem>
                    </Select>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="endoparasit-findings" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'endoparasit-findings'} />
                </InputLabel>
                <Stack flexDirection={'row'}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isNematoda}
                        onChange={(event) => setFormValue((e) => ({ ...e, isNematoda: event.target.checked }))}
                        name="isNematoda"
                      />
                    }
                    label={'Nematoda'}
                    sx={{ width: { xs: '100%', sm: '20%' } }}
                  />
                  <TextField
                    fullWidth
                    id="noteNematoda"
                    name="noteNematoda"
                    value={formValue.noteNematoda}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '80%' } }}
                  />
                </Stack>

                <Stack flexDirection={'row'}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isTermatoda}
                        onChange={(event) => setFormValue((e) => ({ ...e, isTermatoda: event.target.checked }))}
                        name="isTermatoda"
                      />
                    }
                    label={'Trematoda'}
                    sx={{ width: { xs: '100%', sm: '20%' } }}
                  />
                  <TextField
                    fullWidth
                    id="noteTermatoda"
                    name="noteTermatoda"
                    value={formValue.noteTermatoda}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '80%' } }}
                  />
                </Stack>

                <Stack flexDirection={'row'}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isCestode}
                        onChange={(event) => setFormValue((e) => ({ ...e, isCestode: event.target.checked }))}
                        name="isCestode"
                      />
                    }
                    label={'Cestode'}
                    sx={{ width: { xs: '100%', sm: '20%' } }}
                  />
                  <TextField
                    fullWidth
                    id="noteCestode"
                    name="noteCestode"
                    value={formValue.noteCestode}
                    onChange={(event) => onFieldHandler(event)}
                    sx={{ width: { xs: '100%', sm: '80%' } }}
                  />
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="Mukosa" style={{ fontWeight: 'bold' }}>
                  Mukosa
                </InputLabel>

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <InputLabel htmlFor="konjung" sx={{ width: { xs: '100%', sm: '20%' } }}>
                        Konjung
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="konjung"
                        value={formValue.konjung}
                        name="konjung"
                        onChange={(event) => onFieldHandler(event)}
                        placeholder=""
                        sx={{ width: { xs: '100%', sm: '80%' } }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <InputLabel htmlFor="Ginggiva" sx={{ width: { xs: '100%', sm: '20%' } }}>
                        Ginggiva
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="ginggiva"
                        value={formValue.ginggiva}
                        name="ginggiva"
                        onChange={(event) => onFieldHandler(event)}
                        placeholder=""
                        sx={{ width: { xs: '100%', sm: '80%' } }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <InputLabel htmlFor="Telinga" sx={{ width: { xs: '100%', sm: '20%' } }}>
                        Telinga
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="ear"
                        value={formValue.ear}
                        name="ear"
                        onChange={(event) => onFieldHandler(event)}
                        placeholder=""
                        sx={{ width: { xs: '100%', sm: '80%' } }}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <InputLabel htmlFor="tongue" sx={{ width: { xs: '100%', sm: '20%' } }}>
                        <FormattedMessage id="tongue" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="tongue"
                        value={formValue.tongue}
                        name="tongue"
                        onChange={(event) => onFieldHandler(event)}
                        placeholder=""
                        sx={{ width: { xs: '100%', sm: '80%' } }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <InputLabel htmlFor="nose" sx={{ width: { xs: '100%', sm: '20%' } }}>
                        <FormattedMessage id="nose" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="nose"
                        value={formValue.nose}
                        name="nose"
                        onChange={(event) => onFieldHandler(event)}
                        placeholder=""
                        sx={{ width: { xs: '100%', sm: '80%' } }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <InputLabel htmlFor="crt" sx={{ width: { xs: '100%', sm: '20%' } }}>
                        CRT
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="CRT"
                        value={formValue.CRT}
                        name="CRT"
                        onChange={(event) => onFieldHandler(event)}
                        placeholder=""
                        sx={{ width: { xs: '100%', sm: '80%' } }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <InputLabel htmlFor="genitals" sx={{ width: { xs: '100%', sm: '20%' } }}>
                        <FormattedMessage id="genitals" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="genitals"
                        value={formValue.genitals}
                        name="genitals"
                        onChange={(event) => onFieldHandler(event)}
                        placeholder=""
                        sx={{ width: { xs: '100%', sm: '80%' } }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="nervous-system-and-locomotion" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id="nervous-system-and-locomotion" />
                </InputLabel>

                <Stack flexDirection={'row'} alignItems={'center'}>
                  <InputLabel htmlFor="neurological-findings" sx={{ width: { xs: '100%', sm: '15%' } }}>
                    <FormattedMessage id="neurological-findings" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="neurologicalFindings"
                    value={formValue.neurologicalFindings}
                    name="neurologicalFindings"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder=""
                    sx={{ width: { xs: '100%', sm: '85%' } }}
                  />
                </Stack>
                <Stack flexDirection={'row'} alignItems={'center'}>
                  <InputLabel htmlFor="lokomosi-findings" sx={{ width: { xs: '100%', sm: '15%' } }}>
                    <FormattedMessage id="lokomosi-findings" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="lokomosiFindings"
                    value={formValue.lokomosiFindings}
                    name="lokomosiFindings"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder=""
                    sx={{ width: { xs: '100%', sm: '85%' } }}
                  />
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="respiratory-system" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'respiratory-system'} />
                </InputLabel>
                <InputLabel htmlFor="snot">
                  <FormattedMessage id={'snot'} />
                </InputLabel>
                <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={2}>
                  <Select value={formValue.isSnot} name="isSnot" onChange={(event) => onFieldHandler(event)} fullWidth>
                    <MenuItem value="1">
                      <FormattedMessage id={'yes'} />
                    </MenuItem>
                    <MenuItem value="0">
                      <FormattedMessage id={'no'} />
                    </MenuItem>
                  </Select>
                  {formValue.isSnot === '0' && (
                    <TextField
                      fullWidth
                      id="noteSnot"
                      value={formValue.noteSnot}
                      name="noteSnot"
                      onChange={(event) => onFieldHandler(event)}
                      placeholder="note"
                      sx={{ width: { xs: '100%', sm: '50%' } }}
                    />
                  )}
                </Stack>

                <InputLabel htmlFor="breath-type">
                  <FormattedMessage id={'breath-type'} />
                </InputLabel>
                <Select value={formValue.breathType} name="breathType" onChange={(event) => onFieldHandler(event)} fullWidth>
                  {formDropdown.breathList.map((dt, idx) => (
                    <MenuItem value={dt.value} key={idx}>
                      {dt.label}
                    </MenuItem>
                  ))}
                </Select>

                <InputLabel htmlFor="breath-sound-type">
                  <FormattedMessage id={'breath-sound-type'} />
                </InputLabel>
                <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={2}>
                  <Select value={formValue.breathSoundType} name="breathSoundType" onChange={(event) => onFieldHandler(event)} fullWidth>
                    {formDropdown.breathSoundList.map((dt, idx) => (
                      <MenuItem value={dt.value} key={idx}>
                        {dt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formValue.breathSoundType === '4' && (
                    <TextField
                      fullWidth
                      id="breathSoundNote"
                      value={formValue.breathSoundNote}
                      name="breathSoundNote"
                      onChange={(event) => onFieldHandler(event)}
                      sx={{ width: { xs: '100%', sm: '50%' } }}
                    />
                  )}
                </Stack>
                <InputLabel htmlFor="other-findings">
                  <FormattedMessage id={'other-findings'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="othersFoundBreath"
                  value={formValue.othersFoundBreath}
                  name="othersFoundBreath"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="cardiovascular-system" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'cardiovascular-system'} />
                </InputLabel>

                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} alignItems="center" spacing={2}>
                  <Stack sx={{ width: { xs: '100%', sm: '15%' } }}>
                    <InputLabel htmlFor="pulsus">Pulsus</InputLabel>
                    <RadioGroup row name="pulsus" value={formValue.pulsus} onChange={(event) => onFieldHandler(event)}>
                      <FormControlLabel value="1" control={<Radio />} label={'Teraba'} />
                      <FormControlLabel value="2" control={<Radio />} label={<FormattedMessage id="no" />} />
                    </RadioGroup>
                  </Stack>

                  <Stack sx={{ width: { xs: '100%', sm: '42.5%' } }}>
                    <InputLabel htmlFor="heart-sound">
                      <FormattedMessage id={'heart-sound'} />
                    </InputLabel>
                    <Select value={formValue.heartSound} name="heartSound" onChange={(event) => onFieldHandler(event)} fullWidth>
                      {formDropdown.heartList.map((dt, idx) => (
                        <MenuItem value={dt.value} key={idx}>
                          {dt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>

                  <Stack sx={{ width: { xs: '100%', sm: '42.5%' } }}>
                    <InputLabel htmlFor="other-findings">
                      <FormattedMessage id={'other-findings'} />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="othersFoundHeart"
                      value={formValue.othersFoundHeart}
                      name="othersFoundHeart"
                      onChange={(event) => onFieldHandler(event)}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="skin-and-integumentary-system" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'skin-and-integumentary-system'} />
                </InputLabel>

                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} alignItems="center" spacing={2}>
                  <Stack sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <InputLabel htmlFor="skin-findings">
                      <FormattedMessage id={'skin-findings'} />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="othersFoundSkin"
                      value={formValue.othersFoundSkin}
                      name="othersFoundSkin"
                      onChange={(event) => onFieldHandler(event)}
                    />
                  </Stack>
                  <Stack sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <InputLabel htmlFor="hair-findings">
                      <FormattedMessage id={'hair-findings'} />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="othersFoundHair"
                      value={formValue.othersFoundHair}
                      name="othersFoundHair"
                      onChange={(event) => onFieldHandler(event)}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="urogenital-system" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id={'urogenital-system'} />
                </InputLabel>

                <InputLabel htmlFor="male-testicles">
                  <FormattedMessage id={'male-testicles'} />
                </InputLabel>
                <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={2}>
                  <Select value={formValue.maleTesticles} name="maleTesticles" onChange={(event) => onFieldHandler(event)} fullWidth>
                    <MenuItem value={'1'}>Steril</MenuItem>
                    <MenuItem value={'2'}>normal</MenuItem>
                    <MenuItem value={'3'}>chriptorchid</MenuItem>
                    <MenuItem value={'4'}>lainnya</MenuItem>
                  </Select>
                  {formValue.maleTesticles === '4' && (
                    <TextField
                      fullWidth
                      id="othersMaleTesticles"
                      value={formValue.othersMaleTesticles}
                      name="othersMaleTesticles"
                      onChange={(event) => onFieldHandler(event)}
                      sx={{ width: { xs: '100%', sm: '50%' } }}
                    />
                  )}
                </Stack>

                <InputLabel htmlFor="penis-condition">
                  <FormattedMessage id={'penis-condition'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="penisCondition"
                  value={formValue.penisCondition}
                  name="penisCondition"
                  onChange={(event) => onFieldHandler(event)}
                />

                <InputLabel htmlFor="vaginal-discharge">
                  <FormattedMessage id={'vaginal-discharge'} />
                </InputLabel>
                <Select
                  value={formValue.vaginalDischargeType}
                  name="vaginalDischargeType"
                  onChange={(event) => onFieldHandler(event)}
                  fullWidth
                >
                  {formDropdown.vaginalList.map((dt, idx) => (
                    <MenuItem value={dt.value} key={idx}>
                      {dt.label}
                    </MenuItem>
                  ))}
                </Select>

                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} alignItems="center" spacing={2}>
                  <Stack sx={{ width: { xs: '100%', sm: '20%' } }}>
                    <InputLabel htmlFor="urinasi">Urinasi</InputLabel>
                    <RadioGroup row name="urinationType" value={formValue.urinationType} onChange={(event) => onFieldHandler(event)}>
                      <FormControlLabel value="1" control={<Radio />} label={'Normal'} />
                      <FormControlLabel value="2" control={<Radio />} label={'Anuria'} />
                      <FormControlLabel value="3" control={<Radio />} label={'Disuria'} />
                    </RadioGroup>
                  </Stack>
                  {formValue.urinationType === '3' && (
                    <Stack sx={{ width: { xs: '100%', sm: '80%' } }}>
                      <InputLabel htmlFor="with-character">
                        <FormattedMessage id={'with-character'} />
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="othersUrination"
                        value={formValue.othersUrination}
                        name="othersUrination"
                        onChange={(event) => onFieldHandler(event)}
                      />
                    </Stack>
                  )}
                </Stack>

                <InputLabel htmlFor="other-findings">
                  <FormattedMessage id={'other-findings'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="othersFoundUrogenital"
                  value={formValue.othersFoundUrogenital}
                  name="othersFoundUrogenital"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="digestive-system" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id="digestive-system" />
                </InputLabel>

                <Stack flexDirection={'row'} alignItems={'center'}>
                  <InputLabel htmlFor="abnormalitas-cavum-oris" sx={{ width: { xs: '100%', sm: '15%' } }}>
                    <FormattedMessage id="abnormalitas-cavum-oris" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="abnormalitasCavumOris"
                    value={formValue.abnormalitasCavumOris}
                    name="abnormalitasCavumOris"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder=""
                    sx={{ width: { xs: '100%', sm: '85%' } }}
                  />
                </Stack>

                <Stack flexDirection={'row'} alignItems={'center'}>
                  <InputLabel htmlFor="intestinal-peristalsis" sx={{ width: { xs: '100%', sm: '15%' } }}>
                    <FormattedMessage id="intestinal-peristalsis" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="intestinalPeristalsis"
                    value={formValue.intestinalPeristalsis}
                    name="intestinalPeristalsis"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder=""
                    sx={{ width: { xs: '100%', sm: '85%' } }}
                  />
                </Stack>

                <Stack flexDirection={'row'} alignItems={'center'}>
                  <InputLabel htmlFor="abdominal-percussion" sx={{ width: { xs: '100%', sm: '15%' } }}>
                    <FormattedMessage id="abdominal-percussion" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="perkusiAbdomen"
                    value={formValue.perkusiAbdomen}
                    name="perkusiAbdomen"
                    onChange={(event) => onFieldHandler(event)}
                    placeholder=""
                    sx={{ width: { xs: '100%', sm: '85%' } }}
                  />
                </Stack>

                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} gap={'10px'}>
                  <Box flexBasis={'50%'} display={'flex'} alignItems={'center'}>
                    <InputLabel htmlFor="condition-rektum-kloaka" style={{ flexBasis: matchDownSM ? '50%' : '30%' }}>
                      <FormattedMessage id="condition" /> (*rektum/kloaka)
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="rektumKloaka"
                      value={formValue.rektumKloaka}
                      name="rektumKloaka"
                      onChange={(event) => onFieldHandler(event)}
                      placeholder=""
                      style={{ flexBasis: matchDownSM ? '50%' : '70%' }}
                    />
                  </Box>

                  <Box flexBasis={'50%'} display={'flex'} alignItems={'center'}>
                    <InputLabel htmlFor="other-characters-rektum-kloaka" style={{ flexBasis: matchDownSM ? '50%' : '20%' }}>
                      <FormattedMessage id="other-characters" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="othersCharacterRektumKloaka"
                      value={formValue.othersCharacterothersCharacterRektumKloaka}
                      name="othersCharacterRektumKloaka"
                      onChange={(event) => onFieldHandler(event)}
                      placeholder=""
                      style={{ flexBasis: matchDownSM ? '50%' : '80%' }}
                    />
                  </Box>
                </Stack>

                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} gap={'10px'}>
                  <Box width={'100%'}>
                    <InputLabel htmlFor="feces-form">
                      <FormattedMessage id="feces-form" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="fecesForm"
                      value={formValue.fecesForm}
                      name="fecesForm"
                      onChange={(event) => onFieldHandler(event)}
                      placeholder=""
                    />
                  </Box>

                  <Box width={'100%'}>
                    <InputLabel htmlFor="feces-color">
                      <FormattedMessage id="feces-color" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="fecesColor"
                      value={formValue.fecesColor}
                      name="fecesColor"
                      onChange={(event) => onFieldHandler(event)}
                      placeholder=""
                    />
                  </Box>

                  <Box width={'100%'}>
                    <InputLabel htmlFor="feces-with-character">
                      <FormattedMessage id="feces-with-character" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      id="fecesWithCharacter"
                      value={formValue.fecesWithCharacter}
                      name="fecesWithCharacter"
                      onChange={(event) => onFieldHandler(event)}
                      placeholder=""
                    />
                  </Box>
                </Stack>

                <InputLabel htmlFor="other-findings">
                  <FormattedMessage id={'other-findings'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="othersFoundDigesti"
                  value={formValue.othersFoundDigesti}
                  name="othersFoundDigesti"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="visual-system" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id="visual-system" />
                </InputLabel>

                <InputLabel htmlFor="pupillary-reflex">
                  <FormattedMessage id={'pupillary-reflex'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="reflectPupil"
                  value={formValue.reflectPupil}
                  name="reflectPupil"
                  onChange={(event) => onFieldHandler(event)}
                />

                <InputLabel htmlFor="eye-ball-condition">
                  <FormattedMessage id={'eye-ball-condition'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="eyeBallCondition"
                  value={formValue.eyeBallCondition}
                  name="eyeBallCondition"
                  onChange={(event) => onFieldHandler(event)}
                />

                <InputLabel htmlFor="other-findings">
                  <FormattedMessage id={'other-findings'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="othersFoundVision"
                  value={formValue.othersFoundVision}
                  name="othersFoundVision"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="hearing-system" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id="hearing-system" />
                </InputLabel>

                <InputLabel htmlFor="earlobe">
                  <FormattedMessage id={'earlobe'} />
                </InputLabel>
                <TextField fullWidth id="earlobe" value={formValue.earlobe} name="earlobe" onChange={(event) => onFieldHandler(event)} />

                <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} alignItems="center" spacing={2}>
                  <Stack sx={{ width: { xs: '100%', sm: '20%' } }}>
                    <InputLabel htmlFor="earwax">
                      <FormattedMessage id="earwax" />
                    </InputLabel>
                    <RadioGroup row name="earwax" value={formValue.earwax} onChange={(event) => onFieldHandler(event)}>
                      <FormControlLabel value="1" control={<Radio />} label={'Normal'} />
                      <FormControlLabel value="2" control={<Radio />} label={'Tidak'} />
                    </RadioGroup>
                  </Stack>
                  {formValue.earwax === '2' && (
                    <Stack sx={{ width: { xs: '100%', sm: '80%' } }}>
                      <InputLabel htmlFor="with-character">
                        <FormattedMessage id={'with-character'} />
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="earwaxCharacter"
                        value={formValue.earwaxCharacter}
                        name="earwaxCharacter"
                        onChange={(event) => onFieldHandler(event)}
                      />
                    </Stack>
                  )}
                </Stack>

                <InputLabel htmlFor="other-findings">
                  <FormattedMessage id={'other-findings'} />
                </InputLabel>
                <TextField
                  fullWidth
                  id="othersFoundEar"
                  value={formValue.othersFoundEar}
                  name="othersFoundEar"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box marginBottom={'25px'}>
          <Typography variant="h5">
            <FormattedMessage id="disease-diagnosis" />
          </Typography>
          <Divider style={{ marginTop: 5, marginBottom: 20 }} />
          <TextField
            multiline
            fullWidth
            rows={5}
            id="diagnoseDisease"
            name="diagnoseDisease"
            value={formValue.diagnoseDisease}
            onChange={(event) => onFieldHandler(event)}
          />
        </Box>

        <Box marginBottom={'25px'}>
          <Typography variant="h5">
            <FormattedMessage id="disease-prognosis" />
          </Typography>
          <Divider style={{ marginTop: 5, marginBottom: 20 }} />
          <TextField
            multiline
            fullWidth
            rows={5}
            id="prognoseDisease"
            name="prognoseDisease"
            value={formValue.prognoseDisease}
            onChange={(event) => onFieldHandler(event)}
          />

          <Stack spacing={1.25} marginTop={2}>
            <InputLabel htmlFor="overview-of-the-disease-process">
              <FormattedMessage id={'overview-of-the-disease-process'} />
            </InputLabel>
            <TextField
              multiline
              fullWidth
              rows={5}
              id="diseaseProgressOverview"
              name="diseaseProgressOverview"
              value={formValue.diseaseProgressOverview}
              onChange={(event) => onFieldHandler(event)}
            />
          </Stack>
        </Box>

        <Box marginBottom={'25px'}>
          <Typography variant="h5">
            <FormattedMessage id="further-examination" />
          </Typography>
          <Divider style={{ marginTop: 5, marginBottom: 20 }} />

          <Stack spacing={1.25}>
            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isMicroscope}
                    onChange={(event) => setFormValue((e) => ({ ...e, isMicroscope: event.target.checked }))}
                    name="isMicroscope"
                  />
                }
                label={
                  <InputLabel htmlFor="microscope" style={{ fontWeight: 'bold' }}>
                    <FormattedMessage id={'microscope'} />
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteMicroscope"
                name="noteMicroscope"
                value={formValue.noteMicroscope}
                onChange={(event) => onFieldHandler(event)}
                placeholder="Sample"
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isEye}
                    onChange={(event) => setFormValue((e) => ({ ...e, isEye: event.target.checked }))}
                    name="isEye"
                  />
                }
                label={
                  <InputLabel htmlFor="eye" style={{ fontWeight: 'bold' }}>
                    <FormattedMessage id={'eye'} />
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteEye"
                name="noteEye"
                value={formValue.noteEye}
                onChange={(event) => onFieldHandler(event)}
                placeholder="Jenis Tes"
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isTeskit}
                    onChange={(event) => setFormValue((e) => ({ ...e, isTeskit: event.target.checked }))}
                    name="isTeskit"
                  />
                }
                label={
                  <InputLabel htmlFor="teskit" style={{ fontWeight: 'bold' }}>
                    Teskit
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteTeskit"
                name="noteTeskit"
                value={formValue.noteTeskit}
                onChange={(event) => onFieldHandler(event)}
                placeholder="Jenis Tes"
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isUltrasonografi}
                    onChange={(event) => setFormValue((e) => ({ ...e, isUltrasonografi: event.target.checked }))}
                    name="isUltrasonografi"
                  />
                }
                label={
                  <InputLabel htmlFor="Ultrasonografi" style={{ fontWeight: 'bold' }}>
                    Ultrasonografi (USG)
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteUltrasonografi"
                name="noteUltrasonografi"
                value={formValue.noteUltrasonografi}
                onChange={(event) => onFieldHandler(event)}
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isRontgen}
                    onChange={(event) => setFormValue((e) => ({ ...e, isRontgen: event.target.checked }))}
                    name="isRontgen"
                  />
                }
                label={
                  <InputLabel htmlFor="Ultrasonografi" style={{ fontWeight: 'bold' }}>
                    Rontgen (X-ray)
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteRontgen"
                name="noteRontgen"
                value={formValue.noteRontgen}
                onChange={(event) => onFieldHandler(event)}
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isBloodReview}
                    onChange={(event) => setFormValue((e) => ({ ...e, isBloodReview: event.target.checked }))}
                    name="isBloodReview"
                  />
                }
                label={
                  <InputLabel htmlFor="blood-review" style={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="blood-review" />
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteBloodReview"
                name="noteBloodReview"
                value={formValue.noteBloodReview}
                onChange={(event) => onFieldHandler(event)}
                placeholder="Note"
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isSitologi}
                    onChange={(event) => setFormValue((e) => ({ ...e, isSitologi: event.target.checked }))}
                    name="isSitologi"
                  />
                }
                label={
                  <InputLabel htmlFor="cytology" style={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="cytology" />
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteSitologi"
                name="noteSitologi"
                value={formValue.noteSitologi}
                onChange={(event) => onFieldHandler(event)}
                placeholder="Note"
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isVaginalSmear}
                    onChange={(event) => setFormValue((e) => ({ ...e, isVaginalSmear: event.target.checked }))}
                    name="isVaginalSmear"
                  />
                }
                label={
                  <InputLabel htmlFor="Vaginal Smear" style={{ fontWeight: 'bold' }}>
                    Vaginal Smear
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteVaginalSmear"
                name="noteVaginalSmear"
                value={formValue.noteVaginalSmear}
                onChange={(event) => onFieldHandler(event)}
                placeholder="Note"
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>

            <Stack flexDirection={'row'}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isBloodLab}
                    onChange={(event) => setFormValue((e) => ({ ...e, isBloodLab: event.target.checked }))}
                    name="isBloodLab"
                  />
                }
                label={
                  <InputLabel htmlFor="blood-lab" style={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="blood-lab" />
                  </InputLabel>
                }
                sx={{ width: { xs: '100%', sm: '15%' } }}
              />
              <TextField
                fullWidth
                id="noteBloodLab"
                name="noteBloodLab"
                value={formValue.noteBloodLab}
                onChange={(event) => onFieldHandler(event)}
                placeholder="Jenis Tes"
                sx={{ width: { xs: '100%', sm: '85%' } }}
              />
            </Stack>
          </Stack>
        </Box>

        <Box marginBottom={'25px'}>
          <Typography variant="h5">Treatment (Tindakan)</Typography>
          <Divider style={{ marginTop: 5, marginBottom: 20 }} />

          <Stack flexDirection={'row'}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formValue.isSurgery}
                  onChange={(event) => setFormValue((e) => ({ ...e, isSurgery: event.target.checked }))}
                  name="isSurgery"
                />
              }
              label={<InputLabel htmlFor="operasi">Operasi</InputLabel>}
              sx={{ width: { xs: '100%', sm: '10%' } }}
            />
            <TextField
              fullWidth
              id="noteSurgery"
              name="noteSurgery"
              value={formValue.noteSurgery}
              onChange={(event) => onFieldHandler(event)}
              sx={{ width: { xs: '100%', sm: '90%' } }}
            />
          </Stack>

          <Stack spacing={1.25} marginTop={2}>
            <InputLabel htmlFor="infusion">
              <FormattedMessage id="infusion" />
            </InputLabel>
            <TextField fullWidth id="infusion" name="infusion" value={formValue.infusion} onChange={(event) => onFieldHandler(event)} />

            <InputLabel htmlFor="physiotherapy">
              <FormattedMessage id="physiotherapy" />
            </InputLabel>
            <TextField
              fullWidth
              id="fisioteraphy"
              name="fisioteraphy"
              value={formValue.fisioteraphy}
              onChange={(event) => onFieldHandler(event)}
            />

            <InputLabel htmlFor="injection-medicine">
              <FormattedMessage id="injection-medicine" />
            </InputLabel>
            <TextField
              fullWidth
              id="injectionMedicine"
              name="injectionMedicine"
              value={formValue.injectionMedicine}
              onChange={(event) => onFieldHandler(event)}
            />

            <InputLabel htmlFor="oral-medication">
              <FormattedMessage id="oral-medication" />
            </InputLabel>
            <TextField
              fullWidth
              id="oralMedicine"
              name="oralMedicine"
              value={formValue.oralMedicine}
              onChange={(event) => onFieldHandler(event)}
            />

            <InputLabel htmlFor="topical-medicine">
              <FormattedMessage id="topical-medicine" />
            </InputLabel>
            <TextField
              fullWidth
              id="tropicalMedicine"
              name="tropicalMedicine"
              value={formValue.tropicalMedicine}
              onChange={(event) => onFieldHandler(event)}
            />

            <InputLabel htmlFor="vaccination">
              <FormattedMessage id="vaccination" />
            </InputLabel>
            <TextField
              fullWidth
              id="vaccination"
              name="vaccination"
              value={formValue.vaccination}
              onChange={(event) => onFieldHandler(event)}
            />

            <InputLabel htmlFor="other">
              <FormattedMessage id="other" />
            </InputLabel>
            <TextField
              fullWidth
              id="othersTreatment"
              name="othersTreatment"
              value={formValue.othersTreatment}
              onChange={(event) => onFieldHandler(event)}
            />
          </Stack>
        </Box>

        <Box marginBottom={'25px'}>
          <Typography variant="h5">
            <FormattedMessage id="advice" />
          </Typography>
          <Divider style={{ marginTop: 5, marginBottom: 20 }} />

          <Stack spacing={1.25} marginTop={2}>
            <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} alignItems="center" spacing={2}>
              <Stack sx={{ width: { xs: '100%', sm: '10%' } }}>
                <InputLabel htmlFor="inpatient-care">
                  <FormattedMessage id="inpatient-care" />
                </InputLabel>
                <RadioGroup row name="isInpatient" value={formValue.isInpatient} onChange={(event) => onFieldHandler(event)}>
                  <FormControlLabel value="1" control={<Radio />} label={<FormattedMessage id="yes" />} />
                  <FormControlLabel value="2" control={<Radio />} label={<FormattedMessage id="no" />} />
                </RadioGroup>
              </Stack>
              <Stack sx={{ width: { xs: '100%', sm: '90%' } }}>
                <TextField
                  fullWidth
                  id="noteInpatient"
                  value={formValue.noteInpatient}
                  name="noteInpatient"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Stack>

            <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} alignItems="center" spacing={2}>
              <Stack sx={{ width: { xs: '100%', sm: '10%' } }}>
                <InputLabel htmlFor="therapeutic-feed">
                  <FormattedMessage id="therapeutic-feed" />
                </InputLabel>
                <RadioGroup row name="isTherapeuticFeed" value={formValue.isTherapeuticFeed} onChange={(event) => onFieldHandler(event)}>
                  <FormControlLabel value="1" control={<Radio />} label={<FormattedMessage id="yes" />} />
                  <FormControlLabel value="2" control={<Radio />} label={<FormattedMessage id="no" />} />
                </RadioGroup>
              </Stack>
              <Stack sx={{ width: { xs: '100%', sm: '90%' } }}>
                <TextField
                  fullWidth
                  id="noteTherapeuticFeed"
                  value={formValue.noteTherapeuticFeed}
                  name="noteTherapeuticFeed"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Stack>

            <InputLabel htmlFor="imun-booster/multivitamin">Imun booster/multivitamin</InputLabel>
            <TextField
              fullWidth
              id="imuneBooster"
              name="imuneBooster"
              value={formValue.imuneBooster}
              onChange={(event) => onFieldHandler(event)}
            />

            <InputLabel htmlFor="other-supplements">
              <FormattedMessage id="other-supplements" />
            </InputLabel>
            <TextField fullWidth id="suplement" name="suplement" value={formValue.suplement} onChange={(event) => onFieldHandler(event)} />

            <InputLabel htmlFor="environmental-disinfection">
              <FormattedMessage id="environmental-disinfection" />
            </InputLabel>
            <TextField
              fullWidth
              id="desinfeksi"
              name="desinfeksi"
              value={formValue.desinfeksi}
              onChange={(event) => onFieldHandler(event)}
            />

            <InputLabel htmlFor="maintenance-cage-indoor-outdoor-during">
              <FormattedMessage id="maintenance-cage-indoor-outdoor-during" />
            </InputLabel>
            <TextField fullWidth id="care" name="care" value={formValue.care} onChange={(event) => onFieldHandler(event)} />

            <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent={'space-between'} alignItems="center" spacing={2}>
              <Stack sx={{ width: { xs: '100%', sm: '10%' } }}>
                <InputLabel htmlFor="grooming/mandi">Grooming / Mandi</InputLabel>
                <RadioGroup row name="isGrooming" value={formValue.isGrooming} onChange={(event) => onFieldHandler(event)}>
                  <FormControlLabel value="1" control={<Radio />} label={<FormattedMessage id="yes" />} />
                  <FormControlLabel value="2" control={<Radio />} label={<FormattedMessage id="no" />} />
                </RadioGroup>
              </Stack>
              <Stack sx={{ width: { xs: '100%', sm: '90%' } }}>
                <TextField
                  fullWidth
                  id="noteGrooming"
                  value={formValue.noteGrooming}
                  name="noteGrooming"
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Stack>

            <InputLabel htmlFor="other">
              <FormattedMessage id="other" />
            </InputLabel>
            <TextField
              fullWidth
              id="othersNoteAdvice"
              name="othersNoteAdvice"
              value={formValue.othersNoteAdvice}
              onChange={(event) => onFieldHandler(event)}
            />
          </Stack>
        </Box>

        <Box>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5">
                <FormattedMessage id="check-up-schedule" />
              </Typography>
              <Divider style={{ marginTop: 5, marginBottom: 20 }} />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  inputFormat="DD/MM/YYYY"
                  value={formValue.nextControlCheckup}
                  onChange={(value) => {
                    setFormValue((prevState) => ({
                      ...prevState,
                      nextControlCheckup: value
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </ModalC>
    </>
  );
};

CheckPetConditionPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default CheckPetConditionPetClinic;
