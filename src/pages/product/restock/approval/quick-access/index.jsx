import { getLocationList } from 'service/service-global';
import { FormattedMessage } from 'react-intl';
import { useEffect, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { getSupplierList } from 'pages/product/product-list/service';

import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import ApprovalRestock from './approval-restock';
import PropTypes from 'prop-types';

const ProductRestockQuickAccessApproval = (props) => {
  const [tabSelected, setTabSelected] = useState(0);

  const [isDropdownReady, setIsDropdownReady] = useState(false);
  const [filterLocationList, setFilterLocationList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const onCancel = () => {
    props.onClose(true);
    setTabSelected(0);
  };

  const onChangeTab = (value) => setTabSelected(value);

  const getData = () => {
    Promise.all([getLocationList(), getSupplierList()]).then((resp) => {
      setFilterLocationList(resp[0]);
      setSupplierList(resp[1]);

      setIsDropdownReady(true);
    });
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="restock-approval" />}
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
          aria-label="restock approval list tab"
        >
          <Tab
            label={<FormattedMessage id="approval" />}
            id="approval-restock-list-tab-0"
            aria-controls="approval-restock-list-tabpanel-0"
          />
          <Tab
            label={<FormattedMessage id="history" />}
            id="approval-restock-list-tab-1"
            aria-controls="approval-restock-list-tabpanel-1"
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        {props.open && isDropdownReady && (
          <>
            <TabPanel value={tabSelected} index={0} name="approval-restock-list">
              <ApprovalRestock filterLocationList={filterLocationList} filterSupplierList={supplierList} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1} name="approval-restock-list"></TabPanel>
          </>
        )}
      </Box>
    </ModalC>
  );
};

ProductRestockQuickAccessApproval.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ProductRestockQuickAccessApproval;
