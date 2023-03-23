import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

export const defaultProductSellForm = {
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
  isOfficeApproval: true,
  isAdminApproval: true,

  introduction: '',
  description: '',

  selectedSellingPrice: [],
  locations: [],
  categories: [],
  reminders: [],

  photos: [defaultPhotos],
  productSellFormError: false,
  productSellFormTouch: false,
  dataSupport: {
    // for dropdown
    customerGroupsList: [],
    locationList: [],
    brandList: [],
    supplierList: [],
    productCategoryList: []
  }
};

export const useProductSellFormStore = create(() => jsonCentralized(defaultProductSellForm));
export const getAllState = () => useProductSellFormStore.getState();
