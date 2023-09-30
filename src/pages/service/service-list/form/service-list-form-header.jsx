import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Menu, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createServiceList, deleteServiceList, updateServiceList } from '../service';
import { defaultServiceListForm, getAllState, useServiceFormStore } from './service-form-store';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ErrorContainer from 'components/@extended/ErrorContainer';

const ServiceListFormHeader = (props) => {
  const isDetail = useServiceFormStore((state) => state.isDetail);
  const serviceFormError = useServiceFormStore((state) => state.serviceFormError);
  const isTouchForm = useServiceFormStore((state) => state.productSellFormTouch);
  const originalName = useServiceFormStore((state) => state.originalName);
  const id = useServiceFormStore((state) => state.id);
  const type = useServiceFormStore((state) => state.type);
  const fullName = useServiceFormStore((state) => state.fullName);
  const status = useServiceFormStore((state) => state.status);

  const [isError, setIsError] = useState(false);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setTitlePage = id ? originalName : <FormattedMessage id="add-service-list" />;

  const responseError = (err) => {
    const message = createMessageBackend(err, true);
    setIsError(true);
    useServiceFormStore.setState({ productSellFormTouch: false });

    setErrContent({ title: message.msg, detail: message.detail });
  };
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const responseSuccess = async (resp) => {
    const nextProcessSuccess = (message) => {
      dispatch(snackbarSuccess(message));
      navigate('/service/list', { replace: true });
    };

    if (resp && resp.status === 200) {
      const message = `Success ${id ? 'update' : 'create'} product sell`;
      useServiceFormStore.setState(defaultServiceListForm);

      nextProcessSuccess(message);
    }
  };

  const onSubmit = async () => {
    if (id) {
      // console.log(getAllState());
      updateServiceList(getAllState()).then(responseSuccess).catch(responseError);
    } else {
      await createServiceList(getAllState()).then(responseSuccess).catch(responseError);
    }
  };

  const handleDeleted = () => {
    let selectedRow = [id];
    deleteServiceList(selectedRow)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success delete data'));
          props.setParams((_params) => ({ ..._params }));
          props.onClose();
        }
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
  };

  const handleEdited = () => {
    useServiceFormStore.setState({ ...defaultServiceListForm, id });
    navigate(`/service/list/form/${id}`);
  };

  const open = Boolean(anchorEl);
  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        onClickBack={props.onClose ? props.onClose : null}
        locationBackConfig={{ setLocationBack: true, customUrl: '/service/list' }}
        action={
          isDetail ? (
            <div>
              <Button
                id="demo-customized-button"
                aria-haspopup="true"
                aria-controls={open ? 'demo-customized-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                disableElevation
                color="secondary"
                onClick={handleClick}
                variant="text"
                startIcon={<DownOutlined />}
              >
                Actions
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                style={{ width: 100 }}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button'
                }}
              >
                <MenuItem onClick={handleEdited}>Edit</MenuItem>
                <MenuItem onClick={handleDeleted}>Delete</MenuItem>
              </Menu>{' '}
            </div>
          ) : (
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={onSubmit}
              disabled={!fullName || type === '' || status === ''}
            >
              <FormattedMessage id="save" />
            </Button>
          )
        }
      />
      <ErrorContainer open={!isTouchForm && isError} content={errContent} />
    </>
  );
};

ServiceListFormHeader.propTypes = {
  productSellName: PropTypes.string
};

export default ServiceListFormHeader;
