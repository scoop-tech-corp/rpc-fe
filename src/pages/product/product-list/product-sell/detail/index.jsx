import ProductSellDetail from './product-sell-detail';
import { ProductSellDetailProvider as Provider } from './product-sell-detail-context';

const ProductSellDetailIndex = () => {
  return (
    <Provider>
      <ProductSellDetail />
    </Provider>
  );
};

export default ProductSellDetailIndex;
