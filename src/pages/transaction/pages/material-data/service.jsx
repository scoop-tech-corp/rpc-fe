import axios from 'utils/axios';
const url = 'transaction/materialdata';

export const getTransactionDataStatic = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const deleteTransactionDataStatic = async (selectedRow) => await axios.delete(url, { data: { datas: selectedRow } });

export const saveTransactionDataStatic = async (data) => {
  const requestBody = {
    category: data.category,
    name: data.name
  };

  return await axios.post(url, requestBody);
};
