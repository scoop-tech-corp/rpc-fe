import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createProductSell, updateProductSell, uploadImageProduct } from '../../service';
import { getAllState, useProductSellFormStore } from './product-sell-form-store';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductSellFormHeader = (props) => {
  const allState = useProductSellFormStore((state) => state);
  const productSellFormError = useProductSellFormStore((state) => state.productSellFormError);
  const isTouchForm = useProductSellFormStore((state) => state.productSellFormTouch);
  const [formError, setFormError] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? props.productSellName : <FormattedMessage id="add-product-sell" />;

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useProductSellFormStore.setState({ productSellFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const responseSuccess = async (resp) => {
    const nextProcessSuccess = (message) => {
      dispatch(snackbarSuccess(message));
      navigate('/product/product-list', { replace: true });
    };

    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} product sell`;

      if (id) {
        const thenUpload = (res) => {
          if (res && res.status === 200) nextProcessSuccess(message);
        };
        await uploadImageProduct({ ...getAllState(), id }, 'sell')
          .then(thenUpload)
          .catch(responseError);
      } else {
        nextProcessSuccess(message);
      }
    }
  };

  const onSubmit = async () => {
    if (productSellFormError) return;

    if (id) {
      // update process
      updateProductSell({ ...getAllState(), id })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      await createProductSell(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  useEffect(() => {
    let getCate = getAllState().categories;
    const isValidCate = getCate && getCate.length;

    if (!isValidCate) {
      setFormError(true);
    } else {
      setFormError(false);
    }
  }, [allState]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isTouchForm || formError || productSellFormError}
          >
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
