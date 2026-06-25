import axios from 'utils/axios';

const url = 'finance/sales';

export const getSalesSummary = async (property) => {
  return await axios.get(url + '/summary', {
    params: {
      search: property.keyword,
      locationId: property.locationId,
      status: property.status,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const getFinanceSales = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      status: property.status,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const exportFinanceSales = async (property) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      status: property.status,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const getPaymentMethods = async () => {
  return await axios.get(url + '/payment-methods');
};

export const getPaymentDetail = async (invoiceNumber, serviceType) => {
  return await axios.get(url + '/payment-detail', {
    params: { invoiceNumber, serviceType }
  });
};

export const addPayment = async (payload) => {
  return await axios.post(url + '/add-payment', payload);
};
