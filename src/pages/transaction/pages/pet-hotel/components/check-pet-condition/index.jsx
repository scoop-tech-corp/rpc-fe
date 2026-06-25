import BugReportIcon from '@mui/icons-material/BugReport';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  InputLabel,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
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
import { checkPetConditionTransactionPetHotel } from '../../service';

// ── Constants ─────────────────────────────────────────────────────────────────

const CONSTANT_FORM_ERROR = {
  numberVaccinesErr: ''
};

const CONSTANT_FORM_VALUE = {
  numberVaccines: '',
  isLiceFree: false,
  noteLiceFree: '',
  isFungusFree: false,
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

// ── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
    <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">
        {title}
      </Typography>
    </Box>
    <Divider />
    <Box sx={{ px: 2, py: 2 }}>{children}</Box>
  </Paper>
);
SectionCard.propTypes = { icon: PropTypes.node, title: PropTypes.string, children: PropTypes.node };

// ── Checkbox + Note Row ───────────────────────────────────────────────────────
const CheckNoteRow = ({ checked, onCheck, label, noteValue, onNoteChange, notePlaceholder = '' }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 1.5,
      borderRadius: 1.5,
      bgcolor: checked ? 'action.selected' : 'transparent',
      border: '1px solid',
      borderColor: checked ? 'primary.light' : 'divider',
      transition: 'all 0.2s'
    }}
  >
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={onCheck} size="small" />}
      label={
        <Typography variant="body2" fontWeight={checked ? 600 : 400}>
          {label}
        </Typography>
      }
      sx={{ minWidth: 150, m: 0 }}
    />
    <TextField
      size="small"
      fullWidth
      placeholder={notePlaceholder || 'Catatan...'}
      value={noteValue}
      onChange={onNoteChange}
      disabled={!checked}
      variant="outlined"
      sx={{ '& .MuiInputBase-root': { bgcolor: 'background.paper' } }}
    />
  </Box>
);
CheckNoteRow.propTypes = {
  checked: PropTypes.bool,
  onCheck: PropTypes.func,
  label: PropTypes.string,
  noteValue: PropTypes.string,
  onNoteChange: PropTypes.func,
  notePlaceholder: PropTypes.string
};

// ── HPL Status Badge ──────────────────────────────────────────────────────────
const HplStatusBadge = ({ status }) => {
  if (!status) return null;
  const isWarning = ['hpl sudah dekat', 'hpl sudah lewat'].includes(status.toLowerCase());
  return (
    <Alert severity={isWarning ? 'error' : 'success'} icon={<FavoriteIcon fontSize="small" />} sx={{ py: 0.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" fontWeight={500}>
          Status HPL:
        </Typography>
        <Chip label={status} size="small" color={isWarning ? 'error' : 'success'} variant="filled" />
      </Stack>
    </Alert>
  );
};
HplStatusBadge.propTypes = { status: PropTypes.string };

// ── Main Component ─────────────────────────────────────────────────────────────

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
    if (reasonReject) payload = { ...payload, reasonReject };

    await checkPetConditionTransactionPetHotel(payload)
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
      transactionCategory: 'pet-hotel'
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

  const isHplWarning = ['hpl sudah dekat', 'hpl sudah lewat'].includes(formValue.hplStatus.toLowerCase());

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
          <Button variant="outlined" color="error" onClick={() => setFormReject(true)}>
            <FormattedMessage id="reject" />
          </Button>
        }
      >
        <Stack spacing={2}>
          {/* ── Vaksinasi ── */}
          <SectionCard icon={<VaccinesIcon fontSize="small" color="primary" />} title="Vaksinasi">
            <Stack spacing={0.75}>
              <InputLabel htmlFor="numberOfVaccines" sx={{ fontWeight: 600 }}>
                <FormattedMessage id="number-of-vaccines" />
                <Typography component="span" color="error" ml={0.5}>
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                type="number"
                id="numberOfVaccines"
                name="numberOfVaccines"
                value={formValue.numberVaccines}
                inputProps={{ min: 0 }}
                onChange={(e) => setFormValue((prev) => ({ ...prev, numberVaccines: e.target.value }))}
                error={Boolean(formError.numberVaccinesErr)}
                helperText={formError.numberVaccinesErr}
                placeholder="Masukkan jumlah vaksin"
              />
            </Stack>
          </SectionCard>

          {/* ── Kondisi Fisik ── */}
          <SectionCard icon={<BugReportIcon fontSize="small" color="primary" />} title="Kondisi Fisik">
            <Stack spacing={1.25}>
              <CheckNoteRow
                checked={formValue.isLiceFree}
                onCheck={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    isLiceFree: e.target.checked,
                    noteLiceFree: e.target.checked ? prev.noteLiceFree : ''
                  }))
                }
                label={intl.formatMessage({ id: 'lice-free' })}
                noteValue={formValue.noteLiceFree}
                onNoteChange={(e) => setFormValue((prev) => ({ ...prev, noteLiceFree: e.target.value }))}
                notePlaceholder="Catatan kutu..."
              />
              <CheckNoteRow
                checked={formValue.isFungusFree}
                onCheck={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    isFungusFree: e.target.checked,
                    noteFungusFree: e.target.checked ? prev.noteFungusFree : ''
                  }))
                }
                label={intl.formatMessage({ id: 'fungus-free' })}
                noteValue={formValue.noteFungusFree}
                onNoteChange={(e) => setFormValue((prev) => ({ ...prev, noteFungusFree: e.target.value }))}
                notePlaceholder="Catatan jamur..."
              />
            </Stack>
          </SectionCard>

          {/* ── Kondisi Reproduksi ── */}
          <SectionCard icon={<FavoriteIcon fontSize="small" color="primary" />} title="Kondisi Reproduksi">
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isPregnant}
                    onChange={(e) =>
                      setFormValue((prev) => ({
                        ...prev,
                        isPregnant: e.target.checked,
                        estimateDateofBirth: e.target.checked ? prev.estimateDateofBirth : null,
                        hplStatus: e.target.checked ? prev.hplStatus : '',
                        isRecomendInpatient: false,
                        noteInpatient: ''
                      }))
                    }
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={formValue.isPregnant ? 600 : 400}>
                    <FormattedMessage id="pregnant" />
                  </Typography>
                }
              />

              {formValue.isPregnant && (
                <Box
                  sx={{
                    ml: 4,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px dashed',
                    borderColor: 'primary.light',
                    bgcolor: 'primary.50'
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack spacing={0.5}>
                      <InputLabel sx={{ fontWeight: 600, fontSize: 13 }}>
                        <FormattedMessage id="estimated-date-of-birth" />
                      </InputLabel>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DesktopDatePicker
                          inputFormat="DD/MM/YYYY"
                          value={formValue.estimateDateofBirth}
                          onChange={(value) => {
                            setFormValue((prev) => ({
                              ...prev,
                              estimateDateofBirth: value,
                              noteInpatient: '',
                              isRecomendInpatient: false
                            }));
                            checkHpl(value);
                          }}
                          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                        />
                      </LocalizationProvider>
                    </Stack>

                    <HplStatusBadge status={formValue.hplStatus} />

                    {isHplWarning && (
                      <Stack spacing={1} sx={{ mt: 0.5 }}>
                        <Divider />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formValue.isRecomendInpatient}
                              onChange={(e) => setFormValue((prev) => ({ ...prev, isRecomendInpatient: e.target.checked }))}
                              size="small"
                              color="warning"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600} color="warning.main">
                              <FormattedMessage id="recomendation-inpatient" />
                            </Typography>
                          }
                        />
                        <TextField
                          fullWidth
                          size="small"
                          id="noteInpatient"
                          name="noteInpatient"
                          value={formValue.noteInpatient}
                          placeholder="Catatan rekomendasi rawat inap..."
                          onChange={(e) => setFormValue((prev) => ({ ...prev, noteInpatient: e.target.value }))}
                        />
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </SectionCard>

          {/* ── Status Induk ── */}
          <SectionCard icon={<ChildCareIcon fontSize="small" color="primary" />} title="Status Induk">
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isParent}
                    onChange={(e) =>
                      setFormValue((prev) => ({
                        ...prev,
                        isParent: e.target.checked,
                        isBreastfeeding: false,
                        numberofChildren: ''
                      }))
                    }
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={formValue.isParent ? 600 : 400}>
                    <FormattedMessage id="parent" />
                  </Typography>
                }
              />

              {formValue.isParent && (
                <Box
                  sx={{
                    ml: 4,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px dashed',
                    borderColor: 'success.light',
                    bgcolor: 'success.50'
                  }}
                >
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValue.isBreastfeeding}
                            onChange={(e) => setFormValue((prev) => ({ ...prev, isBreastfeeding: e.target.checked }))}
                            size="small"
                            color="success"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            <FormattedMessage id="breast-feeding" />
                          </Typography>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Stack spacing={0.5}>
                        <InputLabel sx={{ fontSize: 12, fontWeight: 600 }}>
                          <FormattedMessage id="number-of-children" />
                        </InputLabel>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          id="numberofChildren"
                          name="numberofChildren"
                          value={formValue.numberofChildren}
                          inputProps={{ min: 0 }}
                          placeholder="0"
                          onChange={(e) => setFormValue((prev) => ({ ...prev, numberofChildren: e.target.value }))}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          </SectionCard>

          {/* ── Info Transaksi (read-only footer) ── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: 'action.hover'
            }}
          >
            <LocalHospitalIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              ID Transaksi: <strong>{data?.transactionId}</strong>
            </Typography>
          </Box>
        </Stack>
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
