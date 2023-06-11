import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { getProductRestockDetail } from '../service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import TabPanel from 'components/TabPanelC';
import ProductRestockDetailAction from './action-detail';
import ProductRestockDetailOverview from './overview';
import ProductRestockDetailHistory from './history';

const ProductRestockDetail = (props) => {
  const [tabSelected, setTabSelected] = useState(0);
  const [dataDetail, setDataDetail] = useState();

  const onCancel = () => {
    props.onClose();
    setTabSelected(0);
  };

  const onChangeTab = (value) => setTabSelected(value);

  const getDetail = async () => {
    const getResp = await getProductRestockDetail(props.id);
    setDataDetail({ id: props.id, ...getResp.data });
  };

  const catchOutputOverview = (event) => {
    if (event === 'trigerData') {
      getDetail();
    }
  };

  useEffect(() => {
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="detail-restock" />}
      open={props.open}
      onCancel={onCancel}
      isModalAction={false}
      fullWidth
      maxWidth="lg"
      action={{
        element: <ProductRestockDetailAction id={props.id} />,
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={tabSelected}
          onChange={(_, value) => onChangeTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="product restock detail tab"
        >
          <Tab
            label={<FormattedMessage id="overview" />}
            id="product-restock-detail-tab-0"
            aria-controls="product-restock-detail-tabpanel-0"
          />
          <Tab
            label={<FormattedMessage id="history" />}
            id="product-restock-detail-tab-1"
            aria-controls="product-restock-detail-tabpanel-1"
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        {props.open && (
          <>
            <TabPanel value={tabSelected} index={0} name="product-restock-detail">
              <ProductRestockDetailOverview data={dataDetail} output={catchOutputOverview} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1} name="product-restock-detail">
              <ProductRestockDetailHistory id={props.id} />
            </TabPanel>
          </>
        )}
      </Box>
    </ModalC>
  );
};

ProductRestockDetail.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  id: PropTypes.number
};

export default ProductRestockDetail;
