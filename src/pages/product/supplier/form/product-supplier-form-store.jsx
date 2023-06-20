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

export const defaultProductSupplierForm = {
  supplierName: '',
  pic: '',

  detailAddress: [defaultDetailAddress],
  telephone: [],
  email: [],
  messenger: [],

  productSupplierFormError: false,
  productSupplierFormTouch: false,

  provinceList: [], // dropdown
  usageList: [], // dropdown
  telephoneType: [], // dropdown
  messengerType: [] // dropdown
};

export const useProductSupplierFormStore = create(() => jsonCentralized(defaultProductSupplierForm));
export const getAllState = () => useProductSupplierFormStore.getState();
