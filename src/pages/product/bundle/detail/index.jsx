import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { getProductBundleDetail } from '../service';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import ProductBundleDetailHistory from './history';
import ProductBundleDetailOverview from './overview';
import ProductBundleDetailAction from './action-detail';

const ProductBundleDetail = (props) => {
  const [tabSelected, setTabSelected] = useState(0);
  const [dataDetail, setDataDetail] = useState({ detailBundle: [], productBundle: null, history: [] });

  const onCancel = () => {
    props.onClose({ isClose: true });
    setTabSelected(0);
  };

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`detail-bundle-tabpanel-${value}`} aria-labelledby={`detail-bundle-tab-${value}`}>
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

  const getDetail = async () => {
    const getData = await getProductBundleDetail(props.id);
    setDataDetail(getData.data);
  };

  useEffect(() => {
    if (props.id) getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  return (
    <ModalC
      title="Detail Bundle"
      open={props.open}
      onCancel={onCancel}
      isModalAction={false}
      fullWidth
      maxWidth="lg"
      action={{
        element: (
          <ProductBundleDetailAction
            id={props.id}
            status={dataDetail.productBundle?.status}
            getDetail={getDetail}
            onCancelDetail={() => {
              props.onClose({ isClose: true, isCloseWithHitIndex: true });
              setTabSelected(0);
            }}
          />
        ),
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
          aria-label="product list tab"
        >
          <Tab label={<FormattedMessage id="overview" />} id="detail-bundle-tab-0" aria-controls="detail-bundle-tabpanel-0" />
          <Tab label={<FormattedMessage id="history" />} id="detail-bundle-tab-1" aria-controls="detail-bundle-tabpanel-1" />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        {props.open && (
          <>
            <TabPanel value={tabSelected} index={0}>
              <ProductBundleDetailOverview data={dataDetail} />
            </TabPanel>
            <TabPanel value={tabSelected} index={1}>
              <ProductBundleDetailHistory data={dataDetail.history} />
            </TabPanel>
          </>
        )}
      </Box>
    </ModalC>
  );
};

ProductBundleDetail.propTypes = {
  id: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ProductBundleDetail;
