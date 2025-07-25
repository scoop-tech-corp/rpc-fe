import axios from 'utils/axios';

export const getDashboardOverView = async () => {
  return await axios.get('dashboard/overview');
};

export const getDashboardUpbookingInPatient = async () => {
  return await axios.get('dashboard/upbookinpatient');
};

export const getDashboardUpbookingOutPatient = async () => {
  return await axios.get('dashboard/upbookoutpatient');
};

export const getDashboardRecentActivity = async (payload) => {
  return await axios.get('dashboard/activity', {
    params: {
      rowPerPage: payload.rowPerPage,
      goToPage: payload.goToPage,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      search: payload.keyword
    }
  });
};
