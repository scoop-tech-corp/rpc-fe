import axios from 'utils/axios';

const url = 'menu/menu-report';

export const getMenuReport = async (property) => {
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

export const getDetailMenuReport = async (id) => {
  return await axios.get('menu/menu-report/detail', {
    params: { id }
  });
};

export const deleteMenuReport = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const createMenuReport = async (property) => {
  const param = new FormData();

  param.append('groupName', property.groupName);
  param.append('menuName', property.menuName);
  param.append('url', property.url);
  param.append('roleId', property.roleId);
  param.append('accessTypeId', property.accessTypeId);

  return await axios.post(url, param); // { headers: { 'Content-Type': 'multipart/form-data' } }
};

export const updateMenuReport = async (property) =>
  await axios.put(url, {
    id: property.id,
    groupName: property.groupName,
    menuName: property.menuName,
    url: property.url,
    roleId: property.roleId,
    accessTypeId: property.accessTypeId
  });
