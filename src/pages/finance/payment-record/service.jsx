import axios from 'utils/axios';

const url = 'finance/payment-records';

export const getPaymentRecords = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      paymentMethodId: property.paymentMethodId,
      isPayed: property.isPayed,
      serviceType: property.serviceType,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const exportPaymentRecords = async (property) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      paymentMethodId: property.paymentMethodId,
      isPayed: property.isPayed,
      serviceType: property.serviceType,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const getPaymentMethods = async () => {
  return await axios.get(url + '/payment-methods');
};
