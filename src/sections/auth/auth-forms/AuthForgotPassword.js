// import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// material-ui
import { Button, FormHelperText, Grid, InputLabel, OutlinedInput, Stack } from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
// import useAuth from 'hooks/useAuth';

// import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'components/@extended/AnimateButton';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { sendOtp } from 'pages/auth/service';
import { createMessageBackend } from 'service/service-global';

// ============================|| FIREBASE - FORGOT PASSWORD ||============================ //

const AuthForgotPassword = (props) => {
  // const scriptedRef = useScriptRef();
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  // const { isLoggedIn, resetPassword } = useAuth();

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          await sendOtp(values.email).then(
            () => {
              props.onSubmit({ email: values.email });
              dispatch(snackbarSuccess('Success Send OTP, Please check your email'));
              setStatus({ success: true });
              setSubmitting(false);
            },
            (err) => {
              dispatch(snackbarError('Something wrong happend'));
              setStatus({ success: false });
              setErrors({ submit: createMessageBackend(err, true, true) });
              setSubmitting(false);
            }
          );
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-forgot">Email Address</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-forgot"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    inputProps={{}}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="helper-text-email-forgot">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Send Password Reset Email
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthForgotPassword;
