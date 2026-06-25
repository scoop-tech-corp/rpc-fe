import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { useStockOpnameFormStore, getAllState } from './form-store';
import { createMessageBackend } from 'service/service-global';
import { createStockOpname, updateStockOpname } from '../service';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { useState } from 'react';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const StockOpnameFormHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isFormTouch = useStockOpnameFormStore((state) => state.isFormTouch);
  const isFormError = useStockOpnameFormStore((state) => state.isFormError);
  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  const onSubmit = async () => {
    if (isFormError) return;

    const state = getAllState();
    const payload = {
      stockOpnameNumber: state.stockOpnameNumber,
      title: state.title,
      startTime: state.startTime ? dayjs(state.startTime).format('YYYY-MM-DD HH:mm:ss') : '',
      locationId: state.locationId?.value ?? null,
      users: state.users.map((u) => u.value)
    };

    const request = id ? updateStockOpname({ ...payload, id }) : createStockOpname(payload);

    await request
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess(`Success ${id ? 'update' : 'create'} stock opname`));
          navigate('/product/stockopname', { replace: true });
        }
      })
      .catch((err) => {
        if (err) {
          const message = createMessageBackend(err, true);
          setIsError(true);
          setErrContent({ title: message.msg, detail: message.detail });
          useStockOpnameFormStore.setState({ isFormTouch: false });
        }
      });
  };

  return (
    <>
      <HeaderPageCustom
        title={<FormattedMessage id={id ? 'edit-stock-opname' : 'add-stock-opname'} />}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/stockopname' }}
        action={
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmit} disabled={!isFormTouch || isFormError}>
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isFormTouch && isError} content={errContent} />
    </>
  );
};

export default StockOpnameFormHeader;
