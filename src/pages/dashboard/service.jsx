import axios from 'utils/axios';

export const getDashboardOverView = async () => {
  return await axios.get('dashboard/overview');
};

export const getDashboardUpbookingClinic = async () => {
  return await axios.get('dashboard/upbookingclinic');
};

export const getDashboardUpbookingHotel = async () => {
  return await axios.get('dashboard/upbookinghotel');
};

export const getDashboardUpbookingSalon = async () => {
  return await axios.get('dashboard/upbookingsalon');
};

export const getDashboardUpbookingBreeding = async () => {
  return await axios.get('dashboard/upbookingbreeding');
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
