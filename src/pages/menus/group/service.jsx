import axios from 'utils/axios';

const url = 'menu/menu-group';

export const getMenuGroup = async (property) => {
  return await axios.get(url, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword
    }
  });
};

export const getMenuGroupList = async () => {
  const getResp = await axios.get('menu/list-menu-group');
  return getResp.data.map((dt) => {
    return { label: dt.groupName, value: +dt.id };
  });
};

export const getLastOrderMenuGroup = async () => await axios.get('menu/last-order-menu-group');

export const deleteMenuGroup = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const createMenuGroup = async (property) => {
  const param = new FormData();
  param.append('groupName', property.groupName);
  param.append('orderMenu', property.orderMenu);

  return await axios.post(url, param); // { headers: { 'Content-Type': 'multipart/form-data' } }
};

export const updateMenuGroup = async (property) =>
  await axios.put(url, { id: property.id, groupName: property.groupName, orderMenu: property.orderMenu });
