import { useEffect, useState } from 'react';
import { getAllState, useFormSecurityGroupStore } from './form-security-group-store';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { createSecurityGroup, updateSecurityGroup, validationFormSecurityGroup } from '../service';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import PropTypes from 'prop-types';
import ErrorContainer from 'components/@extended/ErrorContainer';

const FormSecurityGroupHeader = (props) => {
  const formSecurityGroupError = useFormSecurityGroupStore((state) => state.formSecurityGroupError);
  const isTouchForm = useFormSecurityGroupStore((state) => state.formSecurityGroupTouch);
  const allState = useFormSecurityGroupStore((state) => state);

  const [isError, setIsError] = useState(false);
  const [formError, setFormError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  let { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = () => (id ? props.securityGroupName : <FormattedMessage id="add-security-group" />);

  const responseSuccess = async (resp) => {
    if (resp && resp.status === 200) {
      const message = `Success create data`;
      dispatch(snackbarSuccess(message));
      navigate('/staff/security-group', { replace: true });
    }
  };

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useFormSecurityGroupStore.setState({ formSecurityGroupTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };

  const onSubmit = async () => {
    if (formSecurityGroupError) return;
    const getFormValue = getAllState();

    if (!id) {
      await createSecurityGroup(getFormValue).then(responseSuccess).catch(responseError);
    } else {
      await updateSecurityGroup({ id, ...getFormValue })
        .then(responseSuccess)
        .catch(responseError);
    }
  };

  useEffect(() => {
    const getRespValidForm = validationFormSecurityGroup();
    setFormError(Boolean(getRespValidForm));
  }, [allState]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage()}
        locationBackConfig={{ setLocationBack: true, customUrl: '/staff/security-group' }}
        action={
          <>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={onSubmit}
              disabled={!isTouchForm || formError || formSecurityGroupError}
            >
              <FormattedMessage id="save" />
            </Button>
          </>
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

FormSecurityGroupHeader.propTypes = {
  securityGroupName: PropTypes.string
};

export default FormSecurityGroupHeader;
