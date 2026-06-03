import axios from 'utils/axios';

const stockOpnameUrl = 'product/stock-opname';

export const getStockOpname = async (property) => {
  return await axios.get(stockOpnameUrl, {
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

export const getStockOpnameDetail = async (id) => {
  return await axios.get(stockOpnameUrl + '/detail', { params: { id } });
};

export const generateSoNumber = async (locationId) => {
  return await axios.get(stockOpnameUrl + '/generate-so-number', { params: { locationId } });
};

export const updateStockOpname = async (payload) => {
  return await axios.put(stockOpnameUrl, payload);
};

export const startStockOpname = async (id) => {
  return await axios.put(stockOpnameUrl + '/start', { id });
};

export const createStockOpname = async (payload) => {
  return await axios.post(stockOpnameUrl, payload);
};

export const deleteStockOpname = async (id) => {
  return await axios.delete(stockOpnameUrl, {
    data: { id }
  });
};

export const approvalCheckerStockOpname = async (payload) => {
  return await axios.put(stockOpnameUrl + '/approval-checker', payload);
};

export const approvalDirectorStockOpname = async (payload) => {
  return await axios.put(stockOpnameUrl + '/approval-director', payload);
};

export const printStockOpname = async (id) => {
  return await axios.get(stockOpnameUrl + '/print', { params: { id }, responseType: 'blob' });
};

export const exportStockOpname = async (property) => {
  return await axios.get(stockOpnameUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      locationId: property.locationId,
      status: property.status
    }
  });
};
