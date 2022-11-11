import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const defaultUnitAvailable = {
  name: '',
  status: '',
  capacity: '',
  amount: '',
  notes: ''
};

const defaultPhotos = {
  id: null,
  label: '',
  imagePath: '',
  status: '',
  selectedFile: null
};

const defaultFacilityDetail = {
  locationName: '',
  introduction: '',
  description: '',
  detailUnitAvailable: [defaultUnitAvailable],
  photos: [defaultPhotos]
};

const FacilityDetailContext = createContext({
  facilityDetail: { ...defaultFacilityDetail },
  setFacilityDetail: null,
  facilityDetailError: true,
  setFacilityDetailError: null
});

export const FacilityDetailProvider = (props) => {
  const { children } = props;
  const [facilityDetail, setFacilityDetail] = useState(defaultFacilityDetail);
  const [facilityDetailError, setFacilityDetailError] = useState(true);

  return (
    <FacilityDetailContext.Provider
      value={{
        facilityDetail,
        setFacilityDetail,
        facilityDetailError,
        setFacilityDetailError
      }}
    >
      {children}
    </FacilityDetailContext.Provider>
  );
};

FacilityDetailProvider.propTypes = {
  children: PropTypes.any
};

export default FacilityDetailContext;
