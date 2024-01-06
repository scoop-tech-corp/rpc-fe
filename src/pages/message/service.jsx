import axios from 'utils/axios';

export const getChatUser = async () => {
  const getResp = await axios.get('chat/list-user', {});

  return getResp?.data?.data;
};

export const getChatHistory = async (params) => {
  const getResp = await axios.get('chat/detail', { params });

  return getResp?.data?.data?.map((item) => {
    return {
      ...item
    };
  });
};

export const submitMessage = async (property) => {
  let params = property;
  if (property?.file) {
    params = new FormData();
    params.append('file', property.file);
    params.append('toUserId', property.toUserId);
  }
  return await axios.post('chat', params, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const readMessage = async (property) => {
  return await axios.post('chat/read', property);
};
