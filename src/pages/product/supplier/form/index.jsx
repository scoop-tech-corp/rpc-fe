import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { getProvinceLocation } from 'pages/location/location-list/detail/service';
import { defaultProductSupplierForm, useProductSupplierFormStore } from './product-supplier-form-store';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { jsonCentralized } from 'utils/func';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { getProductSupplierMessenger, getProductSupplierPhone, getProductSupplierUsage } from '../service';

import ProductSupplierFormHeader from './product-supplier-form-header';
import MainCard from 'components/MainCard';
import TabPanel from 'components/TabPanelC';
import TabContacts from './tab/tab-contacts';
import TabAddress from './tab/tab-address';
import TabDetails from './tab/tab-details';

const ProductSupplierForm = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [productSupplierName, setProductSupplierName] = useState('');
  let { id } = useParams();

  const onChangeTab = (_, value) => setTabSelected(value);

  const getDropdownData = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getProvince = await getProvinceLocation();
      const getUsageList = await getProductSupplierUsage();
      const getPhoneList = await getProductSupplierPhone();
      const getMessengerList = await getProductSupplierMessenger();

      useProductSupplierFormStore.setState({
        provinceList: getProvince,
        usageList: getUsageList,
        telephoneType: getPhoneList,
        messengerType: getMessengerList
      });

      resolve(true);
    });
  };

  const getDetail = async () => {
    setProductSupplierName();
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
      useProductSupplierFormStore.setState(jsonCentralized(defaultProductSupplierForm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <ProductSupplierFormHeader productSupplierName={productSupplierName} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={onChangeTab}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="product supplier form detail tab"
          >
            <Tab
              label={<FormattedMessage id="details" />}
              id="product-supplier-form-tab-0"
              aria-controls="product-supplier-form-tabpanel-0"
            />
            <Tab
              label={<FormattedMessage id="address" />}
              id="product-supplier-form-tab-2"
              aria-controls="product-supplier-form-tabpanel-2"
            />
            <Tab
              label={<FormattedMessage id="contacts" />}
              id="product-supplier-form-tab-3"
              aria-controls="product-supplier-form-tabpanel-3"
            />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="product-supplier-form">
            <TabDetails />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="product-supplier-form">
            <TabAddress />
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="product-supplier-form">
            <TabContacts />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default ProductSupplierForm;
