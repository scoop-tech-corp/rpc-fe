import axios from 'axios';
import { formateDateYYYMMDD } from 'utils/func';

export const getSallarySliptList = async (property) => {
  return {
    data: {
      totalPagination: 1,
      data: [
        {
          id: '1',
          name: 'John Doe',
          payrollDate: '12/05/2025',
          branch: 'Branch A',
          basicIncome: 4_000_000,
          annualIncreaseIncentive: 200_000,
          absent: 12,
          late: 0,
          totalIncome: 4_200_000,
          totalReduction: 0,
          netIncome: 4_200_000
        }
      ]
    }
  };

  // const dateFrom = property?.dateRange ? formateDateYYYMMDD(property.dateRange[0]) : '';
  // const dateTo = property?.dateRange ? formateDateYYYMMDD(property.dateRange[1]) : '';

  // const getResp = await axios.get('sallary-slipt', {
  //   params: {
  //     rowPerPage: property.rowPerPage,
  //     goToPage: property.goToPage,
  //     orderValue: property.orderValue,
  //     orderColumn: property.orderColumn,
  //     search: property.keyword,
  //     locationId: property.locationId,
  //     dateFrom: dateFrom,
  //     dateTo: dateTo
  //   }
  // });

  // return getResp;
};

export const deleteSallarySliptList = async (id) => {
  return await axios.delete('sallary-slipt', {
    data: { id }
  });
};

export const exportSallarySlipt = async (param) => {
  const dateFrom = property?.dateRange ? formateDateYYYMMDD(property.dateRange[0]) : '';
  const dateTo = property?.dateRange ? formateDateYYYMMDD(property.dateRange[1]) : '';

  return await axios.get('sallary-slipt/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : [''],
      dateFrom: dateFrom,
      dateTo: dateTo
    }
  });
};
