import PhotoC from 'components/PhotoC';
import { useContext } from 'react';
import ProductSellDetailContext from '../product-sell-detail-context';

const TabPhoto = () => {
  const { productSellDetail, setProductSellDetail } = useContext(ProductSellDetailContext);
  const photos = productSellDetail.photos;

  const outputValueHandler = (output) => {
    console.log('output', output);
    setProductSellDetail((value) => ({ ...value, photos: output }));
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputValueHandler(event)} />;
};

export default TabPhoto;
