import { useParams } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';

const ProductInventoryDetailHeader = () => {
  const [productInventoryName] = useState('');
  let { id } = useParams();

  const setTitlePage = () => (id ? productInventoryName : <FormattedMessage id="add-product-inventory" />);
  const onSubmit = () => {};

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list?tab=2' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={false}>
            <FormattedMessage id="save" />
          </Button>
        }
      />
    </>
  );
};

export default ProductInventoryDetailHeader;
