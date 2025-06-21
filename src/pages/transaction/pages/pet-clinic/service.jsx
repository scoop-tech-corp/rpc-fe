import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

export const TabList = {
  'rawat-jalan': 0,
  'rawat-inap': 1,
  finished: 2
};

export const TYPE_OF_CARE = {
  1: 'Rawat Jalan',
  2: 'Rawat Inap'
};

const url = 'transaction/petclinic';

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
      customerGroupId: payload.customerGroupId
    }
  });
};

export const deleteTransactionPetClinic = async (id) => {
  return await axios.delete(url, {
    data: { id }
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

  return await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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

  for (const pair of formData.entries()) console.log(pair[0] + ', ' + pair[1]);

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

export const createServiceAndRecipe = async (payload) => {
  const formData = new FormData();
  const services = payload.services.map((dt) => +dt.serviceId);
  const recipes = payload.summary.map((dt) => ({
    productId: dt.productClinicId,
    dosage: +dt.dosage,
    unit: dt.unit,
    frequency: +dt.frequency,
    giveMedicine: dt.medication
  }));

  formData.append('transactionPetClinicId', payload.transactionPetClinicId);

  services.forEach((dt) => formData.append('services[]', dt));
  formData.append('recipes', JSON.stringify(recipes));

  return await axios.post(url + '/serviceandrecipe', formData);
};
