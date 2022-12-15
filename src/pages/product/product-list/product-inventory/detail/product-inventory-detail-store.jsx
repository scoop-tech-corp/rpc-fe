import { jsonCentralized } from 'utils/json-centralized';
import create from 'zustand';

export const defaultProductInventoryDetail = {
  requirementName: '',
  productLocation: null,

  productType: '',
  productName: null,
  productUsage: null,
  quantity: '',

  listProduct: [],
  locationList: [], // dropdown
  productNameList: [], //dropdown product sell or product clinic
  productUsageList: [],
  productInventoryDetailError: false,
  productInventoryDetailTouch: false
};

export const useProductInventoryDetailStore = create(() => jsonCentralized(defaultProductInventoryDetail));

export const getAllState = () => useProductInventoryDetailStore.getState();
