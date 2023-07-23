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
  const { dataStaticMessenger, dataStaticPayPeriod, dataStaticTelephone, dataStaticTypeId, dataStaticUsage, dataStaticJobTitle } =
    getResp.data;

  const mapping = (dt) => ({ label: dt.name, value: dt.name });
  const mappingDiffValue = (dt) => ({ label: dt.name, value: +dt.id });

  return {
    dataStaticMessenger: dataStaticMessenger.map(mapping),
    dataStaticTelephone: dataStaticTelephone.map(mapping),
    dataStaticUsage: dataStaticUsage.map(mapping),
    dataStaticJobTitle: dataStaticJobTitle.map(mappingDiffValue),
    dataStaticPayPeriod: dataStaticPayPeriod.map(mappingDiffValue),
    dataStaticTypeId: dataStaticTypeId.map(mappingDiffValue)
  };
};

export const saveStaffDataStatic = async (data) => {
  const fd = new FormData();
  fd.append('keyword', data.keyword); // Usage, Telephone, Messenger, Job Title, Pay Period, Type id
  fd.append('name', data.name);

  return await axios.post('staff/datastatic', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
