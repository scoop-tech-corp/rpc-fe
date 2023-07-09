import axios from 'utils/axios';
import { getAllState } from './form/form-security-group-store';

const url = 'securitygroup';

export const getSecurityGroup = async (property) => {
  const getResp = await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn
    }
  });

  return getResp;
};

export const createSecurityGroup = async (property) => {
  const fd = new FormData();
  const newUsersId = property.usersId.map((dt) => dt.value);

  fd.append('role', property.role);
  fd.append('status', property.status);
  fd.append('usersId', JSON.stringify(newUsersId));

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSecurityGroup = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const getSecurityGroupUser = async () => {
  const getResp = await axios.get(url + '/users');

  return getResp.data.map((dt) => {
    return { label: `${dt.customerName} - ${dt.jobName} - ${dt.locationName}`, value: +dt.usersId, data: dt };
  });
};

export const validationFormSecurityGroup = () => {
  let getRole = getAllState().role;
  let getStatus = getAllState().status;

  let getRoleError = !getRole ? 'role-is-required' : '';
  let getStatusError = !getStatus ? 'status-is-required' : '';

  if (getRoleError || getStatusError) {
    return { getRoleError, getStatusError };
  } else {
    return false;
  }
};
