import axios from 'utils/axios';

export const sendOtp = async (email) => {
  const formData = new FormData();
  formData.append('email', email);

  return await axios.post('send-otp', formData);
};

export const verifyOtp = async (payload) => {
  const formData = new FormData();
  formData.append('email', payload.email);
  formData.append('otp', +payload.otp);

  return await axios.post('verify-otp', formData);
};

export const changePassword = async (payload) => {
  const formData = new FormData();
  formData.append('email', payload.email);
  formData.append('password', payload.password);
  formData.append('confirmPassword', payload.confirmPassword);

  return await axios.post('change-password', formData);
};
