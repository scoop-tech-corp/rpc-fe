import axios from 'utils/axios';

const url = 'menu/setting';

export const getMenuSetting = async (property) => {
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

export const getDetailMenuSetting = async (property) => {
  return await axios.get('menu/detail-menu-setting', {
    params: { id: property.id }
  });
};

export const deleteMenuSetting = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const createMenuSetting = async (property) => {
  const param = new FormData();

  param.append('title', property.title);
  param.append('url', property.url);
  param.append('icon', property.icon);

  return await axios.post(url, param); // { headers: { 'Content-Type': 'multipart/form-data' } }
};

export const updateMenuSetting = async (property) =>
  await axios.put(url, {
    id: property.id,
    title: property.title,
    url: property.url,
    icon: property.icon
  });
