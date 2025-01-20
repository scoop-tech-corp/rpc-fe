import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

const baseUrl = 'absent';

export const getStaffRekapList = async (property) => {
  const dateFrom = property.dateFrom ? formateDateYYYMMDD(property.dateFrom) : '';
  const dateTo = property.dateTo ? formateDateYYYMMDD(property.dateTo) : '';

  return await axios.get(baseUrl + '/index', {
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      goToPage: property.goToPage,
      rowPerPage: property.rowPerPage,
      dateFrom: dateFrom,
      dateTo: dateTo,
      locationId: property.locationId,
      staff: property.staff,
      statusPresent: property.statusPresent,
      staffJob: property.staffJob
    }
  });
};

export const exportStaffRekap = async (param) => {
  return await axios.get(baseUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      dateFrom: param.dateFrom,
      dateTo: param.dateTo,
      locationId: param.locationId.length ? param.locationId : [''],
      staff: param.staff.length ? param.staff : [''],
      statusPresent: param.statusPresent.length ? param.statusPresent : ['']
    }
  });
};

export const getStaffRekapDetail = async (id) => {
  return await axios.get(baseUrl + '/detail', { params: { id } });
};

export const getAbsentStaffList = async () => {
  const getResp = await axios.get(baseUrl + '/staff-list');
  return getResp.data.map((dt) => {
    return { label: dt.fullName, value: +dt.id };
  });
};

export const getAbsentPresentList = async () => {
  const getResp = await axios.get(baseUrl + '/present-list');
  return getResp.data.map((dt) => {
    return { label: dt.statusName, value: +dt.id };
  });
};
