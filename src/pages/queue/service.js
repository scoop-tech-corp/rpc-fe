import axios from 'utils/axios';
import axiosLib from 'axios';
import config from 'config';

// Management (butuh auth)
export const getQueueList = (params = {}) => axios.get('queue', { params });

export const createQueue = (payload) => axios.post('queue', payload);

export const convertFromBooking = (payload) => axios.post('queue/convert', payload);

export const updateQueueStatus = (payload) => axios.put('queue/status', payload);

export const deleteQueue = (id) => axios.delete('queue', { data: { id } });

export const resetQueue = (locationId) => axios.put('queue/reset', { locationId });

export const getBookingCandidates = (params = {}) => axios.get('queue/booking-candidates', { params });

// Display publik (tanpa auth, pakai token di query param)
export const getDisplayData = (token, locationId) =>
  axiosLib.get(`${config.apiUrl}/api/queue/display`, {
    params: { token, locationId }
  });
