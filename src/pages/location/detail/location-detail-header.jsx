import { Button, Grid } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import LocationDetailContext from './location-detail-context';
import axios from 'utils/axios';

import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { jsonCentralized } from 'utils/json-centralized';
import configGlobal from '../../../config';

export const getCityList = (provinceCode) => {
  return new Promise((resolve) => {
    const getResp = axios.get('kabupatenkotalocation', { params: { provinceCode } });
    getResp.then((resp) => {
      let getData = [...resp.data];

      getData = getData.map((dt) => {
        return { label: dt.cityName, value: +dt.cityCode };
      });

      resolve(getData);
    });
  });
};

const LocationDetailHeader = ({ setLocationName }) => {
  let { code } = useParams();
  const { locationDetail, setLocationDetail, locationDetailError } = useContext(LocationDetailContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // get detail location when code is exist
    if (code) {
      getDetailLocation();
    }

    // get data static
    getDataStatic();

    // get province list
    getProvinceList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const getDetailLocation = async () => {
    const getResp = await axios.get('detaillocation', { params: { codeLocation: code } });
    const getData = getResp.data;
    console.log('getDetailLocation', getData);

    let getDetailAddress = jsonCentralized(getData.detailAddress);
    const detailAddress = [];
    for (const da of getDetailAddress) {
      const setCityList = da.provinceCode ? await getCityList(da.provinceCode) : [];

      detailAddress.push({
        usage: +da.isPrimary ? true : false,
        streetAddress: da.addressName,
        additionalInfo: da.additionalInfo,
        country: da.country,
        province: da.provinceCode,
        city: da.cityCode,
        postalCode: da.postalCode,
        cityList: setCityList
      });
    }

    let operationalHour = jsonCentralized(getData.operationalHour);
    operationalHour = operationalHour.map((oh) => {
      return {
        allDay: +oh.allDay ? true : false,
        dayName: oh.dayName,
        fromTime: oh.fromTime,
        toTime: oh.toTime
      };
    });

    let messenger = jsonCentralized(getData.messenger);
    messenger = messenger.map((m) => {
      return { messengerNumber: m.messengerNumber, type: m.type, usage: m.usage };
    });

    let email = jsonCentralized(getData.email);
    email = email.map((e) => {
      return { usage: e.usage, username: e.username };
    });

    let telephone = jsonCentralized(getData.telephone);
    telephone = telephone.map((tel) => {
      return { phoneNumber: tel.phoneNumber, type: tel.type, usage: tel.usage };
    });

    let photos = jsonCentralized(getData.images);
    photos = photos.map((photo) => {
      return {
        id: photo.id,
        label: photo.labelName,
        imagePath: `${configGlobal.apiUrl}${photo.imagePath}`,
        status: '',
        selectedFile: null
      };
    });
    setLocationName(getData.locationName);
    setLocationDetail((val) => {
      const newLocationDetail = {
        locationName: getData.locationName,
        isBranch: 0,
        status: getData.status.toString(),
        description: getData.description,
        photos,
        detailAddress,
        operationalHour,
        messenger,
        email,
        telephone
      };

      return { ...val, ...newLocationDetail };
    });
  };

  const getDataStatic = async () => {
    const getResp = await axios.get('datastaticlocation');
    const getData = getResp.data;

    const mapper = (dt) => {
      return { label: dt.name, value: dt.name };
    };

    const newConstruct = {
      usageList: getData.dataStaticUsage.map(mapper),
      telephoneType: getData.dataStaticTelephone.map(mapper),
      messengerType: getData.dataStaticMessenger.map(mapper)
    };

    setLocationDetail((val) => {
      return { ...val, ...newConstruct };
    });
  };

  const getProvinceList = async () => {
    const getResp = await axios.get('provinsilocation');
    const getProvince = getResp.data.map((dt) => {
      return {
        label: dt.provinceName,
        value: +dt.id
      };
    });

    setLocationDetail((val) => {
      return { ...val, provinceList: getProvince };
    });
  };

  const setFormDataImage = (fd) => {
    if (locationDetail.photos.length) {
      const tempFileName = [];
      locationDetail.photos.forEach((file) => {
        fd.append('images[]', file.selectedFile);

        const id = code ? +file.id : '';
        tempFileName.push({ id, name: file.label, status: file.status });
      });
      fd.append('imagesName', JSON.stringify(tempFileName));
    } else {
      fd.append('images[]', []);
      fd.append('imagesName', JSON.stringify([]));
    }
  };

  const generateParamSaved = (property) => {
    const fd = new FormData();
    fd.append('locationName', locationDetail.locationName);
    fd.append('status', +locationDetail.status);
    fd.append('description', locationDetail.description);
    fd.append('detailAddress', JSON.stringify(property.detailAddress));
    fd.append('operationalHour', JSON.stringify(property.operationalHour));
    fd.append('messenger', JSON.stringify(property.messenger));
    fd.append('email', JSON.stringify(locationDetail.email));
    fd.append('telephone', JSON.stringify(locationDetail.telephone));
    setFormDataImage(fd);

    return fd;
  };

  const generateParamUpdate = (property) => {
    return {
      codeLocation: code,
      locationName: locationDetail.locationName,
      status: +locationDetail.status,
      description: locationDetail.description,
      detailAddress: property.detailAddress,
      operationalHour: property.operationalHour,
      messenger: property.messenger,
      email: locationDetail.email,
      telephone: locationDetail.telephone
    };
  };

  const generateParameterSubmit = () => {
    let detailAddress = jsonCentralized(locationDetail.detailAddress);
    detailAddress = detailAddress.map((da) => {
      return {
        addressName: da.streetAddress,
        additionalInfo: da.additionalInfo,
        country: da.country,
        provinceCode: da.province,
        cityCode: da.city,
        postalCode: +da.postalCode,
        isPrimary: da.usage ? 1 : 0
      };
    });
    let operationalHour = jsonCentralized(locationDetail.operationalHour);
    operationalHour = operationalHour.map((oh) => {
      oh.allDay = oh.allDay ? 1 : 0;
      return oh;
    });

    let messenger = jsonCentralized(locationDetail.messenger);
    messenger = messenger.map((m) => {
      return { messengerNumber: m.messengerNumber, type: m.type, usage: m.usage };
    });

    let result = null;
    if (code) {
      result = generateParamUpdate({ detailAddress, operationalHour, messenger });
    } else {
      result = generateParamSaved({ detailAddress, operationalHour, messenger });
    }

    return result;
  };

  const onSubmitLocation = async () => {
    if (locationDetailError) return;

    let response = null;
    let isSuccess = false;
    if (code) {
      response = await axios.put('location', generateParameterSubmit());
    } else {
      response = await axios.post('location', generateParameterSubmit(), { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    if (response && response.status === 200 && response.data.result === 'success') {
      if (code) {
        const fd = new FormData();
        fd.append('codeLocation', code);
        setFormDataImage(fd);
        const respUpload = await axios.post('imagelocation', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (respUpload.status === 200 && respUpload.data.result === 'success') {
          isSuccess = true;
        }
      } else {
        isSuccess = true;
      }
    }

    if (isSuccess) {
      const message = code ? 'Success update location' : 'Success create location';
      dispatch(
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' },
          duration: 1500,
          close: true
        })
      );
      navigate('/location/location-list', { replace: true });
    }
  };

  return (
    <Grid container sx={{ mb: 2.25 }}>
      <Grid item xs={12} sm={12} textAlign="right">
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmitLocation} disabled={locationDetailError}>
          <FormattedMessage id="save" />
        </Button>
      </Grid>
    </Grid>
  );
};

LocationDetailHeader.propTypes = {
  setLocationName: PropTypes.string
};

export default LocationDetailHeader;
