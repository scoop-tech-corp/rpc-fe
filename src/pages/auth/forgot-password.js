import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Grid, Stack, Typography } from '@mui/material';

import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthForgotPassword from 'sections/auth/auth-forms/AuthForgotPassword';
import CodeVerification from './code-verification';
import ResetPassword from './reset-password';

// ================================|| FORGOT PASSWORD ||================================ //

const ForgotPassword = () => {
  const [mode, setMode] = useState('forgot'); // forgot, otp, resetPassword
  const [email, setEmail] = useState('');

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        {mode === 'forgot' && (
          <>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                <Typography variant="h3">Forgot Password</Typography>
                <Typography
                  component={Link}
                  to={'/login'} // isLoggedIn ? '/auth/login' : '/login'
                  variant="body1"
                  sx={{ textDecoration: 'none' }}
                  color="primary"
                >
                  Back to Login
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <AuthForgotPassword
                onSubmit={(response) => {
                  if (response.email) {
                    // email
                    setEmail(response.email);
                    setMode('otp');
                  }
                }}
              />
            </Grid>
          </>
        )}

        {mode === 'otp' && (
          <Grid item xs={12}>
            <CodeVerification
              email={email}
              onSubmitOtp={(resp) => {
                if (resp) {
                  setMode('resetPassword');
                }
              }}
            />
          </Grid>
        )}

        {mode === 'resetPassword' && (
          <Grid item xs={12}>
            <ResetPassword email={email} />
          </Grid>
        )}
      </Grid>
    </AuthWrapper>
  );
};

export default ForgotPassword;
