import { jsonCentralized } from 'utils/func';
import { create } from 'zustand';

export const defaultServiceListForm = {
  openId: '',
  userId: '',
  listUser: []
};

export const useChatStore = create(() => jsonCentralized(defaultServiceListForm));
export const getAllState = () => useChatStore.getState();
