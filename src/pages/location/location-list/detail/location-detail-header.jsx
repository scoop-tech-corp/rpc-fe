import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { getAllState, useLocationDetailStore } from './location-detail-store';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { breakdownDetailMessageBackend } from 'service/service-global';
import { saveLocation, updateLocation, uploadImageLocation } from './service';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import PropTypes from 'prop-types';
import ErrorContainer from 'components/@extended/ErrorContainer';

const LocationDetailHeader = (props) => {
  const locationDetailError = useLocationDetailStore((state) => state.locationDetailError);
  const isTouchForm = useLocationDetailStore((state) => state.locataionTouch);

  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { code } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = () => (code ? props.locationName : <FormattedMessage id="add-location" />);

  const responseError = (err) => {
    const detailErr = breakdownDetailMessageBackend(err.errors);
    setIsError(true);
    useLocationDetailStore.setState({ locataionTouch: false });

    setErrContent({ title: err.message, detail: detailErr });
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
    if (locationDetailError) return;

    if (code) {
      await updateLocation(code, getAllState()).then(responseSuccess).catch(responseError);
    } else {
      await saveLocation(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/location/location-list' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmitLocation}
            disabled={!isTouchForm || locationDetailError}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

LocationDetailHeader.propTypes = {
  locationName: PropTypes.string
};

export default LocationDetailHeader;
