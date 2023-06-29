import { formateDateYYYMMDD, formateNumber, jsonCentralized } from 'utils/func';
import { getCityList } from 'pages/location/location-list/detail/service';
import { getAllState } from './form/staff-form-store';
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
  const newLocationId = property.locationId.map((dt) => dt.value);

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
  param.append('locationId', JSON.stringify(newLocationId));

  param.append('annualSickAllowance', property.annualSickAllowance);
  param.append('annualLeaveAllowance', property.annualLeaveAllowance);
  param.append('payPeriodId', property.payPeriodId);
  param.append('payAmount', formateNumber(property.payAmount));

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

  const newLocationId = property.locationId.map((dt) => dt.value);

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
    locationId: newLocationId,

    annualSickAllowance: property.annualSickAllowance,
    annualLeaveAllowance: property.annualLeaveAllowance,
    payPeriodId: property.payPeriodId,
    payAmount: formateNumber(property.payAmount),

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

export const getStaff = async () => {
  const getResp = await axios.get('staff/list');
  return getResp.data.map((dt) => {
    return { label: dt.fullName ?? '-', value: +dt.id };
  });
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

// Validation Form Staff
const coreValidationPosition = [
  { code: 0, message: 'Job title is required' },
  { code: 1, message: 'Start Date is required' },
  { code: 2, message: 'End Date is required' },
  { code: 3, message: 'Location is required' },
  { code: 4, message: 'Start Date must be smaller then End Date' },
  { code: 5, message: 'End Date must be greater then Start Date' }
];

const coreValidationBasicDetail = [
  { code: 0, message: 'First Name is required' },
  { code: 1, message: 'Status is required' },
  { code: 7, message: 'First Name minimum 3 characters and maximum 20 characters' },
  { code: 8, message: 'Middle Name minimum 3 characters and maximum 20 characters' },
  { code: 9, message: 'Last Name minimum 3 characters and maximum 20 characters' },
  { code: 10, message: 'Nick Name minimum 3 characters and maximum 20 characters' }
];

export const validationFormStaff = (procedure) => {
  let getLocation = getAllState().locationId;
  let getJobTitle = getAllState().jobTitleId;
  let getStartDate = getAllState().startDate;
  let getEndDate = getAllState().endDate;

  let getFirstName = getAllState().firstName;
  let getMiddleName = getAllState().middleName;
  let getLastName = getAllState().lastName;
  let getNickName = getAllState().nickName;
  let getStatus = getAllState().status;

  let getLocationError = '';
  let getJobTitleError = '';
  let getStartDateError = '';
  let getEndDateError = '';

  let getFirstNameError = '';
  let getMiddleNameError = '';
  let getLastNameError = '';
  let getNickNameError = '';
  let getStatusError = '';

  const checkBasicDetail = () => {
    if (!getFirstName) {
      getFirstNameError = coreValidationBasicDetail.find((d) => d.code === 0);
    } else if (getFirstName.length < 3 || getFirstName.length > 20) {
      getFirstNameError = coreValidationBasicDetail.find((d) => d.code === 7);
    }

    if (getMiddleName.length < 3 || getMiddleName.length > 20) {
      getMiddleNameError = coreValidationBasicDetail.find((d) => d.code === 8);
    }

    if (getLastName.length < 3 || getLastName.length > 20) {
      getLastNameError = coreValidationBasicDetail.find((d) => d.code === 9);
    }

    if (getNickName.length < 3 || getNickName.length > 20) {
      getNickNameError = coreValidationBasicDetail.find((d) => d.code === 10);
    }

    if (!getStatus) {
      getStatusError = coreValidationBasicDetail.find((d) => d.code === 1);
    }

    if (getFirstNameError || getMiddleNameError || getLastNameError || getNickNameError || getStatusError) {
      return { getFirstNameError, getMiddleNameError, getLastNameError, getNickNameError, getStatusError };
    } else {
      return false;
    }
  };

  const checkPosition = () => {
    if (!getJobTitle) getJobTitleError = coreValidationPosition.find((d) => d.code === 0);

    if (!getStartDate) {
      getStartDateError = coreValidationPosition.find((d) => d.code === 1);
    } else if (new Date(getStartDate).getTime() > new Date(getEndDate).getTime()) {
      getStartDateError = coreValidationPosition.find((d) => d.code === 4);
    }

    if (!getEndDate) {
      getEndDateError = coreValidationPosition.find((d) => d.code === 2);
    } else if (new Date(getEndDate).getTime() < new Date(getStartDate).getTime()) {
      getEndDateError = coreValidationPosition.find((d) => d.code === 5);
    }

    if (!getLocation.length) getLocationError = coreValidationPosition.find((d) => d.code === 3);

    if (getJobTitleError || getStartDateError || getEndDateError || getLocationError) {
      return { getJobTitleError, getStartDateError, getEndDateError, getLocationError };
    } else {
      return false;
    }
  };

  if (procedure === 'position') {
    return checkPosition();
  } else if (procedure === 'basic-detail') {
    return checkBasicDetail();
  } else {
    return checkPosition() || checkBasicDetail() ? true : false;
  }
};
