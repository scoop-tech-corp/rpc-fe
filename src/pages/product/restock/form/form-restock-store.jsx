import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const defaultFormRestock = {
  productId: null,
  productType: '',
  productLocation: null,
  supplierId: null,
  requireDate: null,
  reStockQuantity: '',
  costPerItem: '',
  currentStock: '',
  statusStock: '',
  total: '',
  remark: '',
  images: [
    {
      id: null,
      label: '',
      imagePath: '',
      status: '',
      selectedFile: null
    }
  ],
  productDetails: [],
  productNameList: [], //dropdown
  supplierList: [], //dropdown
  locationList: [], //dropdown

  formRestockError: false,
  formRestockTouch: false
};

export const useFormRestockStore = create(() => jsonCentralized(defaultFormRestock));

export const getAllState = () => useFormRestockStore.getState();
