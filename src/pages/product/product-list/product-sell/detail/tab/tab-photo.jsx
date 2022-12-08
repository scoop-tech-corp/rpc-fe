import PhotoC from 'components/PhotoC';
import { useContext, useEffect, useState } from 'react';
import ProductSellDetailContext from '../product-sell-detail-context';

const TabPhoto = () => {
  const { productSellDetail, setProductSellDetail } = useContext(ProductSellDetailContext);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (productSellDetail.photos) {
      setPhotos(productSellDetail.photos);
    }
  }, [productSellDetail.photos]);

  const outputValueHandler = (output) => {
    setProductSellDetail((value) => ({ ...value, photos: output }));
  };

  return <PhotoC photoValue={photos} setPhotos={setPhotos} photoOutput={(event) => outputValueHandler(event)} />;
};

export default TabPhoto;
