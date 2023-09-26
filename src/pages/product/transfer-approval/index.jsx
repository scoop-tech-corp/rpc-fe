import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getLocationList } from 'service/service-global';
import { useEffect, useState } from 'react';

import TabPanel from 'components/TabPanelC';
import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import TransferProduct from './tab-transfer-product';
import HistoryTransferProduct from './tab-history';

const ProductTransferApproval = (props) => {
  const [tabSelected, setTabSelected] = useState(0);
  const [filterLocationList, setFilterLocationList] = useState([]);

  const onCancel = () => {
    props.onClose(true);
    setTabSelected(0);
  };

  const onChangeTab = (value) => setTabSelected(value);

  const getLocation = async () => {
    const data = await getLocationList();
    setFilterLocationList(data);
  };

  useEffect(() => {
    getLocation();
    return () => {};
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="list-product-transfer" />}
      open={props.open}
      onCancel={onCancel}
      isModalAction={false}
      fullWidth
      maxWidth="xl"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={tabSelected}
          onChange={(_, value) => onChangeTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="product transfer list tab"
        >
          <Tab
            label={<FormattedMessage id="transfer-product" />}
            id="approval-product-transfer-list-tab-0"
            aria-controls="approval-product-transfer-list-tabpanel-0"
          />
          <Tab
            label={<FormattedMessage id="history" />}
            id="approval-product-transfer-list-tab-1"
            aria-controls="approval-product-transfer-list-tabpanel-1"
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        {props.open && (
          <>
            <TabPanel value={tabSelected} index={0} name="approval-product-transfer-list">
              <TransferProduct filterLocationList={filterLocationList} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1} name="approval-product-transfer-list">
              <HistoryTransferProduct filterLocationList={filterLocationList} />
            </TabPanel>
          </>
        )}
      </Box>
    </ModalC>
  );
};

ProductTransferApproval.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ProductTransferApproval;
