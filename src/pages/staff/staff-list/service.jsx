import axios from 'utils/axios';

export const getStaffList = async (property) => {
  const getResp = await axios.get('staff', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });

  return getResp;
};

export const deleteStaffList = async (id) => {
  return await axios.delete('staff', {
    data: { id }
  });
};
