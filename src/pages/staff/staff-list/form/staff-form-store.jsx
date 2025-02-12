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

const defaultDetailTelephone = {
  phoneNumber: '',
  type: '',
  usage: 'Utama'
};

const defaultDetailEmail = {
  username: '',
  usage: 'Utama'
};

const defaultDetailMessenger = {
  messengerName: '',
  type: '',
  usage: 'Utama'
};

export const defaultIdentification = {
  typeId: null, // tipe kartu identitas
  identificationNumber: '',
  image: defaultImage, // upload one image
  imagePath: ''
};

export const defaultStaffForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  nickName: '',
  gender: '',
  status: 1,

  lineManagerId: null,
  jobTitleId: null,
  startDate: null,
  endDate: null,
  registrationNo: '',
  designation: '',
  locationId: [],

  annualSickAllowance: '',
  annualLeaveAllowance: '',
  payPeriodId: '',
  payAmount: '',

  typeIdentifications: [defaultIdentification],
  additionalInfo: '',

  generalCustomerCanSchedule: false, // checkbox
  generalCustomerReceiveDailyEmail: false, // checkbox
  generalAllowMemberToLogUsingEmail: false, // checkbox
  reminderEmail: false, // checkbox
  reminderWhatsapp: false, // checkbox
  roleId: '',

  detailAddress: [defaultDetailAddress],
  telephone: [defaultDetailTelephone],
  email: [defaultDetailEmail],
  messenger: [defaultDetailMessenger],

  staffFormError: false,
  staffFormTouch: false,

  locationList: [], // dropdown
  typeIdList: [], // dropdown
  payPeriodList: [], // dropdown
  staffManagerList: [], // dropdown
  jobTitleList: [], // dropdown

  rolesIdList: [],

  provinceList: [], // dropdown
  usageList: [], // dropdown
  telephoneType: [], // dropdown
  messengerType: [] // dropdown
};

export const useStaffFormStore = create(() => jsonCentralized(defaultStaffForm));
export const getAllState = () => useStaffFormStore.getState();
