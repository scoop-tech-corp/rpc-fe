import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { defaultBundleForm, getAllState, useProductBundleFormStore } from './bundle-form-store';
import { getProductCategoryList, getProductClinicDropdown } from 'pages/product/product-list/service';
import { useParams } from 'react-router';
import { getProductBundleDetail } from '../service';
import { getLocationList } from 'service/service-global';

import ProductBundleFormHeader from './header';
import MainCard from 'components/MainCard';
import Product from './bundle-form-product';
import BasicDetail from './bundle-form-basic';

const ProductBundleForm = () => {
  const [bundleName, setBundleName] = useState();
  let { id } = useParams();

  const getDropdownData = async () => {
    const getLocation = await getLocationList();
    const getProductCategory = await getProductCategoryList();
    useProductBundleFormStore.setState({
      sellingLocationList: getLocation,
      categoryList: getProductCategory
    });
  };

  const getDetail = async () => {
    await getDropdownData();

    if (id) {
      const getDetail = await getProductBundleDetail(id);
      const getProductBundle = getDetail.data.productBundle;
      const getDetailBundle = getDetail.data.detailBundle;

      const getProduct = await getProductClinicDropdown(+getProductBundle.locationId);
      const newProductDropdown = getProduct.length
        ? getProduct.map((dt) => ({
            id: +dt.data.id,
            label: dt.label,
            value: +dt.value,
            price: +dt.data.price,
            quantity: '',
            total: '',
            status: ''
          }))
        : [];
      useProductBundleFormStore.setState({ productList: newProductDropdown });

      const selectedProducts = getDetailBundle.map((dt) => ({
        id: +dt.productId,
        label: dt.fullName,
        price: +dt.price,
        quantity: +dt.quantity,
        total: +dt.total,
        value: +dt.productId,
        status: ''
      }));

      const products = getDetailBundle.map((dt) => ({
        id: +dt.id,
        productId: +dt.productId,
        itemName: dt.fullName,
        price: +dt.price,
        quantity: +dt.quantity,
        total: +dt.total,
        status: ''
      }));

      setBundleName(getProductBundle.name);
      const getSellingLocationList = getAllState().sellingLocationList;
      const getCategoryList = getAllState().categoryList;

      useProductBundleFormStore.setState({
        name: getProductBundle.name,
        remark: getProductBundle.remark,
        status: getProductBundle.status,
        sellingLocation: getSellingLocationList.find((dt) => dt.value === +getProductBundle.locationId),
        category: getCategoryList.find((dt) => dt.value === +getProductBundle.categoryId),
        selectedProducts,
        products
      });
    }
  };

  useEffect(() => {
    getDetail();

    // destroy store location detail
    return () => {
      useProductBundleFormStore.setState(defaultBundleForm);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <ProductBundleFormHeader bundleName={bundleName} />
      <MainCard border={false} boxShadow>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <BasicDetail />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Product />
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default ProductBundleForm;
