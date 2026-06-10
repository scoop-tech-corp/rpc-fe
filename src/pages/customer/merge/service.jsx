import axios from 'utils/axios';

export const getMergePreview = async (sourceId, targetId) => {
  return await axios.get('customer/merge/preview', {
    params: { sourceId, targetId }
  });
};

export const executeMerge = async (payload) => {
  return await axios.post('customer/merge/execute', payload);
};

export const getMergeHistory = async (params) => {
  return await axios.get('customer/merge/history', { params });
};

export const exportMergeHistory = async (params) => {
  return await axios.get('customer/merge/export', { params, responseType: 'blob' });
};
