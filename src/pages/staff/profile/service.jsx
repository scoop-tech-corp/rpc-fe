import axios from 'utils/axios';

const url = 'staff/profile';

export const getDetailProfile = async (property) => {
  return await axios.get(url, {
    params: {
      id: property.id,
      type: property.type
    }
  });
};

export const updateProfile = async (property) => {
  return await axios.put(url, {
    id: property.id,
    firstName: property.firstName,
    middleName: property.middleName,
    lastName: property.lastName,
    nickName: property.nickName,
    gender: property.gender,
    userName: property.username,
    phoneNumberId: property.phoneNumberId,
    phoneNumber: property.phoneNumber,
    messengerNumberId: property.messengerNumberId,
    messengerNumber: property.messenger,
    emailId: property.emailId,
    email: property.email,
    detailAddressId: property.detailAddressId,
    addressName: property.address
  });
};

export const uploadImageProfile = async (property) => {
  const fd = new FormData();

  fd.append('id', property.id);
  fd.append('image', property.photo.selectedFile || '');

  return await axios.post(url + '/image', fd);
};

export const updatePassword = async (property) => {
  return await axios.put(url + '/password', {
    id: property.id,
    oldPassword: property.oldPassword,
    newPassword: property.newPassword
  });
};
