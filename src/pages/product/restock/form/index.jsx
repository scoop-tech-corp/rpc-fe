import { useParams } from 'react-router';
import { useEffect } from 'react';
import { defaultFormRestock, getAllState, useFormRestockStore } from './form-restock-store';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { jsonCentralized } from 'utils/func';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { getSupplierList } from 'pages/product/product-list/service';
import { getProductRestockDetail } from '../service';
import { snackbarError } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import configGlobal from '../../../../config';

import FormRestockHeader from './form-restock-header';
import FormRestockBody from './form-restock-body';

const ProductRestockForm = () => {
  let { id } = useParams();
  const dispatch = useDispatch();

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

  const getDetail = async () => {
    await getProductRestockDetail(id, 'edit')
      .then((resp) => {
        if (resp.data) {
          const getLocationList = getAllState().locationList;
          const getDetail = resp.data.detail;
          const newDetail = [];

          getDetail.forEach((dt, i) => {
            const newImages = dt.images.map((img) => {
              return {
                id: img.id,
                label: img.labelName,
                imagePath: `${configGlobal.apiUrl}${img.imagePath}`,
                status: '',
                selectedFile: null
              };
            });

            newDetail.push({
              id: dt.id,
              index: i,
              productId: +dt.productId,
              productType: dt.productType,
              productName: dt.productName,
              supplier: dt.supplierName,
              supplierId: +dt.supplierId,
              requireDate: dt.requireDate,
              currentStock: dt.currentStock,
              restockQuantity: +dt.reStockQuantity,
              costPerItem: dt.costPerItem,
              total: +dt.total,
              remark: dt.remark,
              images: newImages,
              totalImage: newImages.length,
              status: ''
            });
          });

          useFormRestockStore.setState({
            productRestockId: resp.data.id,
            productLocation: getLocationList.find((dt) => dt.value === +resp.data.locationId),
            productDetails: newDetail
          });
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

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
