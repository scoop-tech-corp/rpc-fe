import axios from 'utils/axios';

const url = 'finance/quotation';

// ── List & Detail ──────────────────────────────────────────────────────────────

export const getQuotationList = async (payload) =>
  axios.get(url, {
    params: {
      orderValue:    payload.orderValue,
      orderColumn:   payload.orderColumn,
      goToPage:      payload.goToPage,
      rowPerPage:    payload.rowPerPage,
      search:        payload.search,
      locationId:    payload.locationId,
      status:        payload.status,
      typeOfService: payload.typeOfService,
      dateFrom:      payload.dateFrom,
      dateTo:        payload.dateTo,
    }
  });

export const getQuotationDetail = async (id) =>
  axios.get(`${url}/detail`, { params: { id } });

// ── CRUD ───────────────────────────────────────────────────────────────────────

export const createQuotation = async (payload) => axios.post(url, payload);

export const updateQuotation = async (payload) => axios.put(url, payload);

export const deleteQuotation = async (id) => axios.delete(url, { data: { id } });

// ── Actions ───────────────────────────────────────────────────────────────────

export const updateQuotationStatus = async (id, status, remarks = '') =>
  axios.post(`${url}/status`, { id, status, remarks });

export const duplicateQuotation = async (id) =>
  axios.post(`${url}/duplicate`, { id });

export const convertQuotationToTransaction = async (id) =>
  axios.post(`${url}/convert`, { id });

// ── Print ─────────────────────────────────────────────────────────────────────

export const printQuotation = async (id) =>
  axios.get(`${url}/print`, { params: { id }, responseType: 'blob' });

export const exportQuotationExcel = async (payload) =>
  axios.get(`${url}/export-excel`, {
    params: {
      orderValue:    payload.orderValue,
      orderColumn:   payload.orderColumn,
      locationId:    payload.locationId,
      status:        payload.status,
      typeOfService: payload.typeOfService,
      dateFrom:      payload.dateFrom,
      dateTo:        payload.dateTo,
      search:        payload.search,
    },
    responseType: 'blob',
  });

// ── Dropdowns ─────────────────────────────────────────────────────────────────

export const getCustomerDropdown = async (locationId = '', search = '') =>
  axios.get(`${url}/customer-dropdown`, { params: { locationId, search } });

export const getPetDropdown = async (customerId) =>
  axios.get(`${url}/pet-dropdown`, { params: { customerId } });

export const getDiscountOptions = async (locationId) =>
  axios.get(`${url}/discount-options`, { params: { locationId } });

export const calculateDiscount = async (promoId, items) =>
  axios.post(`${url}/calculate-discount`, { promoId, items });

// ── Constants ─────────────────────────────────────────────────────────────────

export const STATUS_OPTIONS = [
  { label: 'Draft',     value: 'draft' },
  { label: 'Sent',      value: 'sent' },
  { label: 'Accepted',  value: 'accepted' },
  { label: 'Rejected',  value: 'rejected' },
  { label: 'Expired',   value: 'expired' },
  { label: 'Converted', value: 'converted' },
];

export const SERVICE_TYPE_OPTIONS = [
  { label: 'Pet Clinic',  value: 'clinic' },
  { label: 'Pet Hotel',   value: 'hotel' },
  { label: 'Salon',       value: 'salon' },
  { label: 'Grooming',    value: 'grooming' },
  { label: 'Pet Shop',    value: 'shop' },
];

export const STATUS_COLOR = {
  draft:     'default',
  sent:      'info',
  accepted:  'success',
  rejected:  'error',
  expired:   'warning',
  converted: 'secondary',
};
