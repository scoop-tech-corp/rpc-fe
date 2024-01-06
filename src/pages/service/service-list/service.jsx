import { setFormDataImage } from 'service/service-global';
import axios from 'utils/axios';

const serviceListUrl = 'service/list';

export const getProductList = async (params) => {
  const getResp = await axios.get(params.api, {
    params: {
      locationId: params.locationId
    }
  });

  return getResp;
};

export const getFacilityList = async (params) => {
  const getResp = await axios.get('location/facility/location', {
    params: {
      locationId: params.locationId
    }
  });

  return getResp;
};

export const getStaffByLocation = async (params) => {
  const getResp = await axios.get('staff/list/location', {
    params: {
      locationId: params.locationId
    }
  });

  return getResp;
};

export const getServiceCategoryList = async () => {
  const getResp = await axios.get('service/category', {
    params: {
      orderValue: 'asc',
      orderColumn: 'categoryName',
      rowPerPage: '0'
    }
  });

  return getResp.data?.data?.map((dt) => {
    return { label: dt.categoryName, value: dt.id };
  });
};

export const getServiceListFollowup = async (params) => {
  const getResp = await axios.get(serviceListUrl, {
    params
  });

  return getResp.data?.data?.map((dt) => {
    return { label: dt.fullName, value: dt.id };
  });
};

export const getServiceList = async (params) => {
  const getResp = await axios.get(serviceListUrl, {
    params
  });

  return getResp;
};

export const createServiceList = async (property) => {
  const fd = new FormData();
  Object.entries(property).forEach(([key, value]) => {
    if (['listPrice', 'categories', 'facility', 'listStaff', 'productRequired', 'location', 'listPrice', 'followup'].includes(key)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, value);
    }
  });
  setFormDataImage(property.photos, fd, 'save');
  fd.delete('photos');
  return await axios.post(serviceListUrl, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateServiceList = async (property) => {
  const fd = new FormData();
  Object.entries(property).forEach(([key, value]) => {
    if (['listPrice', 'categories', 'facility', 'listStaff', 'productRequired', 'location', 'listPrice', 'followup'].includes(key)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, value);
    }
  });
  setFormDataImage(property.photos, fd);
  fd.delete('photos');
  return await axios.post(`${serviceListUrl}/?_method=PUT`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getServiceListById = async (params) => {
  const getResp = await axios.get(serviceListUrl + '/detail', {
    params: {
      id: params.id
    }
  });

  return getResp;
};
export const deleteServiceList = async (id) => {
  return await axios.delete(serviceListUrl, {
    data: { id }
  });
};

export const exportServiceList = async (property) => {
  return await axios.get(serviceListUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      // locationId: property.locationId.length ? property.locationId : [''],
      isExportAll: property.allData ? 1 : 0,
      isExportLimit: property.onlyItem ? 1 : 0
    }
  });
};
export const downloadTemplateServiceList = async () => {
  return await axios.get(serviceListUrl + '/template', { responseType: 'blob' });
};

export const importServiceList = async (file) => {
  const fd = new FormData();
  fd.append('file', file);

  return await axios.post(serviceListUrl + '/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
