import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

const defaultUnitAvailable = {
  id: '',
  unitName: '',
  status: '',
  capacity: '',
  amount: '',
  notes: '',
  command: ''
};

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

export const defaultFacilityDetail = {
  locationId: '',
  introduction: '',
  description: '',
  detailUnitAvailable: [defaultUnitAvailable],
  photos: [defaultPhotos],
  facilityLocationList: [],
  facilityDetailError: false,
  facilityDetailTouch: false
};

export const useFacilityDetailStore = create(() => jsonCentralized(defaultFacilityDetail));

export const getAllState = () => useFacilityDetailStore.getState();
