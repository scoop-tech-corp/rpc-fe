import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import { getAllState, useFormRestockStore } from './form-restock-store';
import { createMessageBackend } from 'service/service-global';
import { createProductRestockMultiple, updateProductRestock } from '../service';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const FormRestockHeader = () => {
  const formRestockError = useFormRestockStore((state) => state.formRestockError);
  const isTouchForm = useFormRestockStore((state) => state.formRestockTouch);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  let { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = () => (id ? <FormattedMessage id="edit-product-restock" /> : <FormattedMessage id="add-product-restock" />);

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

    const getFormValue = getAllState();
    let parameter = {
      status: statusValue,
      locationId: getFormValue.productLocation.value,
      productList: getFormValue.productDetails
    };
    if (!id) {
      await createProductRestockMultiple(parameter).then(responseSuccess).catch(responseError);
    } else {
      parameter = { id, ...parameter };
      await updateProductRestock(parameter).then(responseSuccess).catch(responseError);
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

export default FormRestockHeader;
