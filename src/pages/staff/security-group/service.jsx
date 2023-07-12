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

export const getSecurityGroupDetail = async (id) => {
  return await axios.get(url + '/detail', {
    params: { id }
  });
};

export const createSecurityGroup = async (property) => {
  console.log('property', property);
  const newUsers = property.selectedUsers.filter((dt) => dt.status !== 'del').map((dt) => dt.usersId);

  const fd = new FormData();
  fd.append('role', property.role);
  fd.append('status', property.status);
  fd.append('usersId', JSON.stringify(newUsers));

  for (let pair of fd.entries()) {
    console.log(pair[0] + ', ' + pair[1]);
  }

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateSecurityGroup = async (property) => {
  const newUsers = property.selectedUsers.map((dt) => {
    return {
      userId: +dt.usersId,
      status: dt.status
    };
  });

  const parameter = {
    id: +property.id,
    status: property.status,
    users: newUsers
  };
  console.log('parameter', parameter);
  return await axios.put(url, parameter);
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
  let getStatusError = getStatus === '' ? 'status-is-required' : '';

  if (getRoleError || getStatusError) {
    return { getRoleError, getStatusError };
  } else {
    return false;
  }
};
