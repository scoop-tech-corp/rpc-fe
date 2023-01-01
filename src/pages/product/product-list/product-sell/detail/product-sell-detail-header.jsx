import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createProductSell } from '../../service';
import { getAllState, useProductSellDetailStore } from './product-sell-detail-store';
import { breakdownDetailMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductSellDetailHeader = (props) => {
  const productSellDetailError = useProductSellDetailStore((state) => state.productSellDetailError);
  const isTouchForm = useProductSellDetailStore((state) => state.productSellDetailTouch);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? props.productSellName : <FormattedMessage id="add-product-sell" />;

  const responseSuccess = (resp) => {
    if (resp && resp.status === 200) {
      const message = id ? 'Success update product sell' : 'Success create product sell';
      dispatch(snackbarSuccess(message));
      navigate('/product/product-list', { replace: true });
    }
  };

  const responseError = (err) => {
    const detailErr = breakdownDetailMessageBackend(err.errors);
    setIsError(true);
    useProductSellDetailStore.setState({ productSellDetailTouch: false });
    setErrContent({ title: err.message, detail: detailErr });
  };

  const onSubmit = async () => {
    if (productSellDetailError) return;

    if (id) {
      // update process
    } else {
      await createProductSell(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={!isTouchForm || productSellDetailError}>
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ProductSellDetailHeader.propTypes = {
  productSellName: PropTypes.string
};

export default ProductSellDetailHeader;
