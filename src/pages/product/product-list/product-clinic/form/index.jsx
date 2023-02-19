import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { getCustomerGroupList, getBrandList, getSupplierList, getProductCategoryList, getProductClinicDetail } from '../../service';
import { getLocationList } from 'service/service-global';
import { defaultProductClinicForm, useProductClinicFormStore } from './product-clinic-form-store';
import { jsonCentralized } from 'utils/func';
import configGlobal from '../../../../../config';

import PropTypes from 'prop-types';
import ProductClinicFormHeader from './product-clinic-form-header';
import MainCard from 'components/MainCard';
import TabDetail from './tab/tab-detail/tab-detail';
import TabDescription from './tab/tab-description';
import TabCategories from './tab/tab-categories';
import TabReminders from './tab/tab-reminders';
import TabPhoto from './tab/tab-photo';

const ProductClinicForm = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [productClinicName, setProductClinicName] = useState('');
  let { id } = useParams();

  const getDropdownData = async () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getCustomer = await getCustomerGroupList();
      const getLoc = await getLocationList();
      const getBrand = await getBrandList();
      const getSupplier = await getSupplierList();
      const getCategory = await getProductCategoryList();

      useProductClinicFormStore.setState((prevState) => {
        return {
          ...prevState,
          dataSupport: {
            customerGroupsList: getCustomer,
            locationList: getLoc,
            brandList: getBrand,
            supplierList: getSupplier,
            productCategoryList: getCategory
          }
        };
      });
      resolve(true);
    });
  };

  const getDetail = async () => {
    await getProductClinicDetail(id).then((resp) => {
      const data = resp.data;

      setProductClinicName(data.fullName);

      const getImage = data.images?.map((img) => ({
        ...img,
        label: img.labelName,
        imagePath: `${configGlobal.apiUrl}${img.imagePath}`,
        status: '',
        selectedFile: null
      }));

      const dosage = data.dosages.map((dt) => {
        return {
          from: dt.fromWeight,
          to: dt.toWeight,
          dosage: dt.dosage,
          unit: dt.unit
        };
      });

      useProductClinicFormStore.setState((prevState) => {
        return {
          ...prevState,
          fullName: data.fullName,
          simpleName: data.simpleName,
          sku: data.details.sku,
          status: data.details.status,
          productBrand: +data.details.productBrandId
            ? prevState.dataSupport.brandList.find((b) => +b.value === +data.details.productBrandId)
            : prevState.productBrand,
          productSupplier: +data.details.productSupplierId
            ? prevState.dataSupport.supplierList.find((s) => +s.value === +data.details.productSupplierId)
            : prevState.productSupplier,
          expiredDate: '',

          pricingStatus: data.pricingStatus,
          costPrice: data.costPrice,
          marketPrice: data.marketPrice,
          price: data.price,

          customerGroups: data.customerGroups ?? [],
          priceLocations: data.priceLocations ?? [],
          quantities: data.quantities,

          isShipped: +data.isShipped,
          length: data.length,
          height: data.height,
          width: data.width,
          weight: data.weight,

          isCustomerPurchase: +data.setting.isCustomerPurchase ? true : false,
          isCustomerPurchaseOnline: +data.setting.isCustomerPurchaseOnline ? true : false,
          isCustomerPurchaseOutStock: +data.setting.isCustomerPurchaseOutStock ? true : false,
          isStockLevelCheck: +data.setting.isStockLevelCheck ? true : false,
          isNonChargeable: +data.setting.isNonChargeable ? true : false,
          isOfficeApproval: +data.setting.isOfficeApproval ? true : false,
          isAdminApproval: +data.setting.isAdminApproval ? true : false,

          introduction: data.introduction,
          description: data.description,
          dosage,

          // selectedClinicPrice: [],
          locations: data.location,
          categories: data.details.categories,
          reminders: data.reminders,
          photos: getImage
        };
      });
    });
  };

  const getData = async () => {
    await getDropdownData();
    if (id) getDetail();
  };

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`product-clinic-tabpanel-${value}`} aria-labelledby={`product-clinic-tab-${value}`}>
        {value === index && <>{children}</>}
      </div>
    );
  };
  TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

  const onChangeTab = (_, value) => setTabSelected(value);

  useEffect(() => {
    getData();

    return () => {
      useProductClinicFormStore.setState(jsonCentralized(defaultProductClinicForm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <ProductClinicFormHeader productClinicName={productClinicName} />

      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="product clinic form tab">
            <Tab label={<FormattedMessage id="details" />} id="product-clinic-tab-0" aria-controls="product-clinic-tabpanel-0" />
            <Tab label={<FormattedMessage id="description" />} id="product-clinic-tab-1" aria-controls="product-clinic-tabpanel-1" />
            <Tab label={<FormattedMessage id="category" />} id="product-clinic-tab-2" aria-controls="product-clinic-tabpanel-2" />
            <Tab label={<FormattedMessage id="photos" />} id="product-clinic-tab-3" aria-controls="product-clinic-tabpanel-3" />
            <Tab label={<FormattedMessage id="reminders" />} id="product-clinic-tab-4" aria-controls="product-clinic-tabpanel-4" />
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
            <TabCategories />
          </TabPanel>
          <TabPanel value={tabSelected} index={3}>
            <TabPhoto />
          </TabPanel>
          <TabPanel value={tabSelected} index={4}>
            <TabReminders />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default ProductClinicForm;
