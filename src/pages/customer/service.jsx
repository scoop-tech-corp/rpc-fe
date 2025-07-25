import { setFormDataImage } from 'service/service-global';
import { formateDateYYYMMDD, jsonCentralized } from 'utils/func';

import axios from 'utils/axios';

export const getCustomerList = async (property) => {
  return await axios.get('customer', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      customerGroupId: property.customerGroupId
    }
  });
};

export const getCustomerDetail = async (id) => {
  return await axios.get('customer/detail', {
    params: { customerId: id }
  });
};

export const getCustomerPetList = async (id) => {
  const getResp = await axios.get('customer/petlist', {
    params: { customerId: id }
  });

  return getResp.data.map((dt) => {
    return { label: dt.petName, value: +dt.id };
  });
};

export const createCustomer = async (property) => {
  const joinDate = property.joinDate ? formateDateYYYMMDD(new Date(property.joinDate)) : '';
  const birthDate = property.birthDate ? formateDateYYYMMDD(new Date(property.birthDate)) : '';
  const customerPets = jsonCentralized(property.customerPets).map((cp) => {
    cp.dateOfBirth = cp.dateOfBirth ? formateDateYYYMMDD(new Date(cp.dateOfBirth)) : '';
    cp.isSteril = cp.isSteril ? +cp.isSteril : '';
    cp.petCategoryId = cp.petCategoryId ? cp.petCategoryId.value : '';

    return cp;
  });

  const reminderBooking = jsonCentralized(property.reminderBooking).map((dt) => {
    dt.sourceId = dt.sourceId ? +dt.sourceId.value : null;
    return dt;
  });

  const reminderPayment = jsonCentralized(property.reminderPayment).map((dt) => {
    dt.sourceId = dt.sourceId ? +dt.sourceId.value : null;
    return dt;
  });

  const reminderLatePayment = jsonCentralized(property.reminderLatePayment).map((dt) => {
    dt.sourceId = dt.sourceId ? +dt.sourceId.value : null;
    return dt;
  });

  const detailAddresses = jsonCentralized(property.detailAddresses).map((da) => {
    return {
      addressName: da.streetAddress,
      additionalInfo: da.additionalInfo,
      country: da.country,
      provinceCode: da.province,
      cityCode: da.city,
      postalCode: da.postalCode ? +da.postalCode : '',
      isPrimary: da.isPrimary ? 1 : 0
    };
  });

  const param = new FormData();
  param.append('memberNo', property.memberNo);
  param.append('firstName', property.firstName);
  param.append('middleName', property.middleName);
  param.append('lastName', property.lastName);
  param.append('nickName', property.nickName);
  param.append('titleCustomerId', property.titleCustomerId ? +property.titleCustomerId : '');
  param.append('customerGroupId', property.customerGroupId ? +property.customerGroupId : '');
  param.append('colorType', property.colorType);

  param.append('locationId', property.locationId);
  param.append('notes', property.notes);

  param.append('joinDate', joinDate);
  param.append('typeId', property.typeId ? +property.typeId : '');
  param.append('numberId', property.numberId);
  param.append('gender', property.gender);
  param.append('occupationId', property.occupationId ? +property.occupationId : '');

  param.append('birthDate', birthDate);
  param.append('referenceCustomerId', property.referenceCustomerId ? +property.referenceCustomerId : '');
  param.append('customerPets', JSON.stringify(customerPets));

  param.append('isReminderBooking', property.isReminderBooking ? 1 : 0);
  param.append('isReminderPayment', property.isReminderPayment ? 1 : 0);

  param.append('reminderBooking', JSON.stringify(reminderBooking));
  param.append('reminderPayment', JSON.stringify(reminderPayment));
  param.append('reminderLatePayment', JSON.stringify(reminderLatePayment));

  param.append('detailAddresses', JSON.stringify(detailAddresses));
  param.append('telephones', JSON.stringify(property.telephones));
  param.append('emails', JSON.stringify(property.emails));
  param.append('messengers', JSON.stringify(property.messengers));

  setFormDataImage(property.photos, param, 'save');

  return await axios.post('customer', param, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateCustomer = async (property) => {
  const joinDate = property.joinDate ? formateDateYYYMMDD(new Date(property.joinDate)) : '';
  const birthDate = property.birthDate ? formateDateYYYMMDD(new Date(property.birthDate)) : '';

  const customerPets = property.customerPets.map((dt) => {
    const dateOfBirth = dt.dateOfBirth ? formateDateYYYMMDD(new Date(dt.dateOfBirth)) : '';
    return {
      id: dt.id,
      petName: dt.petName,
      petCategoryId: dt.petCategoryId?.value || '',
      races: dt.races,
      condition: dt.condition,
      color: dt.color,
      petMonth: dt.petMonth,
      petYear: dt.petYear,
      dateOfBirth: dateOfBirth,
      remark: dt.remark,
      petGender: dt.petGender,
      isSteril: dt.isSteril,
      command: dt.command
    };
  });

  const reminderBooking = property.reminderBooking.map((dt) => {
    return {
      ...dt,
      sourceId: dt.sourceId?.value || ''
    };
  });

  const reminderLatePayment = property.reminderLatePayment.map((dt) => {
    return {
      ...dt,
      sourceId: dt.sourceId?.value || ''
    };
  });

  const reminderPayment = property.reminderPayment.map((dt) => {
    return {
      ...dt,
      sourceId: dt.sourceId?.value || ''
    };
  });

  const detailAddresses = property.detailAddresses.map((dt) => {
    return {
      addressName: dt.streetAddress,
      additionalInfo: dt.additionalInfo,
      country: dt.country,
      provinceCode: dt.province,
      cityCode: dt.city,
      postalCode: dt.postalCode ? +dt.postalCode : '',
      isPrimary: dt.isPrimary ? 1 : 0
    };
  });

  return await axios.put('customer', {
    customerId: property.id,
    memberNo: property.memberNo,
    firstName: property.firstName,
    middleName: property.middleName,
    colorType: property.colorType,
    lastName: property.lastName,
    nickName: property.nickName,
    gender: property.gender,
    titleCustomerId: property.titleCustomerId,
    customerGroupId: property.customerGroupId,
    locationId: property.locationId,
    notes: property.notes,
    joinDate: joinDate,
    typeId: property.typeId,
    numberId: property.numberId,
    occupationId: property.occupationId,
    birthDate,
    referenceCustomerId: property.referenceCustomerId,
    isReminderBooking: property.isReminderBooking ? 1 : 0,
    isReminderPayment: property.isReminderPayment ? 1 : 0,
    customerPets,
    reminderBooking,
    reminderPayment,
    reminderLatePayment,
    detailAddresses,
    telephones: property.telephones,
    emails: property.emails,
    messengers: property.messengers,
    images: property.image
  });
};

export const uploadImageCustomer = async (property) => {
  const fd = new FormData();
  const url = 'customer/images';

  fd.append('customerId', property.id);
  setFormDataImage(property.photos, fd);

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const exportCustomer = async (param) => {
  return await axios.get('customer/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : ['']
    }
  });
};

export const deleteCustomerList = async (id) => {
  return await axios.delete('customer', {
    data: { customerId: id }
  });
};

export const getTitleList = async () => {
  const getResp = await axios.get('customer/title');

  return getResp.data.map((dt) => {
    return { label: dt.titleCustomerName, value: +dt.titleCustomerId };
  });
};

export const createTitleCustomer = async (titleName) => {
  const parameter = new FormData();
  parameter.append('titleName', titleName);

  return await axios.post('customer/title', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getCustomerGroupList = async () => {
  const getResp = await axios.get('customer/group');

  return getResp.data.map((dt) => {
    return { label: dt.customerGroup, value: +dt.id };
  });
};

export const createCustomerGroup = async (customerGroup) => {
  const parameter = new FormData();
  parameter.append('customerGroup', customerGroup);

  return await axios.post('customer/group', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getOccupationList = async () => {
  const getResp = await axios.get('customer/occupation');

  return getResp.data.map((dt) => {
    return { label: dt.occupationName, value: +dt.occupationId };
  });
};

export const createOccupation = async (name) => {
  const parameter = new FormData();
  parameter.append('occupationName', name);

  return await axios.post('customer/occupation', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getReferenceList = async () => {
  const getResp = await axios.get('customer/reference');

  return getResp.data.map((dt) => {
    return { label: dt.referenceCustomerName, value: +dt.referenceCustomerId };
  });
};

export const createReference = async (referenceName) => {
  const parameter = new FormData();
  parameter.append('referenceName', referenceName);

  return await axios.post('customer/reference', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getPetCategoryList = async () => {
  const getResp = await axios.get('customer/pet');

  return getResp.data.map((dt) => {
    return { label: dt.petCategoryName, value: +dt.petCategoryId };
  });
};

export const createPetCategory = async (petCategoryName) => {
  const parameter = new FormData();
  parameter.append('petCategoryName', petCategoryName);

  return await axios.post('customer/pet', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getSourceList = async () => {
  const getResp = await axios.get('customer/source');

  return getResp.data.map((dt) => {
    return { label: dt.sourceName, value: +dt.sourceId };
  });
};

export const createSource = async (sourceName) => {
  const parameter = new FormData();
  parameter.append('sourceName', sourceName);

  return await axios.post('customer/source', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getTypeIdList = async () => {
  const getResp = await axios.get('customer/typeid');

  return getResp.data.map((dt) => {
    return { label: dt.typeName, value: +dt.typeId };
  });
};

export const createTypeId = async (typeName) => {
  const parameter = new FormData();
  parameter.append('typeName', typeName);

  return await axios.post('customer/typeid', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};
