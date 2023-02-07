import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import ProductClinicDetailOverview from './overview';

const ProductClinicDetail = (props) => {
  const [tabSelected, setTabSelected] = useState(0);

  const onCancel = () => {
    props.onClose(true);
    setTabSelected(0);
  };

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`product-clinic-detail-tabpanel-${value}`} aria-labelledby={`product-clinic-detail-tab-${value}`}>
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
            <TabPanel value={tabSelected} index={0}>
              <ProductClinicDetailOverview data={props.data} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1}></TabPanel>
            <TabPanel value={tabSelected} index={2}></TabPanel>
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
