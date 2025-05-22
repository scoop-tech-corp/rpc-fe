import axios from 'utils/axios';

export const getPromotionDashboard = async () => {
  return await axios.get('promotion/dashboard');
};
