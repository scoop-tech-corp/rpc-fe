import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { defaultDiscountForm, useDiscountFormStore } from './discount-form-store';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { getCustomerGroupList, getLocationList, getProductSellClinicByLocation, getServiceListByLocation } from 'service/service-global';
import { useParams } from 'react-router';
import { jsonCentralized } from 'utils/func';
import { getPromotionDiscountDetail } from '../service';

import MainCard from 'components/MainCard';
import PromotionDiscountFormHeader from './discount-form-header';
import SectionBasicDetail from './sections/section-basic-detail';
import SectionSettings from './sections/section-settings';

const PromotionDiscountForm = () => {
  let { id } = useParams();
  const [discountName, setDiscountName] = useState('');

  const getDropdownData = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getLoc = await getLocationList();
      const getCustomerGroup = await getCustomerGroupList();
      // const getProductSell = await getProductSellClinicByLocation('sell');
      // const getProductClinic = await getProductSellClinicByLocation('clinic');

      useDiscountFormStore.setState({
        locationList: getLoc,
        customerGroupList: getCustomerGroup
        // productSellList: getProductSell,
        // productClinicList: getProductClinic
      });

      resolve(true);
    });
  };

  const getDetail = async () => {
    const getResp = await getPromotionDiscountDetail(id);
    const detail = getResp.data;
    console.log('detail', detail);
    setDiscountName(detail.name);

    const newLocation = detail.location.map((dt) => {
      return {
        value: +dt.id,
        label: dt.locationName
      };
    });

    const newCustomerGroup = detail.customerGroup.map((dt) => {
      return {
        value: +dt.id,
        label: dt.customerGroup
      };
    });

    let stateForm = {
      type: detail.typeId,
      name: detail.name,
      startDate: detail.startDate,
      endDate: detail.endDate,
      status: detail.statusId,
      locations: newLocation,
      customerGroups: newCustomerGroup
    };

    if (detail.typeId === '1') {
      const productBuyList = await getProductSellClinicByLocation(detail.productBuyType, [...newLocation.map((dt) => dt.value)]);
      const productFreeList = await getProductSellClinicByLocation(detail.productFreeType, [...newLocation.map((dt) => dt.value)]);

      const productBuyId = productBuyList.find((dt) => dt.id === +detail.productBuyId);
      const productFreeId = productFreeList.find((dt) => dt.id === +detail.productFreeId);

      stateForm = {
        ...stateForm,
        freeItem: {
          quantityBuy: detail.quantityBuyItem,
          productBuyType: detail.productBuyType,
          productBuyId,
          productBuyList,
          quantityFree: detail.quantityFreeItem,
          productFreeType: detail.productFreeType,
          productFreeId,
          productFreeList,
          totalMaxUsage: detail.totalMaxUsage,
          maxUsagePerCustomer: detail.maxUsagePerCustomer
        }
      };
    }

    if (detail.typeId === '2') {
      let productId = null;
      let productList = [];
      let serviceId = null;
      let serviceList = [];

      if (detail.productOrService === 'product') {
        productList = await getProductSellClinicByLocation(detail.productType, [...newLocation.map((dt) => dt.value)]);
        productId = productList.find((dt) => dt.id === +detail.productId);
      }

      if (detail.productOrService === 'service') {
        serviceList = await getServiceListByLocation([...newLocation.map((dt) => dt.value)]);
        serviceId = serviceList.find((dt) => dt.id === +detail.serviceId);
      }

      stateForm = {
        ...stateForm,
        discount: {
          productOrService: detail.productOrService,
          percentOrAmount: detail.discountType,
          productType: detail.productType,
          productId,
          serviceId,
          amount: detail.amount,
          percent: detail.percent,
          totalMaxUsage: detail.totalMaxUsage,
          maxUsagePerCustomer: detail.maxUsagePerCustomer,
          productList,
          serviceList
        }
      };
    }

    if (detail.typeId === '3') {
      const bundleDetails = [];

      for (const dt of detail.bundles) {
        let productId = null;
        let productList = [];

        let serviceId = null;
        let serviceList = [];

        if (dt.productOrService === 'product') {
          productList = await getProductSellClinicByLocation(dt.productType, [...newLocation.map((datum) => datum.value)]);
          productId = productList.find((datum) => +datum.id === +dt.productId);
        }

        if (dt.productOrService === 'service') {
          serviceList = await getServiceListByLocation([...newLocation.map((datum) => datum.value)]);
          serviceId = serviceList.find((datum) => +datum.id === +dt.serviceId);
        }

        bundleDetails.push({
          productOrService: dt.productOrService,
          productType: dt.productType,
          quantity: dt.quantity,
          productId,
          serviceId,

          productList,
          serviceList
        });
      }

      stateForm = {
        ...stateForm,
        bundle: {
          price: detail.price,
          totalMaxUsage: detail.totalMaxUsage,
          maxUsagePerCustomer: detail.maxUsagePerCustomer
        },
        bundleDetails
      };
    }

    if (detail.typeId === '4') {
      stateForm = {
        ...stateForm,
        basedSale: {
          minPurchase: detail.basedSales.minPurchase,
          maxPurchase: detail.basedSales.maxPurchase,
          percentOrAmount: detail.basedSales.percentOrAmount,
          amount: detail.basedSales.amount,
          percent: detail.basedSales.percent,
          totalMaxUsage: detail.basedSales.totalMaxUsage,
          maxUsagePerCustomer: detail.basedSales.maxUsagePerCustomer
        }
      };
    }

    useDiscountFormStore.setState(stateForm);
  };

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getDropdownData();
    if (id) getDetail();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getData();

    return () => {
      useDiscountFormStore.setState(jsonCentralized(defaultDiscountForm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <PromotionDiscountFormHeader discountName={discountName} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard content={true}>
            <SectionBasicDetail />
          </MainCard>
        </Grid>
        <Grid item xs={12}>
          <MainCard content={true}>
            <SectionSettings />
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default PromotionDiscountForm;
