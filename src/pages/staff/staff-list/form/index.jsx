import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import { defaultImage, defaultStaffForm, useStaffFormStore } from './staff-form-store';
import { jsonCentralized } from 'utils/func';
import { getLocationList } from 'service/service-global';
import { getJobTitleList, getPayPeriodList, getRolesIdList, getStaffDetail, getTypeIdList } from '../service';
import { getDataStaticLocation, getProvinceLocation } from 'pages/location/location-list/detail/service';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';

import MainCard from 'components/MainCard';
import StaffFormHeader from './staff-form-header';
import TabPanel from 'components/TabPanelC';
import TabDetail from './tab/tab-detail';
import TabSettings from './tab/tab-settings';
import TabAddress from './tab/tab-address';
import TabContacts from './tab/tab-contacts';
import configGlobal from '../../../../config';

const StaffForm = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [staffName, setStaffName] = useState('');
  let { id } = useParams();

  const onChangeTab = (_, value) => setTabSelected(value);

  const getDropdownData = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getLoc = await getLocationList();
      const getTypeId = await getTypeIdList();
      const getPayPeriod = await getPayPeriodList();
      const getJobTitle = await getJobTitleList();
      const newConstruct = await getDataStaticLocation();
      const getProvince = await getProvinceLocation();
      const getRolesId = await getRolesIdList();

      useStaffFormStore.setState({
        ...newConstruct,
        provinceList: getProvince,
        locationList: getLoc,
        typeIdList: getTypeId,
        payPeriodList: getPayPeriod,
        jobTitleList: getJobTitle,
        rolesIdList: getRolesId
      });

      resolve(true);
    });
  };

  const getDetail = async () => {
    const resp = await getStaffDetail(id);
    const getData = resp.data;

    setStaffName(`${getData.firstName} ${getData.middleName} ${getData.lastName}`);
    useStaffFormStore.setState({
      firstName: getData.firstName,
      middleName: getData.middleName,
      lastName: getData.lastName,
      nickName: getData.nickName,
      gender: getData.gender,
      status: getData.status,

      jobTitleId: +getData.jobTitleId,
      startDate: getData.startDate,
      endDate: getData.endDate,
      registrationNo: getData.registrationNo,
      designation: getData.designation,
      locationId: +getData.locationId,

      annualSickAllowance: getData.annualSickAllowance,
      annualLeaveAllowance: getData.annualLeaveAllowance ?? '',
      payPeriodId: +getData.payPeriodId,
      payAmount: getData.payAmount,

      typeId: +getData.typeId, // tipe kartu identitas
      identificationNumber: getData.identificationNumber,
      image: jsonCentralized(defaultImage),
      imagePath: getData.images[0] ? `${configGlobal.apiUrl}${getData.images[0].imagePath}` : '',
      additionalInfo: getData.additionalInfo,

      generalCustomerCanSchedule: +getData.generalCustomerCanSchedule ? true : false,
      generalCustomerReceiveDailyEmail: +getData.generalCustomerReceiveDailyEmail ? true : false,
      generalAllowMemberToLogUsingEmail: +getData.generalAllowMemberToLogUsingEmail ? true : false,
      reminderEmail: +getData.reminderEmail ? true : false,
      reminderWhatsapp: +getData.reminderWhatsapp ? true : false,
      roleId: getData.roleId,

      detailAddress: getData.detailAddress,
      telephone: getData.telephone,
      email: getData.email,
      messenger: getData.messenger
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
      useStaffFormStore.setState(jsonCentralized(defaultStaffForm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <StaffFormHeader staffName={staffName} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="staff form detail tab">
            <Tab label={<FormattedMessage id="details" />} id="staff-form-tab-0" aria-controls="staff-form-tabpanel-0" />
            <Tab label={<FormattedMessage id="settings" />} id="staff-form-tab-1" aria-controls="staff-form-tabpanel-1" />
            <Tab label={<FormattedMessage id="address" />} id="staff-form-tab-2" aria-controls="staff-form-tabpanel-2" />
            <Tab label={<FormattedMessage id="contacts" />} id="staff-form-tab-3" aria-controls="staff-form-tabpanel-3" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="staff-form">
            <TabDetail />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="staff-form">
            <TabSettings />
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="staff-form">
            <TabAddress />
          </TabPanel>
          <TabPanel value={tabSelected} index={3} name="staff-form">
            <TabContacts />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default StaffForm;
