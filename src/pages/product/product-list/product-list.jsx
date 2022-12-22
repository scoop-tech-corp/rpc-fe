import MainCard from 'components/MainCard';
import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import HeaderCustom from 'components/@extended/HeaderPageCustom';
import ProductSell from './product-sell/product-sell-list';
import ProductClinic from './product-clinic/product-clinic-list';
import ProductInventory from './product-inventory/product-inventory-list';

const ProductList = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [searchParams] = useSearchParams();

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`product-list-tabpanel-${value}`} aria-labelledby={`product-list-tab-${value}`}>
        {value === index && <>{children}</>}
      </div>
    );
  };
  TabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number,
    index: PropTypes.number
  };

  const onChangeTab = (value) => setTabSelected(value);

  useEffect(() => {
    const getTab = +searchParams.get('tab');
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
          <TabPanel value={tabSelected} index={0}>
            <ProductSell />
          </TabPanel>
          <TabPanel value={tabSelected} index={1}>
            <ProductClinic />
          </TabPanel>
          <TabPanel value={tabSelected} index={2}>
            <ProductInventory />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default ProductList;
