import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createProductClinic } from '../../service';
import { getAllState, useProductClinicDetailStore } from './product-clinic-detail-store';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductClinicDetailHeader = (props) => {
  const productClinicDetailError = useProductClinicDetailStore((state) => state.productClinicDetailError);
  const isTouchForm = useProductClinicDetailStore((state) => state.productClinicDetailTouch);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? props.productClinicName : <FormattedMessage id="add-product-clinic" />;

  const responseSuccess = (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} update product clinic`;
      dispatch(snackbarSuccess(message));
      navigate('/product/product-list?tab=1', { replace: true });
    }
  };

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useProductClinicDetailStore.setState({ productClinicDetailTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const onSubmit = async () => {
    if (productClinicDetailError) return;

    if (id) {
      // update process
    } else {
      await createProductClinic(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/product-list?tab=1' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={!isTouchForm || productClinicDetailError}>
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ProductClinicDetailHeader.propTypes = {
  productClinicName: PropTypes.string
};

export default ProductClinicDetailHeader;
