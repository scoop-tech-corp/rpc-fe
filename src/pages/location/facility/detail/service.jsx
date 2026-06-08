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

/**
 * Ambil daftar kandang yang tersedia di lokasi tertentu.
 *
 * @param {number[]} locationIds  - array locationId
 * @param {object}   conditionOpts - opsi kondisi pet untuk filter tipe kandang
 *   @param {boolean} conditionOpts.isPregnant     - pet hamil → kandang maternal
 *   @param {boolean} conditionOpts.isParent       - pet induk + anak
 *   @param {number}  conditionOpts.minCapacity    - kapasitas minimum (induk + jumlah anak)
 */
export const getCageFacilityLocationList = async (locationIds = [], conditionOpts = {}) => {
  const { isPregnant = false, isParent = false, minCapacity = 1 } = conditionOpts;

  const getResp = await axios.get('location/facility/cage', {
    params: {
      locationId: locationIds.length ? locationIds : [''],
      isPregnant: isPregnant ? 1 : 0,
      isParent: isParent ? 1 : 0,
      minCapacity: minCapacity || 1
    }
  });

  return getResp.data.map((dt) => {
    const remaining = dt.remainingCapacity !== undefined ? +dt.remainingCapacity : +dt.capacity;
    const total     = +dt.capacity;
    const capLabel  = remaining < total
      ? `sisa ${remaining}/${total}`
      : `${total}`;
    return {
      label: `${dt.cageName || dt.unitName}${dt.size ? ` (${dt.size})` : ''} — cap. ${capLabel}`,
      value: +dt.id,
      cageName: dt.cageName || dt.unitName,
      type: dt.type,
      size: dt.size,
      capacity: total,
      remainingCapacity: remaining
    };
  });
};
