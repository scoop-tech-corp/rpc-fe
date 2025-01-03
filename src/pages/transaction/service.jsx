import { formateDateYYYMMDD } from 'utils/func';
import axios from 'utils/axios';

export const getTransactionCategoryList = async () => {
  const getResp = await axios.get('transaction/category');

  return getResp.data.map((dt) => {
    return { label: dt.fullName, value: +dt.id };
  });
};

export const getLocationTransactionList = async () => {
  const getResp = await axios.get('location/list/transaction');

  return getResp.data.map((dt) => {
    return { label: dt.locationName, value: +dt.id };
  });
};

export const getCategoryTransactionList = async () => {
  const getResp = await axios.get('transaction/category');

  return getResp.data.map((dt) => {
    return { label: dt, value: dt };
  });
};

const SeriviceCategory = {
  clinic: 'Pet Clinic',
  hotel: 'Pet Hotel',
  salon: 'Pet Salon',
  pecak: 'Pacak'
};

export const createTransaction = async (payload) => {
  const startDate = payload.startDate ? formateDateYYYMMDD(new Date(payload.startDate)) : '';
  const endDate = payload.endDate ? formateDateYYYMMDD(new Date(payload.endDate)) : '';
  const petDob = payload.petDateOfBirth ? formateDateYYYMMDD(new Date(payload.petDateOfBirth)) : '';

  const isNewCustomer = payload.customer === 'old' ? 0 : 1;
  const isNewPet = () => {
    if (isNewCustomer || payload.petName) return 1;
    return 0;
  };
  const customer = isNewCustomer ? payload.customerName : payload.customerName.value;
  const location = payload.location.value;

  const formData = new FormData();
  formData.append('isNewCustomer', isNewCustomer);
  formData.append('locationId', location);
  formData.append('customerId', customer);
  formData.append('customerName', customer);
  formData.append('registrant', payload.registrantName || '');

  formData.append('isNewPet', isNewPet()); // 0 untuk No, 1 untuk Yes
  formData.append('petId', !isNewPet() ? payload.pets.value : ''); // untuk pet lama, pet baru tidak perlu diisi
  formData.append('petName', payload.petName || '');
  formData.append('petCategory', payload.petCategory?.value || '');
  formData.append('condition', payload.petCondition);
  formData.append('petGender', payload.petGender);
  formData.append('isSterile', payload.petSterile);
  formData.append('birthDate', petDob);
  formData.append('month', payload.petMonth);
  formData.append('year', payload.petYear);
  formData.append('serviceCategory', SeriviceCategory[payload.configTransaction]);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('doctorId', payload.treatingDoctor?.value); // sementara hardcode dlu, ga dpt datanya
  formData.append('note', payload.notes);

  return await axios.post('transaction', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getTransactionIndex = async (payload) => {
  return await axios.get('transaction', {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      search: payload.search,
      locationId: payload.locationId,
      customerGroupId: payload.customerGroupId,
      serviceCategories: payload.serviceCategories,
      status: payload.status // ongoing or finished
    }
  });
};

export const getTransactionDetail = async (id) => {
  return await axios.get('transaction/detail', {
    params: { id }
  });
};

export const deleteTransaction = async (id) => {
  return await axios.delete('transaction', {
    data: { id }
  });
};

export const exportTransaction = async (payload) => {
  return await axios.get('transaction/export', {
    responseType: 'blob',
    params: {
      status: payload.status, //ongoing or finished
      locationId: payload.locationId.length ? payload.locationId : [''],
      customerGroupId: payload.customerGroupId.length ? payload.customerGroupId : [''],
      serviceCategoryId: payload.serviceCategories.length ? payload.serviceCategories : ['']
    }
  });
};
