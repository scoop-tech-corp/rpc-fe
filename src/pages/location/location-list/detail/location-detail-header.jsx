import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { getAllState, useLocationDetailStore } from './location-detail-store';
import { openSnackbar } from 'store/reducers/snackbar';
import { SetupConfigSnackbar } from 'components/@extended/Snackbar';
import { breakdownMessageBackend } from 'service/service-global';
import { saveLocation, updateLocation, uploadImageLocation } from './service';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import PropTypes from 'prop-types';

const LocationDetailHeader = (props) => {
  const locationDetailError = useLocationDetailStore((state) => state.locationDetailError);
  let { code } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const snackbarSuccess = (message) => openSnackbar(SetupConfigSnackbar(true, { color: 'success', severity: 'success' }, message, 1500));
  const snackbarError = (message) => openSnackbar(SetupConfigSnackbar(true, { color: 'error', severity: 'error' }, message, 3000));
  const setTitlePage = () => (code ? props.locationName : <FormattedMessage id="add-location" />);

  const responseError = (err) => {
    let message = err.message;
    message += breakdownMessageBackend(err.errors);

    dispatch(snackbarError(message));
  };

  const nextProcessSuccess = (message) => {
    dispatch(snackbarSuccess(message));
    navigate('/location/location-list', { replace: true });
  };

  const responseSuccess = async (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success ${code ? 'update' : 'create'} data`;

      if (code) {
        const respUpload = await uploadImageLocation(locationDetail, code);
        if (respUpload.status === 200 && respUpload.data.result === 'success') {
          nextProcessSuccess(message);
        }
      } else {
        nextProcessSuccess(message);
      }
    }
  };

  const onSubmitLocation = async () => {
    console.log('getAllState()', getAllState());
    if (locationDetailError) return;
    if (code) {
      await updateLocation(code, getAllState()).then(responseSuccess).catch(responseError);
    } else {
      await saveLocation(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <HeaderPageCustom
      title={setTitlePage()}
      locationBackConfig={{ setLocationBack: true, customUrl: '/location/location-list' }}
      action={
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmitLocation} disabled={locationDetailError}>
          <FormattedMessage id="save" />
        </Button>
      }
    />
  );
};

LocationDetailHeader.propTypes = {
  locationName: PropTypes.string
};

export default LocationDetailHeader;
