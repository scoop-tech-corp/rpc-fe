import PhotoC from 'components/PhotoC';
import { useServiceFormStore } from '../service-form-store';

const TabPhoto = () => {
  const photos = useServiceFormStore((state) => state.photos);
  const isDetail = useServiceFormStore((state) => state.isDetail);

  const outputHandler = (output) => {
    useServiceFormStore.setState({ photos: output, productSellFormTouch: true });
  };

  return <PhotoC photoValue={photos} disabled={isDetail} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
