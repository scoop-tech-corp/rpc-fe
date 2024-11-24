import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { defaultCustomerForm, getAllState, useCustomerFormStore } from './customer-form-store';

import TabPanel from 'components/TabPanelC';
import CustomerFormHeader from './customer-form-header';
import MainCard from 'components/MainCard';
import TabPhoto from './tab/tab-photo';
import TabContacts from './tab/tab-contacts';
import TabAddress from './tab/tab-address';
import TabReminders from './tab/tab-reminders';
import TabPetInformation from './tab/tab-pet-information';
import TabInformation from './tab/tab-information';
import {
  getCustomerDetail,
  getCustomerGroupList,
  getOccupationList,
  getPetCategoryList,
  getReferenceList,
  getSourceList,
  getTitleList,
  getTypeIdList
} from 'pages/customer/service';
import { getDataStaticLocation, getProvinceLocation } from 'pages/location/location-list/detail/service';
import { getLocationList } from 'service/service-global';
import { jsonCentralized } from 'utils/func';
import { getCityList } from 'pages/location/location-list/detail/service';
import configGlobal from '../../../../config';

const CustomerForm = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [customerName, setCustomerName] = useState('');
  let { id } = useParams();

  const onChangeTab = (_, value) => setTabSelected(value);

  const getDropdownData = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getLoc = await getLocationList();
      const getTitle = await getTitleList();
      const getTypeId = await getTypeIdList();
      const getCustomerGroup = await getCustomerGroupList();
      const getOccupation = await getOccupationList();
      const getRef = await getReferenceList();
      const getPetCategory = await getPetCategoryList();
      const getSource = await getSourceList();
      const getProvince = await getProvinceLocation();
      const newConstruct = await getDataStaticLocation();

      useCustomerFormStore.setState({
        ...newConstruct,
        provinceList: getProvince,
        locationList: getLoc,
        titleCustomerList: getTitle,
        customerGroupList: getCustomerGroup,
        typeIdList: getTypeId,
        occupationList: getOccupation,
        referenceList: getRef,
        petCategoryList: getPetCategory,
        sourceList: getSource
      });

      resolve(true);
    });
  };

  const getDetail = async () => {
    const resp = await getCustomerDetail(id);
    const getData = resp.data;

    const petCategoryList = getAllState().petCategoryList;
    const newCustomerPets = getData.customerPets.map((dt) => {
      let newBirthDateType = (data) => {
        if (data === 'Birth Date') return 'birthDate';
        else if (data === 'Month and Year') return 'monthAndYear';
      };

      return {
        ...dt,
        petCategoryId: petCategoryList?.length ? petCategoryList.find((list) => list.value === +dt.petCategoryId) : null,
        birthDateType: newBirthDateType(dt.isbirthDate),
        command: '',
        error: {
          petNameErr: '',
          petCategoryErr: '',
          conditionErr: '',
          petGenderErr: '',
          isSterilErr: ''
        }
      };
    });

    const sourceList = getAllState().sourceList;
    const newReminderBooking = getData.reminderBooking.map((dt) => {
      return {
        ...dt,
        sourceId: sourceList?.length ? sourceList.find((source) => source.value === +dt.sourceId) : null
      };
    });

    const newReminderPayment = getData.reminderPayment.map((dt) => {
      return {
        ...dt,
        sourceId: sourceList?.length ? sourceList.find((source) => source.value === +dt.sourceId) : null
      };
    });

    const newReminderLatePayment = getData.reminderLatePayment.map((dt) => {
      return {
        ...dt,
        sourceId: sourceList?.length ? sourceList.find((source) => source.value === +dt.sourceId) : null
      };
    });

    const detailAddress = [];
    getData.detailAddresses.forEach(async (dt) => {
      const setCityList = dt.provinceCode ? await getCityList(+dt.provinceCode) : [];

      detailAddress.push({
        isPrimary: +dt.isPrimary ? true : false,
        streetAddress: dt.addressName,
        additionalInfo: dt.additionalInfo,
        country: dt.country,
        province: +dt.provinceCode,
        city: +dt.cityCode,
        postalCode: dt.postalCode,
        cityList: setCityList,
        error: { streetAddressErr: '', countryErr: '', provinceErr: '', cityErr: '' }
      });
    });

    const newTelephone = getData.telephones.map((dt) => {
      return {
        ...dt,
        error: { phoneUsageErr: '', phoneNumberErr: '', phoneTypeErr: '' }
      };
    });

    const newEmail = getData.emails.map((dt) => {
      return {
        ...dt,
        error: { emailUsageErr: '', emailAddressErr: '' }
      };
    });

    const newMessenger = getData.messengers.map((dt) => {
      return {
        ...dt,
        error: { messengerUsageErr: '', messengerUsageNameErr: '', messengerTypeErr: '' }
      };
    });

    const getImage = getData.images?.map((img) => ({
      ...img,
      label: img.labelName,
      imagePath: `${configGlobal.apiUrl}${img.imagePath}`,
      status: '',
      selectedFile: null
    }));

    setCustomerName(`${getData.firstName ?? ''} ${getData.middleName ?? ''} ${getData.lastName ?? ''}`);
    useCustomerFormStore.setState({
      memberNo: getData.memberNo,
      firstName: getData.firstName ?? '',
      middleName: getData.middleName ?? '',
      lastName: getData.lastName ?? '',
      nickName: getData.nickName ?? '',
      titleCustomerId: +getData.titleCustomerId,
      customerGroupId: +getData.customerGroupId,
      locationId: +getData.locationId,
      notes: getData.notes,
      gender: getData.gender,
      joinDate: getData.joinDate,
      typeId: +getData.typeId,
      numberId: getData.numberId,
      occupationId: +getData.occupationId,
      birthDate: getData.birthDate,
      referenceCustomerId: +getData.referenceCustomerId,
      customerPets: newCustomerPets,
      isReminderBooking: +getData.isReminderBooking ? true : false,
      isReminderPayment: +getData.isReminderPayment ? true : false,
      reminderBooking: newReminderBooking,
      reminderPayment: newReminderPayment,
      reminderLatePayment: newReminderLatePayment,
      detailAddresses: detailAddress,
      telephones: newTelephone,
      emails: newEmail,
      messengers: newMessenger,
      photos: getImage
    });
  };

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getDropdownData();
    if (id) getDetail();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getData();

    return () => {
      useCustomerFormStore.setState(jsonCentralized(defaultCustomerForm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <CustomerFormHeader customerName={customerName} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="customer form detail tab">
            <Tab label={<FormattedMessage id="information" />} id="customer-form-tab-0" aria-controls="customer-form-tabpanel-0" />
            <Tab label={<FormattedMessage id="pet-information" />} id="customer-form-tab-1" aria-controls="customer-form-tabpanel-1" />
            <Tab label={<FormattedMessage id="reminders" />} id="customer-form-tab-2" aria-controls="customer-form-tabpanel-2" />
            <Tab label={<FormattedMessage id="address" />} id="customer-form-tab-3" aria-controls="customer-form-tabpanel-3" />
            <Tab label={<FormattedMessage id="contacts" />} id="customer-form-tab-3" aria-controls="customer-form-tabpanel-3" />
            <Tab label={<FormattedMessage id="photos" />} id="customer-form-tab-3" aria-controls="customer-form-tabpanel-3" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="customer-form">
            <TabInformation />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="customer-form">
            <TabPetInformation />
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="customer-form">
            <TabReminders />
          </TabPanel>
          <TabPanel value={tabSelected} index={3} name="customer-form">
            <TabAddress />
          </TabPanel>
          <TabPanel value={tabSelected} index={4} name="customer-form">
            <TabContacts />
          </TabPanel>
          <TabPanel value={tabSelected} index={5} name="customer-form">
            <TabPhoto />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default CustomerForm;
