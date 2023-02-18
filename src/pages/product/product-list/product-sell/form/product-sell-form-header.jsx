import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createProductSell } from '../../service';
import { getAllState, useProductSellFormStore } from './product-sell-form-store';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductSellFormHeader = (props) => {
  const productSellFormError = useProductSellFormStore((state) => state.productSellFormError);
  const isTouchForm = useProductSellFormStore((state) => state.productSellFormTouch);
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
    const message = createMessageBackend(err, true);
    setIsError(true);
    useProductSellFormStore.setState({ productSellFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const onSubmit = async () => {
    if (productSellFormError) return;

    if (id) {
      // update process
      console.log('submit update', getAllState());
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
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={!isTouchForm || productSellFormError}>
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ProductSellFormHeader.propTypes = {
  productSellName: PropTypes.string
};

export default ProductSellFormHeader;
