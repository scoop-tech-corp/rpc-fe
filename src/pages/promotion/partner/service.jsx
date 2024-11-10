import axios from 'utils/axios';

const baseUrl = 'promotion/partner';

export const getPromotionPartnerList = async (property) => {
  return await axios.get(baseUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const deletePromotionPartnerList = async (id) => {
  return await axios.delete(baseUrl, {
    data: { id }
  });
};

export const exportPromotionPartner = async (param) => {
  return await axios.get(baseUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn
    }
  });
};

export const getPromotionPartnerDetail = async (id) => {
  return await axios.get(baseUrl + '/detail', {
    params: { id }
  });
};

const mappingPayloadArrays = (param, procedure = '') => {
  let phone = param.phone.map((dt) => ({ id: +dt.id, phoneNumber: dt.number, typeId: +dt.type, usageId: +dt.usage, status: dt.status }));
  let email = param.email.map((dt) => ({ id: +dt.id, email: dt.address, usageId: +dt.usage, status: dt.status }));
  let messenger = param.messenger.map((dt) => ({
    id: +dt.id,
    messengerName: dt.username,
    usageId: +dt.usage,
    typeId: +dt.type,
    status: dt.status
  }));

  if (procedure === 'create') {
    phone = phone.filter((dt) => dt.status !== 'del');
    email = email.filter((dt) => dt.status !== 'del');
    messenger = messenger.filter((dt) => dt.status !== 'del');
  }

  return { phone, email, messenger };
};

export const createPromotionPartner = async (param) => {
  const parameter = new FormData();
  const { phone, email, messenger } = mappingPayloadArrays(param, 'create');

  parameter.append('name', param.name);
  parameter.append('status', param.status);
  parameter.append('phones', JSON.stringify(phone));
  parameter.append('emails', JSON.stringify(email));
  parameter.append('messengers', JSON.stringify(messenger));

  return await axios.post(baseUrl, parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updatePromotionPartner = async (param) => {
  const { phone, email, messenger } = mappingPayloadArrays(param);

  return await axios.put(baseUrl, {
    id: +param.id,
    name: param.name,
    status: +param.status,
    phones: phone,
    emails: email,
    messengers: messenger
  });
};
