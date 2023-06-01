import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getLocationList } from 'service/service-global';
import { jsonCentralized } from 'utils/func';
import { getBrandList, getProductUsage } from '../../service';
import { useProductInventoryDetailStore, defaultProductInventoryDetail } from './product-inventory-detail-store';

import FormProductInventory from './form-product-inventory';
import Header from './product-inventory-detail-header';

const ProductInventoryDetail = () => {
  const [productInventoryName] = useState('');
  let { id } = useParams();

  const getDropdownData = async () => {
    const locationList = await getLocationList();
    const productUsageList = await getProductUsage();
    const brandList = await getBrandList();
    useProductInventoryDetailStore.setState({
      locationList,
      productUsageList,
      brandList
    });
  };

  useEffect(() => {
    getDropdownData();

    return () => {
      useProductInventoryDetailStore.setState(jsonCentralized(defaultProductInventoryDetail));
    };
  }, [id]);

  return (
    <>
      <Header productInventoryName={productInventoryName} />
      <FormProductInventory />
    </>
  );
};

export default ProductInventoryDetail;
