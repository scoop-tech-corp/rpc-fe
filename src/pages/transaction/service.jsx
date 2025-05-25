import { formateDateYYYMMDD } from 'utils/func';
import axios from 'utils/axios';
import { getProductClinic, getProductSell } from 'pages/product/product-list/service';

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

export const getPaymentMethodTransactionList = async () => {
  const getResp = await axios.get('transaction/listdata/paymentmethod');

  return getResp.data.data.map((dt) => {
    return { label: dt.name, value: +dt.id };
  });
};

export const createPaymentMethod = async (payload) => {
  return await axios.post('transaction/listdata/paymentmethod', payload);
};

export const ServiceCategory = {
  clinic: 'Pet Clinic',
  hotel: 'Pet Hotel',
  salon: 'Pet Salon',
  pacak: 'Pacak'
};

export const getKeyServiceCategoryByValue = (value) => {
  return Object.entries(ServiceCategory).find(([, val]) => val === value)?.[0];
};

const mapPayloadTransactionForm = (payload) => {
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

  return {
    isNewPet: isNewPet(),
    startDate,
    endDate,
    petDob,
    isNewCustomer,
    customer,
    location
  };
};

export const updateTransaction = async (payload) => {
  const { isNewPet, startDate, endDate, petDob, isNewCustomer, customer, location } = mapPayloadTransactionForm(payload);

  return await axios.put('transaction', {
    id: payload.id,
    registrationNo: payload.registrationNo,
    isNewCustomer: isNewCustomer,
    locationId: location,
    customerId: payload.customerId,
    customerName: customer,
    registrant: payload.registrantName || '',
    isNewPet, // 0 untuk No, 1 untuk Yes
    petId: payload.petId, // !isNewPet ? payload.pets.value : '' untuk pet lama, pet baru tidak perlu diisi
    petName: payload.petName || '',
    petCategory: payload.petCategory?.value || '',
    condition: payload.petCondition,
    petGender: payload.petGender,
    isSterile: payload.petSterile,
    birthDate: petDob,
    month: payload.petMonth,
    year: payload.petYear,
    serviceCategory: ServiceCategory[payload.configTransaction],
    startDate,
    endDate,
    doctorId: payload.treatingDoctor?.value, // sementara hardcode dlu, ga dpt datanya
    note: payload.notes
  });
};

export const createTransaction = async (payload) => {
  const { isNewPet, startDate, endDate, petDob, isNewCustomer, customer, location } = mapPayloadTransactionForm(payload);

  const formData = new FormData();
  formData.append('isNewCustomer', isNewCustomer);
  formData.append('locationId', location);
  formData.append('customerId', isNewCustomer ? '' : customer);
  formData.append('customerName', isNewCustomer ? customer : '');
  formData.append('registrant', payload.registrantName || '');

  formData.append('isNewPet', isNewPet); // 0 untuk No, 1 untuk Yes
  formData.append('petId', !isNewPet ? payload.pets.value : ''); // untuk pet lama, pet baru tidak perlu diisi
  formData.append('petName', payload.petName || '');
  formData.append('petCategory', payload.petCategory?.value || '');
  formData.append('condition', payload.petCondition);
  formData.append('petGender', payload.petGender);
  formData.append('isSterile', payload.petSterile);
  formData.append('birthDate', petDob);
  formData.append('month', payload.petMonth);
  formData.append('year', payload.petYear);
  formData.append('serviceCategory', ServiceCategory[payload.configTransaction]);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('doctorId', payload.treatingDoctor?.value); // sementara hardcode dlu, ga dpt datanya
  formData.append('note', payload.notes);

  return await axios.post('transaction', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const createPetShopTransaction = async (payload) => {
  return await axios.post('transaction/petshop', {
    isNewCustomer: false,
    customerId: payload.customerId,
    registrant: payload.registrant,
    locationId: payload.locationId,
    serviceCategory: 'Pet Shop',
    notes: payload.notes,
    paymentMethod: payload.paymentMethod,
    productList: payload.productList.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      note: item.note,
      promoId: item.promoId
    })),
    selectedPromos: payload.selectedPromos
  });
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

export const getPetShopTransactionIndex = async (payload) => {
  return await axios.get('/transaction/petshop', {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      search: payload.search,
      locationId: payload.locationId,
      customerGroupId: payload.customerGroupId
    }
  });
};

export const getTransactionDetail = async (payload) => {
  const dateFrom = payload.dateRange ? formateDateYYYMMDD(payload.dateRange[0]) : '';
  const dateTo = payload.dateRange ? formateDateYYYMMDD(payload.dateRange[1]) : '';

  return await axios.get('transaction/detail', {
    params: { id: payload.id, dateFrom, dateTo }
  });
};

export const deleteTransaction = async (id) => {
  return await axios.delete('transaction', {
    data: { id }
  });
};

export const deletePetShopTransaction = async (id) => {
  return await axios.delete('transaction/petshop', {
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

export const submitPromoDiscount = async (payload) => {
  return await axios.post('transaction/petshop/discount', payload);
};

export const exportPetShopTransaction = async (payload) => {
  return await axios.get('transaction/petshop/export', {
    responseType: 'blob',
    params: {
      locationId: payload?.locationId?.length ? payload.locationId : [''],
      customerGroupId: payload?.customerGroupId?.length ? payload.customerGroupId : ['']
    }
  });
};

export const getPromoList = async (payload) => {
  return await axios.post('promotion/discount/checkpromo', payload);
};

export const acceptTransaction = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('status', payload.status);
  formData.append('reason', payload.reason);

  return await axios.post('transaction/accept', formData);
};

export const reassignTransaction = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('doctorId', payload.doctorId);

  return await axios.post('transaction/reassign', formData);
};

export const checkHplStatus = async (payload) => {
  const estimateDateofBirth = payload.estimateDateofBirth ? formateDateYYYMMDD(new Date(payload.estimateDateofBirth)) : '';

  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('estimateDateofBirth', estimateDateofBirth);
  return await axios.post('transaction/hplcheck', formData);
};

export const checkPetConditionTransaction = async (payload) => {
  const estimateDateofBirth = payload.estimateDateofBirth ? formateDateYYYMMDD(new Date(payload.estimateDateofBirth)) : '';

  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('numberVaccines', payload.numberVaccines || 0);
  formData.append('isLiceFree', payload.isLiceFree ? 1 : 0);
  formData.append('noteLiceFree', payload.noteLiceFree);
  formData.append('isFungusFree', payload.isFungusFree ? 1 : 0);
  formData.append('noteFungusFree', payload.noteFungusFree);
  formData.append('isPregnant', payload.isPregnant ? 1 : 0);
  formData.append('estimateDateofBirth', estimateDateofBirth);

  formData.append('isRecomendInpatient', payload.isRecomendInpatient ? 1 : 0);
  formData.append('noteInpatient', payload.noteInpatient);

  formData.append('isParent', payload.isParent ? 1 : 0);
  formData.append('isBreastfeeding', payload.isBreastfeeding ? 1 : 0);
  formData.append('numberofChildren', payload.numberofChildren || 0);
  formData.append('isAcceptToProcess', payload.reasonReject ? 0 : 1);
  if (payload.reasonReject) formData.append('reasonReject', payload.reasonReject);

  return await axios.post('transaction/petcheck', formData);
};

export const TransactionType = {
  'pet-clinic': 'Pet Clinic',
  'pet-hotel': 'Pet Hotel',
  'pet-salon': 'Pet Salon',
  pacak: 'Pacak',
  'pet-shop': 'Pet Shop'
};

export const TabList = {
  ongoing: 0,
  finished: 1
};
