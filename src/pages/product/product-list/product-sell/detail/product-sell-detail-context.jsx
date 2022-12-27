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

const defaultProductSellDetail = {
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

  selectedSellingPrice: [],
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

const ProductSellDetailContext = createContext({
  productSellDetail: jsonCentralized(defaultProductSellDetail),
  setProductSellDetail: null,
  productSellDetailError: false,
  setProductSellDetailError: null
});

export const ProductSellDetailProvider = (props) => {
  const { children } = props;

  const [productSellDetail, setProductSellDetail] = useState(jsonCentralized(defaultProductSellDetail));
  const [productSellDetailError, setProductSellDetailError] = useState(false);

  return (
    <ProductSellDetailContext.Provider
      value={{
        productSellDetail,
        setProductSellDetail,
        productSellDetailError,
        setProductSellDetailError
      }}
    >
      {children}
    </ProductSellDetailContext.Provider>
  );
};

ProductSellDetailProvider.propTypes = {
  children: PropTypes.any
};

export default ProductSellDetailContext;
