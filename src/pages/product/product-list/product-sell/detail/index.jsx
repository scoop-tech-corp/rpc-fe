import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { getCustomerGroupList, getBrandList, getSupplierList, getProductCategoryList } from '../../service';
import { getLocationList } from 'service/service-global';
import { useProductSellDetailStore } from './product-sell-detail-store';

import PropTypes from 'prop-types';
import ProductSellDetailHeader from './product-sell-detail-header';
import MainCard from 'components/MainCard';
import TabDetail from './tab/tab-detail/tab-detail';
import TabDescription from './tab/tab-description';
import TabCategories from './tab/tab-categories';
import TabReminders from './tab/tab-reminders';
import TabPhoto from './tab/tab-photo';

const ProductSellDetail = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [productSellName, setProductSellName] = useState('');
  let { id } = useParams();

  const getDropdownData = async () => {
    const getCustomer = await getCustomerGroupList();
    const getLoc = await getLocationList();
    const getBrand = await getBrandList();
    const getSupplier = await getSupplierList();
    const getCategory = await getProductCategoryList();

    useProductSellDetailStore.setState((prevState) => {
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

  const getDetailProductSell = async () => setProductSellName('');

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`product-sell-tabpanel-${value}`} aria-labelledby={`product-sell-tab-${value}`}>
        {value === index && <>{children}</>}
      </div>
    );
  };
  TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

  const onChangeTab = (_, value) => setTabSelected(value);

  useEffect(() => {
    getDropdownData();

    if (id) {
      getDetailProductSell();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <ProductSellDetailHeader productSellName={productSellName} />

      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="product sell detail tab">
            <Tab label="Details" id="product-sell-tab-0" aria-controls="product-sell-tabpanel-0" />
            <Tab label={<FormattedMessage id="description" />} id="product-sell-tab-1" aria-controls="product-sell-tabpanel-1" />
            <Tab label={<FormattedMessage id="category" />} id="product-sell-tab-2" aria-controls="product-sell-tabpanel-2" />
            <Tab label={<FormattedMessage id="photos" />} id="product-sell-tab-3" aria-controls="product-sell-tabpanel-3" />
            <Tab label={<FormattedMessage id="reminders" />} id="product-sell-tab-4" aria-controls="product-sell-tabpanel-4" />
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

export default ProductSellDetail;
