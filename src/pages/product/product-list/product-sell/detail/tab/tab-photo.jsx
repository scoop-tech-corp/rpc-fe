import PhotoC from 'components/PhotoC';
import { useProductSellDetailStore } from '../product-sell-detail-store';

const TabPhoto = () => {
  const photos = useProductSellDetailStore((state) => state.photos);

  const outputHandler = (output) => {
    useProductSellDetailStore.setState({ photos: output, productSellDetailTouch: true });
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
