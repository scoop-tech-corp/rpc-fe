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
