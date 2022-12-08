import ProductSellDetail from './product-sell-detail';
import { ProductSellDetailProvider as Provider } from './product-sell-detail-context';

const ProductSellDetailPage = () => {
  return (
    <Provider>
      <ProductSellDetail />
    </Provider>
  );
};

export default ProductSellDetailPage;
