import { Box, Button, Tab, Tabs } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { PlusOutlined } from '@ant-design/icons';
import { getCustomerGroupList, getBrandList, getSupplierList, getProductCategoryList, createProductClinic } from '../../service';
import { getLocationList } from 'service/service-global';

import ProductClinicDetailContext from './product-clinic-detail-context';
import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import TabDetail from './tab/tab-detail/tab-detail';
import TabDescription from './tab/tab-description';
import TabCategories from './tab/tab-categories';
import TabReminders from './tab/tab-reminders';
import TabPhoto from './tab/tab-photo';

const ProductClinicDetail = () => {
  const { productClinicDetail, setProductClinicDetail, productClinicDetailError } = useContext(ProductClinicDetailContext);
  const [tabSelected, setTabSelected] = useState(0);
  const [productClinicName, setProductClinicName] = useState('');
  let { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getDropdownData = async () => {
    const getCustomer = await getCustomerGroupList();
    const getLoc = await getLocationList();
    const getBrand = await getBrandList();
    const getSupplier = await getSupplierList();
    const getCategory = await getProductCategoryList();

    setProductClinicDetail((value) => {
      return {
        ...value,
        dataSupport: {
          customerGroupsList: getCustomer,
          locationList: getLoc,
          brandList: getBrand,
          supplierList: getSupplier,
          productCategoryList: getCategory
        }
      };
    });
  };

  const getDetailProductClinic = async () => {
    setProductClinicName('');
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

  const onChangeTab = (event, value) => setTabSelected(value);

  const setTitlePage = id ? productClinicName : <FormattedMessage id="add-product-clinic" />;

  const onSubmit = async () => {
    if (productClinicDetailError) return;

    if (id) {
      // update process
    } else {
      await createProductClinic(productClinicDetail)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const message = id ? 'Success update product clinic' : 'Success create product clinic';
            dispatch(
              openSnackbar({
                open: true,
                message,
                variant: 'alert',
                alert: { color: 'success', severity: 'success' },
                duration: 1500,
                close: true
              })
            );
            navigate('/product/product-list?tab=1', { replace: true });
          }
        })
        .catch((err) => {
          let message = '';
          message += err.message;

          if (err.errors && Array.isArray(err.errors)) {
            err.errors.forEach((dt) => {
              message += '\n' + dt;
            });
          }

          dispatch(
            openSnackbar({
              open: true,
              message,
              variant: 'alert',
              alert: { color: 'error', severity: 'error' },
              duration: 3000,
              close: true
            })
          );
        });
    }
  };

  useEffect(() => {
    if (id) {
      getDetailProductClinic();
    }

    getDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list?tab=1' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={productClinicDetailError}>
            <FormattedMessage id="save" />
          </Button>
        }
      />

      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="product clinic detail tab">
            <Tab label="Details" id="product-clinic-tab-0" aria-controls="product-clinic-tabpanel-0" />
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

export default ProductClinicDetail;
