import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import configGlobal from '../../../config';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import TabPanel from 'components/TabPanelC';
// import CategoryDetailContent from './content-tab';
import { getLocationList, getCustomerGroupList } from 'service/service-global';

import MainCard from 'components/MainCard';
import TabDetail from './form/tab/tab-detail/tab-detail';
import TabDescription from './form/tab/tab-description';
import TabCategories from './form/tab/tab-categories';
import TabBooking from './form/tab/tab-booking/tab-booking';
import TabStaff from './form/tab/tab-staff/tab-staff';
import TabFacility from './form/tab/tab-facility';
import TabPhoto from './form/tab/tab-photo';
import ServiceListFormHeader from './form/service-list-form-header';
import useGetDetail from 'hooks/useGetDetail';
import { getServiceListById, getServiceCategoryList, getServiceListFollowup } from './service';

import { useServiceFormStore } from './form/service-form-store';

const ProductCategoryDetail = (props) => {
  const [tabSelected, setTabSelected] = useState(0);
  const detail = useGetDetail(getServiceListById, 'id', props.data?.id);
  const [filterLocationList, setFilterLocationList] = useState([]);

  useEffect(() => {
    useServiceFormStore.setState({
      ...detail.detail,
      isDetail: true,
      originalName: detail.detail?.fullName,
      productRequired: detail.detail?.product_required_list?.map((item) => {
        return {
          productType: item?.product_type,
          productList: item?.product_name,
          quantity: item?.quantity
        };
      }),
      location: detail.detail?.location_list?.map((item) => {
        return {
          id: item.locationId,
          value: item.locationId,
          label: item.locationName
        };
        // return item.locationId;
      }),
      listPrice: detail.detail?.price_list?.map((item) => {
        return {
          ...item,
          customerGroup: item?.customer_group
        };
      }),
      listStaff: detail.detail?.staff_list,
      facility: detail.detail?.facility_list?.map((item) => {
        return {
          value: item.id,
          label: item.unitName
        };
      }),
      categories: detail.detail?.category_list?.map((item) => {
        return {
          value: item.id,
          label: item.categoryName
        };
      }),
      followup: detail.detail?.followup_list?.map((item) => {
        return { id: item.id, value: item.service_id, label: item.fullName, created_at: item.created_at };
      }),
      photos: detail.detail?.image_list?.map((item) => {
        return {
          id: item.id,
          label: item.labelName,
          imagePath: `${configGlobal.apiUrl}${item.imagePath}`,
          status: '',
          originalName: item.realImageName,
          selectedFile: null
        };
      })
    });
  }, [detail]);
  const getDropdownData = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getCustomer = await getCustomerGroupList();
      const getLoc = await getLocationList();
      const getCategory = await getServiceCategoryList();
      const getService = await getServiceListFollowup();

      useServiceFormStore.setState((prevState) => {
        return {
          ...prevState,
          dataSupport: {
            customerGroupsList: getCustomer,
            locationList: getLoc,
            categoryList: getCategory,
            serviceList: getService
          }
        };
      });
      resolve(true);
    });
  };

  const getData = async () => {
    await getDropdownData();
  };

  useEffect(() => {
    getData();
  }, []);

  const onCancel = () => props.onClose(false);

  return (
    <ModalC
      title={<ServiceListFormHeader setParams={props.setParams} onClose={onCancel} />}
      open={props.open}
      isModalAction={false}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '90%', maxHeight: 650 } }}
      maxWidth="xl"
    >
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} variant="scrollable" scrollButtons="auto" aria-label="product sell detail tab">
            <Tab
              label={<FormattedMessage id="details" />}
              onClick={() => {
                setTabSelected(0);
              }}
              id="service-list-tab-0"
              aria-controls="service-list-tabpanel-0"
            />
            <Tab
              label={<FormattedMessage id="description" />}
              onClick={() => {
                setTabSelected(1);
              }}
              id="service-list-tab-1"
              aria-controls="service-list-tabpanel-1"
            />
            <Tab
              label={<FormattedMessage id="booking" />}
              onClick={() => {
                setTabSelected(2);
              }}
              id="service-list-tab-2"
              aria-controls="service-list-tabpanel-2"
            />
            <Tab
              label={<FormattedMessage id="staff" />}
              onClick={() => {
                setTabSelected(3);
              }}
              id="service-list-tab-4"
              aria-controls="service-list-tabpanel-4"
            />
            <Tab
              label={<FormattedMessage id="facility" />}
              onClick={() => {
                setTabSelected(4);
              }}
              id="service-list-tab-5"
              aria-controls="service-list-tabpanel-5"
            />
            <Tab
              label={<FormattedMessage id="category" />}
              onClick={() => {
                setTabSelected(5);
              }}
              id="service-list-tab-6"
              aria-controls="service-list-tabpanel-6"
            />
            <Tab
              label={<FormattedMessage id="photos" />}
              onClick={() => {
                setTabSelected(6);
              }}
              id="service-list-tab-7"
              aria-controls="service-list-tabpanel-7"
            />
          </Tabs>
        </Box>
        <div className="detailModal">
          <Box sx={{ mt: 2.5 }}>
            <TabPanel value={tabSelected} index={0}>
              <TabDetail />
            </TabPanel>
            <TabPanel value={tabSelected} index={1}>
              <TabDescription />
            </TabPanel>
            <TabPanel value={tabSelected} index={2}>
              <TabBooking />
            </TabPanel>
            <TabPanel value={tabSelected} index={3}>
              <TabStaff />
            </TabPanel>
            <TabPanel value={tabSelected} index={4}>
              <TabFacility />
            </TabPanel>
            <TabPanel value={tabSelected} index={5}>
              <TabCategories />
            </TabPanel>
            <TabPanel value={tabSelected} index={6}>
              <TabPhoto />
            </TabPanel>
          </Box>
        </div>
      </MainCard>
    </ModalC>
  );
};

ProductCategoryDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ProductCategoryDetail;
