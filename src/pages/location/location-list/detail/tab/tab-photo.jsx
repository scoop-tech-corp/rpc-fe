import PhotoC from 'components/PhotoC';
import { useLocationDetailStore } from '../location-detail-store';

const TabPhoto = () => {
  const photos = useLocationDetailStore((state) => state.photos);

  const outputHandler = (output) => {
    useLocationDetailStore.setState({ photos: output });
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
