import axios from 'utils/axios';

const productCategoryUrl = 'service/category';

export const getProductCategory = async (params) => {
  const getResp = await axios.get(productCategoryUrl, {
    params
  });

  return getResp;
};

export const exportServiceCategory = async (params) => {
  return await axios.get(productCategoryUrl + '/export', {
    responseType: 'blob',
    params
  });
};

export const deleteServiceCategory = async (id) => {
  return await axios.delete(productCategoryUrl, {
    data: { id }
  });
};

export const createProductCategory = async (property) => {
  const param = new FormData();
  param.append('categoryName', property.categoryName);

  return await axios.post(productCategoryUrl, param, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductCategory = async (property) => {
  const parameter = {
    id: property.id,
    categoryName: property.categoryName,
    expiredDay: property.expiredDay
  };

  return await axios.put(productCategoryUrl, parameter);
};
