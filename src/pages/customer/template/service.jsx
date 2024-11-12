import axios from 'utils/axios';

const url = 'customer/template';

export const getCustomerTemplate = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.search
    }
  });
};

export const downloadCustomerTemplate = async () => {
  // fileType
  // return await axios.get(
  //   url + '/download',
  //   {
  //     params: { fileType }
  //   },
  //   { responseType: 'blob' }
  // );
  return await axios.get(url + '/download', { responseType: 'blob' });
};
