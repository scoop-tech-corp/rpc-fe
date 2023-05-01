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
  postalCode: '',
  error: { streetAddressErr: '', countryErr: '', provinceErr: '', cityErr: '' }
};

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

export const defaultCustomerForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  nickName: '',
  titleCustomerId: null,
  customerGroupId: null,
  locationId: null,
  notes: '',

  gender: '',
  joinDate: new Date(),
  typeId: null,
  numberId: '',
  occupationId: null,
  birthDate: null,
  referenceCustomerId: null,
  customerPets: [],

  isReminderBooking: false,
  isReminderPayment: false,

  reminderBooking: [],
  reminderPayment: [],
  reminderLatePayment: [],

  detailAddresses: [defaultDetailAddress],
  telephones: [],
  emails: [],
  messengers: [],

  photos: [defaultPhotos],

  customerFormError: false,
  customerFormCoreError: false,
  customerFormTouch: false,

  titleCustomerList: [], // dropdown
  customerGroupList: [], // dropdown
  typeIdList: [], // dropdown
  occupationList: [], // dropdown
  referenceList: [], // dropdown
  petCategoryList: [], // dropdown
  sourceList: [], // dropdown
  locationList: [], // dropdown
  provinceList: [], // dropdown

  usageList: [], // dropdown
  telephoneType: [], // dropdown
  messengerType: [] // dropdown
};

export const useCustomerFormStore = create(() => jsonCentralized(defaultCustomerForm));
export const getAllState = () => useCustomerFormStore.getState();
