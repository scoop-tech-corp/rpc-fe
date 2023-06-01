import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLocationList } from 'service/service-global';

import MainCard from 'components/MainCard';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import ProductSell from './product-sell/product-sell-list';
import ProductClinic from './product-clinic/product-clinic-list';
import ProductInventory from './product-inventory/product-inventory-list';
import TabPanel from 'components/TabPanelC';

const ProductList = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [searchParams] = useSearchParams();

  const onChangeTab = (value) => setTabSelected(value);

  const getDataFacilityLocation = async () => {
    const data = await getLocationList();
    setFacilityLocationList(data);
  };

  useEffect(() => {
    const getTab = +searchParams.get('tab');
    getDataFacilityLocation();
    if (getTab) {
      setTabSelected(getTab);
      window.history.pushState({ path: '/product/product-list' }, '', '/product/product-list');
    } else {
      setTabSelected(0);
    }
  }, [searchParams]);

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="product-list" />} isBreadcrumb={true} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="product list tab"
          >
            <Tab label={<FormattedMessage id="product-sell" />} id="product-list-tab-0" aria-controls="product-list-tabpanel-0" />
            <Tab label={<FormattedMessage id="product-clinic" />} id="product-list-tab-1" aria-controls="product-list-tabpanel-1" />
            <Tab label={<FormattedMessage id="product-inventory" />} id="product-list-tab-2" aria-controls="product-list-tabpanel-2" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="product-list">
            <ProductSell facilityLocationList={facilityLocationList} />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="product-list">
            <ProductClinic facilityLocationList={facilityLocationList} />
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="product-list">
            <ProductInventory facilityLocationList={facilityLocationList} />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default ProductList;
