import { useParams } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { getAllState, useProductInventoryDetailStore } from './product-inventory-detail-store';
import { createProductInventory } from '../../service';
import { breakdownDetailMessageBackend } from 'service/service-global';
import { snackbarSuccess } from 'store/reducers/snackbar';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import PropTypes from 'prop-types';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductInventoryDetailHeader = (props) => {
  const productInventoryDetailError = useProductInventoryDetailStore((state) => state.productInventoryDetailError);
  const isTouchForm = useProductInventoryDetailStore((state) => state.productInventoryDetailTouch);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  let { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = () => (id ? props.productInventoryName : <FormattedMessage id="add-product-inventory" />);

  const responseSuccess = async (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success create data`;
      dispatch(snackbarSuccess(message));
      navigate('/product/product-list?tab=2', { replace: true });
    }
  };

  const responseError = (err) => {
    const detailErr = breakdownDetailMessageBackend(err.errors);
    setIsError(true);
    useProductInventoryDetailStore.setState({ productInventoryDetailTouch: false });

    setErrContent({ title: err.message, detail: detailErr });
  };

  const onSubmit = async () => {
    if (productInventoryDetailError) return;

    if (!id) {
      const getFormValue = getAllState();
      const listProducts = getFormValue.listProduct.map((dt) => {
        return {
          productType: dt.productType,
          productId: dt.productId,
          usageId: dt.usageId,
          quantity: dt.quantity
        };
      });

      const newParam = {
        requirementName: getFormValue.requirementName,
        locationId: getFormValue.productLocation.value,
        listProducts
      };

      await createProductInventory(newParam).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list?tab=2' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isTouchForm || productInventoryDetailError}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ProductInventoryDetailHeader.propTypes = {
  productInventoryName: PropTypes.string
};

export default ProductInventoryDetailHeader;
