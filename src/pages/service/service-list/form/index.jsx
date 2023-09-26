import { Box, Tab, Tabs } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { getLocationList, getCustomerGroupList } from 'service/service-global';
import { defaultServiceListForm, useServiceFormStore } from './service-form-store';
import configGlobal from '../../../../config';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import TabDetail from './tab/tab-detail/tab-detail';
import TabDescription from './tab/tab-description';
import TabCategories from './tab/tab-categories';
import TabBooking from './tab/tab-booking/tab-booking';
import TabStaff from './tab/tab-staff/tab-staff';
import TabFacility from './tab/tab-facility';
import TabPhoto from './tab/tab-photo';
import ServiceListFormHeader from './service-list-form-header';
import { getServiceCategoryList, getServiceListById, getServiceListFollowup } from '../service';
import useGetDetail from 'hooks/useGetDetail';

const ServiceListForm = () => {
  const [tabSelected, setTabSelected] = useState(0);

  let { id } = useParams();

  const detail = useGetDetail(getServiceListById, 'id', id);

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
    if (detail.detail)
      useServiceFormStore.setState({
        ...detail.detail,
        isDetail: false,
        originalName: detail.detail?.fullName,
        productRequired: detail.detail?.product_required_list?.map((item) => {
          return {
            ...item,
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
            customerGroup: item?.customer_group,
            value: item?.id
          };
        }),
        listStaff: detail.detail?.staff_list,
        facility: detail.detail?.facility_list?.map((item) => {
          return {
            ...item,
            value: item.facility_id,
            label: item.unitName
          };
        }),
        categories: detail.detail?.category_list?.map((item) => {
          return {
            ...item,
            id: item.id,
            value: item.category_id,
            label: item.categoryName
          };
        }),
        followup: detail.detail?.followup_list?.map((item) => {
          return { id: item.id, value: item.service_id, label: item.fullName, created_at: item.created_at };
        }),
        photos: detail.detail?.image_list?.map((item) => {
          return {
            ...item,
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

  useEffect(() => {
    useServiceFormStore.setState(defaultServiceListForm);
  }, []);

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`service-list-tabpanel-${value}`} aria-labelledby={`service-list-tab-${value}`}>
        {value === index && <>{children}</>}
      </div>
    );
  };
  TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

  const onChangeTab = (_, value) => setTabSelected(value);

  useEffect(() => {
    getData();
  }, [id]);

  return (
    <>
      <ServiceListFormHeader />

      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="product sell detail tab">
            <Tab label={<FormattedMessage id="details" />} id="service-list-tab-0" aria-controls="service-list-tabpanel-0" />
            <Tab label={<FormattedMessage id="description" />} id="service-list-tab-1" aria-controls="service-list-tabpanel-1" />
            <Tab label={<FormattedMessage id="booking" />} id="service-list-tab-2" aria-controls="service-list-tabpanel-2" />
            <Tab label={<FormattedMessage id="staff" />} id="service-list-tab-4" aria-controls="service-list-tabpanel-4" />
            <Tab label={<FormattedMessage id="facility" />} id="service-list-tab-5" aria-controls="service-list-tabpanel-5" />
            <Tab label={<FormattedMessage id="category" />} id="service-list-tab-6" aria-controls="service-list-tabpanel-6" />
            <Tab label={<FormattedMessage id="photos" />} id="service-list-tab-7" aria-controls="service-list-tabpanel-7" />
          </Tabs>
        </Box>
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
      </MainCard>
    </>
  );
};

export default ServiceListForm;
