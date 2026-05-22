import axios from 'utils/axios';

const url = 'finance/data-static';

export const getFinanceDataStatic = async (property) => {
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

export const deleteFinanceDataStatic = async (selectedRow) => await axios.delete(url, { data: { datas: selectedRow } });
