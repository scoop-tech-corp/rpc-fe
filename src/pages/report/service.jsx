import { formateDateYYYMMDD } from 'utils/func';
import axios from 'utils/axios';

const urlCustomerGrowth = 'report/customer/growth';
const urlCustomerGrowthByGroup = 'report/customer/growthgroup';
const urlCustomerTotal = 'report/customer/total';
const urlCustomerLeaving = 'report/customer/leaving';
const urlCustomerList = 'report/customer/list';
const urlCustomerReferralSpend = 'report/customer/refspend';
const urlCustomerSubAccount = 'report/customer/subaccount';

export const exportReportCustomerGrowth = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlCustomerGrowth}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: payload.location.length ? payload.location : [''],
      customerGroup: payload.customerGroup.length ? payload.customerGroup : ['']
    }
  });
};

export const getReportCustomerGrowth = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerGrowth, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup
    }
  });
};

export const exportReportCustomerGrowthGroup = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlCustomerGrowthByGroup}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: payload.location.length ? payload.location : [''],
      customerGroup: payload.customerGroup.length ? payload.customerGroup : ['']
    }
  });
};

export const getReportCustomerGrowthGroup = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerGrowthByGroup, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup
    }
  });
};

export const exportReportCustomerTotal = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlCustomerTotal}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: payload.location.length ? payload.location : [''],
      customerGroup: payload.customerGroup.length ? payload.customerGroup : ['']
    }
  });
};

export const getReportCustomerTotal = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerTotal, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup
    }
  });
};

export const exportReportCustomerLeaving = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlCustomerLeaving}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: payload.location.length ? payload.location : [''],
      customerGroup: payload.customerGroup.length ? payload.customerGroup : [''],
      status: payload.status
    }
  });
};

export const getReportCustomerLeaving = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerLeaving, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup,
      status: payload.status
    }
  });
};

export const exportReportCustomerList = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlCustomerList}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: payload.location.length ? payload.location : [''],
      customerGroup: payload.customerGroup.length ? payload.customerGroup : [''],
      status: payload.status,
      search: payload.search,
      gender: payload.gender,
      idType: payload.typeId.length ? payload.typeId : ['']
    }
  });
};

export const getReportCustomerList = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const typeId = payload.typeId.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerList, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup,
      status: payload.status,
      search: payload.search,
      gender: payload.gender,
      idType: typeId
    }
  });
};

export const exportReportCustomerReferralSpend = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlCustomerReferralSpend}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: payload.location.length ? payload.location : [''],
      search: payload.search
    }
  });
};

export const getReportCustomerReferralSpend = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerReferralSpend, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      search: payload.search
    }
  });
};

export const exportReportCustomerSubAccount = async (payload) => {
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(`${urlCustomerSubAccount}/export`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo,
      locationId: payload.location.length ? payload.location : [''],
      customerGroup: payload.customerGroup.length ? payload.customerGroup : [''],
      status: payload.status,
      sterile: payload.sterile,
      gender: payload.gender,
      search: payload.search
    }
  });
};

export const getReportCustomerSubAccount = async (payload) => {
  const location = payload.location.map((dt) => dt.value);
  const customerGroup = payload.customerGroup.map((dt) => dt.value);
  const dateFrom = payload.date ? formateDateYYYMMDD(payload.date[0]) : '';
  const dateTo = payload.date ? formateDateYYYMMDD(payload.date[1]) : '';

  return await axios.get(urlCustomerSubAccount, {
    params: {
      dateFrom,
      dateTo,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      locationId: location,
      customerGroup,
      sterile: payload.sterile,
      gender: payload.gender,
      search: payload.search
    }
  });
};
