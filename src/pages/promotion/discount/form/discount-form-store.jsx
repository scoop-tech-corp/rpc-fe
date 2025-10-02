import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

const defaultFreeItem = {
  quantityBuy: '',
  productBuyType: '',
  productBuyId: null,
  quantityFree: '',
  productFreeType: '',
  productFreeId: null,
  totalMaxUsage: '',
  maxUsagePerCustomer: '',

  productBuyList: [], // dropdown
  productFreeList: [] // dropdown
};

const defaultDiscount = {
  productOrService: '',
  percentOrAmount: '',
  productType: '',
  productId: null,
  serviceId: null,
  amount: '',
  percent: '',
  totalMaxUsage: '',
  maxUsagePerCustomer: '',

  productList: [], // dropdown
  serviceList: [] // dropdown
};

const defaultBundels = {
  price: '',
  totalMaxUsage: '',
  maxUsagePerCustomer: ''
};

export const defaultBundleDetails = {
  productOrService: '',
  productType: '',
  productId: '',
  serviceId: null,
  quantity: '',

  productList: [], // dropdown
  serviceList: [] // dropdown
};

const defaultBasedSale = {
  minPurchase: '',
  maxPurchase: '',
  percentOrAmount: '',
  amount: '',
  percent: '',
  totalMaxUsage: '',
  maxUsagePerCustomer: ''
};

export const defaultDiscountForm = {
  type: '', // 1 = Free Item, 2 = Discount, 3 = Bundle, 4 = Based Sales
  name: '',
  startDate: null,
  endDate: null,
  status: 0, // 0 = inactive ; 1 = active
  locations: [],
  customerGroups: [],
  freeItem: defaultFreeItem,
  discount: defaultDiscount,
  bundle: defaultBundels,
  bundleDetails: [defaultBundleDetails],
  basedSale: defaultBasedSale,

  discountFormError: false,
  discountFormTouch: false,

  locationList: [], // dropdown
  customerGroupList: [] // dropdown
};

export const useDiscountFormStore = create(() => jsonCentralized(defaultDiscountForm));
export const getAllState = () => useDiscountFormStore.getState();
