import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const defaultDetailAddress = {
  usage: true,
  streetAddress: '',
  additionalInfo: '',
  country: 'Indonesia',
  province: '',
  city: '',
  postalCode: ''
};

const defaultDetailTelephone = {
  phoneNumber: '087888821648',
  type: '',
  usage: 'Utama'
};

const defaultDetailEmail = {
  username: 'wahyudidanny23@gmail.com',
  usage: 'Utama'
};

const defaultDetailMessenger = {
  messengerName: '(021) 3851185',
  type: '',
  usage: 'Utama'
};

const defaultPhotos = {
  name: '',
  selectedFile: null
};

const defaultLocationDetail = {
  locationName: '',
  isBranch: 0,
  status: '',
  description: '',
  image: '',
  imageTitle: '',
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

// {
//   "locationName": "RPC Permata Hijau Jakarta",
//   "isBranch": 0,
//   "status": 1,
//   "introduction":"RPC Permata Hijau Pekanbaru, the best pet shop in the pekanbaru",
//   "description":"Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum fuga, alias placeat necessitatibus dolorem ea autem   tempore omnis asperiores nostrum, excepturi a unde mollitia blanditiis iusto. Dolorum tempora enim atque.",
//   "image":"D:\\ImageFolder\\ExamplePath\\ImageRPCPermataHijau.jpg",
//   "imageTitle":"ImageRPCPermataHijau.jpg",
//   "detailAddress":[
//           {
//               "addressName": "Jalan U 27 B Palmerah Barat no 206 Jakarta Barat 11480",
//               "additionalInfo": "Didepan nasi goreng kuning arema, disebelah bubur pasudan",
//               "cityName": "Jakarta Barat",
//               "provinceName": "DKI Jakarta",
//               "districtName": "Palmerah",
//               "postalCode": "11480",
//               "country": "Indonesia",
//               "parking": 1,
//               "usage": "Indekos"
//           },
//           {
//               "addressName": "Jalan Keluarga sebelah binus syahdan",
//               "additionalInfo": "Didepan nasi goreng kuning arema, disebelah bubur pasudan",
//               "cityName": "Jakarta Barat",
//               "provinceName": "DKI Jakarta",
//               "districtName": "Palmerah",
//               "postalCode": "11480",
//               "country": "Indonesia",
//               "parking": 1,
//               "usage": "Utama"
//           }
//       ],
//   "operationalHour": [
//                           {
//                               "dayName": "Monday",
//                               "fromTime": "",
//                               "toTime": "",
//                               "allDay": 1
//                           },
//                           {
//                               "dayName": "Tuesday",
//                               "fromTime": "",
//                               "toTime": "",
//                               "allDay": 1
//                           },
//                           {
//                               "dayName": "Wednesday",
//                               "fromTime": "",
//                               "toTime": "",
//                               "allDay": 1
//                           },
//                           {
//                               "dayName": "Thursday",
//                               "fromTime": "",
//                               "toTime": "",
//                               "allDay": 1
//                           },
//                           {
//                               "dayName": "Friday",
//                               "fromTime": "",
//                               "toTime": "",
//                               "allDay": 1
//                           },
//                           {
//                                "dayName": "Saturday",
//                               "fromTime": "",
//                               "toTime": "",
//                               "allDay": 1
//                           },
//                           {
//                               "dayName": "Sunday",
//                               "fromTime": "",
//                               "toTime": "",
//                               "allDay": 1
//                           }
//                       ],
//   "messenger":[
//                   {

//                       "messengerName":"(021) 3851185",
//         "type":"Fax",
//         "usage":"Utama"

//                   },
//                   {

//                       "messengerName":"(021) 012345678",
//                       "type":"Office",
//         "usage":"Personal"
//                   }
//               ],
//   "email":[
//               {

//                   "username":"wahyudidanny23@gmail.com",
//                   "type":"Personal",
//       "usage":"Utama"
//               },
//               {

//                   "username":"wahyudidanny25@gmail.com",
//       "type":"Secondary",
//                   "usage":"Personal"
//               }
//           ],
//   "telephone":[
//               {

//                   "phoneNumber":"087888821648",
//                   "type":"Telepon Selular",
//       "usage":"Utama"
//               },
//               {

//                   "phoneNumber":"085265779499",
//                   "type":"Whatshapp",
//       "usage":"Secondary"
//               }
//           ]
//   }
