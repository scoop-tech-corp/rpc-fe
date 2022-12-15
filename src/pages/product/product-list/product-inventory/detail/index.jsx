import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getLocationList } from 'service/service-global';
import { getProductUsage } from '../../service';
import FormProductInventory from './form-product-inventory';
import Header from './product-inventory-detail-header';
import { useProductInventoryDetailStore } from './product-inventory-detail-store';

const ProductInventoryDetail = () => {
  const [productInventoryName] = useState('');
  let { id } = useParams();

  const getDropdownData = async () => {
    const locationList = await getLocationList();
    const productUsageList = await getProductUsage();
    useProductInventoryDetailStore.setState({
      locationList,
      productUsageList
    });
  };

  useEffect(() => {
    getDropdownData();
  }, [id]);

  return (
    <>
      <Header productInventoryName={productInventoryName} />
      <FormProductInventory />
    </>
  );
};

export default ProductInventoryDetail;
