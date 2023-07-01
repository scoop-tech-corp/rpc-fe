import axios from 'utils/axios';

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

  fd.append('status', property.status);
  fd.append('locationId', property.productLocation);
  fd.append('productList', JSON.stringify(property.productList));

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSecurityGroup = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const getSecurityGroupUser = async () => {
  const getResp = await axios.get(url + '/users');
  console.log('resp user security group', getResp);
  return getResp;
};
