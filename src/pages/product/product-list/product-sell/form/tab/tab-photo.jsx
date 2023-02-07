import PhotoC from 'components/PhotoC';
import { useProductSellFormStore } from '../product-sell-form-store';

const TabPhoto = () => {
  const photos = useProductSellFormStore((state) => state.photos);

  const outputHandler = (output) => {
    useProductSellFormStore.setState({ photos: output, productSellFormTouch: true });
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
