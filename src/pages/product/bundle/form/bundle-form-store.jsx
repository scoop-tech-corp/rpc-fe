import { jsonCentralized } from 'utils/func';
import create from 'zustand';

export const defaultBundleForm = {
  name: '',
  sellingLocation: null,
  category: null,
  remark: '',
  status: '1',
  selectedProducts: [],
  products: [],
  sellingLocationList: [], //dropdown
  categoryList: [], //dropdown
  productList: [], //dropdown
  bundleFormError: false,
  bundleFormTouch: false
};

export const useProductBundleFormStore = create(() => jsonCentralized(defaultBundleForm));

export const getAllState = () => useProductBundleFormStore.getState();
