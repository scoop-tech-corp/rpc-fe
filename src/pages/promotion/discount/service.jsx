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
  formData.append('customerGroups', customerGroups);
  formData.append('locations', locations);

  if (property.type == '1') {
    const freeItem = {
      quantityBuyItem: +property.freeItem.quantityBuyItem,
      productBuyType: property.freeItem.productBuyType,
      productBuyName: property.freeItem.productBuyName?.value || '',
      quantityFreeItem: +property.freeItem.quantityFreeItem,
      productFreeType: property.freeItem.productFreeType,
      productFreeName: property.freeItem.productFreeName?.value || '',
      totalMaxUsage: +property.freeItem.totalMaxUsage,
      maxUsagePerCustomer: +property.freeItem.maxUsagePerCustomer
    };

    for (const key in freeItem) {
      // if (freeItem.hasOwnProperty(key)) {
      formData.append(key, freeItem[key]);
      // }
    }

    // formData.append('freeItem', JSON.stringify(freeItem));
  }
  if (property.type == '2') {
    const discount = {
      productOrService: property.discount.productOrService,
      percentOrAmount: property.discount.percentOrAmount,
      productType: property.discount.productType,
      productName: property.discount.productName?.value || '',
      serviceId: property.discount.serviceId?.value || '',
      amount: property.discount.amount,
      percent: +property.discount.percent,
      totalMaxUsage: +property.discount.totalMaxUsage,
      maxUsagePerCustomer: +property.discount.maxUsagePerCustomer
    };

    formData.append('discount', JSON.stringify(discount));
  }

  if (property.type == '3') {
    const bundle = {
      price: property.bundle.totalMaxUsage,
      totalMaxUsage: +property.bundle.totalMaxUsage,
      maxUsagePerCustomer: +property.bundle.maxUsagePerCustomer
    };

    const bundleDetails = property.bundleDetails.map((dt) => ({
      productOrService: dt.productOrService,
      productType: dt.productType,
      productName: dt.productName?.value,
      serviceId: dt.serviceId?.value,
      quantity: dt.quantity
    }));

    formData.append('bundle', JSON.stringify(bundle));
    formData.append('bundleDetails', JSON.stringify(bundleDetails));
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

  return await axios.post(baseUrl, formData); // { headers: { 'Content-Type': 'multipart/form-data' } }
};
