import axios from 'utils/axios';

const url = 'menu/profile';

export const getMenuProfile = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.search
    }
  });
};

export const getDetailMenuProfile = async (property) => {
  return await axios.get('menu/detail-menu-profile', {
    params: { id: property.id }
  });
};

export const deleteMenuProfile = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const createMenuProfile = async (property) => {
  const param = new FormData();

  param.append('title', property.title);
  param.append('url', property.url);
  param.append('icon', property.icon);

  return await axios.post(url, param); // { headers: { 'Content-Type': 'multipart/form-data' } }
};

export const updateMenuProfile = async (property) =>
  await axios.put(url, {
    id: property.id,
    title: property.title,
    url: property.url,
    icon: property.icon
  });
