import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const defaultFormSecurityGroup = {
  role: '',
  status: '',
  usersId: [],
  userList: [], //dropdown
  formSecurityGroupError: false,
  formSecurityGroupTouch: false
};

export const useFormSecurityGroupStore = create(() => jsonCentralized(defaultFormSecurityGroup));

export const getAllState = () => useFormSecurityGroupStore.getState();
