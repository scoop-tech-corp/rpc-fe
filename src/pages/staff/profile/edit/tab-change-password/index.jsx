import { useRef, useState, useEffect } from 'react';
import { Button, FormHelperText, Grid, InputAdornment, InputLabel, OutlinedInput, Stack, Typography } from '@mui/material';
import { EyeOutlined, EyeInvisibleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { updatePassword } from '../../service';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import IconButton from 'components/@extended/IconButton';
import { useParams } from 'react-router';
import ErrorContainer from 'components/@extended/ErrorContainer';

const configCoreErr = {
  oldPasswordErr: '',
  newPasswordErr: '',
  confirmPaswordErr: ''
};

const TabChangePassword = () => {
  const firstRender = useRef(true);
  const intl = useIntl();
  const dispatch = useDispatch();

  let { id } = useParams();
  const [newPwError, setNewPwError] = useState(false);
  const [errorForm, setErrorForm] = useState(false);
  const [formErr, setFormErr] = useState(configCoreErr);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  const [formChangePw, setFormChangePw] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  const onClickShowPassword = (type) => setShowPassword((prevState) => ({ ...prevState, [type]: !showPassword[type] }));

  const onCheckValidation = () => {
    let getOldPasswordError = '';
    let getNewPasswordError = '';
    let getConfirmPasswordError = '';

    if (!formChangePw.oldPassword) {
      getOldPasswordError = intl.formatMessage({ id: 'old-password-is-required' });
    }

    if (!formChangePw.newPassword) {
      getNewPasswordError = intl.formatMessage({ id: 'new-password-is-required' });
    }

    if (!formChangePw.confirmPassword) {
      getConfirmPasswordError = intl.formatMessage({ id: 'confirm-password-is-required' });
    } else if (formChangePw.confirmPassword !== formChangePw.newPassword) {
      getConfirmPasswordError = intl.formatMessage({ id: 'confirm-password-not-same-with-new-password' });
    }

    if (getOldPasswordError || getNewPasswordError || getConfirmPasswordError) {
      setFormErr({
        oldPasswordErr: getOldPasswordError,
        newPasswordErr: getNewPasswordError,
        confirmPasswordErr: getConfirmPasswordError
      });
      setErrorForm(true);
      return true;
    } else {
      setFormErr(configCoreErr);
      setErrorForm(false);
    }
  };

  const onValidateNewPassword = () => {
    const regexPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    setNewPwError(!regexPw.test(formChangePw.newPassword));
  };

  const onSubmit = async () => {
    await updatePassword({ id, ...formChangePw })
      .then((resp) => {
        if (resp && resp.status === 200) {
          setErrContent({ title: '', detail: '' });
          dispatch(snackbarSuccess('Success update password'));
        }
      })
      .catch((err) => {
        if (err) {
          const message = createMessageBackend(err, true);
          setErrContent({ title: message.msg, detail: message.detail });
        }
      });
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) {
      onCheckValidation();
      onValidateNewPassword();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formChangePw, intl]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={onSubmit}
          disabled={errorForm || newPwError || firstRender.current}
        >
          <FormattedMessage id="save" />
        </Button>
      </Grid>
      <Grid item xs={12}>
        <ErrorContainer open={Boolean(errContent.title && errContent.detail)} content={errContent} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="old-password">{<FormattedMessage id="old-password" />}</InputLabel>
              <OutlinedInput
                fullWidth
                id="old-password"
                type={showPassword.old ? 'text' : 'password'}
                value={formChangePw.oldPassword}
                name="password"
                onChange={(e) => setFormChangePw((prevState) => ({ ...prevState, oldPassword: e.target.value }))}
                error={Boolean(formErr.oldPasswordErr && formErr.oldPasswordErr.length > 0)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => onClickShowPassword('old')}
                      edge="end"
                      color="secondary"
                    >
                      {showPassword.old ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </IconButton>
                  </InputAdornment>
                }
                placeholder="******"
                inputProps={{}}
              />
              <FormHelperText error id="helper-text-old-password">
                {formErr.oldPasswordErr}
              </FormHelperText>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="new-password">{<FormattedMessage id="new-password" />}</InputLabel>
              <OutlinedInput
                fullWidth
                id="new-password"
                type={showPassword.new ? 'text' : 'password'}
                value={formChangePw.newPassword}
                name="password"
                onChange={(e) => setFormChangePw((prevState) => ({ ...prevState, newPassword: e.target.value }))}
                error={Boolean((formErr.newPasswordErr && formErr.newPasswordErr.length > 0) || newPwError)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => onClickShowPassword('new')}
                      edge="end"
                      color="secondary"
                    >
                      {showPassword.new ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </IconButton>
                  </InputAdornment>
                }
                placeholder="******"
                inputProps={{}}
              />
              <FormHelperText error id="helper-text-new-password">
                {formErr.newPasswordErr}
              </FormHelperText>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="confirm-password">{<FormattedMessage id="confirm-password" />}</InputLabel>
              <OutlinedInput
                fullWidth
                id="confirm-password"
                type={showPassword.confirm ? 'text' : 'password'}
                value={formChangePw.confirmPassword}
                name="password"
                onChange={(e) => setFormChangePw((prevState) => ({ ...prevState, confirmPassword: e.target.value }))}
                error={Boolean(formErr.confirmPasswordErr && formErr.confirmPasswordErr.length > 0)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => onClickShowPassword('confirm')}
                      edge="end"
                      color="secondary"
                    >
                      {showPassword.confirm ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </IconButton>
                  </InputAdornment>
                }
                placeholder="******"
                inputProps={{}}
              />
              <FormHelperText error id="helper-text-confirm-password">
                {formErr.confirmPasswordErr}
              </FormHelperText>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
      {newPwError && (
        <Grid item xs={12} md={6}>
          <Typography variant="h5" fontWeight={'bold'}>
            <FormattedMessage id="new-password-must-contain" />
          </Typography>
          <ul style={{ color: '#ff4d4f' }}>
            <li>{intl.formatMessage({ id: 'at-least-8-characters' })}</li>
            <li>At least 1 lower letter (a-z)</li>
            <li>At least 1 uppercase letter (A-Z)</li>
            <li>At least 1 number (0-9)</li>
            <li>At least 1 special characters</li>
          </ul>
        </Grid>
      )}
    </Grid>
  );
};

export default TabChangePassword;
