import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import TabPanel from 'components/TabPanelC';
import ProductClinicDetailOverview from './overview';
import ProductLogTransaction from '../../components/LogTransaction';

const ProductClinicDetail = (props) => {
  const [tabSelected, setTabSelected] = useState(0);

  const onCancel = (isRefreshIndex) => {
    props.onClose({ isOpen: true, isRefreshIndex: typeof isRefreshIndex === 'string' ? +isRefreshIndex : false });
    setTabSelected(0);
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
          aria-label="product clinic detail tab"
        >
          <Tab
            label={<FormattedMessage id="overview" />}
            id="product-clinic-detail-tab-0"
            aria-controls="product-clinic-detail-tabpanel-0"
          />
          <Tab
            label={<FormattedMessage id="batch-stock" />}
            id="product-clinic-detail-tab-1"
            aria-controls="product-clinic-detail-tabpanel-1"
          />
          <Tab
            label={<FormattedMessage id="log-transaction" />}
            id="product-clinic-detail-tab-2"
            aria-controls="product-clinic-detail-tabpanel-2"
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 1.25 }}>
        {props.open && (
          <>
            <TabPanel value={tabSelected} index={0} name="product-clinic-detail">
              <ProductClinicDetailOverview data={props.data} output={(e) => outputOverviewHandler(e)} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1} name="product-clinic-detail"></TabPanel>
            <TabPanel value={tabSelected} index={2} name="product-clinic-detail">
              <ProductLogTransaction data={{ ...props.data, productType: 'productClinic' }} />
            </TabPanel>
          </>
        )}
      </Box>
    </ModalC>
  );
};

ProductClinicDetail.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  data: PropTypes.object
};

export default ProductClinicDetail;
