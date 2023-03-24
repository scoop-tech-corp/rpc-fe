import { formateDateYYYMMDD, jsonCentralized } from 'utils/func';
import { getCityList } from 'pages/location/location-list/detail/service';
import axios from 'utils/axios';

export const getStaffList = async (property) => {
  const getResp = await axios.get('staff', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId
    }
  });

  return getResp;
};

export const deleteStaffList = async (id) => {
  return await axios.delete('staff', {
    data: { id }
  });
};

export const createStaff = async (property) => {
  const startDate = property.startDate ? formateDateYYYMMDD(new Date(property.startDate)) : '';
  const endDate = property.endDate ? formateDateYYYMMDD(new Date(property.endDate)) : '';
  const param = new FormData();

  let detailAddress = jsonCentralized(property.detailAddress);
  detailAddress = detailAddress.map((da) => {
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

  param.append('firstName', property.firstName);
  param.append('middleName', property.middleName);
  param.append('lastName', property.lastName);
  param.append('nickName', property.nickName);
  param.append('gender', property.gender);
  param.append('status', property.status);

  param.append('jobTitleId', property.jobTitleId);
  param.append('startDate', startDate);
  param.append('endDate', endDate);
  param.append('registrationNo', property.registrationNo);
  param.append('designation', property.designation);
  param.append('locationId', property.locationId);

  param.append('annualSickAllowance', property.annualSickAllowance);
  param.append('annualLeaveAllowance', property.annualLeaveAllowance);
  param.append('payPeriodId', property.payPeriodId);
  param.append('payAmount', property.payAmount);

  param.append('typeId', property.typeId);
  param.append('identificationNumber', property.identificationNumber);
  param.append('additionalInfo', property.additionalInfo);

  param.append('roleId', property.roleId);

  param.append('generalCustomerCanSchedule', property.generalCustomerCanSchedule ? 1 : 0);
  param.append('generalCustomerReceiveDailyEmail', property.generalCustomerReceiveDailyEmail ? 1 : 0);
  param.append('generalAllowMemberToLogUsingEmail', property.generalAllowMemberToLogUsingEmail ? 1 : 0);
  param.append('reminderEmail', property.reminderEmail ? 1 : 0);
  param.append('reminderWhatsapp', property.reminderWhatsapp ? 1 : 0);

  param.append('detailAddress', JSON.stringify(detailAddress));
  param.append('telephone', JSON.stringify(property.telephone));
  param.append('email', JSON.stringify(property.email));
  param.append('messenger', JSON.stringify(property.messenger));

  param.append('image', property.image?.selectedFile);

  return await axios.post('staff', param, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateStaff = async (property) => {
  const startDate = property.startDate ? formateDateYYYMMDD(new Date(property.startDate)) : '';
  const endDate = property.endDate ? formateDateYYYMMDD(new Date(property.endDate)) : '';

  let detailAddress = jsonCentralized(property.detailAddress);
  detailAddress = detailAddress.map((da) => {
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

  return await axios.put('staff', {
    id: property.id,
    firstName: property.firstName,
    middleName: property.middleName,
    lastName: property.lastName,
    nickName: property.nickName,
    gender: property.gender,
    status: property.status,

    jobTitleId: property.jobTitleId,
    startDate,
    endDate,
    registrationNo: property.registrationNo,
    designation: property.designation,
    locationId: property.locationId,

    annualSickAllowance: property.annualSickAllowance,
    annualLeaveAllowance: property.annualLeaveAllowance,
    payPeriodId: property.payPeriodId,
    payAmount: property.payAmount,

    typeId: property.typeId,
    identificationNumber: property.identificationNumber,
    additionalInfo: property.additionalInfo,

    roleId: property.roleId,
    image: property.image,

    generalCustomerCanSchedule: property.generalCustomerCanSchedule ? 1 : 0,
    generalCustomerReceiveDailyEmail: property.generalCustomerReceiveDailyEmail ? 1 : 0,
    generalAllowMemberToLogUsingEmail: property.generalAllowMemberToLogUsingEmail ? 1 : 0,
    reminderEmail: property.reminderEmail ? 1 : 0,
    reminderWhatsapp: property.reminderWhatsapp ? 1 : 0,
    securityAdministrator: property.securityAdministrator,
    securityManager: property.securityManager,
    securityVeterinarian: property.securityVeterinarian,
    securityReceptionist: property.securityReceptionist,

    detailAddress,
    telephone: property.telephone,
    email: property.email,
    messenger: property.messenger
  });
};

export const uploadImageStaff = async (property) => {
  const fd = new FormData();
  const url = 'staff/imageStaff';

  fd.append('id', property.id);
  fd.append('image', property.image ? property.image.selectedFile : '');

  return await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const exportStaff = async (param) => {
  return await axios.get('staff/exportstaff', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : ['']
    }
  });
};

export const getStaffDetail = async (id) => {
  const getResp = await axios.get('staff/staffdetail', {
    params: { id }
  });

  const data = getResp.data;
  const detailAddress = [];

  for (const dt of data.detailAddress) {
    const setCityList = dt.provinceCode ? await getCityList(dt.provinceCode) : [];

    detailAddress.push({
      isPrimary: +dt.isPrimary ? true : false,
      streetAddress: dt.addressName,
      additionalInfo: dt.additionalInfo,
      country: dt.country,
      province: dt.provinceCode,
      city: dt.cityCode,
      postalCode: dt.postalCode,
      cityList: setCityList
    });
  }

  data.detailAddress = detailAddress;
  data.telephone = data.telephone.map((dt) => {
    return {
      phoneNumber: dt.phoneNumber.replace('+62', '0'),
      type: dt.type,
      usage: dt.usage
    };
  });

  return { ...getResp, data };
};

export const getTypeIdList = async () => {
  const getResp = await axios.get('staff/typeid');

  return getResp.data.map((dt) => {
    return { label: dt.typeName, value: +dt.typeId };
  });
};

export const getPayPeriodList = async () => {
  const getResp = await axios.get('staff/payperiod');

  return getResp.data.map((dt) => {
    return { label: dt.periodName, value: +dt.payPeriodId };
  });
};

export const getRolesIdList = async () => {
  const getResp = await axios.get('staff/rolesid');

  return getResp.data.map((dt) => {
    return { label: dt.roleName, value: +dt.id };
  });
};

export const getJobTitleList = async () => {
  const getResp = await axios.get('staff/jobtitle');

  return getResp.data.map((dt) => {
    return { label: dt.jobName, value: +dt.jobTitleid };
  });
};

export const createJobTitle = async (jobName) => {
  const parameter = new FormData();
  parameter.append('jobName', jobName);

  return await axios.post('staff/jobtitle', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const createPayPeriod = async (periodName) => {
  const parameter = new FormData();
  parameter.append('periodName', periodName);

  return await axios.post('staff/payperiod', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const createTypeId = async (typeName) => {
  const parameter = new FormData();
  parameter.append('typeName', typeName);

  return await axios.post('staff/typeid', parameter, { headers: { 'Content-Type': 'multipart/form-data' } });
};
