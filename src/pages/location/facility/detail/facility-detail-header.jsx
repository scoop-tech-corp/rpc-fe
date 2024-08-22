import { useState } from 'react';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createFacilityLocation, updateFacilityLocation, uploadImageFacility } from './service';
import { getAllState, useFacilityDetailStore } from './facility-detail-store';
import { createMessageBackend, detectUserPrivilage } from 'service/service-global';

import PropTypes from 'prop-types';
import ErrorContainer from 'components/@extended/ErrorContainer';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import useAuth from 'hooks/useAuth';

const FacilityDetailHeader = (props) => {
  let { id } = useParams();
  const facilityDetailError = useFacilityDetailStore((state) => state.facilityDetailError);
  const isTouchForm = useFacilityDetailStore((state) => state.facilityDetailTouch);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userPrivilage = detectUserPrivilage(user?.extractMenu.masterMenu);

  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  const setTitleFacility = () => (id ? props.facilityName : <FormattedMessage id="add-facility" />);

  const nextProcessSuccess = (message) => {
    dispatch(snackbarSuccess(message));
    navigate('/location/facilities', { replace: true });
  };

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useFacilityDetailStore.setState({ facilityDetailTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const responseSuccess = async (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} data`;

      if (id) {
        const thenUpload = (res) => {
          if (res && res.status === 200) nextProcessSuccess(message);
        };
        await uploadImageFacility(getAllState()).then(thenUpload).catch(responseError);
      } else {
        nextProcessSuccess(message);
      }
    }
  };

  const onSubmitFacility = async () => {
    if (facilityDetailError) return;

    if (id) {
      await updateFacilityLocation(getAllState()).then(responseSuccess).catch(responseError);
    } else {
      await createFacilityLocation(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  const isShowBtnSave = () => {
    if (id && userPrivilage == 4) return true;
    else if (!id && [2, 4].includes(userPrivilage)) return true;
    else return false;
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitleFacility()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/location/facilities' }}
        action={
          isShowBtnSave() && (
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={onSubmitFacility}
              disabled={!isTouchForm || facilityDetailError}
            >
              <FormattedMessage id="save" />
            </Button>
          )
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

FacilityDetailHeader.propTypes = {
  facilityName: PropTypes.string
};

export default FacilityDetailHeader;
