import axios from 'utils/axios';

const url = 'menu/child-menu-group';

export const getMenuGroupChildren = async (property) => {
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

export const getLastOrderMenu = async () => await axios.get('menu/last-order-child-menu-group');

export const getMenuChildrenList = async () => {
  const getResp = await axios.get('menu/list-child-menu-group');
  return getResp.data.map((dt) => {
    return { label: dt.menuName, value: +dt.id };
  });
};

export const getDetailMenuGroupChildren = async (property) => {
  return await axios.get('menu/detail-child-menu-group', {
    params: { id: property.id }
  });
};

export const deleteMenuGroupChildren = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const createMenuGroupChildren = async (property) => {
  const param = new FormData();

  param.append('groupId', property.groupId);
  param.append('menuName', property.menuName);
  param.append('identify', property.identify);
  param.append('title', property.title);
  param.append('type', property.type);
  param.append('icon', property.icon);
  param.append('orderMenu', property.orderMenu);
  param.append('isActive', property.isActive);

  return await axios.post(url, param); // { headers: { 'Content-Type': 'multipart/form-data' } }
};

export const updateMenuGroupChildren = async (property) =>
  await axios.put(url, {
    id: property.id,
    groupId: property.groupId,
    menuName: property.menuName,
    identify: property.identify,
    title: property.title,
    type: property.type,
    icon: property.icon,
    orderMenu: property.orderMenu,
    isActive: property.isActive
  });
