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
    data: { id }
  });
};

export const getStaffScheduleUser = async (locationId) => {
  const getResp = await axios.get(url + '/liststaff', {
    params: { locationId }
  });

  return getResp.data.map((dt) => {
    return { label: dt.name, value: +dt.usersId };
  });
};

export const getStaffScheduleDetail = async (property) => {
  return await axios.get(url + '/detail', { params: { id: property.id, type: property.type } });
};

export const getStaffScheduleMenuList = async (masterMenuId) => {
  const getResp = await axios.get(url + '/menulist', {
    params: { masterId: masterMenuId }
  });

  return getResp.data.map((dt) => {
    return { label: dt.menuName, value: +dt.id };
  });
};

export const createStaffSchedule = async (property) => {
  const fd = new FormData();
  fd.append('locationId', property.locationId);
  fd.append('usersId', property.usersId);
  fd.append('details', JSON.stringify(property.details));

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateStaffSchedule = async (property) => {
  return await axios.put(url, {
    id: property.id,
    locationId: property.locationId,
    usersId: property.usersId,
    details: property.details
  });
};
