import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createProductClinic, updateProductClinic, uploadImageProduct } from '../../service';
import { getAllState, useProductClinicFormStore } from './product-clinic-form-store';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductClinicFormHeader = (props) => {
  const allState = useProductClinicFormStore((state) => state);
  const productClinicFormError = useProductClinicFormStore((state) => state.productClinicFormError);
  const isTouchForm = useProductClinicFormStore((state) => state.productClinicFormTouch);
  const [formError, setFormError] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? props.productClinicName : <FormattedMessage id="add-product-clinic" />;

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useProductClinicFormStore.setState({ productClinicFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const responseSuccess = async (resp) => {
    const nextProcessSuccess = (message) => {
      dispatch(snackbarSuccess(message));
      navigate('/product/product-list?tab=1', { replace: true });
    };

    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} product clinic`;

      if (id) {
        const thenUpload = (res) => {
          if (res && res.status === 200) nextProcessSuccess(message);
        };
        await uploadImageProduct({ ...getAllState(), id }, 'clinic')
          .then(thenUpload)
          .catch(responseError);
      } else {
        nextProcessSuccess(message);
      }
    }
  };

  const onSubmit = async () => {
    if (productClinicFormError) return;

    if (id) {
      // update process
      updateProductClinic({ ...getAllState(), id })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      await createProductClinic(getAllState()).then(responseSuccess).catch(responseError);
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
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list?tab=1' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isTouchForm || formError || productClinicFormError}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ProductClinicFormHeader.propTypes = {
  productClinicName: PropTypes.string
};

export default ProductClinicFormHeader;
