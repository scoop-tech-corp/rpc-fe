import axios from 'utils/axios';

const url = 'notifications';

export const getNotifications = (params = {}) => axios.get(url, { params });

export const markNotificationRead = (id) => axios.post(`${url}/read/${id}`);

export const markAllNotificationsRead = () => axios.post(`${url}/read-all`);
