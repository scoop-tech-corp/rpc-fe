import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import RequestProduct from './request';
import History from './history';

const ProductInventoryApproval = (props) => {
  const [tabSelected, setTabSelected] = useState(0);
  const onCancel = () => {
    props.onClose(true);
    setTabSelected(0);
  };
  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`approval-inventory-list-tabpanel-${value}`} aria-labelledby={`approval-inventory-list-tab-${value}`}>
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
    return () => {};
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="list-request-product-inventory" />}
      open={props.open}
      onCancel={onCancel}
      isModalAction={false}
      fullWidth
      maxWidth="lg"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={tabSelected}
          onChange={(_, value) => onChangeTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="product list tab"
        >
          <Tab
            label={<FormattedMessage id="request-product" />}
            id="approval-inventory-list-tab-0"
            aria-controls="approval-inventory-list-tabpanel-0"
          />
          <Tab
            label={<FormattedMessage id="history" />}
            id="approval-inventory-list-tab-1"
            aria-controls="approval-inventory-list-tabpanel-1"
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        {props.open && (
          <>
            <TabPanel value={tabSelected} index={0}>
              <RequestProduct />
            </TabPanel>
            <TabPanel value={tabSelected} index={1}>
              <History />
            </TabPanel>
          </>
        )}
      </Box>
    </ModalC>
  );
};

ProductInventoryApproval.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ProductInventoryApproval;
