import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getAllState, useProductBundleFormStore } from './bundle-form-store';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createProductBundle, updateProductBundle } from '../service';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ProductBundleFormHeader = (props) => {
  const bundleFormError = useProductBundleFormStore((state) => state.bundleFormError);
  const isTouchForm = useProductBundleFormStore((state) => state.bundleFormTouch);

  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = () => (id ? props.bundleName : <FormattedMessage id="add-product-bundle" />);

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useProductBundleFormStore.setState({ bundleFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const nextProcessSuccess = (message) => {
    dispatch(snackbarSuccess(message));
    navigate('/product/bundle', { replace: true });
  };

  const responseSuccess = async (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} data`;
      nextProcessSuccess(message);
    }
  };

  const onSubmit = async () => {
    if (bundleFormError) return;

    if (id) {
      await updateProductBundle({ id, ...getAllState() })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      await createProductBundle(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/bundle' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={!isTouchForm || bundleFormError}>
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ProductBundleFormHeader.propTypes = {
  bundleName: PropTypes.string
};

export default ProductBundleFormHeader;
