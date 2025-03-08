import { getAllState, useCustomerFormStore } from './customer-form-store';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createMessageBackend, detectUserPrivilage } from 'service/service-global';
import { Button } from '@mui/material';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createCustomer, deleteCustomerList, updateCustomer, uploadImageCustomer } from 'pages/customer/service';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';
import useAuth from 'hooks/useAuth';
import ConfirmationC from 'components/ConfirmationC';

const CustomerFormHeader = (props) => {
  const allState = useCustomerFormStore((state) => state);
  const customerFormError = useCustomerFormStore((state) => state.customerFormError);
  const isTouchForm = useCustomerFormStore((state) => state.customerFormTouch);
  const [formError, setFormError] = useState(false);
  const { user } = useAuth();
  const userPrivilage = detectUserPrivilage(user?.extractMenu.masterMenu);

  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  const [dialogDelete, setDialogDelete] = useState(false);

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

        await uploadImageCustomer({ ...getAllState(), id })
          .then(thenUpload)
          .catch(responseError);
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

  const onConfirm = async (value) => {
    if (value) {
      await deleteCustomerList([id])
        .then((resp) => {
          if (resp.status === 200) {
            setDialogDelete(false);
            dispatch(snackbarSuccess('Success Delete Customer'));
            navigate('/customer/list', { replace: true });
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialogDelete(false);
    }
  };

  const isShowBtnSave = () => {
    if (id && userPrivilage == 4) return true;
    else if (!id && [2, 4].includes(userPrivilage)) return true;
    else return false;
  };

  useEffect(() => {
    let getFirstName = getAllState().firstName;
    let getLocation = getAllState().locationId;
    let getCustomerGroupId = getAllState().customerGroupId;

    if (!getFirstName || !getLocation || !getCustomerGroupId) {
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
          isShowBtnSave() && (
            <>
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={onSubmit}
                disabled={!isTouchForm || formError || customerFormError}
              >
                <FormattedMessage id="save" />
              </Button>
              {id && (
                <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialogDelete(true)}>
                  <FormattedMessage id="delete" />
                </Button>
              )}
            </>
          )
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
      <ConfirmationC
        open={dialogDelete}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

CustomerFormHeader.propTypes = {
  customerName: PropTypes.string
};

export default CustomerFormHeader;
