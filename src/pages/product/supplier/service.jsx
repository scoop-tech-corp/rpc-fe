import { jsonCentralized } from 'utils/func';
import { getCityList } from 'pages/location/location-list/detail/service';
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

const mappingPropertyDetail = (property) => {
  let detailAddress = jsonCentralized(property.detailAddress);
  detailAddress = detailAddress.map((da) => {
    return {
      id: +da.id ?? '',
      productSupplierId: +da.productSupplierId ?? '',
      status: da.status ?? '',
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
      id: +dt.id ?? '',
      productSupplierId: +dt.productSupplierId ?? '',
      status: dt.status ?? '',
      usageId: +dt.usage,
      number: dt.phoneNumber.toString(),
      typePhoneId: +dt.type
    };
  });

  let detailEmails = jsonCentralized(property.email);
  detailEmails = detailEmails.map((de) => {
    return {
      id: +de.id ?? '',
      productSupplierId: +de.productSupplierId ?? '',
      status: de.status ?? '',
      usageId: +de.usage,
      address: de.email
    };
  });

  let detailMessengers = jsonCentralized(property.messenger);
  detailMessengers = detailMessengers.map((dm) => {
    return {
      id: +dm.id ?? '',
      productSupplierId: +dm.productSupplierId ?? '',
      status: dm.status ?? '',
      usageId: +dm.usage,
      usageName: dm.messengerNumber,
      typeId: +dm.type
    };
  });

  return { detailAddress, detailTelephone, detailEmails, detailMessengers };
};

export const createProductSupplier = async (property) => {
  const param = new FormData();

  const { detailAddress, detailTelephone, detailEmails, detailMessengers } = mappingPropertyDetail(property);

  param.append('supplierName', property.supplierName);
  param.append('pic', property.pic);
  param.append('addresses', JSON.stringify(detailAddress));
  param.append('phones', JSON.stringify(detailTelephone));
  param.append('emails', JSON.stringify(detailEmails));
  param.append('messengers', JSON.stringify(detailMessengers));

  return await axios.post(productSupplierUrl, param, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateProductSupplier = async (property) => {
  const { detailAddress, detailTelephone, detailEmails, detailMessengers } = mappingPropertyDetail(property);

  return await axios.put(productSupplierUrl, {
    id: property.id,
    supplierName: property.supplierName,
    pic: property.pic,
    addresses: detailAddress,
    phones: detailTelephone,
    emails: detailEmails,
    messengers: detailMessengers
  });
};

export const getProductSupplierDetail = async (id) => {
  const getResp = await axios.get(productSupplierUrl + '/detail', {
    params: { id }
  });

  const data = getResp.data;
  const detailAddress = [];
  for (const dt of data.addresses) {
    const setCityList = dt.province ? await getCityList(dt.province) : [];
    detailAddress.push({
      ...dt,
      isPrimary: +dt.isPrimary ? true : false,
      cityList: setCityList,
      status: ''
    });
  }
  data.addresses = detailAddress;
  data.phones = data.phones.map((dt) => {
    return {
      id: +dt.id,
      productSupplierId: +dt.productSupplierId,
      usage: +dt.usageId,
      phoneNumber: +dt.number,
      type: +dt.typePhoneId,
      status: ''
    };
  });
  data.emails = data.emails.map((dt) => {
    return {
      id: +dt.id,
      productSupplierId: +dt.productSupplierId,
      usage: +dt.usageId,
      email: dt.address,
      status: ''
    };
  });
  data.messengers = data.messengers.map((dt) => {
    return {
      id: +dt.id,
      productSupplierId: +dt.productSupplierId,
      usage: +dt.usageId,
      messengerNumber: dt.usageName,
      type: +dt.typeId,
      status: ''
    };
  });

  return { ...getResp, data };
};

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
