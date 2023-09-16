import axios from 'utils/axios';

const serviceCategoryUrl = 'service/category';

export const getServiceCategory = async (params) => {
  const getResp = await axios.get(serviceCategoryUrl, {
    params
  });

  return getResp;
};

export const exportServiceCategory = async (params) => {
  return await axios.get(serviceCategoryUrl + '/export', {
    responseType: 'blob',
    params
  });
};

export const deleteServiceCategory = async (id) => {
  return await axios.delete(serviceCategoryUrl, {
    data: { id }
  });
};

export const createServiceCategory = async (property) => {
  const param = new FormData();
  param.append('categoryName', property.categoryName);

  return await axios.post(serviceCategoryUrl, param, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateServiceCategory = async (property) => {
  const parameter = {
    id: property.id,
    categoryName: property.categoryName,
    expiredDay: property.expiredDay
  };

  return await axios.put(serviceCategoryUrl, parameter);
};
