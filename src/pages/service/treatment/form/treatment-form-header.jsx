import { DownOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import FormItem from './step2/form-item';
import { defaultTreatmentForm, useTreatmentStore } from '../treatment-form-store';
import OffCanvas from 'components/offCanvas';
import { deleteTreatment, getTreatmentById, updateTreatment } from '../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { dispatch } from 'store';
import { createMessageBackend } from 'service/service-global';
import { useEffect } from 'react';

const TreatmentFormHeader = (props) => {
  const { showEdit, setShowEdit } = props;
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const totalColumn = useTreatmentStore((state) => state.formStep2.totalColumn);
  const treatmentDetail = useTreatmentStore((state) => state.dataSupport.treatmentDetail);

  const isEdit = useTreatmentStore((state) => state.formStep2Item.isEdit);

  const setTitlePage = <FormattedMessage id="create-plan" />;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleted = () => {
    let selectedRow = [treatmentDetail?.id];
    deleteTreatment(selectedRow)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success delete data'));
          navigate('/service/treatment', { replace: true });
        }
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
  };

  const regetDetailData = async () => {
    const getTreatmentDetail = await getTreatmentById({ id: treatmentDetail?.id });

    useTreatmentStore.setState({
      dataSupport: {
        ...useTreatmentStore.getState().dataSupport,
        treatmentDetail: await getTreatmentDetail.data
      }
    });
  };
  const handleDisabled = () => {
    let params = {
      id: [treatmentDetail?.id],
      status: treatmentDetail?.status == 2 || treatmentDetail?.status == 3 ? '1' : '3'
    };
    updateTreatment(params)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success update data'));
          regetDetailData();
        }
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
  };

  const open = Boolean(anchorEl);
  const [openOffcanvas, setOpenOffcanvas] = useState(false);

  useEffect(() => {
    if (showEdit.id) {
      setOpenOffcanvas(true);

      if (showEdit.serviceName) {
        setStep(3);
      }

      if (showEdit.taskName) {
        setStep(4);
      }

      if (showEdit.productName) {
        setStep(2);
      }
      useTreatmentStore.setState({
        ...useTreatmentStore.getState(),
        formStep2Item: {
          ...useTreatmentStore.getState().formStep2Item,
          task_id: showEdit.taskName,
          service_id: showEdit.serviceName,
          start: showEdit.start,
          product_name: showEdit.productName,
          quantity: showEdit.quantity,
          id: showEdit.id,
          frequency_id: {
            label: showEdit.frequencyName,
            value: showEdit.frequencyId
          },
          duration: showEdit.duration,
          notes: showEdit.notes,
          isEdit: true
        }
      });
    }
  }, [showEdit]);

  return (
    <>
      <HeaderPageCustom
        title={setTitlePage}
        onClickBack={props.onClose ? props.onClose : null}
        locationBackConfig={{ setLocationBack: true, customUrl: '/service/treatment' }}
        action={
          <>
            <Button variant="outlined" startIcon={<PlusOutlined />} onClick={() => setOpenOffcanvas(true)}>
              <FormattedMessage id="item" />
            </Button>

            <OffCanvas
              title={
                isEdit ? (
                  step == 1 ? (
                    <FormattedMessage id="add-item" />
                  ) : step == 2 ? (
                    <FormattedMessage id="edit-product" />
                  ) : step == 3 ? (
                    <FormattedMessage id="edit-service" />
                  ) : (
                    <FormattedMessage id="edit-task" />
                  )
                ) : step == 1 ? (
                  <FormattedMessage id="add-item" />
                ) : step == 2 ? (
                  <FormattedMessage id="add-product" />
                ) : step == 3 ? (
                  <FormattedMessage id="add-service" />
                ) : (
                  <FormattedMessage id="add-task" />
                )
              }
              isOpen={openOffcanvas}
            >
              <>
                {step == 1 ? (
                  <>
                    <Button variant="contained" sx={{ mb: 2 }} fullWidth color="primary" onClick={() => setStep(2)}>
                      <FormattedMessage id="product" />
                    </Button>
                    <Button variant="contained" sx={{ mb: 2 }} fullWidth color="primary" onClick={() => setStep(3)}>
                      <FormattedMessage id="service" />
                    </Button>
                    <Button variant="contained" sx={{ mb: 2 }} fullWidth color="primary" onClick={() => setStep(4)}>
                      <FormattedMessage id="task" />
                    </Button>

                    <Button
                      variant="contained"
                      sx={{ mb: 2 }}
                      fullWidth
                      color="error"
                      onClick={() => {
                        useTreatmentStore.setState(
                          {
                            ...useTreatmentStore.getState(),
                            formStep2Item: {
                              ...defaultTreatmentForm.formStep2Item
                            }
                          },
                          true
                        );
                        setOpenOffcanvas(false);
                      }}
                    >
                      <FormattedMessage id="cancel" />
                    </Button>
                  </>
                ) : (
                  <FormItem step={step} setStep={setStep} setParams={props.setParams} />
                )}
              </>
            </OffCanvas>
            <Button
              variant="outlined"
              color="success"
              startIcon={<PlusOutlined />}
              onClick={() => props.setTotalColumn(Number(totalColumn + 1))}
            >
              <FormattedMessage id="day" />
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<MinusOutlined />}
              disabled={totalColumn == 1}
              onClick={() => props.setTotalColumn(Number(totalColumn == 1 ? 1 : totalColumn - 1))}
            >
              <FormattedMessage id="day" />
            </Button>
            <div>
              <Button
                id="demo-customized-button"
                aria-controls={open ? 'demo-customized-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                disableElevation
                color="secondary"
                variant="outlined"
                onClick={handleClick}
                endIcon={<DownOutlined />}
              >
                Actions
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button'
                }}
              >
                <MenuItem onClick={() => setOpenOffcanvas(true)}>
                  <FormattedMessage id="add-item" />
                </MenuItem>
                <MenuItem onClick={() => props.setTotalColumn(Number(totalColumn + 1))}>
                  <FormattedMessage id="add-day" />
                </MenuItem>
                <MenuItem onClick={() => props.setTotalColumn(Number(totalColumn == 1 ? 1 : totalColumn - 1))}>
                  <FormattedMessage id="remove-day" />
                </MenuItem>
                <MenuItem onClick={handleDisabled}>
                  {treatmentDetail?.status == 2 || treatmentDetail?.status == 3 ? (
                    <FormattedMessage id="enabled" />
                  ) : (
                    <FormattedMessage id="disabled" />
                  )}
                </MenuItem>
                <MenuItem onClick={handleDeleted}>
                  <FormattedMessage id="delete" />
                </MenuItem>
              </Menu>
            </div>
          </>
        }
      />
      {/* <ErrorContainer open={!isTouchForm && isError} content={errContent} /> */}
    </>
  );
};

TreatmentFormHeader.propTypes = {
  productSellName: PropTypes.string
};

export default TreatmentFormHeader;
