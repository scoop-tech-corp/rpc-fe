import { Box, Button, Tab, Tabs } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { PlusOutlined } from '@ant-design/icons';
import { getCustomerGroupList, getBrandList, getSupplierList, getProductCategoryList, createProductSell } from '../../service';
import { getLocationList } from 'service/service-global';

import ProductSellDetailContext from './product-sell-detail-context';
import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import TabDetail from './tab/tab-detail/tab-detail';
import TabDescription from './tab/tab-description';
import TabCategories from './tab/tab-categories';
import TabReminders from './tab/tab-reminders';
import TabPhoto from './tab/tab-photo';

const ProductSellDetail = () => {
  const { productSellDetail, setProductSellDetail, productSellDetailError } = useContext(ProductSellDetailContext);
  const [tabSelected, setTabSelected] = useState(0);
  const [productSellName, setProductSellName] = useState('');
  let { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getDropdownData = async () => {
    const getCustomer = await getCustomerGroupList();
    const getLoc = await getLocationList();
    const getBrand = await getBrandList();
    const getSupplier = await getSupplierList();
    const getCategory = await getProductCategoryList();

    setProductSellDetail((value) => {
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

  const getDetailProductSell = async () => {
    setProductSellName('');
  };

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`product-sell-tabpanel-${value}`} aria-labelledby={`product-sell-tab-${value}`}>
        {value === index && <>{children}</>}
      </div>
    );
  };
  TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

  const onChangeTab = (event, value) => setTabSelected(value);

  const setTitlePage = id ? productSellName : <FormattedMessage id="add-product-sell" />;

  const onSubmit = async () => {
    if (productSellDetailError) return;

    if (id) {
      // update process
    } else {
      await createProductSell(productSellDetail)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const message = id ? 'Success update product sell' : 'Success create product sell';
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
            navigate('/product/product-list', { replace: true });
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
      getDetailProductSell();
    }

    getDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={productSellDetailError}>
            <FormattedMessage id="save" />
          </Button>
        }
      />

      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="product sell detail tab">
            <Tab label="Details" id="product-sell-tab-0" aria-controls="product-sell-tabpanel-0" />
            <Tab label={<FormattedMessage id="description" />} id="product-sell-tab-1" aria-controls="product-sell-tabpanel-1" />
            <Tab label={<FormattedMessage id="category" />} id="product-sell-tab-2" aria-controls="product-sell-tabpanel-2" />
            <Tab label={<FormattedMessage id="photos" />} id="product-sell-tab-3" aria-controls="product-sell-tabpanel-3" />
            <Tab label={<FormattedMessage id="reminders" />} id="product-sell-tab-4" aria-controls="product-sell-tabpanel-4" />
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

export default ProductSellDetail;
