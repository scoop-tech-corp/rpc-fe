import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const defaultDetailAddress = {
  isPrimary: true,
  streetAddress: '',
  additionalInfo: '',
  country: 'Indonesia',
  province: '',
  city: '',
  cityList: [],
  postalCode: ''
};

export const defaultImage = { id: '', selectedFile: null, isChange: false };

export const defaultStaffForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  nickName: '',
  gender: '',
  status: 1,

  jobTitleId: null,
  startDate: null,
  endDate: null,
  registrationNo: '',
  designation: '',
  locationId: '',

  annualSickAllowance: '',
  annualLeaveAllowance: '',
  payPeriodId: '',
  payAmount: '',

  typeId: '', // tipe kartu identitas
  identificationNumber: '',
  image: defaultImage, // upload one image
  imagePath: '',
  additionalInfo: '',

  generalCustomerCanSchedule: false, // checkbox
  generalCustomerReceiveDailyEmail: false, // checkbox
  generalAllowMemberToLogUsingEmail: false, // checkbox
  reminderEmail: false, // checkbox
  reminderWhatsapp: false, // checkbox
  roleId: '',

  detailAddress: [defaultDetailAddress],
  telephone: [],
  email: [],
  messenger: [],

  staffFormError: false,
  staffFormTouch: false,

  locationList: [], // dropdown
  typeIdList: [], // dropdown
  payPeriodList: [], // dropdown
  jobTitleList: [], // dropdown

  rolesIdList: [],

  provinceList: [], // dropdown
  usageList: [], // dropdown
  telephoneType: [], // dropdown
  messengerType: [] // dropdown
};

export const useStaffFormStore = create(() => jsonCentralized(defaultStaffForm));
export const getAllState = () => useStaffFormStore.getState();
