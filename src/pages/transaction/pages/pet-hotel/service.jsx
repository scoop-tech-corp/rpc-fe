import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

export const createTransactionPetHotel = async (payload) => {
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

export const updateTransactionPetHotel = async (payload) => {
  const { isNewPet, startDate, endDate, petDob, isNewCustomer, customer, location } = mapPayloadTransactionForm(payload);

  return await axios.put('transaction/pethotel', {
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

export const getTransactionPetHotelIndex = async (payload) => {
  return await axios.get('/transaction/pethotel', {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      search: payload.search,
      locationId: payload.locationId,
      customerGroupId: payload.customerGroupId,
      status: payload.status // ongoing or finished
    }
  });
};

export const exportTransactionPetHotel = async (payload) => {
  return await axios.get('transaction/pethotel/export', {
    responseType: 'blob',
    params: {
      locationId: payload?.locationId?.length ? payload.locationId : [''],
      customerGroupId: payload?.customerGroupId?.length ? payload.customerGroupId : ['']
    }
  });
};

export const deleteTransactionPetHotel = async (id) => {
  return await axios.delete('transaction/pethotel', {
    data: { id }
  });
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

export const checkPetConditionTransactionPetHotel = async (payload) => {
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

  return await axios.post('transaction/pethotel/petcheck', formData);
};
