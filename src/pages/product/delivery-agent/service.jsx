import axios from 'utils/axios';

const agentUrl = 'product/delivery-agent';
const orderUrl = 'product/delivery-order';

export const getCustomerListByLocation = async (locationId) => {
  const resp = await axios.get('customer/list', { params: { locationId } });
  return resp.data.map((dt) => ({
    label: `${dt.memberNo || dt.id} - ${dt.firstName}`,
    value: +dt.id,
    name: dt.firstName,
    phone: dt.phone ?? dt.phoneNumber ?? ''
  }));
};

export const getProductsByType = async (type, locationId) => {
  const endpointMap = {
    sell: 'product/sell/dropdown',
    clinic: 'product/clinic/dropdown',
    product: 'product/inventory/dropdown'
  };
  const url = endpointMap[type] ?? endpointMap.product;
  const resp = await axios.get(url, { params: { locationId } });
  return resp.data.map((dt) => ({
    label: dt.fullName ?? dt.name ?? '',
    value: +dt.id,
    price: +(dt.price ?? dt.sellingPrice ?? 0)
  }));
};

// ── Delivery Agent ──────────────────────────────────────────────────────────

export const getDeliveryAgents = async (property) => {
  return await axios.get(agentUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      isActive: property.isActive
    }
  });
};

export const getDeliveryAgentDetail = async (id) => {
  return await axios.get(agentUrl + '/detail', { params: { id } });
};

export const getDeliveryAgentDropdown = async (locationId) => {
  return await axios.get(agentUrl + '/dropdown', { params: { locationId } });
};

export const createDeliveryAgent = async (payload) => {
  return await axios.post(agentUrl, payload);
};

export const updateDeliveryAgent = async (payload) => {
  return await axios.put(agentUrl, payload);
};

export const changeDeliveryAgentStatus = async (payload) => {
  return await axios.put(agentUrl + '/status', payload);
};

export const deleteDeliveryAgent = async (id) => {
  return await axios.delete(agentUrl, { data: { id } });
};

// ── Delivery Order ──────────────────────────────────────────────────────────

export const generateDeliveryNumber = async (locationId) => {
  return await axios.get(orderUrl + '/generate-number', { params: { locationId } });
};

export const getDeliveryOrders = async (property) => {
  return await axios.get(orderUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      agentId: property.agentId,
      status: property.status,
      startDate: property.startDate,
      endDate: property.endDate
    }
  });
};

export const getDeliveryOrderDetail = async (id) => {
  return await axios.get(orderUrl + '/detail', { params: { id } });
};

export const downloadDeliveryOrderPdf = async (id) => {
  return await axios.get(orderUrl + '/download-pdf', { params: { id }, responseType: 'blob' });
};

export const createDeliveryOrder = async (payload) => {
  return await axios.post(orderUrl, payload);
};

export const updateDeliveryOrder = async (payload) => {
  return await axios.put(orderUrl, payload);
};

export const deleteDeliveryOrder = async (id) => {
  return await axios.delete(orderUrl, { data: { id } });
};

export const assignDeliveryOrder = async (payload) => {
  return await axios.post(orderUrl + '/assign', payload);
};

export const pickupDeliveryOrder = async (id) => {
  return await axios.post(orderUrl + '/pickup', { id });
};

export const startDeliveryOrder = async (id) => {
  return await axios.post(orderUrl + '/start', { id });
};

export const completeDeliveryOrder = async (payload) => {
  return await axios.post(orderUrl + '/complete', payload);
};

export const failedDeliveryOrder = async (payload) => {
  return await axios.post(orderUrl + '/failed', payload);
};

export const cancelDeliveryOrder = async (payload) => {
  return await axios.post(orderUrl + '/cancel', payload);
};
