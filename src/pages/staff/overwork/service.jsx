import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';
const url = 'staff/overwork';

export const getFullShiftData = async (property) => {
  const getResp = await axios.get(`${url}/full-shift`, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      staffId: property.staffId
    }
  });

  return getResp;
};

export const exportFullShift = async (property) => {
  return await axios.get(`${url}/full-shift/export`, {
    responseType: 'blob',
    params: {
      locationId: property.locationId.length ? property.locationId : [''],
      staffId: property.staffId.length ? property.staffId : ['']
    }
  });
};

export const approvalFullShift = async (property) => {
  return await axios.put(`${url}/full-shift/approval`, {
    id: property.id,
    status: property.status,
    reason: property.reason
  });
};

export const deleteFullShift = async (id) => {
  return await axios.delete(`${url}/full-shift`, {
    data: { id }
  });
};

export const createFullShift = async (property) => {
  const date = property.date ? formateDateYYYMMDD(new Date(property.date)) : '';
  const fd = new FormData();
  fd.append('fullShiftDate', date);
  fd.append('reason', property.reason);

  return await axios.post(`${url}/full-shift`, fd);
};

export const updateFullShift = async (property) => {
  const date = property.date ? formateDateYYYMMDD(new Date(property.date)) : '';
  return await axios.put(`${url}/full-shift`, {
    id: property.id,
    fullShiftDate: date,
    reason: property.reason
  });
};

// ------------------------- //

export const getLongShiftData = async (property) => {
  const getResp = await axios.get(`${url}/long-shift`, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      staffId: property.staffId
    }
  });

  return getResp;
};

export const exportLongShift = async (property) => {
  return await axios.get(`${url}/long-shift/export`, {
    responseType: 'blob',
    params: {
      locationId: property.locationId.length ? property.locationId : [''],
      staffId: property.staffId.length ? property.staffId : ['']
    }
  });
};

export const approvalLongShift = async (property) => {
  return await axios.put(`${url}/long-shift/approval`, {
    id: property.id,
    status: property.status,
    reason: property.reason
  });
};

export const deleteLongShift = async (id) => {
  return await axios.delete(`${url}/long-shift`, {
    data: { id }
  });
};

export const createLongShift = async (property) => {
  const date = property.date ? formateDateYYYMMDD(new Date(property.date)) : '';
  const fd = new FormData();
  fd.append('longShiftDate', date);
  fd.append('reason', property.reason);

  return await axios.post(`${url}/long-shift`, fd);
};

export const updateLongShift = async (property) => {
  const date = property.date ? formateDateYYYMMDD(new Date(property.date)) : '';
  return await axios.put(`${url}/long-shift`, {
    id: property.id,
    longShiftDate: date,
    reason: property.reason
  });
};
