import { create } from 'zustand';
import { jsonCentralized } from 'utils/func';

export const defaultOrderForm = {
  deliveryNumber: '',
  locationId: null,
  customerId: null,
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  deliveryDate: '',
  deliveryTime: '',
  scheduledAt: '',
  orderId: null,
  note: '',
  details: [],

  isFormTouch: false,
  isFormError: false,

  locationList: [],
  customerList: [],
  productOptions: { sell: [], clinic: [], product: [] }
};

export const useOrderFormStore = create(() => jsonCentralized(defaultOrderForm));
export const getAllState = () => useOrderFormStore.getState();
