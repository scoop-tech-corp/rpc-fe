import axios from 'utils/axios';
import configGlobal from '../../../../config';
import { jsonCentralized } from 'utils/func';
import { setFormDataImage } from 'service/service-global';

export const getCityList = (provinceCode) => {
  return new Promise((resolve) => {
    const getResp = axios.get('location/kabupatenkotalocation', { params: { provinceCode } });
    getResp.then((resp) => {
      let getData = [...resp.data];

      getData = getData.map((dt) => {
        return { label: dt.cityName, value: +dt.cityCode };
      });

      resolve(getData);
    });
  });
};

export const getDataStaticLocation = async () => {
  const getResp = await axios.get('location/datastaticlocation');
  const getData = getResp.data;

  const mapper = (dt) => {
    return { label: dt.name, value: dt.name };
  };

  return {
    usageList: getData.dataStaticUsage.map(mapper),
    telephoneType: getData.dataStaticTelephone.map(mapper),
    messengerType: getData.dataStaticMessenger.map(mapper)
  };
};

export const getProvinceLocation = async () => {
  const getResp = await axios.get('location/provinsilocation');

  return getResp.data.map((dt) => {
    return {
      label: dt.provinceName,
      value: +dt.id
    };
  });
};

export const getDetailLocation = async (code) => {
  const getResp = await axios.get('location/detaillocation', { params: { codeLocation: code } });
  const getData = getResp.data;

  const locationName = getData.locationName;
  const description = getData.description;
  const status = getData.status.toString();

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

  return { locationName, description, status, operationalHour, detailAddress, messenger, email, telephone, photos };
};

const generateParamUpdate = (property, locationData, codeLocation) => {
  return {
    codeLocation,
    locationName: locationData.locationName,
    status: +locationData.status,
    description: locationData.description,
    detailAddress: property.detailAddress,
    operationalHour: property.operationalHour,
    messenger: property.messenger,
    email: locationData.email,
    telephone: locationData.telephone
  };
};

const generateParamSaved = (property, locationData) => {
  const fd = new FormData();
  fd.append('locationName', locationData.locationName);
  fd.append('status', +locationData.status);
  fd.append('description', locationData.description);
  fd.append('detailAddress', JSON.stringify(property.detailAddress));
  fd.append('operationalHour', JSON.stringify(property.operationalHour));
  fd.append('messenger', JSON.stringify(property.messenger));
  fd.append('email', JSON.stringify(locationData.email));
  fd.append('telephone', JSON.stringify(locationData.telephone));
  setFormDataImage(locationData.photos, fd, 'save');

  return fd;
};

const generateParameterSubmit = (locationData, code = '') => {
  let detailAddress = jsonCentralized(locationData.detailAddress);
  detailAddress = detailAddress.map((da) => {
    return {
      addressName: da.streetAddress,
      additionalInfo: da.additionalInfo,
      country: da.country,
      provinceCode: da.province,
      cityCode: da.city,
      postalCode: da.postalCode ? +da.postalCode : '',
      isPrimary: da.usage ? 1 : 0
    };
  });
  let operationalHour = jsonCentralized(locationData.operationalHour);
  operationalHour = operationalHour.map((oh) => {
    oh.allDay = oh.allDay ? 1 : 0;
    return oh;
  });

  let messenger = jsonCentralized(locationData.messenger);
  messenger = messenger.map((m) => {
    return { messengerNumber: m.messengerNumber, type: m.type, usage: m.usage };
  });

  let result = null;
  if (code) {
    result = generateParamUpdate({ detailAddress, operationalHour, messenger }, locationData, code);
  } else {
    result = generateParamSaved({ detailAddress, operationalHour, messenger }, locationData);
  }

  return result;
};

export const updateLocation = async (code, data) => {
  return await axios.put('location', generateParameterSubmit(data, code));
};

export const saveLocation = async (data) => {
  return await axios.post('location', generateParameterSubmit(data), { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const saveDataStaticLocation = async (data) => {
  const fd = new FormData();
  fd.append('keyword', data.keyword); // Usage, Telephone, Messenger
  fd.append('name', data.name);

  return await axios.post('location/datastatic', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getLocation = async (property) => {
  return await axios.get('location', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const uploadImageLocation = async (property, code) => {
  const fd = new FormData();
  fd.append('codeLocation', code);
  setFormDataImage(property.photos, fd);

  return await axios.post('location/imagelocation', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const exportLocation = async () => {
  return axios.get('location/exportlocation', { responseType: 'blob' });
};
