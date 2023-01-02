import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { jsonCentralized } from 'utils/func';

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

const defaultProductClinicDetail = {
  fullName: '',
  simpleName: '',
  productBrandId: null,
  productSupplierId: null,
  status: 1,
  sku: '',
  expiredDate: '',

  pricingStatus: 'Basic',
  costPrice: '',
  marketPrice: '',
  price: '',

  customerGroups: [],
  priceLocations: [],
  quantities: [],

  isShipped: 1,
  weight: '',
  length: null,
  width: null,
  height: null,

  introduction: '',
  description: '',

  selectedClinicingPrice: [],
  locations: [],
  categories: [],
  reminders: [],

  photos: [defaultPhotos],
  dataSupport: {
    // for dropdown
    customerGroupsList: [],
    locationList: [],
    brandList: [],
    supplierList: [],
    productCategoryList: []
  }
};

const ProductClinicDetailContext = createContext({
  productClinicDetail: jsonCentralized(defaultProductClinicDetail),
  setProductClinicDetail: null,
  productClinicDetailError: false,
  setProductClinicDetailError: null
});

export const ProductClinicDetailProvider = (props) => {
  const { children } = props;

  const [productClinicDetail, setProductClinicDetail] = useState(jsonCentralized(defaultProductClinicDetail));
  const [productClinicDetailError, setProductClinicDetailError] = useState(false);

  return (
    <ProductClinicDetailContext.Provider
      value={{
        productClinicDetail,
        setProductClinicDetail,
        productClinicDetailError,
        setProductClinicDetailError
      }}
    >
      {children}
    </ProductClinicDetailContext.Provider>
  );
};

ProductClinicDetailProvider.propTypes = {
  children: PropTypes.any
};

export default ProductClinicDetailContext;
