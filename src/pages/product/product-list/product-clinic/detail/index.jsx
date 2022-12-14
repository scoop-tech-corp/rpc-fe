import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { getCustomerGroupList, getBrandList, getSupplierList, getProductCategoryList } from '../../service';
import { getLocationList } from 'service/service-global';
import { useProductClinicDetailStore } from './product-clinic-detail-store';

import PropTypes from 'prop-types';
import ProductClinicDetailHeader from './product-clinic-detail-header';
import MainCard from 'components/MainCard';
import TabDetail from './tab/tab-detail/tab-detail';
import TabDescription from './tab/tab-description';
import TabCategories from './tab/tab-categories';
import TabReminders from './tab/tab-reminders';
import TabPhoto from './tab/tab-photo';

const ProductClinicDetail = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [productClinicName, setProductClinicName] = useState('');
  let { id } = useParams();

  const getDropdownData = async () => {
    const getCustomer = await getCustomerGroupList();
    const getLoc = await getLocationList();
    const getBrand = await getBrandList();
    const getSupplier = await getSupplierList();
    const getCategory = await getProductCategoryList();

    useProductClinicDetailStore.setState((prevState) => {
      return {
        ...prevState,
        dataSupport: {
          customerGroupsList: getCustomer,
          locationList: getLoc,
          brandList: getBrand,
          supplierList: getSupplier,
          productCategoryList: getCategory
        }
      };
    });
  };

  const getDetailProductClinic = async () => setProductClinicName('');

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`product-clinic-tabpanel-${value}`} aria-labelledby={`product-clinic-tab-${value}`}>
        {value === index && <>{children}</>}
      </div>
    );
  };
  TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

  const onChangeTab = (_, value) => setTabSelected(value);

  useEffect(() => {
    getDropdownData();

    if (id) {
      getDetailProductClinic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <ProductClinicDetailHeader productClinicName={productClinicName} />

      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="product clinic detail tab">
            <Tab label="Details" id="product-clinic-tab-0" aria-controls="product-clinic-tabpanel-0" />
            <Tab label={<FormattedMessage id="description" />} id="product-clinic-tab-1" aria-controls="product-clinic-tabpanel-1" />
            <Tab label={<FormattedMessage id="category" />} id="product-clinic-tab-2" aria-controls="product-clinic-tabpanel-2" />
            <Tab label={<FormattedMessage id="photos" />} id="product-clinic-tab-3" aria-controls="product-clinic-tabpanel-3" />
            <Tab label={<FormattedMessage id="reminders" />} id="product-clinic-tab-4" aria-controls="product-clinic-tabpanel-4" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0}>
            <TabDetail />
          </TabPanel>
          <TabPanel value={tabSelected} index={1}>
            <TabDescription />
          </TabPanel>
          <TabPanel value={tabSelected} index={2}>
            <TabCategories />
          </TabPanel>
          <TabPanel value={tabSelected} index={3}>
            <TabPhoto />
          </TabPanel>
          <TabPanel value={tabSelected} index={4}>
            <TabReminders />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default ProductClinicDetail;
