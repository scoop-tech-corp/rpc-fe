import { setFormDataImage } from 'service/service-global';
import axios from 'utils/axios';

export const getFacilityLocationList = () => {
  return new Promise((resolve) => {
    const getResp = axios.get('facilitylocation', { params: {} });
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
  const getResp = await axios.get('facilitydetail', { params: { locationId: id } });

  return getResp.data;
};

export const createFacilityLocation = async (property) => {
  const fd = new FormData();
  fd.append('locationId', property.locationId);
  fd.append('introduction', property.introduction);
  fd.append('description', property.description);
  fd.append('unit', JSON.stringify(property.detailUnitAvailable));

  setFormDataImage(property.photos, fd, 'save');

  return await axios.post('facility', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateFacilityLocation = async (property) => {
  const parameter = {
    locationId: property.locationId,
    introduction: property.introduction,
    description: property.description,
    unit: property.detailUnitAvailable
  };

  return await axios.put('facility', parameter);
};

export const uploadImageFacility = async (property) => {
  const fd = new FormData();
  fd.append('locationId', property.locationId);
  setFormDataImage(property.photos, fd);

  return await axios.post('imagefacility', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
