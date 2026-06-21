import axios from 'utils/axios';

const url = 'location/cage-management';

export const getCageList = (params) => axios.get(url, { params });
export const createCage = (payload) => axios.post(url, payload);
export const getCageDetail = (id) => axios.get(`${url}/detail`, { params: { id } });
export const updateCage = (payload) => axios.put(url, payload);
export const deleteCage = (id) => axios.delete(url, { data: { id } });

// ── Export / Import ───────────────────────────────────────────
export const exportCage = (params) => axios.get(`${url}/export`, { params, responseType: 'blob' });

export const downloadImportTemplate = () => axios.get(`${url}/import-template`, { responseType: 'blob' });

export const importCage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return axios.post(`${url}/import`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ── Inspeksi ──────────────────────────────────────────────────
export const getInspections = (params) => axios.get(`${url}/inspection`, { params });
export const storeInspection = (payload) => axios.post(`${url}/inspection`, payload);

// ── Maintenance ───────────────────────────────────────────────
export const getMaintenances = (params) => axios.get(`${url}/maintenance`, { params });
export const storeMaintenance = (payload) => axios.post(`${url}/maintenance`, payload);
export const updateMaintenance = (payload) => axios.put(`${url}/maintenance`, payload);

// ── Cleaning Log ──────────────────────────────────────────────
export const getCleaningLogs = (params) => axios.get(`${url}/cleaning-log`, { params });
export const storeCleaningLog = (payload) => axios.post(`${url}/cleaning-log`, payload);
