import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { createDeliveryOrder, updateDeliveryOrder } from '../service';
import { getAllState, useOrderFormStore } from './form-store';
import { PlusOutlined } from '@ant-design/icons';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const OrderFormHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const isFormTouch = useOrderFormStore((s) => s.isFormTouch);
  const isFormError = useOrderFormStore((s) => s.isFormError);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  const onSubmit = async () => {
    if (isFormError) return;

    const state = getAllState();
    const payload = {
      deliveryNumber: state.deliveryNumber,
      locationId: state.locationId?.value ?? null,
      customerId: state.customerId || null,
      customerName: state.customerName,
      customerPhone: state.customerPhone,
      deliveryAddress: state.deliveryAddress,
      deliveryDate: state.deliveryDate,
      deliveryTime: state.deliveryTime || null,
      scheduledAt: state.scheduledAt || null,
      orderId: state.orderId || null,
      note: state.note,
      details: state.details
    };

    const request = id ? updateDeliveryOrder({ ...payload, id }) : createDeliveryOrder(payload);

    await request
      .then((resp) => {
        if (resp.status === 200 || resp.status === 201) {
          dispatch(snackbarSuccess(`Success ${id ? 'update' : 'create'} delivery order`));
          navigate('/product/delivery-agent', { replace: true });
        }
      })
      .catch((err) => {
        if (err) {
          const message = createMessageBackend(err, true);
          setIsError(true);
          setErrContent({ title: message.msg, detail: message.detail });
          useOrderFormStore.setState({ isFormTouch: false });
        }
      });
  };

  return (
    <>
      <HeaderPageCustom
        title={
          <FormattedMessage
            id={id ? 'edit-delivery-order' : 'add-delivery-order'}
            defaultMessage={id ? 'Edit Delivery Order' : 'Add Delivery Order'}
          />
        }
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/delivery-agent' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isFormTouch || isFormError}
          >
            <FormattedMessage id="save" defaultMessage="Save" />
          </Button>
        }
      />
      <ErrorContainer open={!isFormTouch && isError} content={errContent} />
    </>
  );
};

export default OrderFormHeader;
