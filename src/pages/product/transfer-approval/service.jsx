import axios from 'utils/axios';

export const getTransferProduct = async (property) => {
  return await axios.get('product/transfer', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId.length ? property.locationId : null,
      locationType: property.locationType ? property.locationType : undefined,
      type: property.type
    }
  });
};

export const getDetailTransferProduct = async (id) => {
  return await axios.get('product/transfer/detail', {
    params: { id }
  });
};

export const receiveTransferProduct = async (property) => {
  const fd = new FormData();
  fd.append('id', +property.id);
  fd.append('reference', property.reference);
  fd.append('image', property.image.selectedFile);

  return await axios.post('product/transfer/receive', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateTransferProductApproval = async (property) => {
  const parameter = { id: property.id, status: property.status, reason: property.reason };

  return await axios.put('product/transfer/approval', parameter);
};

export const exportHistoryTransferProduct = async (param) => {
  return await axios.get('product/transfer/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : ['']
    }
  });
};
