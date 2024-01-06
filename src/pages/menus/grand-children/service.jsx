import axios from 'utils/axios';

const url = 'menu/grand-child-menu-group';

export const getMenuGroupGrandChildren = async (property) => {
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

export const getLastOrderMenu = async () => await axios.get('menu/last-order-grand-child-menu-group');

export const getDetailMenuGroupGrandChildren = async (property) => {
  return await axios.get('menu/detail-grand-child-menu-group', {
    params: { id: property.id }
  });
};

export const deleteMenuGroupGrandChildren = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const createMenuGroupGrandChildren = async (property) => {
  const param = new FormData();

  param.append('childrenId', property.childrenId);
  param.append('menuName', property.menuName);
  param.append('identify', property.identify);
  param.append('title', property.title);
  param.append('type', property.type);
  param.append('icon', property.icon);
  param.append('orderMenu', property.orderMenu);
  param.append('isActive', property.isActive);

  return await axios.post(url, param); // { headers: { 'Content-Type': 'multipart/form-data' } }
};

export const updateMenuGroupGrandChildren = async (property) =>
  await axios.put(url, {
    id: property.id,
    childrenId: property.childrenId,
    menuName: property.menuName,
    identify: property.identify,
    title: property.title,
    type: property.type,
    icon: property.icon,
    orderMenu: property.orderMenu,
    isActive: property.isActive
  });
