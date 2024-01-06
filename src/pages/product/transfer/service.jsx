import axios from 'utils/axios';
const url = 'product/transfer';

export const getProductTransfer = async (property) => {
  return await axios.get(url, {
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      goToPage: property.goToPage,
      rowPerPage: property.rowPerPage,
      locationDestinationId: property.locationDestinationId,
      status: property.status
    }
  });
};

export const exportProductTransfer = async (property) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      locationDestinationId: property.locationDestinationId,
      status: property.status
    }
  });
};

export const deleteProductTransfer = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};
