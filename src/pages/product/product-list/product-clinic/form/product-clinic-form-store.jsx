import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  originalName: '',
  selectedFile: null
};

export const defaultProductClinicForm = {
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
  dosage: [],

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
  isOfficeApproval: true,
  isAdminApproval: true,

  introduction: '',
  description: '',

  selectedClinicPrice: [],
  locations: [],
  categories: [],
  reminders: [],

  photos: [defaultPhotos],
  productClinicFormError: false,
  productClinicFormTouch: false,
  dataSupport: {
    // for dropdown
    customerGroupsList: [],
    locationList: [],
    brandList: [],
    supplierList: [],
    productCategoryList: []
  }
};

export const useProductClinicFormStore = create(() => jsonCentralized(defaultProductClinicForm));
export const getAllState = () => useProductClinicFormStore.getState();
