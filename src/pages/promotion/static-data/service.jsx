import axios from 'utils/axios';

const url = 'promotion/datastatic';

export const getPromotionDataStatic = async (property) => {
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

export const deletePromotionDataStatic = async (selectedRow) => await axios.delete(url, { data: { datas: selectedRow } });

export const getPromotionDataStaticUsage = async () => {
  const getResp = await axios.get(url + '/usage');
  const usage = getResp.data;

  return usage && usage.length ? usage.map((dt) => ({ label: dt.usage, value: +dt.id })) : [];
};

export const getPromotionDataStaticType = async (procedure) => {
  const getResp = await axios.get(url + `/type${procedure}`); // phone || messenger
  const type = getResp.data;

  return type && type.length ? type.map((dt) => ({ label: dt.name, value: +dt.id })) : [];
};

export const savePromotionDataStaticUsage = async (data) => {
  const fd = new FormData();
  fd.append('usage', data.name);

  return await axios.post(url + '/usage', fd);
};

export const savePromotionDataStaticType = async (data, procedure) => {
  const fd = new FormData();
  fd.append('typeName', data.name);

  return await axios.post(url + `/type${procedure}`, fd); // phone || messenger
};
