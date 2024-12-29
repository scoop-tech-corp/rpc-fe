import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const CONSTANT_TYPE_SERVICE = {
  1: 'Pet Clinic',
  2: 'Pet Hotel',
  3: 'Pet Salon',
  4: 'Pacak'
};

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  originalName: '',
  selectedFile: null
};

export const defaultServiceListForm = {
  id: null,
  type: '',
  fullName: '',
  simpleName: '',
  policy: '1',
  surcharges: '',
  staffPerBooking: '',
  color: '#000000',
  serviceFormError: true,
  isDetail: false,
  listPrice: [],
  listStaff: [],
  location: [],
  prices: [],
  productRequired: [],
  facility: [],
  price_list: [],
  photos: [defaultPhotos],
  followup: [],
  status: '',
  dataSupport: {
    locationList: [],
    customerGroupsList: [],
    categoryList: [],
    serviceList: []
  }
};

export const useServiceFormStore = create(() => jsonCentralized(defaultServiceListForm));
export const getAllState = () => useServiceFormStore.getState();
