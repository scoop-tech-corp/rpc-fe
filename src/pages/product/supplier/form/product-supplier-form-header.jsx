import { getAllState, useProductSupplierFormStore } from './product-supplier-form-store';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createMessageBackend } from 'service/service-global';
import { createProductSupplier, updateProductSupplier } from '../service';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { snackbarSuccess } from 'store/reducers/snackbar';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductSupplierFormHeader = (props) => {
  const allState = useProductSupplierFormStore((state) => state);
  const productSupplierFormError = useProductSupplierFormStore((state) => state.productSupplierFormError);
  const isTouchForm = useProductSupplierFormStore((state) => state.productSupplierFormTouch);
  const [isError, setIsError] = useState(false);
  const [formError, setFormError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? props.productSupplierName : <FormattedMessage id="add-product-supplier" />;

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useProductSupplierFormStore.setState({ productSupplierFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const responseSuccess = async (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} supplier`;
      dispatch(snackbarSuccess(message));
      navigate('/product/supplier', { replace: true });
    }
  };

  const onSubmit = async () => {
    if (productSupplierFormError) return;

    if (id) {
      // update process
      await updateProductSupplier({ ...getAllState(), id })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      // create process
      await createProductSupplier(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  useEffect(() => {
    const getSupplierName = getAllState().supplierName;
    const getPic = getAllState().pic;

    setFormError(!getSupplierName || !getPic ? true : false);
  }, [allState]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/supplier' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isTouchForm || formError || productSupplierFormError}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ProductSupplierFormHeader.propTypes = {
  productSupplierName: PropTypes.string
};

export default ProductSupplierFormHeader;
