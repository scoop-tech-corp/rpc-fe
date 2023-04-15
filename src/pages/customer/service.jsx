import axios from 'utils/axios';

export const getCustomerList = async (property) => {
  return await axios.get('customer', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });
};

export const exportCustomer = async (param) => {
  return await axios.get('customer/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : ['']
    }
  });
};

export const deleteCustomerList = async (id) => {
  return await axios.delete('customer', {
    data: { customerId: id }
  });
};
