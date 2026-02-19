import { setFormDataImage } from 'service/service-global';
import axios from 'utils/axios';

export const getFacilityLocationList = () => {
  return new Promise((resolve) => {
    const getResp = axios.get('location/facility/facilitylocation', { params: {} });
    getResp.then((resp) => {
      let getData = [...resp.data];

      getData = getData.map((dt) => {
        return { label: dt.locationName, value: +dt.id };
      });

      resolve(getData);
    });
  });
};

export const getFacilityLocationDetail = async (id) => {
  const getResp = await axios.get('location/facility/facilitydetail', { params: { locationId: id } });

  return getResp.data;
};

export const createFacilityLocation = async (property) => {
  const fd = new FormData();
  fd.append('locationId', property.locationId);
  fd.append('introduction', property.introduction);
  fd.append('description', property.description);
  fd.append('unit', JSON.stringify(property.detailUnitAvailable));

  setFormDataImage(property.photos, fd, 'save');

  return await axios.post('location/facility', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateFacilityLocation = async (property) => {
  const parameter = {
    locationId: property.locationId,
    introduction: property.introduction,
    description: property.description,
    unit: property.detailUnitAvailable
  };

  return await axios.put('location/facility', parameter);
};

export const getFacility = async (property) => {
  return axios.get('location/facility', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      locationId: property.locationId
    }
  });
};

export const uploadImageFacility = async (property) => {
  const fd = new FormData();
  fd.append('locationId', property.locationId);
  setFormDataImage(property.photos, fd);

  return await axios.post('location/facility/imagefacility', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const exportFacility = async (property) => {
  return axios.get('location/facility/facilityexport', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      locationId: property.locationId.length ? property.locationId : ['']
    }
  });
};

export const getCageFacilityLocationList = async (locationIds = []) => {
  const getResp = await axios.get('location/facility/cage', { params: { locationId: locationIds.length ? locationIds : [''] } });

  return getResp.data.map((dt) => {
    return { label: dt.unitName, value: +dt.id };
  });
};
