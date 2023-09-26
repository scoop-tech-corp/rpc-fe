import axios from 'utils/axios';

const url = 'staff/schedule';

export const getStaffSchedule = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });
};

export const exportStaffSchedule = async (property) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      locationId: property.locationId
    }
  });
};

export const deleteStaffSchedule = async (id) => {
  return await axios.delete(url, {
    data: { usersId: id }
  });
};
