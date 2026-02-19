import axios from 'utils/axios';

const TreatmentUrl = 'service/treatment';

export const getTreatment = async (params) => {
  const getResp = await axios.get(TreatmentUrl, {
    params
  });

  return getResp;
};
export const getTreatmentItem = async (params) => {
  const getResp = await axios.get(`${TreatmentUrl}/item`, {
    params
  });

  return getResp;
};

export const getProductList = async (params) => {
  const getResp = await axios.get(params.api, {
    params: {
      locationId: params.locationId
    }
  });

  return getResp;
};

export const getDiagnoseList = async () => {
  const getResp = await axios.get('service/diagnose');
  return getResp?.data?.data?.map((dt) => {
    return { label: dt.name, value: +dt.id };
  });
};
export const getFrequencyList = async () => {
  const getResp = await axios.get('service/frequency');
  return getResp?.data?.data?.map((dt) => {
    return { label: dt.name, value: +dt.id };
  });
};
export const getTaskList = async () => {
  const getResp = await axios.get('service/task');
  return getResp?.data?.data?.map((dt) => {
    return { label: dt.name, value: +dt.id };
  });
};

export const getTreatmentListByLocation = async (locationIds = []) => {
  const getResp = await axios.get(`${TreatmentUrl}/list`, {
    params: { locationId: locationIds.length ? locationIds : [''] }
  });

  return getResp.data.map((dt) => {
    return { label: dt.name, value: +dt.id };
  });
};

export const getServiceListByLocation = async (params) => {
  const getResp = await axios.get('service/list', {
    params
  });

  return getResp?.data?.data?.map((dt) => {
    return { label: dt.fullName, value: +dt.id };
  });
};
export const getTreatmentById = async (params) => {
  const getResp = await axios.get(`${TreatmentUrl}/detail`, {
    params
  });

  return getResp;
};

export const findTreatment = async (property) => {
  // const getResp = await axios.get(serviceListUrl + '/category', {
  //   params: {
  //     id: property.id,
  //     rowPerPage: property.rowPerPage,
  //     goToPage: property.goToPage,
  //     orderValue: property.orderValue,
  //     orderColumn: property.orderColumn,
  //     search: property.keyword,
  //     locationId: property.locationId
  //   }
  // });
  // return getResp;
};

export const exportTreatment = async (params) => {
  return await axios.get(TreatmentUrl + '/export', {
    responseType: 'blob',
    params
  });
};

export const deleteTreatment = async (id) => {
  return await axios.delete(TreatmentUrl, {
    data: { id }
  });
};

export const createTreatment = async (property) => {
  return await axios.post(TreatmentUrl, property);
};

export const updateTreatment = async (property) => {
  return await axios.put(TreatmentUrl, property);
};
export const updateTreatmentItems = async (property) => {
  return await axios.put(`${TreatmentUrl}/item`, property);
};
