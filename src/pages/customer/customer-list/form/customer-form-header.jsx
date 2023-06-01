import { getAllState, useCustomerFormStore } from './customer-form-store';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createMessageBackend } from 'service/service-global';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createCustomer } from 'pages/customer/service';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const CustomerFormHeader = (props) => {
  const allState = useCustomerFormStore((state) => state);
  const customerFormError = useCustomerFormStore((state) => state.customerFormError);
  const isTouchForm = useCustomerFormStore((state) => state.customerFormTouch);
  const [formError, setFormError] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? props.customerName : <FormattedMessage id="add-customer" />;

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useCustomerFormStore.setState({ customerFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const responseSuccess = async (resp) => {
    const nextProcessSuccess = (message) => {
      dispatch(snackbarSuccess(message));
      navigate('/customer/list', { replace: true });
    };

    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} customer`;

      if (id) {
        const thenUpload = (res) => {
          if (res && res.status === 200) nextProcessSuccess(message);
        };

        await uploadImageCustomer({ image, id }).then(thenUpload).catch(responseError);
      } else {
        nextProcessSuccess(message);
      }
    }
  };

  const onSubmit = async () => {
    if (customerFormError) return;

    if (id) {
      // update process
      await updateCustomer({ ...getAllState(), id })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      // create process
      await createCustomer(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  useEffect(() => {
    let getFirstName = getAllState().firstName;
    let getLocation = getAllState().locationId;
    let getNumberId = getAllState().numberId;

    if (!getFirstName || !getLocation || !getNumberId) {
      setFormError(true);
    } else {
      setFormError(false);
    }
  }, [allState]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/customer/list' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isTouchForm || formError || customerFormError}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

CustomerFormHeader.propTypes = {
  customerName: PropTypes.string
};

export default CustomerFormHeader;
