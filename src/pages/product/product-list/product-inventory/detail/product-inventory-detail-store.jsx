import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const defaultProductInventoryDetail = {
  requirementName: '',
  productLocation: null,

  productType: '',
  productName: null,
  productUsage: null,
  productBrand: null,
  dateCondition: null,
  itemCondition: '',
  imagePath: '',
  quantity: '',

  listProduct: [],
  locationList: [], // dropdown
  productNameList: [], //dropdown product sell or product clinic
  productUsageList: [],
  brandList: [],
  images: [],
  productInventoryDetailError: false,
  productInventoryDetailTouch: false
};

export const useProductInventoryDetailStore = create(() => jsonCentralized(defaultProductInventoryDetail));

export const getAllState = () => useProductInventoryDetailStore.getState();
