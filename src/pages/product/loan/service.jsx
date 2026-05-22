import axios from 'utils/axios';

const productLoanUrl = 'product/loan';

export const getProductLoan = async (property) => {
  return await axios.get(productLoanUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      status: property.status
    }
  });
};

export const deleteProductLoan = async (id) => {
  return await axios.delete(productLoanUrl, {
    data: { id }
  });
};

export const exportProductLoan = async (property) => {
  return await axios.get(productLoanUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      locationId: property.locationId,
      status: property.status
    }
  });
};
