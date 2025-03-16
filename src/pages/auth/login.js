import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Grid, Stack, Typography } from '@mui/material';

import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';

// ================================|| LOGIN ||================================ //

const Login = () => {
  const { isLoggedIn, logout } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (+searchParams.get('islogout')) {
      window.history.pushState({ path: '/login' }, '', '/login');
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
            <Typography component={Link} to={'/forgot-password'} variant="body1" sx={{ textDecoration: 'none' }} color="primary">
              Forgot Password
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Login;
