import axios from 'utils/axios';

const url = 'finance/refund';

export const getRefunds = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      serviceType: property.serviceType,
      status: property.status,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const getRefundSummary = async (property) => {
  return await axios.get(url + '/summary', {
    params: {
      locationId: property.locationId,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const lookupInvoice = async (invoiceNumber, serviceType) => {
  return await axios.get(url + '/invoice-lookup', {
    params: { invoiceNumber, serviceType }
  });
};

export const getPaymentMethods = async () => {
  return await axios.get(url + '/payment-methods');
};

export const createRefund = async (payload) => {
  return await axios.post(url, payload);
};

export const deleteRefund = async (id) => {
  return await axios.delete(`${url}/${id}`);
};

export const exportRefunds = async (property) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      serviceType: property.serviceType,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};
