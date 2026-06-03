import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { getLocationList, createMessageBackend } from 'service/service-global';
import { getDeliveryOrderDetail, getCustomerListByLocation, getProductsByType } from '../service';
import { defaultOrderForm, useOrderFormStore } from './form-store';
import { jsonCentralized } from 'utils/func';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { snackbarError } from 'store/reducers/snackbar';

import OrderFormHeader from './form-header';
import OrderFormBody from './form-body';

const DeliveryOrderForm = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const getDetail = async (locationList) => {
    await getDeliveryOrderDetail(id)
      .then(async (resp) => {
        const d = resp.data;
        const location = locationList.find((l) => l.value === +d.locationId) ?? null;
        const locId = location?.value;
        const [customerList, sell, clinic, product] = locId
          ? await Promise.all([
              getCustomerListByLocation(locId).catch(() => []),
              getProductsByType('sell', locId).catch(() => []),
              getProductsByType('clinic', locId).catch(() => []),
              getProductsByType('product', locId).catch(() => [])
            ])
          : [[], [], [], []];

        useOrderFormStore.setState({
          deliveryNumber: d.deliveryNumber ?? '',
          locationId: location,
          customerList,
          productOptions: { sell, clinic, product },
          customerId: d.customerId ?? null,
          customerName: d.customerName ?? '',
          customerPhone: d.customerPhone ?? '',
          deliveryAddress: d.deliveryAddress ?? '',
          deliveryDate: d.deliveryDate ?? '',
          deliveryTime: d.deliveryTime ?? '',
          scheduledAt: d.scheduledAt ?? '',
          orderId: d.orderId ?? null,
          note: d.note ?? '',
          details: (d.details ?? []).map((item) => ({
            productType: item.productType ?? 'product',
            productId: item.productId ?? '',
            qty: item.qty ?? 1,
            unitPrice: item.unitPrice ?? '',
            weight: item.weight ?? '',
            note: item.note ?? ''
          }))
        });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getLocationList()
      .then(async (locationList) => {
        useOrderFormStore.setState({ locationList });
        if (id) await getDetail(locationList);
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getData();
    return () => {
      useOrderFormStore.setState(jsonCentralized(defaultOrderForm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <OrderFormHeader />
      <OrderFormBody />
    </>
  );
};

export default DeliveryOrderForm;
