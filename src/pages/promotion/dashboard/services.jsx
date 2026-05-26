import axios from 'utils/axios';

export const getPromotionDashboard = async (params) => {
  return await axios.get('promotion/dashboard', { params });
};
