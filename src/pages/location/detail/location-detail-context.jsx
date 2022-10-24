import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const defaultDetailAddress = {
  usage: true,
  streetAddress: '',
  additionalInfo: '',
  country: 'Indonesia',
  province: '',
  city: '',
  cityList: [],
  postalCode: ''
};

const defaultDetailTelephone = {
  phoneNumber: '',
  type: '',
  usage: 'Utama'
};

const defaultDetailEmail = {
  username: '',
  usage: 'Utama'
};

const defaultDetailMessenger = {
  messengerName: '',
  type: '',
  usage: 'Utama'
};

const defaultPhotos = {
  label: '',
  imagePath: '',
  imageOriginalName: '',
  selectedFile: null
};

const defaultLocationDetail = {
  locationName: '',
  isBranch: 0,
  status: '',
  description: '',
  detailAddress: [defaultDetailAddress],
  operationalHour: [],
  messenger: [defaultDetailMessenger],
  email: [defaultDetailEmail],
  telephone: [defaultDetailTelephone],
  photos: [defaultPhotos],
  provinceList: [],
  usageList: [],
  telephoneType: [],
  messengerType: []
};

const LocationDetailContext = createContext({
  locationDetail: { ...defaultLocationDetail },
  setLocationDetail: null,
  locationDetailError: true,
  setLocationDetailError: null
});

export const LocationDetailProvider = (props) => {
  const { children } = props;
  const [locationDetail, setLocationDetail] = useState(defaultLocationDetail);
  const [locationDetailError, setLocationDetailError] = useState(true);

  return (
    <LocationDetailContext.Provider
      value={{
        locationDetail,
        setLocationDetail,
        locationDetailError,
        setLocationDetailError
      }}
    >
      {children}
    </LocationDetailContext.Provider>
  );
};

LocationDetailProvider.propTypes = {
  children: PropTypes.any
};

export default LocationDetailContext;
