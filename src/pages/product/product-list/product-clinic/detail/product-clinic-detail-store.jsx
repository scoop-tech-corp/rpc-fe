import { jsonCentralized } from 'utils/func';
import create from 'zustand';

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

export const defaultProductClinicDetail = {
  fullName: '',
  simpleName: '',
  productBrandId: null,
  productSupplierId: null,
  status: 1,
  sku: '',
  expiredDate: '',

  pricingStatus: 'Basic',
  costPrice: '',
  marketPrice: '',
  price: '',

  customerGroups: [],
  priceLocations: [],
  quantities: [],

  isShipped: 1,
  weight: '',
  length: null,
  width: null,
  height: null,

  introduction: '',
  description: '',

  selectedClinicPrice: [],
  locations: [],
  categories: [],
  reminders: [],

  photos: [defaultPhotos],
  productClinicDetailError: false,
  productClinicDetailTouch: false,
  dataSupport: {
    // for dropdown
    customerGroupsList: [],
    locationList: [],
    brandList: [],
    supplierList: [],
    productCategoryList: []
  }
};

export const useProductClinicDetailStore = create(() => jsonCentralized(defaultProductClinicDetail));
export const getAllState = () => useProductClinicDetailStore.getState();
