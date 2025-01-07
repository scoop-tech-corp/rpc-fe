import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

export const getStaffLeave = async (property) => {
  const fromDate = property.dateRange ? formateDateYYYMMDD(property.dateRange[0]) : '';
  const toDate = property.dateRange ? formateDateYYYMMDD(property.dateRange[1]) : '';

  return await axios.get('staff/leave', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      fromDate,
      toDate,
      search: property.keyword,
      status: property.status,
      locationId: property.locationId
    }
  });
};

export const exportStaffLeave = async (param) => {
  return await axios.get('staff/leave/exportleave', {
    responseType: 'blob',
    params: {
      search: param.keyword,
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      status: param.status,
      locationId: param.locationId.length ? param.locationId : ['']
    }
  });
};

export const getStaffLeaveBalance = async (property) => {
  return await axios.get('staff/leave/leavebalance', {
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

export const exportStaffLeaveBalance = async (param) => {
  return await axios.get('staff/leave/exportbalance', {
    responseType: 'blob',
    params: {
      search: param.keyword,
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : ['']
    }
  });
};

export const staffLeaveApprovedRejected = async (property) => {
  const fd = new FormData();
  fd.append('leaveRequestId', property.leaveRequestId);
  fd.append('status', property.status);
  fd.append('reason', property.reason);

  return await axios.post('staff/leave/statusleave', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const createStaffLeave = async (property) => {
  const fromDate = property.fromDate ? formateDateYYYMMDD(new Date(property.fromDate)) : '';
  const toDate = property.toDate ? formateDateYYYMMDD(new Date(property.toDate)) : '';
  const workingDays = property.workingDays.map((dt) => ({ name: dt.value }));

  const fd = new FormData();
  fd.append('usersId', property.userId);
  fd.append('leaveType', property.leaveType.value);
  fd.append('fromDate', fromDate);
  fd.append('toDate', toDate);
  fd.append('workingDays', JSON.stringify(workingDays));
  fd.append('remark', property.remark);
  fd.append('totalDays', property.totalDays);

  return await axios.post('staff/leave', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getLeaveTypeList = async (usersId) => {
  await axios.get('staff/leave/leavetype', { params: { usersId } });

  const getData = resp.data;
  let newMapping = [];

  if (getData && getData.length) {
    newMapping = getData.map((dt) => ({
      label: dt.value,
      value: dt.leaveType
    }));
  }

  return newMapping;
};

export const getWorkingDaysList = async (property) => {
  const fromDate = property.fromDate ? formateDateYYYMMDD(new Date(property.fromDate)) : '';
  const toDate = property.toDate ? formateDateYYYMMDD(new Date(property.toDate)) : '';

  return await axios.get('staff/leave/workingdate', {
    params: { fromDate, toDate }
  });
};
