import { useCustomerFormStore } from '../customer-form-store';
import PhotoC from 'components/PhotoC';

const TabPhoto = () => {
  const photos = useCustomerFormStore((state) => state.photos);

  const outputHandler = (output) => {
    useCustomerFormStore.setState({ photos: output, customerFormTouch: true });
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
