import { jsonCentralized } from 'utils/json-centralized';
import create from 'zustand';

export const defaultDetailAddress = {
  usage: true,
  streetAddress: '',
  additionalInfo: '',
  country: 'Indonesia',
  province: '',
  city: '',
  cityList: [],
  postalCode: ''
};

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

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

export const defaultLocationDetail = {
  locationName: '',
  isBranch: 0,
  status: '',
  description: '',
  detailAddress: [defaultDetailAddress],
  operationalHour: [],
  messenger: [defaultDetailMessenger],
  email: [defaultDetailEmail],
  telephone: [defaultDetailTelephone],
  photos: [defaultPhotos],
  provinceList: [],
  usageList: [],
  telephoneType: [],
  messengerType: [],
  locationDetailError: false,
  locataionTouch: false
};

export const useLocationDetailStore = create(() => jsonCentralized(defaultLocationDetail));

export const getAllState = () => useLocationDetailStore.getState();
