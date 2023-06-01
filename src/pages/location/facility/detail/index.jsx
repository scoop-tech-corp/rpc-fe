import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { getFacilityLocationDetail, getFacilityLocationList } from './service';
import { defaultFacilityDetail, useFacilityDetailStore } from './facility-detail-store';
import { jsonCentralized } from 'utils/func';

import FacilityDetailTab from './tab/facility-detail-tab';
import configGlobal from '../../../../config';
import FacilityDetailHeader from './facility-detail-header';

const FacilityDetail = () => {
  const [facilityName, setFacilityName] = useState('');
  let { id } = useParams();

  const getDetailFacility = async () => {
    const getData = await getFacilityLocationDetail(id);

    let getUnit = jsonCentralized(getData.unit);
    getUnit = getUnit.map((u) => ({ ...u, id: +u.id, command: '' }));

    let getImage = jsonCentralized(getData.images);
    getImage = getImage.map((img) => ({
      ...img,
      label: img.labelName,
      imagePath: `${configGlobal.apiUrl}${img.imagePath}`,
      status: '',
      selectedFile: null
    }));

    useFacilityDetailStore.setState({
      locationId: +getData.locationId,
      introduction: getData.introduction,
      description: getData.description,
      detailUnitAvailable: getUnit,
      photos: getImage
    });
    setFacilityName(getData.locationName);
  };

  const getDropdownData = async () => {
    const data = await getFacilityLocationList();
    useFacilityDetailStore.setState({ facilityLocationList: data });
  };

  useEffect(() => {
    if (id) getDetailFacility();

    getDropdownData();

    // destroy store facility detail
    return () => {
      useFacilityDetailStore.setState(jsonCentralized(defaultFacilityDetail));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <FacilityDetailHeader facilityName={facilityName} />
      <FacilityDetailTab />
    </>
  );
};

export default FacilityDetail;
