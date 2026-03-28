import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

const url = 'transaction/breeding';

export const getTransactionBreedingIndex = async (payload) => {
  return await axios.get(url, {
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

export const createTransactionBreeding = async (payload) => {
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
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('doctorId', payload.treatingDoctor?.value); // sementara hardcode dlu, ga dpt datanya
  formData.append('note', payload.notes);

  return await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getTransactionBreedingDetail = async (payload) => {
  const dateFrom = payload.dateRange ? formateDateYYYMMDD(payload.dateRange[0]) : '';
  const dateTo = payload.dateRange ? formateDateYYYMMDD(payload.dateRange[1]) : '';

  return await axios.get(url + '/detail', {
    params: { id: payload.id, dateFrom, dateTo }
  });
};

export const transactionBreedingTreatment = async (payload) => {
  const formData = new FormData();

  formData.append('transactionId', payload.transactionId);
  formData.append('serviceCategory', payload.serviceCategory);
  formData.append('treatmentPlans', JSON.stringify(payload.treatmentPlans));
  formData.append('services', JSON.stringify(payload.services));
  formData.append('productSells', JSON.stringify(payload.productSells));
  formData.append('productClinics', JSON.stringify(payload.productClinics));
  formData.append('cageId', payload.cage?.value);

  return await axios.post(url + '/treatment', formData);
};

export const updateTransactionBreeding = async (payload) => {
  const { isNewPet, startDate, endDate, petDob, isNewCustomer, customer, location } = mapPayloadTransactionForm(payload);

  return await axios.put(url, {
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
    startDate,
    endDate,
    doctorId: payload.treatingDoctor?.value, // sementara hardcode dlu, ga dpt datanya
    note: payload.notes
  });
};

export const deleteTransactionBreeding = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const exportTransactionBreeding = async (payload) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      locationId: payload?.locationId?.length ? payload.locationId : [''],
      customerGroupId: payload?.customerGroupId?.length ? payload.customerGroupId : ['']
    }
  });
};

export const reassignTransactionBreeding = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('doctorId', payload.doctorId);

  return await axios.post(url + '/reassign', formData);
};

export const acceptTransactionBreeding = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('status', payload.status);
  formData.append('reason', payload.reason);

  return await axios.post(url + '/accept', formData);
};

export const checkPetConditionTransactionBreeding = async (payload) => {
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

  return await axios.post(url + '/petcheck', formData);
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

export const submitTransactionBreedingDiscount = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionBreedingId);

  payload.freeItems.forEach((freeItem) => {
    formData.append('freeItems[]', +freeItem);
  });
  payload.discounts.forEach((discount) => {
    formData.append('discounts[]', +discount);
  });
  payload.bundles.forEach((bundle) => {
    formData.append('bundles[]', +bundle);
  });
  formData.append('basedSale', +payload.basedSales);

  formData.append('recipes', JSON.stringify(payload.recipes));
  formData.append('services', JSON.stringify(payload.services));
  formData.append('products', JSON.stringify(payload.products));

  return await axios.post(url + '/discount', formData);
};

export const printInvoiceBreedingOutpatient = async (transactionId, formValue) => {
  const { detail_total, payment_method } = constructPayloadCreatePrintBreedingOutpatient(transactionId, formValue);

  return await axios.get(url + '/invoice', {
    responseType: 'blob',
    params: {
      transactionId: transactionId,
      purchases: JSON.stringify(formValue.summaryList),
      detail_total: JSON.stringify(detail_total),
      payment_method: JSON.stringify(payment_method)
    }
  });
};

export const checkPromoTransactionBreeding = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionBreedingId);
  formData.append('recipes', JSON.stringify(payload.recipes));
  formData.append('services', JSON.stringify(payload.services));
  formData.append('products', JSON.stringify(payload.products));

  return await axios.post(url + '/checkpromo', formData);
};

export const getBeforePayment = async (id) => {
  return await axios.get(url + '/beforepayment', {
    params: { transactionId: id }
  });
};

const constructPayloadCreatePrintBreedingOutpatient = (transactionId, formValue) => {
  const detail_total = {
    subtotal: formValue.summarySubtotal,
    total_discount: formValue.summaryTotalDiscount,
    discount_based_sales: formValue.discountBasedSale,
    total_payment: formValue.summaryTotalPayment,
    promoBasedSaleId: formValue.promoBasedSaleId
  };

  const payment_method = {
    paymentId: transactionId,
    amount: undefined,
    amountPaid: undefined,
    duration: undefined,
    tenor: undefined,
    next_payment: undefined
  };

  if (formValue.paymentMethod === 'full') {
    payment_method.amountPaid = formValue.summaryTotalPayment;
  }

  if (formValue.paymentMethod === 'cicilan') {
    payment_method.amountPaid = formValue.installmentDp;
    payment_method.duration = formValue.installmentDuration;
    payment_method.tenor = formValue.installmentTenor;
  }

  if (formValue.paymentMethod === 'dp') {
    const next_payment = formValue.dpNextPayment ? formateDateYYYMMDD(new Date(formValue.dpNextPayment)) : '';
    payment_method.amountPaid = formValue.dpNominal;
    payment_method.next_payment = next_payment;
  }

  return { detail_total, payment_method };
};
export const createPaymentBreedingOutpatient = async (transactionId, formValue) => {
  const { detail_total, payment_method } = constructPayloadCreatePrintBreedingOutpatient(transactionId, formValue);

  const formData = new FormData();
  formData.append('transactionId', transactionId);

  formData.append('purchases', JSON.stringify(formValue.summaryList));
  formData.append('detail_total', JSON.stringify(detail_total));
  formData.append('payment_method', JSON.stringify(payment_method));

  return await axios.post(url + '/payment', formData);
};
