import { Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Icon } from 'leaflet';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';

import axios from 'utils/axios';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

import './style.css';
import 'leaflet/dist/leaflet.css';

const IconMarker = new Icon({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  iconSize: [30, 30] // size of the icon
});

const configCoreErr = {
  statusErr: ''
};

const FormAbsent = (props) => {
  const { open } = props;

  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const firstRender = useRef(true);
  const intl = useIntl();
  const dispatch = useDispatch();

  const [isFormValid, setFormValid] = useState(false);
  const [formErr, setFormErr] = useState(configCoreErr);

  const [stateCamera, setStateCamera] = useState(true);
  const [formValue, setFormValue] = useState({
    presentTime: '',
    location: [null, null], // [lat, long]
    address: '',
    city: '',
    province: '',
    status: '', // 1 = masuk, 2 = cuti, 3 = sakit, 4 = pulang
    reason: '',
    filePhoto: ''
  });

  const onSubmit = async () => {
    const payload = new FormData();
    payload.append('presentTime', formValue.presentTime);
    payload.append('latitude', formValue.location[0]);
    payload.append('longitude', formValue.location[1]);
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

          let prevUserLogin = JSON.parse(localStorage.getItem('user'));
          prevUserLogin.isAbsent = !prevUserLogin.isAbsent;
          localStorage.setItem('user', JSON.stringify(prevUserLogin));

          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  const onCancel = () => {
    onStopCamera();
    props.onClose(true);
  };

  const getCurrentLocationUser = () => {
    navigator.geolocation.getCurrentPosition(async (postion) => {
      const getRespLocation = await axios.get('https://nominatim.openstreetmap.org/reverse.php?zoom=10&format=jsonv2', {
        params: { lat: postion.coords.latitude, lon: postion.coords.longitude }
      });

      const getAddress = getRespLocation.data.address;

      setFormValue((prevState) => ({
        ...prevState,
        location: [postion.coords.latitude, postion.coords.longitude],
        address: `${getAddress.city_district} ${getAddress.city} ${getAddress.state ?? ''}`,
        city: getAddress.city,
        province: getAddress.state ?? ''
      }));
    });
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
      setFormValid(false);
    } else {
      setFormErr(configCoreErr);
      setFormValid(true);
    }
  };

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

  // <ModalC
  //   title={<FormattedMessage id="absent" />}
  //   open={open}
  //   onOk={onSubmit}
  //   onCancel={onCancel}
  //   fullWidth
  //   maxWidth="md"
  //   disabledOk={!isFormValid}
  // >
  //   <Grid container spacing={2}>
  //     <Grid item xs={12}>
  //       <Stack spacing={1}>
  //         <InputLabel htmlFor="present-time">
  //           <FormattedMessage id="present-time" />
  //         </InputLabel>
  //         <TextField fullWidth id="present-time" name="present-time" value={formValue.presentTime} inputProps={{ readOnly: true }} />
  //       </Stack>
  //     </Grid>

  //     <Grid item xs={12}>
  //       <Stack spacing={1}>
  //         <InputLabel htmlFor="location">
  //           <FormattedMessage id="location" />
  //         </InputLabel>
  //         <TextField fullWidth id="location" name="location" value={formValue.address} />
  //       </Stack>
  //       {formValue.location[0] !== null && formValue.location[1] !== null && (
  //         <MapContainer center={formValue.location} zoom={14} scrollWheelZoom={false}>
  //           <TileLayer
  //             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //           />
  //           <Marker position={formValue.location} icon={IconMarker}>
  //             <Popup>You are here</Popup>
  //           </Marker>
  //         </MapContainer>
  //       )}
  //     </Grid>

  //     <Grid item xs={12}>
  //       <Stack spacing={1}>
  //         <InputLabel htmlFor="status">Status</InputLabel>
  //         <FormControl sx={{ m: 1, minWidth: 120 }}>
  //           <Select
  //             id="status"
  //             name="status"
  //             value={formValue.status}
  //             onChange={(event) => {
  //               setFormValue((prevState) => ({
  //                 ...prevState,
  //                 status: event.target.value,
  //                 reason: [2, 3].includes(event.target.value) ? prevState.reason : ''
  //               }));
  //             }}
  //             placeholder="Select status"
  //           >
  //             <MenuItem value="">
  //               <em>Select status</em>
  //             </MenuItem>
  //             <MenuItem value={1}>Masuk</MenuItem>
  //             <MenuItem value={2}>Cuti</MenuItem>
  //             <MenuItem value={3}>Sakit</MenuItem>
  //             <MenuItem value={4}>Pulang</MenuItem>
  //           </Select>
  //           {formErr.statusErr.length > 0 && <FormHelperText error> {formErr.statusErr} </FormHelperText>}
  //         </FormControl>
  //       </Stack>
  //     </Grid>

  //     {[2, 3].includes(formValue.status) && (
  //       <Grid item xs={12}>
  //         <Stack spacing={1}>
  //           <InputLabel htmlFor="reason">{<FormattedMessage id="reason" />}</InputLabel>
  //           <TextField
  //             fullWidth
  //             id="reason"
  //             name="reason"
  //             value={formValue.reason}
  //             onChange={(event) => setFormValue((prevState) => ({ ...prevState, reason: event.target.value }))}
  //           />
  //         </Stack>
  //       </Grid>
  //     )}

  //     <Grid item xs={12}>
  //       <Stack spacing={1}>
  //         <InputLabel htmlFor="take-a-picture">{<FormattedMessage id="take-a-picture" />}</InputLabel>
  //         <Button
  //           variant="contained"
  //           onClick={() => {
  //             setStateCamera((prevState) => {
  //               if (prevState) {
  //                 onOpenCamera();
  //               } else {
  //                 onStopCamera();
  //               }

  //               return !prevState;
  //             });
  //           }}
  //           color={stateCamera ? 'primary' : 'error'}
  //         >
  //           {stateCamera ? 'Open a camera' : 'Stop a camera'}
  //         </Button>

  //         {!stateCamera && (
  //           <Button variant="contained" onClick={onTakeSelfie} color="success">
  //             Take a selfie
  //           </Button>
  //         )}
  //         <video ref={videoRef} style={{ display: 'none' }} />
  //         <canvas ref={photoRef} style={{ display: 'none' }} />
  //       </Stack>
  //     </Grid>
  //   </Grid>
  // </ModalC>
  return <p>www</p>;
};

export default FormAbsent;
