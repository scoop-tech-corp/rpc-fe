import { jsonCentralized } from 'utils/func';
import axios from 'utils/axios';

const productSupplierUrl = 'product/supplier';

export const getProductSupplier = async (property) => {
  const getResp = await axios.get(productSupplierUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });

  return getResp;
};

export const deleteProductSupplier = async (id) => {
  return await axios.delete(productSupplierUrl, {
    data: { id }
  });
};

export const exportProductSupplier = async (property) => {
  return await axios.get(productSupplierUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const createProductSupplier = async (property) => {
  const param = new FormData();

  let detailAddress = jsonCentralized(property.detailAddress);
  detailAddress = detailAddress.map((da) => {
    return {
      streetAddress: da.streetAddress,
      additionalInfo: da.additionalInfo,
      country: da.country,
      province: da.province,
      city: da.city,
      postalCode: da.postalCode ? +da.postalCode : '',
      isPrimary: da.isPrimary ? 1 : 0
    };
  });

  let detailTelephone = jsonCentralized(property.telephone);
  detailTelephone = detailTelephone.map((dt) => {
    return {
      usageId: +dt.usage,
      number: +dt.phoneNumber,
      typePhoneId: +dt.type
    };
  });

  let detailEmails = jsonCentralized(property.email);
  detailEmails = detailEmails.map((de) => {
    return {
      usageId: +de.usage,
      address: de.email
    };
  });

  let detailMessengers = jsonCentralized(property.messenger);
  detailMessengers = detailMessengers.map((dm) => {
    return {
      usageId: +dm.usage,
      usageName: dm.messengerNumber,
      typeId: +dm.type
    };
  });

  param.append('supplierName', property.supplierName);
  param.append('pic', property.pic);
  param.append('addresses', JSON.stringify(detailAddress));
  param.append('phones', JSON.stringify(detailTelephone));
  param.append('emails', JSON.stringify(detailEmails));
  param.append('messengers', JSON.stringify(detailMessengers));

  return await axios.post(productSupplierUrl, param, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductSupplier = async () => {};

export const getProductSupplierUsage = async () => {
  const getResp = await axios.get(productSupplierUrl + '/usage');

  return getResp.data.map((dt) => {
    return { label: dt.usageName, value: dt.id };
  });
};

export const createProductSupplierUsage = async (data) => {
  const fd = new FormData();
  fd.append('usageName', data.usageName);

  return await axios.post(productSupplierUrl + '/usage', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getProductSupplierPhone = async () => {
  const getResp = await axios.get(productSupplierUrl + '/phone');

  return getResp.data.map((dt) => {
    return { label: dt.typeName, value: dt.id };
  });
};

export const createProductSupplierPhone = async (data) => {
  const fd = new FormData();
  fd.append('typeName', data.typeName);

  return await axios.post(productSupplierUrl + '/phone', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getProductSupplierMessenger = async () => {
  const getResp = await axios.get(productSupplierUrl + '/messenger');

  return getResp.data.map((dt) => {
    return { label: dt.typeName, value: dt.id };
  });
};

export const createProductSupplierMessenger = async (data) => {
  const fd = new FormData();
  fd.append('typeName', data.typeName);

  return await axios.post(productSupplierUrl + '/messenger', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
