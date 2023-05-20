import axios from 'utils/axios';

const productRestockUrl = 'product/restock';

export const getProductRestock = async (property) => {
  return await axios.get(productRestockUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      supplierId: property.supplierId
    }
  });
};

export const deleteProductRestock = async (id) => {
  return await axios.delete(productRestockUrl, {
    data: { id }
  });
};

export const exportProductRestock = async (property) => {
  return await axios.get(productRestockUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};
