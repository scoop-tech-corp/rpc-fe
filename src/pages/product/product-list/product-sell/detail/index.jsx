import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import ProductSellDetailOverview from './overview';

const ProductSellDetail = (props) => {
  const [tabSelected, setTabSelected] = useState(0);

  const onCancel = (isRefreshIndex) => {
    props.onClose({ isOpen: true, isRefreshIndex: typeof isRefreshIndex === 'string' ? +isRefreshIndex : false });
    setTabSelected(0);
  };

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`product-sell-detail-tabpanel-${value}`} aria-labelledby={`product-sell-detail-tab-${value}`}>
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

  const outputOverviewHandler = (event) => {
    if (event === 'closeOverview') onCancel('1');
  };

  return (
    <ModalC title={props.title} open={props.open} onCancel={onCancel} isModalAction={false} fullWidth maxWidth="lg">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={tabSelected}
          onChange={(_, value) => onChangeTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="product sell detail tab"
        >
          <Tab label={<FormattedMessage id="overview" />} id="product-sell-detail-tab-0" aria-controls="product-sell-detail-tabpanel-0" />
          <Tab
            label={<FormattedMessage id="batch-stock" />}
            id="product-sell-detail-tab-1"
            aria-controls="product-sell-detail-tabpanel-1"
          />
          <Tab
            label={<FormattedMessage id="log-transaction" />}
            id="product-sell-detail-tab-2"
            aria-controls="product-sell-detail-tabpanel-2"
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 1.25 }}>
        {props.open && (
          <>
            <TabPanel value={tabSelected} index={0}>
              <ProductSellDetailOverview data={props.data} output={(e) => outputOverviewHandler(e)} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1}></TabPanel>
            <TabPanel value={tabSelected} index={2}></TabPanel>
          </>
        )}
      </Box>
    </ModalC>
  );
};

ProductSellDetail.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  data: PropTypes.object
};

export default ProductSellDetail;
