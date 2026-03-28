import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import { createServicePolicies, updateServicePolicies } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

// Version validation regex: x.x format
const versionRegex = /^\d+\.\d+$/;

const PoliciesFormHeader = ({ form, formError }) => {
  let { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorState, setErrorState] = useState({ isError: false, title: '', detail: '' });

  const setTitlePage = id ? <FormattedMessage id="edit-policy" /> : <FormattedMessage id="add-policy" />;

  const responseSuccess = () => {
    const message = `Success ${id ? 'update' : 'create'} policy`;

    dispatch(snackbarSuccess(message));
    navigate('/service/policies', { replace: true });
  };

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setErrorState({ isError: true, title: message.msg, detail: message.detail });
  };

  const onSubmit = async () => {
    // Get category values array
    const categoryValues = form.category.map((cat) => cat.value);

    let payload = {
      title: form.title,
      content: form.content,
      category: categoryValues,
      status: form.status ? 'active' : 'inactive',
      version: form.version
    };
    if (id) payload = { ...payload, id };

    const actionForm$ = id ? updateServicePolicies(payload) : createServicePolicies(payload);
    actionForm$.then(responseSuccess).catch(responseError);
  };

  const isFormError = () => {
    const hasErrors = formError.titleErr || formError.contentErr || formError.versionErr;
    const hasEmptyRequired = !form.title || !form.content || !form.version;
    const invalidVersion = form.version && !versionRegex.test(form.version);
    return hasErrors || hasEmptyRequired || invalidVersion;
  };

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        locationBackConfig={{ setLocationBack: true, customUrl: '/service/policies' }}
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

PoliciesFormHeader.propTypes = {
  form: PropTypes.object,
  formError: PropTypes.object
};

export default PoliciesFormHeader;
