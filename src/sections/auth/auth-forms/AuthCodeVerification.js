import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { verifyOtp } from 'pages/auth/service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import OtpInput from 'react-otp-input-rc-17';
import AnimateButton from 'components/@extended/AnimateButton';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

const AuthCodeVerification = (props) => {
  const { email } = props;
  const theme = useTheme();
  const dispatch = useDispatch();

  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [finishCountdown, setFinishCountdown] = useState(false);
  const [disabledContinue, setDisabledContinue] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setFinishCountdown(true);
      return; // Stop when countdown reaches 0
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [seconds]);

  useEffect(() => setDisabledContinue(otp.toString().length < 6), [otp]);

  const onContinue = async () => {
    await verifyOtp({ email, otp: otp }).then(
      () => {
        props.onSubmitOtp(true);
        dispatch(snackbarSuccess('Success Send OTP, Please check your email'));
      },
      (err) => {
        dispatch(snackbarError(err.message || 'Something wrong happend'));
      }
    );
  };

  const borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[300];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <OtpInput
          value={otp}
          isInputNum
          onChange={(otp) => setOtp(otp)}
          numInputs={6}
          containerStyle={{ justifyContent: 'space-between' }}
          inputStyle={{
            width: '100%',
            margin: '8px',
            padding: '10px',
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            ':hover': {
              borderColor: theme.palette.primary.main
            }
          }}
          focusStyle={{
            outline: 'none',
            boxShadow: theme.customShadows.primary,
            border: `1px solid ${theme.palette.primary.main}`
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <AnimateButton>
          <Button fullWidth size="large" type="submit" variant="contained" disabled={disabledContinue} onClick={onContinue}>
            Continue
          </Button>
        </AnimateButton>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          {finishCountdown && (
            <Typography variant="body1" style={{ cursor: 'pointer' }} color="primary">
              Resend OTP
            </Typography>
          )}
          {!finishCountdown && (
            <Typography>
              Your OTP will expire in <span style={{ fontWeight: 'bold' }}>{seconds} seconds</span>. Use it before time runs out!
            </Typography>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AuthCodeVerification;
