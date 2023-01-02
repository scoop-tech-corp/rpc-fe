import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getDataStaticLocation, getDetailLocation, getProvinceLocation } from './service';
import { defaultLocationDetail, useLocationDetailStore } from './location-detail-store';
import LocationDetailTab from './tab/location-detail-tab';
import Header from './location-detail-header';

const LocationDetailPage = () => {
  const [locationName, setLocationName] = useState('');
  let { code } = useParams();

  const getDropdownData = async () => {
    const newConstruct = await getDataStaticLocation();
    const getProvince = await getProvinceLocation();

    useLocationDetailStore.setState({
      ...newConstruct,
      provinceList: getProvince
    });
  };

  const getDetail = async () => {
    const data = await getDetailLocation(code);

    setLocationName(data.locationName);
    useLocationDetailStore.setState({
      locationName: data.locationName,
      isBranch: 0,
      status: data.status,
      description: data.description,
      photos: data.photos,
      detailAddress: data.detailAddress,
      operationalHour: data.operationalHour,
      messenger: data.messenger,
      email: data.email,
      telephone: data.telephone
    });
  };

  useEffect(() => {
    if (code) getDetail();

    getDropdownData();

    // destroy store location detail
    return () => {
      useLocationDetailStore.setState(defaultLocationDetail);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <>
      <Header locationName={locationName} />
      <LocationDetailTab />
    </>
  );
};

export default LocationDetailPage;
