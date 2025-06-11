import { Button, Checkbox, FormControlLabel, FormGroup, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FormReject from 'components/FormReject';
import ModalC from 'components/ModalC';
import { checkHplStatus } from 'pages/transaction/service';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { checkPetConditionTransactionBreeding } from '../../service';

const CONSTANT_FORM_ERROR = {
  numberVaccinesErr: ''
};

const CONSTANT_FORM_VALUE = {
  numberVaccines: '',
  isLiceFree: false, // bebas kutu
  noteLiceFree: '',
  isFungusFree: false, // bebas jamur
  noteFungusFree: '',
  isPregnant: false,
  estimateDateofBirth: null,
  hplStatus: '',
  isRecomendInpatient: false,
  noteInpatient: '',
  isParent: false,
  isBreastfeeding: false,
  numberofChildren: ''
};

const CheckPetCondition = (props) => {
  const { data } = props;
  const [formError, setFormError] = useState({ ...CONSTANT_FORM_ERROR });
  const [formValue, setFormValue] = useState({ ...CONSTANT_FORM_VALUE });
  const [disabledOke, setDisabledOk] = useState(true);
  const [formReject, setFormReject] = useState(false);
  const dispatch = useDispatch();
  const isFirstRender = useRef(true);
  const intl = useIntl();

  const onSubmit = async (reasonReject = null) => {
    let payload = { ...formValue, transactionId: data.transactionId };
    if (reasonReject) {
      payload = { ...payload, reasonReject };
    }

    await checkPetConditionTransactionBreeding(payload)
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

  const checkHpl = async (estimateDob) => {
    await checkHplStatus({
      transactionId: data.transactionId,
      estimateDateofBirth: estimateDob || formValue.estimateDateofBirth,
      transactionCategory: 'breeding'
    })
      .then((resp) => {
        if (resp?.status === 200) {
          setFormValue((prevState) => ({ ...prevState, hplStatus: resp.data.status }));
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isFirstRender.current) {
      const set_obj_err = { ...CONSTANT_FORM_ERROR };
      if (!formValue.numberVaccines) set_obj_err.numberVaccinesErr = intl.formatMessage({ id: 'number-of-vaccines-is-required' });

      setFormError((prevState) => {
        const objErr = { ...prevState, ...set_obj_err };
        setDisabledOk(Boolean(Object.values(objErr).filter((dt) => dt).length));
        return objErr;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue, intl]);

  return (
    <>
      <ModalC
        title={<FormattedMessage id="check-pet-condition" />}
        open={props.open}
        onOk={() => onSubmit()}
        disabledOk={disabledOke}
        onCancel={onCancel}
        fullWidth
        maxWidth="sm"
        otherDialogAction={
          <>
            {/* disabled={disabledOke} */}
            <Button variant="outlined" onClick={() => setFormReject(true)}>
              {<FormattedMessage id="reject" />}
            </Button>
          </>
        }
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack>
              <InputLabel>
                <FormattedMessage id="number-of-vaccines" />
              </InputLabel>
              <TextField
                fullWidth
                type="number"
                id="numberOfVaccines"
                name="numberOfVaccines"
                value={formValue.numberVaccines}
                inputProps={{ min: 0 }}
                onChange={(event) => {
                  setFormValue((e) => ({ ...e, numberVaccines: event.target.value }));
                }}
                error={Boolean(formError.numberVaccinesErr && formError.numberVaccinesErr.length > 0)}
                helperText={formError.numberVaccinesErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={3}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isLiceFree}
                    onChange={(event) => setFormValue((e) => ({ ...e, isLiceFree: event.target.checked }))}
                    name="isLiceFree"
                  />
                }
                label={<FormattedMessage id="lice-free" />}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <Stack>
              <InputLabel>
                <FormattedMessage id="notes" />
              </InputLabel>
              <TextField
                fullWidth
                id="noteLiceFree"
                name="noteLiceFree"
                value={formValue.noteLiceFree}
                onChange={(event) => {
                  setFormValue((e) => ({ ...e, noteLiceFree: event.target.value }));
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={3}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isFungusFree}
                    onChange={(event) => setFormValue((e) => ({ ...e, isFungusFree: event.target.checked }))}
                    name="isFungusFree"
                  />
                }
                label={<FormattedMessage id="fungus-free" />}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <Stack>
              <InputLabel>
                <FormattedMessage id="notes" />
              </InputLabel>
              <TextField
                fullWidth
                id="noteFungusFree"
                name="noteFungusFree"
                value={formValue.noteFungusFree}
                onChange={(event) => {
                  setFormValue((e) => ({ ...e, noteFungusFree: event.target.value }));
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={3}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isPregnant}
                    onChange={(event) => setFormValue((e) => ({ ...e, isPregnant: event.target.checked }))}
                    name="isPregnant"
                  />
                }
                label={<FormattedMessage id="pregnant" />}
              />
            </FormGroup>
          </Grid>

          {formValue.isPregnant && (
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="estimated-date-of-birth">
                  <FormattedMessage id="estimated-date-of-birth" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    inputFormat="DD/MM/YYYY"
                    value={formValue.estimateDateofBirth}
                    onChange={(value) => {
                      setFormValue((prevState) => ({
                        ...prevState,
                        estimateDateofBirth: value,
                        noteInpatient: '',
                        isRecomendInpatient: false
                      }));
                      checkHpl(value);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
                {formValue.hplStatus && (
                  <p>
                    Status:{' '}
                    <span style={{ color: formValue.hplStatus.toLowerCase() === 'hpl sudah dekat' ? 'red' : 'green' }}>
                      {formValue.hplStatus}
                    </span>
                  </p>
                )}
              </Stack>
            </Grid>
          )}

          {formValue.hplStatus.toLowerCase() === 'hpl sudah dekat' && (
            <>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isRecomendInpatient}
                        onChange={(event) => setFormValue((e) => ({ ...e, isRecomendInpatient: event.target.checked }))}
                        name="isRecomendInpatient"
                      />
                    }
                    label={<FormattedMessage id="recomendation-inpatient" />}
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <Stack>
                  <InputLabel>
                    <FormattedMessage id="notes" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="noteInpatient"
                    name="noteInpatient"
                    value={formValue.noteInpatient}
                    onChange={(event) => {
                      setFormValue((e) => ({ ...e, noteInpatient: event.target.value }));
                    }}
                  />
                </Stack>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isParent}
                    onChange={(event) => setFormValue((e) => ({ ...e, isParent: event.target.checked }))}
                    name="isParent"
                  />
                }
                label={<FormattedMessage id="parent" />}
              />
            </FormGroup>
          </Grid>

          {formValue.isParent && (
            <>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValue.isBreastfeeding}
                        onChange={(event) => setFormValue((e) => ({ ...e, isBreastfeeding: event.target.checked }))}
                        name="isBreastfeeding"
                      />
                    }
                    label={<FormattedMessage id="breast-feeding" />}
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12}>
                <Stack>
                  <InputLabel>
                    <FormattedMessage id="number-of-children" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="numberofChildren"
                    name="numberofChildren"
                    value={formValue.numberofChildren}
                    inputProps={{ min: 0 }}
                    onChange={(event) => {
                      setFormValue((e) => ({ ...e, numberofChildren: event.target.value }));
                    }}
                  />
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
      </ModalC>
      <FormReject
        open={formReject}
        title={<FormattedMessage id="reject" />}
        onSubmit={(response) => onSubmit(response)}
        onClose={() => setFormReject(false)}
      />
    </>
  );
};

CheckPetCondition.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default CheckPetCondition;
