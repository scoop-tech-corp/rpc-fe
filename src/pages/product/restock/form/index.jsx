import { useParams } from 'react-router';
import { useEffect } from 'react';
import { defaultFormRestock, useFormRestockStore } from './form-restock-store';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { jsonCentralized } from 'utils/func';
import { getLocationList } from 'service/service-global';
import { getSupplierList } from 'pages/product/product-list/service';

import FormRestockHeader from './form-restock-header';
import FormRestockBody from './form-restock-body';

const ProductRestockForm = () => {
  let { id } = useParams();

  const getDropdownData = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const locationList = await getLocationList();
      const supplierList = await getSupplierList();

      useFormRestockStore.setState({
        supplierList: supplierList,
        locationList: locationList
      });
      resolve(true);
    });
  };

  const getDetail = () => {};

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getDropdownData();
    if (id) await getDetail();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getData();

    return () => {
      useFormRestockStore.setState(jsonCentralized(defaultFormRestock));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <FormRestockHeader />
      <FormRestockBody />
    </>
  );
};

export default ProductRestockForm;
