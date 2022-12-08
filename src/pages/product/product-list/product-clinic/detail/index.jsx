import ProductClinicDetail from './product-clinic-detail';
import { ProductClinicDetailProvider as Provider } from './product-clinic-detail-context';

const ProductClinicDetailIndex = () => {
  return (
    <Provider>
      <ProductClinicDetail />
    </Provider>
  );
};

export default ProductClinicDetailIndex;
