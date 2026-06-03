import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Draggable, Map, Overlay, ZoomControl } from 'pigeon-maps';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { useDispatch } from 'react-redux';

import axios from 'utils/axios';
import PropTypes from 'prop-types';
import useAuth from 'hooks/useAuth';

const configCoreErr = { statusErr: '' };

const AccuracyCircle = ({ anchor, accuracy, latLngToPixel, pixelToLatLng, setCenterZoom, mapState }) => {
  if (!accuracy || !mapState || !anchor[0]) return null;
  const metersPerPx = (156543.03392 * Math.cos((anchor[0] * Math.PI) / 180)) / Math.pow(2, mapState.zoom);
  const radiusPx = Math.max(accuracy / metersPerPx, 0);
  return (
    <Overlay anchor={anchor} offset={[radiusPx, radiusPx]} latLngToPixel={latLngToPixel} pixelToLatLng={pixelToLatLng} setCenterZoom={setCenterZoom} mapState={mapState}>
      <div
        style={{
          width: radiusPx * 2,
          height: radiusPx * 2,
          borderRadius: '50%',
          backgroundColor: 'rgba(66, 133, 244, 0.15)',
          border: '2px solid rgba(66, 133, 244, 0.4)',
          pointerEvents: 'none'
        }}
      />
    </Overlay>
  );
};

const FormAbsent = (props) => {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const firstRender = useRef(true);
  const intl = useIntl();
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [formErr, setFormErr] = useState(configCoreErr);
  const [locationStatus, setLocationStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [locationError, setLocationError] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  const [stateCamera, setStateCamera] = useState(true);
  const [formValue, setFormValue] = useState({
    presentTime: '',
    location: [null, null], // [lat, long]
    address: '',
    city: '',
    province: '',
    shift: '',
    status: '', // 1 = masuk, 2 = cuti, 3 = sakit, 4 = pulang
    reason: '',
    filePhoto: ''
  });

  const onSubmit = async () => {
    const payload = new FormData();
    payload.append('presentTime', formValue.presentTime);
    payload.append('latitude', formValue.location[0]);
    payload.append('longitude', formValue.location[1]);
    payload.append('shift', formValue.shift);
    payload.append('status', formValue.status);
    payload.append('reason', formValue.reason);
    payload.append('address', '');
    payload.append('city', formValue.city);
    payload.append('province', formValue.province);
    payload.append('image', formValue.filePhoto);

    await axios
      .post('absent', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Success input absent'));
          updateIsAbsent();

          if ('onClose' in props) props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  const onCancel = () => {
    onStopCamera();
    updateIsAbsent();

    if ('onClose' in props) props.onClose(true);
  };

  const updateIsAbsent = () => {
    let prevUserLogin = JSON.parse(localStorage.getItem('user'));
    prevUserLogin.isAbsent = !prevUserLogin.isAbsent;
    localStorage.setItem('user', JSON.stringify(prevUserLogin));
  };

  const getCurrentLocationUser = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Browser Anda tidak mendukung akses lokasi.');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (postion) => {
        const lat = postion.coords.latitude;
        const lon = postion.coords.longitude;

        setAccuracy(postion.coords.accuracy);
        setFormValue((prevState) => ({ ...prevState, location: [lat, lon] }));
        setLocationStatus('success');

        try {
          const getRespLocation = await fetch(
            `https://nominatim.openstreetmap.org/reverse.php?zoom=10&format=jsonv2&lat=${lat}&lon=${lon}`
          );
          const data = await getRespLocation.json();
          const getAddress = data.address;

          setFormValue((prevState) => ({
            ...prevState,
            address: `${getAddress.city_district || getAddress.suburb}, ${getAddress.city || getAddress.municipality}, ${
              getAddress.state ?? ''
            }`,
            city: getAddress.city,
            province: getAddress.state ?? ''
          }));
        } catch {
          // address stays empty, map still shows with coordinates
        }
      },
      (error) => {
        setLocationStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Izin lokasi ditolak. Silakan izinkan akses lokasi di browser Anda lalu coba lagi.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Informasi lokasi tidak tersedia. Pastikan GPS Anda aktif.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Permintaan lokasi timeout. Silakan coba lagi.');
        } else {
          setLocationError('Gagal mendapatkan lokasi. Silakan coba lagi.');
        }
      },
      { timeout: 10000 }
    );
  };

  const onMarkerDragEnd = async ([lat, lon]) => {
    setFormValue((prevState) => ({ ...prevState, location: [lat, lon] }));
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse.php?zoom=10&format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await resp.json();
      const addr = data.address;
      setFormValue((prevState) => ({
        ...prevState,
        address: `${addr.city_district || addr.suburb}, ${addr.city || addr.municipality}, ${addr.state ?? ''}`,
        city: addr.city,
        province: addr.state ?? ''
      }));
    } catch {
      // keep previous address if reverse geocode fails
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const dateStr =
      ('00' + date.getDate()).slice(-2) +
      '/' +
      ('00' + (date.getMonth() + 1)).slice(-2) +
      '/' +
      date.getFullYear() +
      ' ' +
      ('00' + date.getHours()).slice(-2) +
      ':' +
      ('00' + date.getMinutes()).slice(-2);

    setFormValue((prevState) => ({ ...prevState, presentTime: dateStr }));
  };

  const onOpenCamera = () => {
    photoRef.current.removeAttribute('width');
    photoRef.current.removeAttribute('height');
    photoRef.current.removeAttribute('style');
    photoRef.current.style.display = 'none';

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // attach the stream to the video tag
        let video = videoRef.current;
        video.srcObject = stream;
        video.style.display = 'block';
        video.style.webkitTransform = 'scaleX(-1)';
        video.style.transform = 'scaleX(-1)';

        video.play();
      })
      .catch((err) => console.log(err));
  };

  const onStopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    videoRef.current.style.display = 'none';
  };

  const onTakeSelfie = async () => {
    const video = videoRef.current;
    const photo = photoRef.current;
    const width = video.videoWidth; //500;
    const height = width / (16 / 9);

    photo.width = width;
    photo.height = height;
    photo.style.display = 'block';
    photo.style.webkitTransform = 'scaleX(-1)';
    photo.style.transform = 'scaleX(-1)';
    const ctx = photo.getContext('2d');
    const getFileFromBlob = () => {
      return new Promise((resolve) => {
        photo.toBlob((blob) => {
          let file = new File([blob], 'fileName.jpg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg');
      });
    };
    ctx.drawImage(video, 0, 0, photo.width, photo.height);

    const getFile = await getFileFromBlob();

    setFormValue((prevState) => ({ ...prevState, filePhoto: getFile }));

    // stop the camera, rollback state camera and reset photo;
    onStopCamera();
    setStateCamera(true);

    // hide video
    video.style.display = 'none';
  };

  const onCheckValidation = () => {
    let getStatusError = '';

    if (!formValue.status) {
      getStatusError = intl.formatMessage({ id: 'status-is-required' });
    }

    if (getStatusError) {
      setFormErr({
        statusErr: getStatusError
      });
      if ('setFormValid' in props) props.setFormValid(false);
    } else {
      setFormErr(configCoreErr);
      if ('setFormValid' in props) props.setFormValid(true);
    }
  };

  useEffect(() => {
    if (props.firedSubmit) onSubmit();
    if (props.firedCancel) onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.firedSubmit, props.firedCancel]);

  useEffect(() => {
    getCurrentLocationUser();
    getCurrentDate();
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) {
      onCheckValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel htmlFor="present-time">
            <FormattedMessage id="present-time" />
          </InputLabel>
          <TextField fullWidth id="present-time" name="present-time" value={formValue.presentTime} inputProps={{ readOnly: true }} />
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel htmlFor="location">
            <FormattedMessage id="location" />
          </InputLabel>
          <TextField fullWidth id="location" name="location" value={formValue.address} />
        </Stack>
        {locationStatus === 'loading' && (
          <Box display="flex" justifyContent="center" alignItems="center" height={200} mt={1}>
            <CircularProgress size={36} />
          </Box>
        )}
        {locationStatus === 'error' && (
          <Alert
            severity="error"
            sx={{ mt: 1 }}
            action={
              <Button color="inherit" size="small" onClick={getCurrentLocationUser}>
                Coba Lagi
              </Button>
            }
          >
            {locationError}
          </Alert>
        )}
        {locationStatus === 'success' && formValue.location[0] !== null && formValue.location[1] !== null && (
          <>
            <Map height={400} defaultCenter={formValue.location} defaultZoom={15} style={{ marginTop: 8 }}>
              <AccuracyCircle anchor={formValue.location} accuracy={accuracy} />
              <Draggable anchor={formValue.location} onDragEnd={onMarkerDragEnd} offset={[14.5, 43]}>
                <svg
                  width="29"
                  height="43"
                  viewBox="0 0 29 43"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ cursor: 'grab', display: 'block' }}
                >
                  <path
                    d="M14.5 0C6.492 0 0 6.395 0 14.285c0 10.714 14.5 28.715 14.5 28.715S29 25 29 14.285C29 6.395 22.508 0 14.5 0zm0 20a5.715 5.715 0 1 1 0-11.43A5.715 5.715 0 0 1 14.5 20z"
                    fill="#d73a49"
                  />
                </svg>
              </Draggable>
              <ZoomControl style={{ position: 'absolute', right: 10, bottom: 10 }} />
            </Map>
            <Box sx={{ mt: 0.5, color: 'text.secondary', fontSize: 12 }}>
              Geser pin merah jika lokasi kurang tepat. Akurasi GPS: ±{accuracy ? Math.round(accuracy) : '—'} meter.
            </Box>
          </>
        )}
      </Grid>

      {user?.role === 'doctor' && (
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="shift">Shift</InputLabel>
            <FormControl>
              <Select
                id={'shift'}
                name="shift"
                value={formValue.shift}
                onChange={(event) => setFormValue((prevState) => ({ ...prevState, shift: event.target.value }))}
              >
                <MenuItem value="">
                  <em>
                    <FormattedMessage id="select-shift" />
                  </em>
                </MenuItem>
                <MenuItem value={1}>Shift 1</MenuItem>
                <MenuItem value={2}>Shift 2</MenuItem>
              </Select>
              {/* {dt.error.shiftErr.length > 0 && <FormHelperText error> {dt.error.shiftErr} </FormHelperText>} */}
            </FormControl>
          </Stack>
        </Grid>
      )}

      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel htmlFor="status">Status</InputLabel>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select
              id="status"
              name="status"
              value={formValue.status}
              onChange={(event) => {
                setFormValue((prevState) => ({
                  ...prevState,
                  status: event.target.value,
                  reason: [2, 3].includes(event.target.value) ? prevState.reason : ''
                }));
              }}
              placeholder="Select status"
            >
              <MenuItem value="">
                <em>Select status</em>
              </MenuItem>
              <MenuItem value={1}>Masuk</MenuItem>
              <MenuItem value={2}>Cuti</MenuItem>
              <MenuItem value={3}>Sakit</MenuItem>
              <MenuItem value={4}>Pulang</MenuItem>
            </Select>
            {formErr.statusErr.length > 0 && <FormHelperText error> {formErr.statusErr} </FormHelperText>}
          </FormControl>
        </Stack>
      </Grid>

      {[2, 3].includes(formValue.status) && (
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="reason">{<FormattedMessage id="reason" />}</InputLabel>
            <TextField
              fullWidth
              id="reason"
              name="reason"
              value={formValue.reason}
              onChange={(event) => setFormValue((prevState) => ({ ...prevState, reason: event.target.value }))}
            />
          </Stack>
        </Grid>
      )}

      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel htmlFor="take-a-picture">{<FormattedMessage id="take-a-picture" />}</InputLabel>
          <Button
            variant="contained"
            onClick={() => {
              setStateCamera((prevState) => {
                if (prevState) {
                  onOpenCamera();
                } else {
                  onStopCamera();
                }

                return !prevState;
              });
            }}
            color={stateCamera ? 'primary' : 'error'}
          >
            {stateCamera ? 'Open a camera' : 'Stop a camera'}
          </Button>

          {!stateCamera && (
            <Button variant="contained" onClick={onTakeSelfie} color="success">
              Take a selfie
            </Button>
          )}
          <video ref={videoRef} style={{ display: 'none' }} />
          <canvas ref={photoRef} style={{ display: 'none' }} />
        </Stack>
      </Grid>
    </Grid>
  );
};

FormAbsent.propTypes = {
  firedSubmit: PropTypes.bool,
  firedCancel: PropTypes.bool,
  setFormValid: PropTypes.func,
  onClose: PropTypes.func // currently use in modal form absent
};

export default FormAbsent;
