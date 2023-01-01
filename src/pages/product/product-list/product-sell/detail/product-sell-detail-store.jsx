import { jsonCentralized } from 'utils/func';
import create from 'zustand';

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

export const defaultProductSellDetail = {
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

  selectedSellingPrice: [],
  locations: [],
  categories: [],
  reminders: [],

  photos: [defaultPhotos],
  productSellDetailError: false,
  productSellDetailTouch: false,
  dataSupport: {
    // for dropdown
    customerGroupsList: [],
    locationList: [],
    brandList: [],
    supplierList: [],
    productCategoryList: []
  }
};

export const useProductSellDetailStore = create(() => jsonCentralized(defaultProductSellDetail));
export const getAllState = () => useProductSellDetailStore.getState();
