import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { defaultDiscountForm, useDiscountFormStore } from './discount-form-store';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { getCustomerGroupList, getLocationList } from 'service/service-global';
import { useParams } from 'react-router';
import { jsonCentralized } from 'utils/func';

import MainCard from 'components/MainCard';
import PromotionDiscountFormHeader from './discount-form-header';
import SectionBasicDetail from './sections/section-basic-detail';
import SectionSettings from './sections/section-settings';

const PromotionDiscountForm = () => {
  let { id } = useParams();

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

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getDropdownData();
    // if (id) getDetail();

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
      <PromotionDiscountFormHeader />
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
