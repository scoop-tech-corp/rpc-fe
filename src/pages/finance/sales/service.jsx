import axios from 'utils/axios';

const url = 'finance/sales';

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
      locationId: property.locationId,
      status: property.status,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};
