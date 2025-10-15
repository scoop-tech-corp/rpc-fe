import axios from 'utils/axios';
import { formateDateYYYMMDD } from 'utils/func';

const baseUrl = 'promotion/discount';

export const getPromotionDiscountList = async (property) => {
  return await axios.get(baseUrl, {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      type: property.type
    }
  });
};

export const getPromotionDiscountDetail = async (id) => {
  return await axios.get(baseUrl + '/detail', { params: { id } });
};

export const getPromoDiscountType = async () => {
  const getResp = await axios.get(baseUrl + '/list-type');
  return getResp.data.map((dt) => {
    return { label: dt.typeName, value: +dt.id };
  });
};

export const deletePromotionDiscountList = async (id) => {
  return await axios.delete(baseUrl, {
    data: { id }
  });
};

export const exportPromotionDiscount = async (param) => {
  return await axios.get(baseUrl + '/export', {
    responseType: 'blob',
    params: {
      orderValue: param.orderValue,
      orderColumn: param.orderColumn,
      locationId: param.locationId.length ? param.locationId : [''],
      type: param.type.length ? param.type : ['']
    }
  });
};

export const updatePromotionDiscount = async (payload) => {
  const startDate = payload.startDate ? formateDateYYYMMDD(new Date(payload.startDate)) : '';
  const endDate = payload.endDate ? formateDateYYYMMDD(new Date(payload.endDate)) : '';
  const customerGroups = payload.customerGroups.map((dt) => dt.value);
  const locations = payload.locations.map((dt) => dt.value);

  let basePayload = {
    id: payload.id,
    name: payload.name,
    status: payload.status,
    type: payload.type,
    startDate,
    endDate,
    customerGroups,
    locations
  };

  if (payload.type == '1') {
    basePayload = {
      ...basePayload,
      freeItem: {
        quantityBuy: +payload.freeItem.quantityBuy,
        productBuyType: payload.freeItem.productBuyType,
        productBuyId: payload.freeItem.productBuyId?.id || '',
        quantityFree: +payload.freeItem.quantityFree,
        productFreeType: payload.freeItem.productFreeType,
        productFreeId: payload.freeItem.productFreeId?.id || '',
        totalMaxUsage: +payload.freeItem.totalMaxUsage,
        maxUsagePerCustomer: +payload.freeItem.maxUsagePerCustomer
      }
    };
  }

  if (payload.type == '2') {
    let basedDiscount = {
      amount: payload.discount.amount,
      percent: +payload.discount.percent,
      totalMaxUsage: +payload.discount.totalMaxUsage,
      maxUsagePerCustomer: +payload.discount.maxUsagePerCustomer
    };

    if (payload.discount.productOrService === 'product') {
      const discountProducts = {
        discountType: payload.discount.percentOrAmount,
        productType: payload.discount.productType,
        productId: payload.discount.productId?.id || '',
        ...basedDiscount
      };

      basePayload = {
        ...basePayload,
        discountProducts
      };
    }

    if (payload.discount.productOrService === 'service') {
      const discountServices = {
        discountType: payload.discount.percentOrAmount,
        serviceId: payload.discount.serviceId?.id || '',
        ...basedDiscount
      };

      basePayload = {
        ...basePayload,
        discountServices
      };
    }
  }

  if (payload.type == '3') {
    const bundleDetailProducts = payload.bundleDetails
      .filter((dt) => dt.productOrService === 'product')
      .map((dt) => ({
        productType: dt.productType,
        productId: dt.productId?.id,
        quantity: dt.quantity
      }));

    const bundleDetailServices = payload.bundleDetails
      .filter((dt) => dt.productOrService === 'service')
      .map((dt) => ({
        serviceId: dt.serviceId?.id,
        quantity: dt.quantity
      }));

    basePayload = {
      ...basePayload,
      bundle: {
        price: payload.bundle.price,
        totalMaxUsage: +payload.bundle.totalMaxUsage,
        maxUsagePerCustomer: +payload.bundle.maxUsagePerCustomer
      },
      bundleDetailProducts: bundleDetailProducts.length ? bundleDetailProducts : undefined,
      bundleDetailServices: bundleDetailServices.length ? bundleDetailServices : undefined
    };
  }

  if (payload.type == '4') {
    basePayload = {
      ...basePayload,
      basedSale: {
        minPurchase: payload.basedSale.minPurchase,
        maxPurchase: payload.basedSale.maxPurchase,
        percentOrAmount: payload.basedSale.percentOrAmount,
        amount: payload.basedSale.amount,
        percent: +payload.basedSale.percent,
        totalMaxUsage: +payload.basedSale.totalMaxUsage,
        maxUsagePerCustomer: +payload.basedSale.maxUsagePerCustomer
      }
    };
  }

  return await axios.put(baseUrl, basePayload);
};

export const createPromotionDiscount = async (property) => {
  // note for type 1 = Free Item, 2 = Discount, 3 = Bundle, 4 = Based Sales

  const startDate = property.startDate ? formateDateYYYMMDD(new Date(property.startDate)) : '';
  const endDate = property.endDate ? formateDateYYYMMDD(new Date(property.endDate)) : '';
  const customerGroups = property.customerGroups.map((dt) => dt.value);
  const locations = property.locations.map((dt) => dt.value);

  const formData = new FormData();
  formData.append('name', property.name);
  formData.append('status', property.status);
  formData.append('type', property.type);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);

  locations.forEach((location) => {
    formData.append('locations[]', location);
  });

  customerGroups.forEach((customer) => {
    formData.append('customerGroups[]', customer);
  });

  if (property.type == '1') {
    const freeItem = {
      quantityBuy: +property.freeItem.quantityBuy,
      productBuyType: property.freeItem.productBuyType,
      productBuyId: property.freeItem.productBuyId?.id || '',
      quantityFree: +property.freeItem.quantityFree,
      productFreeType: property.freeItem.productFreeType,
      productFreeId: property.freeItem.productFreeId?.id || '',
      totalMaxUsage: +property.freeItem.totalMaxUsage,
      maxUsagePerCustomer: +property.freeItem.maxUsagePerCustomer
    };

    formData.append('freeItem', JSON.stringify(freeItem));
  }

  if (property.type == '2') {
    const basedDiscount = {
      amount: property.discount.amount,
      percent: +property.discount.percent,
      totalMaxUsage: +property.discount.totalMaxUsage,
      maxUsagePerCustomer: +property.discount.maxUsagePerCustomer
    };

    if (property.discount.productOrService === 'product') {
      const discount = {
        discountType: property.discount.percentOrAmount,
        productType: property.discount.productType,
        productId: property.discount.productId?.id || '',
        ...basedDiscount
      };
      formData.append('discountProducts', JSON.stringify(discount));
    }
    if (property.discount.productOrService === 'service') {
      const service = {
        discountType: property.discount.percentOrAmount,
        serviceId: property.discount.serviceId?.id || '',
        ...basedDiscount
      };
      formData.append('discountServices', JSON.stringify(service));
    }
  }

  if (property.type == '3') {
    const bundle = {
      price: property.bundle.price,
      totalMaxUsage: +property.bundle.totalMaxUsage,
      maxUsagePerCustomer: +property.bundle.maxUsagePerCustomer
    };
    formData.append('bundle', JSON.stringify(bundle));

    const bundleDetailProducts = property.bundleDetails
      .filter((dt) => dt.productOrService === 'product')
      .map((dt) => ({
        productType: dt.productType,
        productId: dt.productId?.id,
        quantity: dt.quantity
      }));

    const bundleDetailServices = property.bundleDetails
      .filter((dt) => dt.productOrService === 'service')
      .map((dt) => ({
        serviceId: dt.serviceId?.id,
        quantity: dt.quantity
      }));

    formData.append('bundleDetailProducts', JSON.stringify(bundleDetailProducts));
    formData.append('bundleDetailServices', JSON.stringify(bundleDetailServices));
  }

  if (property.type == '4') {
    const basedSale = {
      minPurchase: property.basedSale.minPurchase,
      maxPurchase: property.basedSale.maxPurchase,
      percentOrAmount: property.basedSale.percentOrAmount,
      amount: property.basedSale.amount,
      percent: +property.basedSale.percent,
      totalMaxUsage: +property.basedSale.totalMaxUsage,
      maxUsagePerCustomer: +property.basedSale.maxUsagePerCustomer
    };

    formData.append('basedSale', JSON.stringify(basedSale));
  }

  return await axios.post(baseUrl, formData);
};
