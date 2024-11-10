import axios from 'utils/axios';

const url = 'customer/import';

export const getCustomerImportList = async (property) => {
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

export const importCustomerImport = async (file) => {
  const fd = new FormData();
  fd.append('file', file);

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
