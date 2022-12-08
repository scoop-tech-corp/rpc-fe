import PhotoC from 'components/PhotoC';
import { useContext, useEffect, useState } from 'react';
import ProductClinicDetailContext from '../product-clinic-detail-context';

const TabPhoto = () => {
  const { productClinicDetail, setProductClinicDetail } = useContext(ProductClinicDetailContext);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (productClinicDetail.photos) {
      setPhotos(productClinicDetail.photos);
    }
  }, [productClinicDetail.photos]);

  const outputValueHandler = (output) => {
    console.log('output', output);
    setProductClinicDetail((value) => ({ ...value, photos: output }));
  };

  return <PhotoC photoValue={photos} setPhotos={setPhotos} photoOutput={(event) => outputValueHandler(event)} />;
};

export default TabPhoto;
