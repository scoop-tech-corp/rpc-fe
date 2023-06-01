import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Box, Tab, Tabs } from '@mui/material';
import { getLocationList } from 'service/service-global';
import { useEffect, useState } from 'react';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import TabPanel from 'components/TabPanelC';
import CategoryDetailContent from './content-tab';

const ProductCategoryDetail = (props) => {
  const [tabSelected, setTabSelected] = useState(0);
  const [filterLocationList, setFilterLocationList] = useState([]);

  const onChangeTab = (value) => setTabSelected(value);
  const onCancel = () => props.onClose(false);

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
      title={<FormattedMessage id="detail-category" />}
      open={props.open}
      isModalAction={false}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: 650 } }}
      maxWidth="xl"
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <InputLabel>{<FormattedMessage id="category-name" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          {props.data.categoryName}
        </Grid>
        <Grid item xs={12} sm={3}>
          <InputLabel>{<FormattedMessage id="expired-day" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          {props.data.expiredDay}&nbsp;
          <FormattedMessage id="day" />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs
              value={tabSelected}
              onChange={(_, value) => onChangeTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="product category detail list tab"
            >
              <Tab
                label={<FormattedMessage id="product-sell" />}
                id="product-category-detail-list-tab-0"
                aria-controls="product-category-detail-list-tabpanel-0"
              />
              <Tab
                label={<FormattedMessage id="product-clinic" />}
                id="product-category-detail-list-tab-1"
                aria-controls="product-category-detail-list-tabpanel-1"
              />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2.5 }}>
            {props.open && (
              <>
                <TabPanel value={tabSelected} index={0} name="product-category-detail-list">
                  <CategoryDetailContent data={{ ...props.data, productType: 'sell' }} filterLocationList={filterLocationList} />
                </TabPanel>
                <TabPanel value={tabSelected} index={1} name="product-category-detail-list">
                  <CategoryDetailContent data={{ ...props.data, productType: 'clinic' }} filterLocationList={filterLocationList} />
                </TabPanel>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </ModalC>
  );
};

ProductCategoryDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ProductCategoryDetail;
