import axios from 'utils/axios';

export const getStaffLeave = async (property) => {
  return await axios.get('staff/leave', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      status: property.status,
      locationId: property.locationId
    }
  });
};

export const exportStaffLeave = async (param) => {
  return await axios.get('staff/exportleave', {
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
  return await axios.get('staff/leavebalance', {
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
  return await axios.get('staff/exportbalance', {
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

  return await axios.post('staff/statusleave', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const createStaffLeave = async (property) => {
  const fromDate = property.fromDate ? new Date(property.fromDate).toISOString().slice(0, 10) : '';
  const toDate = property.toDate ? new Date(property.toDate).toISOString().slice(0, 10) : '';
  const workingDays = property.workingDays.map((dt) => ({ name: dt.value }));

  const fd = new FormData();
  fd.append('usersId', property.userId);
  fd.append('leaveType', property.leaveType.value);
  fd.append('fromDate', fromDate);
  fd.append('toDate', toDate);
  fd.append('workingDays', JSON.stringify(workingDays));
  fd.append('remark', property.remark);

  return await axios.post('staff/leave', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getLeaveTypeList = async (usersId) => await axios.get('staff/leavetype', { params: { usersId } });
