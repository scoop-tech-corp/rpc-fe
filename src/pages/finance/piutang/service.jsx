import axios from 'utils/axios';

const url = 'finance/piutang';

export const getPiutang = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      serviceType: property.serviceType,
      agingBucket: property.agingBucket
    }
  });
};

export const getAgingSummary = async (property) => {
  return await axios.get(url + '/aging-summary', {
    params: {
      search: property.keyword,
      locationId: property.locationId,
      serviceType: property.serviceType
    }
  });
};

export const exportPiutang = async (property) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      serviceType: property.serviceType,
      agingBucket: property.agingBucket
    }
  });
};
