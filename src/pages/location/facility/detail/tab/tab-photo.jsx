import PhotoC from 'components/PhotoC';
import { useFacilityDetailStore } from '../facility-detail-store';

const TabPhoto = () => {
  const photos = useFacilityDetailStore((state) => state.photos);

  const outputHandler = (output) => {
    useFacilityDetailStore.setState({ photos: output });
  };

  return <PhotoC photoValue={photos} photoOutput={(event) => outputHandler(event)} />;
};

export default TabPhoto;
