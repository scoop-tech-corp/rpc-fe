import axios from 'utils/axios';
const url = 'staff/datastatic';

export const getStaffDataStatic = async (property) => {
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

export const deleteStaffDataStatic = async (selectedRow) => await axios.delete(url, { data: { datas: selectedRow } });

export const getDropdownStaffDataStatic = async () => {
  const getResp = await axios.get(url + '/staff');
  const { dataStaticMessenger, dataStaticPayPeriod, dataStaticTelephone, dataStaticTypeId, dataStaticUsage } = getResp.data;

  const mapping = (dt) => ({ label: dt.name, value: dt.name });

  return {
    dataStaticMessenger: dataStaticMessenger.map(mapping),
    dataStaticPayPeriod: dataStaticPayPeriod.map(mapping),
    dataStaticTelephone: dataStaticTelephone.map(mapping),
    dataStaticTypeId: dataStaticTypeId.map(mapping),
    dataStaticUsage: dataStaticUsage.map(mapping)
  };
};

export const saveStaffDataStatic = async (data) => {
  const fd = new FormData();
  fd.append('keyword', data.keyword); // Usage, Telephone, Messenger
  fd.append('name', data.name);

  return await axios.post('staff/datastatic', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
