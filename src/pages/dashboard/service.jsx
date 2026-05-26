import axios from 'utils/axios';

export const getDashboardOverView = async (params = {}) => {
  return await axios.get('dashboard/overview', { params });
};

export const getDashboardUpbookingClinic = async (params = {}) => {
  return await axios.get('dashboard/upbookingclinic', { params });
};

export const getDashboardUpbookingHotel = async (params = {}) => {
  return await axios.get('dashboard/upbookinghotel', { params });
};

export const getDashboardUpbookingSalon = async (params = {}) => {
  return await axios.get('dashboard/upbookingsalon', { params });
};

export const getDashboardUpbookingBreeding = async (params = {}) => {
  return await axios.get('dashboard/upbookingbreeding', { params });
};

export const getDashboardRecentActivity = async (payload) => {
  return await axios.get('dashboard/activity', {
    params: {
      rowPerPage: payload.rowPerPage,
      goToPage: payload.goToPage,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      search: payload.keyword,
      branchesId: payload.branchesId,
      dateRange: payload.dateRange,
      month: payload.month,
      year: payload.year,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo
    }
  });
};
