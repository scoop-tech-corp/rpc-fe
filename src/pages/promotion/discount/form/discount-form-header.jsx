import { useNavigate, useParams } from 'react-router';
import { getAllState, useDiscountFormStore } from './discount-form-store';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { createPromotionDiscount, updatePromotionDiscount } from '../service';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const PromotionDiscountFormHeader = (props) => {
  const { discountName } = props;

  const allState = useDiscountFormStore((state) => state);
  const discountFormError = useDiscountFormStore((state) => state.discountFormError);
  const isTouchForm = useDiscountFormStore((state) => state.discountFormTouch);

  const [formError, setFormError] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? discountName : <FormattedMessage id="add-promotion" />;

  const responseSuccess = () => {
    const message = `Success ${id ? 'update' : 'create'} promotion`;

    dispatch(snackbarSuccess(message));
    navigate('/promotion/discount', { replace: true });
  };

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    useDiscountFormStore.setState({ discountFormTouch: false });

    setIsError(true);
    setErrContent({ title: message.msg, detail: message.detail });
  };

  const onSubmit = async () => {
    console.log('allState', allState);
    if (discountFormError) return;

    if (id) {
      // update
      await updatePromotionDiscount({ id, ...getAllState() })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      // create
      await createPromotionDiscount(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/promotion/discount' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isTouchForm || formError || discountFormError}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

PromotionDiscountFormHeader.propTypes = {
  discountName: PropTypes.string
};

export default PromotionDiscountFormHeader;
