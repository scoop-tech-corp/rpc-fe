import axios from 'utils/axios';

export const getInstallmentList = (params) => axios.get('installment', { params });
export const getInstallmentDetail = (planId) => axios.get('installment/detail', { params: { planId } });
export const getInstallmentSummary = (params) => axios.get('installment/summary', { params });
export const createInstallmentPlan = (payload) => axios.post('installment', payload);
export const recordInstallmentPayment = (payload) => axios.post('installment/payment', payload);
export const previewLateFee = (params) => axios.get('installment/late-fee', { params });
export const cancelInstallmentPlan = (planId) => axios.delete('installment', { data: { planId } });
