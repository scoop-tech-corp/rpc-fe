import PhotoC from 'components/PhotoC';
import { useProductClinicDetailStore } from '../product-clinic-detail-store';

const TabPhoto = () => {
  const photos = useProductClinicDetailStore((state) => state.photos);

  const outputHandler = (output) => {
    useProductClinicDetailStore.setState({ photos: output });
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
