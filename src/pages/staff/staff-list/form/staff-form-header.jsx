import { getAllState, useStaffFormStore } from './staff-form-store';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createMessageBackend } from 'service/service-global';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { createStaff, updateStaff, uploadImageStaff, validationFormStaff } from '../service';
import { snackbarSuccess } from 'store/reducers/snackbar';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const StaffFormHeader = (props) => {
  const allState = useStaffFormStore((state) => state);
  const staffFormError = useStaffFormStore((state) => state.staffFormError);
  const isTouchForm = useStaffFormStore((state) => state.staffFormTouch);
  const [isError, setIsError] = useState(false);
  const [formError, setFormError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? props.staffName : <FormattedMessage id="add-staff" />;

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useStaffFormStore.setState({ staffFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const responseSuccess = async (resp) => {
    const nextProcessSuccess = (message) => {
      dispatch(snackbarSuccess(message));
      navigate('/staff/list', { replace: true });
    };

    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} staff`;

      if (id) {
        const thenUpload = (res) => {
          if (res && res.status === 200) nextProcessSuccess(message);
        };

        const typeIdentifications = getAllState().typeIdentifications;
        if (typeIdentifications.find((dt) => dt.image.isChange)) {
          await uploadImageStaff({ typeIdentifications, id }).then(thenUpload).catch(responseError);
        } else {
          nextProcessSuccess(message);
        }
      } else {
        nextProcessSuccess(message);
      }
    }
  };

  const onSubmit = async () => {
    if (staffFormError) return;

    if (id) {
      // update process
      await updateStaff({ ...getAllState(), id })
        .then(responseSuccess)
        .catch(responseError);
    } else {
      // create process
      await createStaff(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  useEffect(() => {
    const getRespValidForm = validationFormStaff('all');
    setFormError(getRespValidForm);
  }, [allState]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/staff/list' }}
        action={
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={onSubmit}
            disabled={!isTouchForm || formError || staffFormError}
          >
            <FormattedMessage id="save" />
          </Button>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

StaffFormHeader.propTypes = {
  staffName: PropTypes.string
};

export default StaffFormHeader;
