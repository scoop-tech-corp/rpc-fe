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
  productBrand: null,
  productSupplier: null,
  status: 1,
  sku: '',
  expiredDate: null,

  pricingStatus: 'Basic',
  costPrice: '',
  marketPrice: '',
  price: '',

  customerGroups: [],
  priceLocations: [],
  quantities: [],

  isShipped: 1,
  weight: '',
  length: '',
  width: '',
  height: '',

  isCustomerPurchase: false,
  isCustomerPurchaseOnline: false,
  isCustomerPurchaseOutStock: false,
  isStockLevelCheck: false,
  isNonChargeable: false,
  isOfficeApproval: false,
  isAdminApproval: false,

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
