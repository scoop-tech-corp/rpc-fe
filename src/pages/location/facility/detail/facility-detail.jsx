import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  createFacilityLocation,
  updateFacilityLocation,
  getFacilityLocationDetail,
  getFacilityLocationList,
  uploadImageFacility
} from './service';
import { breakdownMessageBackend } from 'service/service-global';
import { SetupConfigSnackbar } from 'components/@extended/Snackbar';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import FacilityDetailTab from './tab/facility-detail-tab';
import { defaultFacilityDetail, getAllState, useFacilityDetailStore } from './facility-detail-store';
import { jsonCentralized } from 'utils/json-centralized';
import configGlobal from '../../../../config';

const FacilityDetail = () => {
  const [facilityName, setFacilityName] = useState('');
  let { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const snackbarSuccess = (message) => openSnackbar(SetupConfigSnackbar(true, { color: 'success', severity: 'success' }, message, 1500));
  const snackbarError = (message) => openSnackbar(SetupConfigSnackbar(true, { color: 'error', severity: 'error' }, message, 3000));

  const setTitleFacility = () => (id ? facilityName : <FormattedMessage id="add-facility" />);

  const getDetailFacility = async () => {
    const getData = await getFacilityLocationDetail(id);

    let getUnit = jsonCentralized(getData.unit);
    getUnit = getUnit.map((u) => ({ ...u, id: +u.id, command: '' }));

    let getImage = jsonCentralized(getData.images);
    getImage = getImage.map((img) => ({
      ...img,
      label: img.labelName,
      imagePath: `${configGlobal.apiUrl}${img.imagePath}`,
      status: '',
      selectedFile: null
    }));

    useFacilityDetailStore.setState({
      locationId: +getData.locationId,
      introduction: getData.introduction,
      description: getData.description,
      detailUnitAvailable: getUnit,
      photos: getImage
    });
    setFacilityName(getData.facilityName);
  };

  const getDropdownData = async () => {
    const data = await getFacilityLocationList();
    useFacilityDetailStore.setState({ facilityLocationList: data });
  };

  const nextProcessSuccess = (message) => {
    dispatch(snackbarSuccess(message));
    navigate('/location/facilities', { replace: true });
  };

  const responseError = (err) => {
    let message = err.message;
    message += breakdownMessageBackend(err.errors);
    console.log('message', message);
    dispatch(snackbarError(message));
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
    if (getAllState().facilityDetailError) return;

    if (id) {
      await updateFacilityLocation(getAllState()).then(responseSuccess).catch(responseError);
    } else {
      await createFacilityLocation(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  useEffect(() => {
    if (id) getDetailFacility();

    getDropdownData();

    // destroy store facility detail
    return () => {
      useFacilityDetailStore.setState(jsonCentralized(defaultFacilityDetail));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <HeaderPageCustom
        title={setTitleFacility()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/location/facilities' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmitFacility}>
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <FacilityDetailTab />
    </>
  );
};

export default FacilityDetail;
