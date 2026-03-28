import axios from 'utils/axios';

const servicePoliciesUrl = 'service/contract';

export const getServicePolicies = async (params) => {
  const getResp = await axios.get(servicePoliciesUrl, {
    params
  });

  return getResp;
};

export const getServicePoliciesById = async (id) => {
  return await axios.get(servicePoliciesUrl + '/detail', {
    params: { id }
  });
};

export const getServicePoliciesList = async () => {
  const getResp = await axios.get(servicePoliciesUrl + '/list');

  return getResp;
};

export const exportServicePolicies = async (params) => {
  return await axios.get(servicePoliciesUrl + '/export', {
    responseType: 'blob',
    params
  });
};

export const deleteServicePolicies = async (id) => {
  return await axios.delete(servicePoliciesUrl, {
    data: { id }
  });
};

export const createServicePolicies = async (property) => {
  const categories = property.category.map((dt) => +dt);
  const param = new FormData();
  param.append('title', property.title);
  param.append('raw_content', property.content);
  categories.forEach((category) => {
    param.append('categories[]', category);
  }); // JSON.stringify(property.category)
  param.append('status', property.status);
  param.append('version', property.version);

  return await axios.post(servicePoliciesUrl, param);
};

export const updateServicePolicies = async (property) => {
  const parameter = {
    id: property.id,
    title: property.title,
    raw_content: property.content,
    categories: property.category,
    status: property.status,
    version: property.version
  };

  return await axios.put(servicePoliciesUrl, parameter);
};
