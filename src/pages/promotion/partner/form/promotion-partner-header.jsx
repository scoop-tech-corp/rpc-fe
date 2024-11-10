import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import { createPromotionPartner, updatePromotionPartner } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const PromotionPartnerFormHeader = ({ form, formError }) => {
  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorState, setErrorState] = useState({ isError: false, title: '', detail: '' });

  const setTitlePage = id ? <FormattedMessage id="update-partner" /> : <FormattedMessage id="add-partner" />;

  const responseSuccess = () => {
    const message = `Success ${id ? 'update' : 'create'} promotion partner`;

    dispatch(snackbarSuccess(message));
    navigate('/promotion/partner', { replace: true });
  };

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setErrorState({ isError: true, title: message.msg, detail: message.detail });
  };

  const onSubmit = async () => {
    let payload = {
      name: form.basicDetail.name,
      status: form.basicDetail.status,
      phone: form.phone.data,
      email: form.email.data,
      messenger: form.messenger.data
    };
    if (id) payload = { ...payload, id };
    console.log('payload', payload);

    const actionForm$ = id ? updatePromotionPartner(payload) : createPromotionPartner(payload);
    actionForm$.then(responseSuccess).catch(responseError);
  };

  const isFormError = () => formError.nameErr || formError.statusErr || formError.phoneErr.length;

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/promotion/partner' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={Boolean(!form.is_form_touched || isFormError())}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={errorState.isError} content={errorState} />
    </>
  );
};

PromotionPartnerFormHeader.propTypes = {
  form: PropTypes.object,
  formError: PropTypes.object
};

export default PromotionPartnerFormHeader;
