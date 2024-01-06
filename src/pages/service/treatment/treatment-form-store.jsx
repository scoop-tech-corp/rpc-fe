import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const defaultTreatmentForm = {
  id: null,
  type: '',
  location: [],
  status: '',
  formStep2: {
    totalColumn: 6
  },
  formStep2Item: {
    duration: '0',
    notes: '',
    start: '',
    isAnother: 0,
    task_id: '',
    frequency_id: '',
    quantity: '',
    product_name: '',
    product_type: ''
  },
  dataSupport: {
    locationList: [],
    diagnoseList: [],
    statusList: [],
    taskList: [],
    frequencyList: [],
    serviceList: []
  }
};

export const useTreatmentStore = create(() => jsonCentralized(defaultTreatmentForm));
export const getAllState = () => useTreatmentStore.getState();
