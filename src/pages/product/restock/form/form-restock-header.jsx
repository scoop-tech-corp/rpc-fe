import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import { getAllState, useFormRestockStore } from './form-restock-store';
import { createMessageBackend } from 'service/service-global';
import { createProductRestockMultiple } from '../service';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const FormRestockHeader = (props) => {
  const formRestockError = useFormRestockStore((state) => state.formRestockError);
  const isTouchForm = useFormRestockStore((state) => state.formRestockTouch);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  let { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = () => (id ? props.productRestockName : <FormattedMessage id="add-product-restock" />);

  const responseSuccess = async (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success create data`;
      dispatch(snackbarSuccess(message));
      navigate('/product/restock', { replace: true });
    }
  };

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useFormRestockStore.setState({ formRestockTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const onSubmit = async (statusValue) => {
    if (formRestockError) return;

    if (!id) {
      const getFormValue = getAllState();
      // const parameter = {
      //   productId: getFormValue.productId,
      //   productType: getFormValue.productType,
      //   supplierId: getFormValue.supplierId.value,
      //   requireDate: getFormValue.requireDate,
      //   reStockQuantity: getFormValue.reStockQuantity,
      //   costPerItem: getFormValue.costPerItem,
      //   total: getFormValue.total,
      //   remark: getFormValue.remark,
      //   photos: getFormValue.images
      // };

      const newImages = [];
      getFormValue.productDetails.forEach((dt) => {
        newImages.push(...dt.images);
      });

      const parameter = {
        status: statusValue,
        productLocation: getFormValue.productLocation.value,
        productList: getFormValue.productDetails,
        images: newImages
      };

      await createProductRestockMultiple(parameter).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/restock' }}
        action={
          <>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => onSubmit('final')}
              disabled={!isTouchForm || formRestockError}
            >
              <FormattedMessage id="save" />
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => onSubmit('draft')}
              disabled={!isTouchForm || formRestockError}
            >
              <FormattedMessage id="save-as-draft" />
            </Button>
          </>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

FormRestockHeader.propTypes = {
  productRestockName: PropTypes.string
};

export default FormRestockHeader;
