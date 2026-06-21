import axios from 'utils/axios';

export const getFeedbackList = async (params) => {
  return await axios.get('customer/feedback', { params });
};

export const createFeedback = async (payload) => {
  return await axios.post('customer/feedback', payload);
};

export const updateFeedback = async (payload) => {
  return await axios.put('customer/feedback', payload);
};

export const deleteFeedback = async (ids) => {
  return await axios.delete('customer/feedback', { data: { feedbackId: ids } });
};
