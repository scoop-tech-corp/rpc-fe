import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

export const TabList = {
  semua: 0,
  'rawat-jalan': 1,
  'rawat-inap': 2,
  finished: 3
};

export const TabListNonAdmin = {
  'rawat-jalan': 0,
  'rawat-inap': 1,
  finished: 2
};

export const TYPE_OF_CARE = {
  1: 'Rawat Jalan',
  2: 'Rawat Inap'
};

const url = 'transaction/petclinic';

export const getTransactionPetClinicStats = async () => {
  return await axios.get(`${url}/stats`);
};

export const getTransactionPetClinicIndex = async (payload) => {
  return await axios.get(url, {
    params: {
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      goToPage: payload.goToPage,
      rowPerPage: payload.rowPerPage,
      search: payload.search,
      status: payload.status, // ongoing or finished
      typeOfCare: payload.typeOfCare,
      locationId: payload.locationId,
      customerGroupId: payload.customerGroupId,
      statusFilter: payload.statusFilter || '',
      startDateFrom: payload.startDateFrom || '',
      startDateTo: payload.startDateTo || ''
    }
  });
};

export const deleteTransactionPetClinic = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

export const getTransactionPetClinicDetail = async (payload) => {
  const dateFrom = payload.dateRange ? formateDateYYYMMDD(payload.dateRange[0]) : '';
  const dateTo = payload.dateRange ? formateDateYYYMMDD(payload.dateRange[1]) : '';

  return await axios.get('transaction/petclinic/detail', {
    params: { id: payload.id, dateFrom, dateTo }
  });
};

export const createTransactionPetClinic = async (payload) => {
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
  formData.append('typeOfCare', payload.typeOfCare);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('doctorId', payload.treatingDoctor?.value); // sementara hardcode dlu, ga dpt datanya
  formData.append('note', payload.notes);
  if (payload.queueId) formData.append('queueId', payload.queueId);

  return await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

const mapPayloadTransactionForm = (payload) => {
  const startDate = payload.startDate ? formateDateYYYMMDD(new Date(payload.startDate)) : '';
  const endDate = payload.endDate ? formateDateYYYMMDD(new Date(payload.endDate)) : '';
  const petDob = payload.petDateOfBirth ? formateDateYYYMMDD(new Date(payload.petDateOfBirth)) : '';

  const isNewCustomer = payload.customer === 'old' ? 0 : 1;
  const isNewPet = () => {
    if (isNewCustomer) return 1; // new customer always needs new pet
    if (payload.petName && !payload.pets && payload.petId === '') return 1; // old customer entering a brand-new pet
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

const CONSTANT_ADDITIONAL_FIELD_FORM_VALUE = {
  ownerName: '',
  noTelp: '',
  petType: ''
};

const CONSTANT_BOOLEAN_FORM_VALUE = {
  isAnthelmintic: '',
  isVaccination: '', //1,
  isFleaMedicine: '', //1,
  isInpatient: '', //1,
  isTherapeuticFeed: '', //1,
  isGrooming: '', //1,
  isMicroscope: '', //1,
  isEye: '', //1,
  isTeskit: '', //1,
  isUltrasonografi: '', //0,
  isRontgen: '', //1,
  isBloodReview: '',
  isSitologi: '', //0,
  isBloodLab: '', //1,
  isSurgery: '', //1,
  isLice: '', //1,
  isFlea: '', //1,
  isCaplak: '', //0,
  isTungau: '', //0,
  isNematoda: '', //0,
  isTermatoda: '', //0,
  isCestode: '', //1,
  isFungiFound: '', //0,
  isSnot: '', //0,
  isVaginalSmear: ''
};

const CONSTANT_DATE_FORM_VALUE = {
  anthelminticDate: null, //'2025-04-27',
  vaccinationDate: null, //'2025-04-27',
  fleaMedicineDate: null, //'2025-04-27',
  nextControlCheckup: null //'2025-05-05',
};

export const CONSTANT_CHECK_PET_CONDITION_PET_CLINIC_FORM_VALUE = {
  transactionPetClinicId: '', //1,
  petCheckRegistrationNo: '', //123456,
  ...CONSTANT_ADDITIONAL_FIELD_FORM_VALUE,
  ...CONSTANT_DATE_FORM_VALUE,
  // isAnthelmintic: '', //1,
  // anthelminticDate: null, //'2025-04-27',
  anthelminticBrand: '', //'Brand A',
  // isVaccination: '', //1,
  // vaccinationDate: null, //'2025-04-27',
  vaccinationBrand: '', //'Brand B',
  // isFleaMedicine: '', //1,
  // fleaMedicineDate: null, //'2025-04-27',
  fleaMedicineBrand: '', //'Brand C',
  previousAction: '', //'Checkup',
  othersCompalints: '', //'No other complaints',
  // isInpatient: '', //1,
  noteInpatient: '', //'Hospitalized for 2 days',
  // isTherapeuticFeed: '', //1,
  noteTherapeuticFeed: '', //'Special feeding needed',
  imuneBooster: '', //1,
  suplement: '', //'Vitamin C',
  desinfeksi: '', //'Routine disinfection',
  care: '', //'Daily care',
  // isGrooming: '', //1,
  noteGrooming: '', //'Grooming completed',
  othersNoteAdvice: '', //'Maintain regular checkups',
  // nextControlCheckup: null, //'2025-05-05',
  diagnoseDisease: '', //'Fever',
  prognoseDisease: '', //'Recovery expected in 2 weeks',
  diseaseProgressOverview: '', //'Condition improving',
  // isMicroscope: '', //1,
  noteMicroscope: '', //'Test results pending',
  // isEye: '', //1,
  noteEye: '', //'No abnormalities',
  // isTeskit: '', //1,
  noteTeskit: '', //'Tested negative for parasites',
  // isUltrasonografi: '', //0,
  noteUltrasonografi: '', //'Not performed',
  // isRontgen: '', //1,
  noteRontgen: '', //'Chest x-ray normal',
  // isBloodReview: '',
  noteBloodReview: '',
  // isSitologi: '', //0,
  noteSitologi: '', //'Not required',
  // isVaginalSmear: '',
  noteVaginalSmear: '',
  // isBloodLab: '', //1,
  noteBloodLab: '', //'Blood tests are normal',
  // isSurgery: '', //1,
  noteSurgery: '', //'Minor surgery on the leg',
  infusion: '', //'IV fluids administered',
  fisioteraphy: '', //'Physiotherapy recommended',
  injectionMedicine: '', //'Injection given for pain relief',
  oralMedicine: '', //'Oral antibiotics prescribed',
  tropicalMedicine: '', //'Tropical ointment for wound',
  vaccination: '', //'Rabies vaccination administered',
  othersTreatment: '', //'Follow-up in 2 days',
  weight: '', //15.5,
  weightCategory: '', //1,
  temperature: '', //38.5,
  temperatureBottom: '', //36.8,
  temperatureTop: '', //40.0,
  temperatureCategory: '', //2,
  // isLice: '', //1,
  noteLice: '', //'Lice detected on fur',
  // isFlea: '', //1,
  noteFlea: '', //'Flea treatment given',
  // isCaplak: '', //0,
  noteCaplak: '', //'No caplak found',
  // isTungau: '', //0,
  noteTungau: '', //'No tungau found',
  ectoParasitCategory: '', //2,
  // isNematoda: '', //0,
  noteNematoda: '', //'No nematoda found',
  // isTermatoda: '', //0,
  noteTermatoda: '', //'No termatoda found',
  // isCestode: '', //1,
  noteCestode: '', //'Cestode detected in stool',
  // isFungiFound: '', //0,
  konjung: '', //'Normal',
  ginggiva: '', //'Healthy gums',
  ear: '', //'Clean and normal',
  tongue: '', //'Normal appearance',
  nose: '', //'Clear nasal passage',
  CRT: '', //'Normal capillary refill time',
  genitals: '', //'Normal',
  neurologicalFindings: '', //'No neurological abnormalities',
  lokomosiFindings: '', //'Able to walk without issue',
  // isSnot: '', //0,
  noteSnot: '', //'No nasal discharge',
  breathType: '', //1,
  breathSoundType: '', //2,
  breathSoundNote: '', //2,
  othersFoundBreath: '', //'No issues',
  pulsus: '',
  heartSound: '', //1,
  othersFoundHeart: '', //'No murmurs',
  othersFoundSkin: '', //'Healthy skin',
  othersFoundHair: '', //'No hair loss',
  maleTesticles: '', //2,
  othersMaleTesticles: '', //'No abnormalities',
  penisCondition: '', //'Normal',
  vaginalDischargeType: '', //2,
  urinationType: '', //2,
  othersUrination: '', //'No issues',
  othersFoundUrogenital: '', //'Healthy urogenital system',
  abnormalitasCavumOris: '', //'No oral abnormalities',
  intestinalPeristalsis: '', //'Normal peristalsis',
  perkusiAbdomen: '', //'Normal abdominal percussion',
  rektumKloaka: '', //'Normal rectum',
  othersCharacterRektumKloaka: '', //'No abnormalities',
  fecesForm: '', //'Solid',
  fecesColor: '', //'Brown',
  fecesWithCharacter: '', //'Normal',
  othersFoundDigesti: '', //'No digestive issues',
  reflectPupil: '', //'Normal',
  eyeBallCondition: '', //'Healthy',
  othersFoundVision: '', //'No vision issues',
  earlobe: '', //'Normal',
  earwax: '',
  earwaxCharacter: '', //'None',
  othersFoundEar: '', //'No ear problems'
  ...CONSTANT_BOOLEAN_FORM_VALUE
};

export const checkPetConditionTransactionPetClinic = async (payload) => {
  const formData = new FormData();

  for (const x in CONSTANT_CHECK_PET_CONDITION_PET_CLINIC_FORM_VALUE) {
    let appendValue = payload[x];

    if (Object.keys(CONSTANT_BOOLEAN_FORM_VALUE).includes(x)) {
      appendValue = +payload[x];
    } else if (Object.keys(CONSTANT_DATE_FORM_VALUE).includes(x)) {
      appendValue = payload[x] ? formateDateYYYMMDD(new Date(payload[x])) : '';
    }

    formData.append(x, appendValue);
  }

  return await axios.post(url + '/petcheck', formData);
};

export const getOrderNumberTransactionPetClinic = async (id) => {
  return await axios.get(url + '/ordernumber', {
    params: { id }
  });
};

export const getLoadPetCheckTransactionPetClinic = async (id) => {
  return await axios.get(url + '/load-petcheck', {
    params: { id }
  });
};

export const getCheckConditionPetClinic = async (id) => {
  return await axios.get(url + '/check-condition', {
    params: { id }
  });
};

export const createServiceAndRecipe = async (payload) => {
  const formData = new FormData();
  const services = payload.services.map((dt) => ({
    serviceId: +dt.serviceId,
    quantity: dt.quantity
  }));
  const recipes = payload.summary.map((dt) => ({
    productId: dt.productClinicId,
    dosage: +dt.dosage,
    duration: +dt.duration,
    unit: dt.unit,
    frequency: +dt.frequency,
    giveMedicine: dt.medication,
    notes: dt.notes
  }));

  formData.append('transactionPetClinicId', payload.transactionPetClinicId);

  formData.append('services', JSON.stringify(services));
  formData.append('recipes', JSON.stringify(recipes));

  return await axios.post(url + '/serviceandrecipe', formData);
};

export const checkPromoTransactionPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('transactionPetClinicId', payload.transactionPetClinicId);
  formData.append('recipes', JSON.stringify(payload.recipes));
  formData.append('services', JSON.stringify(payload.services));
  formData.append('products', JSON.stringify(payload.products));

  return await axios.post(url + '/checkpromo', formData);
};

// Unified endpoint: returns availablePromos + purchases + summary in one call
export const calculatePetClinicOutpatient = async (payload) => {
  const formData = new FormData();
  formData.append('transactionPetClinicId', payload.transactionPetClinicId);
  formData.append('services', JSON.stringify(payload.services ?? []));
  formData.append('recipes', JSON.stringify(payload.recipes ?? []));
  formData.append('products', JSON.stringify(payload.products ?? []));
  formData.append(
    'selectedPromos',
    JSON.stringify(
      payload.selectedPromos ?? {
        freeItems: [],
        discounts: [],
        bundles: [],
        basedSaleId: null
      }
    )
  );

  return await axios.post(url + '/calculate', formData);
};

export const getPaymentMethodsOutpatient = async () => {
  return await axios.get(url + '/payment-methods');
};

export const getPaymentHistoryOutpatient = async (transactionPetClinicId) => {
  return await axios.get(url + '/payment/outpatient/history', {
    params: { transactionPetClinicId }
  });
};

export const getBeforePayment = async (id) => {
  return await axios.get(url + '/beforepayment', {
    params: { transactionPetClinicId: id }
  });
};

export const getInpatientTransactionPetClinic = async (id) => {
  return await axios.get(url + '/inpatient', {
    params: { transactionPetClinicId: id }
  });
};

export const submitTransactionPetClinicDiscount = async (payload) => {
  const formData = new FormData();
  formData.append('transactionPetClinicId', payload.transactionPetClinicId);

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

const constructPayloadCreatePrintPetClinicOutpatient = (transactionId, formValue) => {
  const detail_total = {
    subtotal: formValue.summarySubtotal,
    total_discount: formValue.summaryTotalDiscount,
    discount_based_sales: formValue.discountBasedSale,
    total_payment: formValue.summaryTotalPayment,
    promoBasedSaleId: formValue.promoBasedSaleId
  };

  const payment_method = {
    paymentMethodId: formValue.paymentMethodId,
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

export const createPaymentPetClinicOutpatient = async (transactionId, formValue) => {
  const { detail_total, payment_method } = constructPayloadCreatePrintPetClinicOutpatient(transactionId, formValue);

  const formData = new FormData();
  formData.append('transactionPetClinicId', transactionId);

  formData.append('purchases', JSON.stringify(formValue.summaryList));
  formData.append('detail_total', JSON.stringify(detail_total));
  formData.append('payment_method', JSON.stringify(payment_method));

  return await axios.post(url + '/payment/outpatient', formData);
};

export const printInvoicePetClinicOutpatient = async (transactionId) => {
  const formData = new FormData();
  formData.append('transactionPetClinicId', transactionId);

  return await axios.post(url + '/invoice/outpatient', formData, {
    responseType: 'blob'
  });
};

export const printInvoicePetClinic = async (paymentId) => {
  return await axios.get(url + '/invoice', {
    responseType: 'blob',
    params: { paymentId }
  });
};

// Step 1: Staff upload bukti → status = 'pending'
export const uploadProofOfPayment = async (payload) => {
  const formData = new FormData();
  formData.append('id', payload.paymentId);
  formData.append('proof', payload.file);

  return await axios.post(url + '/upload-payment-proof', formData);
};

// Step 2: Finance/Manager konfirmasi (harus orang berbeda dari uploader)
export const confirmPaymentPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('id', payload.id);

  return await axios.post(url + '/confirm-payment', formData);
};

// Tolak bukti pembayaran
export const rejectPaymentPetClinic = async (payload) => {
  return await axios.post(url + '/reject-payment', { id: payload.id, note: payload.note });
};

// ─── Accept / Reject patient ───────────────────────────────────────────────
export const acceptTransactionPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('status', payload.status);
  formData.append('reason', payload.reason || '');

  return await axios.post(url + '/accept', formData);
};

// ─── Export ────────────────────────────────────────────────────────────────
export const exportTransactionPetClinic = async (payload) => {
  return await axios.get(url + '/export', {
    responseType: 'blob',
    params: {
      locationId: payload?.locationId?.length ? payload.locationId : [''],
      customerGroupId: payload?.customerGroupId?.length ? payload.customerGroupId : ['']
    }
  });
};

// ─── Rawat Inap — Treatment Plan ──────────────────────────────────────────
export const storeTreatmentPlanPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('treatmentPlans', JSON.stringify(payload.treatmentPlans));
  formData.append('services', JSON.stringify(payload.services ?? []));
  formData.append('products', JSON.stringify(payload.products ?? []));
  formData.append('estimatedDays', payload.estimatedDays ?? 1);
  formData.append('note', payload.note || '');

  return await axios.post(url + '/inpatient/treatment-plan', formData);
};

export const getTreatmentPlanPetClinic = async (transactionId) => {
  return await axios.get(url + '/inpatient/treatment-plan', { params: { transactionId } });
};

// ─── Rawat Inap — Policy Agreement ─────────────────────────────────────────
export const getPoliciesForAgreementPetClinic = async () => {
  return await axios.get(url + '/inpatient/policies');
};

export const savePolicyAgreementPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('signerName', payload.signerName);
  formData.append('signatureData', payload.signatureData);
  formData.append('policies', JSON.stringify(payload.policies));

  return await axios.post(url + '/inpatient/policy-agreement', formData);
};

// ─── Rawat Inap — Papan Kerja Harian ───────────────────────────────────────
export const getPapanKerjaHarianPetClinic = async (transactionId, tanggal = '') => {
  return await axios.get(url + '/inpatient/papan-kerja', { params: { transactionId, tanggal } });
};

export const markPapanKerjaHarianPetClinicDone = async (payload) => {
  const formData = new FormData();
  // Laravel tidak bisa parse multipart/form-data pada PUT request,
  // gunakan method spoofing: POST + _method=PUT
  formData.append('_method', 'PUT');
  formData.append('id', payload.id);
  formData.append('statusAktivitas', payload.statusAktivitas);
  if (payload.kondisiUmum) formData.append('kondisiUmum', payload.kondisiUmum);
  if (payload.nafsuMakan) formData.append('nafsuMakan', payload.nafsuMakan);
  if (payload.outputFeses) formData.append('outputFeses', payload.outputFeses);
  if (payload.outputUrin) formData.append('outputUrin', payload.outputUrin);
  if (payload.obatDiberikan !== undefined && payload.obatDiberikan !== null)
    formData.append('obatDiberikan', payload.obatDiberikan ? 1 : 0);
  if (payload.catatanObat) formData.append('catatanObat', payload.catatanObat);
  if (payload.catatan) formData.append('catatan', payload.catatan);
  if (payload.foto) formData.append('foto', payload.foto);
  return await axios.post(url + '/inpatient/papan-kerja/done', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ─── Rawat Inap — Additional Treatment ─────────────────────────────────────
export const getAdditionalTreatmentsPetClinic = async (transactionId) => {
  return await axios.get(url + '/inpatient/additional-treatments', { params: { transactionId } });
};

export const addAdditionalTreatmentPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('type', payload.type);
  formData.append('itemId', payload.itemId);
  formData.append('quantity', payload.quantity);
  formData.append('catatan', payload.catatan || '');

  return await axios.post(url + '/inpatient/additional-treatments', formData);
};

export const getAvailableItemsPetClinic = async (transactionId, type, search = '') => {
  return await axios.get(url + '/inpatient/available-items', { params: { transactionId, type, search } });
};

// ─── Rawat Inap — Prepayment / DP ──────────────────────────────────────────
export const getPrepaymentsPetClinic = async (transactionId) => {
  return await axios.get(url + '/inpatient/prepayments', { params: { transactionId } });
};

export const getEstimatedCostPetClinic = async (transactionId) => {
  return await axios.get(url + '/inpatient/estimated-cost', { params: { transactionId } });
};

export const addPrepaymentPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);
  formData.append('paymentMethodId', payload.paymentMethodId);
  formData.append('amount', payload.amount);
  formData.append('catatan', payload.catatan || '');
  if (payload.proof) formData.append('proof', payload.proof);

  return await axios.post(url + '/inpatient/prepayments', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getPrepaymentReceiptPetClinic = async (prepaymentId) => {
  return await axios.get(url + '/inpatient/prepayments/receipt', {
    responseType: 'blob',
    params: { id: prepaymentId }
  });
};

// ─── Rawat Inap — Inpatient Detail ─────────────────────────────────────────
export const getInpatientDetailPetClinic = async (transactionId) => {
  return await axios.get(url + '/inpatient/detail', { params: { transactionId } });
};

// ─── Rawat Inap — Initiate Checkout ────────────────────────────────────────
export const initiateCheckoutPetClinic = async (payload) => {
  const formData = new FormData();
  formData.append('transactionId', payload.transactionId);

  return await axios.post(url + '/inpatient/checkout', formData);
};

// ─── Rawat Inap — Payment Inpatient ────────────────────────────────────────
export const createPaymentPetClinicInpatient = async (transactionId, formValue, totalPrepaid = 0) => {
  const totalPayment = formValue.summaryTotalPayment - totalPrepaid;

  const detail_total = {
    subtotal: formValue.summarySubtotal,
    total_discount: formValue.summaryTotalDiscount,
    discount_based_sales: formValue.discountBasedSale,
    total_payment: totalPayment < 0 ? 0 : totalPayment,
    promoBasedSaleId: formValue.promoBasedSaleId
  };

  const payment_method = {
    paymentMethodId: formValue.paymentMethodId,
    amountPaid: totalPayment < 0 ? 0 : totalPayment
  };

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

  const formData = new FormData();
  formData.append('transactionPetClinicId', transactionId);
  formData.append('purchases', JSON.stringify(formValue.summaryList));
  formData.append('detail_total', JSON.stringify(detail_total));
  formData.append('payment_method', JSON.stringify(payment_method));

  return await axios.post(url + '/payment/inpatient', formData);
};

export const getActiveTodayPromos = async (locationId) => {
  return await axios.get('promotion/discount/active-today', { params: { locationId } });
};
