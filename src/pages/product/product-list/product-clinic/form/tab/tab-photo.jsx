import PhotoC from 'components/PhotoC';
import { useProductClinicFormStore } from '../product-clinic-form-store';

const TabPhoto = () => {
  const photos = useProductClinicFormStore((state) => state.photos);

  const outputHandler = (output) => {
    useProductClinicFormStore.setState({ photos: output, productClinicFormTouch: true });
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
