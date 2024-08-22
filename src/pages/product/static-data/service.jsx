import axios from 'utils/axios';

const url = 'product/datastatic';

export const getProductDataStatic = async (property) => {
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

export const deleteProductDataStatic = async (selectedRow) => await axios.delete(url, { data: { datas: selectedRow } });
