import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const defaultStockOpnameForm = {
  stockOpnameNumber: '',
  title: '',
  startTime: null,
  locationId: null,
  users: [],

  isFormTouch: false,
  isFormError: false,

  locationList: [],
  staffList: []
};

export const useStockOpnameFormStore = create(() => jsonCentralized(defaultStockOpnameForm));
export const getAllState = () => useStockOpnameFormStore.getState();
