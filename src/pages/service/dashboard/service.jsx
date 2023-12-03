import axios from 'utils/axios';
const url = 'service/data-static';

export const getServiceDataStatic = async (property) => {
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

export const deleteServiceDataStatic = async (selectedRow) => await axios.delete(url, { data: { datas: selectedRow } });

export const getDropdownServiceDataStatic = async () => {
  const getResp = await axios.get(url + '/service');
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

export const saveServiceDataStatic = async (data) => {
  const fd = new FormData();
  fd.append('keyword', data.keyword); // Usage, Telephone, Messenger, Job Title, Pay Period, Type id
  fd.append('name', data.name);

  return await axios.post('service/datastatic', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
