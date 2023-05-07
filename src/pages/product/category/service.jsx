import axios from 'utils/axios';

const productCategoryUrl = 'product/category';

export const getProductCategory = async (property) => {
  const getResp = await axios.get(productCategoryUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });

  return getResp;
};

export const createProductCategory = async (property) => {
  const param = new FormData();
  param.append('categoryName', property.categoryName);
  param.append('expiredDay', property.expiredDay);

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

export const deleteProductCategory = async (id) => {
  return await axios.delete(productCategoryUrl, {
    data: { id }
  });
};

export const exportProductCategory = async (property) => {
  return await axios.get(productCategoryUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const getProductCategoryDetailSell = async (property) => {
  const getResp = await axios.get(productCategoryUrl + '/detail/sell', {
    params: {
      id: property.id,
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });

  return getResp;
};

export const getProductCategoryDetailClinic = async (property) => {
  const getResp = await axios.get(productCategoryUrl + '/detail/clinic', {
    params: {
      id: property.id,
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });

  return getResp;
};
