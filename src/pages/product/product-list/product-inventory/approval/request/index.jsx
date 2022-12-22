import { Chip, Grid, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { updateProductInventoryApproval } from '../../../service';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { useDispatch } from 'react-redux';

import IconButton from 'components/@extended/IconButton';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import ListRequest from './list-request';
import ProductInventoryApprovalDetail from './detail';

const RequestProduct = () => {
  const [dialog, setDialog] = useState({ approval: false, reject: false, view: false, data: { id: '', status: '' } });
  const [initList, setInitList] = useState(false);
  const dispatch = useDispatch();
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="requirement" />,
        accessor: 'requirementName'
      },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="applicant" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: 'Status',
        accessor: 'isApprovedOffice',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="warning" label="Menunggu" size="small" variant="light" />;
            case 1:
              return <Chip color="success" label="Accept" size="small" variant="light" />;
          }
        }
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        style: {
          textAlign: 'center'
        },
        Cell: (data) => {
          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              <IconButton size="large" color="primary" onClick={() => onClickApproval(data.row.original)}>
                <CheckCircleOutlined />
              </IconButton>
              <IconButton size="large" color="error" onClick={() => onClickReject(data.row.original)}>
                <CloseCircleOutlined />
              </IconButton>
              <IconButton size="large" color="info" onClick={() => onClickDetail(data.row.original)}>
                <EyeOutlined />
              </IconButton>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const onClickApproval = (rowData) => {
    setDialog((prev) => ({ ...prev, approval: true, data: { id: +rowData.id, status: 1 } }));
  };

  const onClickReject = (rowData) => {
    setDialog((prev) => ({ ...prev, reject: true, data: { id: +rowData.id, status: 2 } }));
  };

  const onClickDetail = async (rowData) => {
    setDialog((prev) => ({ ...prev, view: true, data: { id: +rowData.id, status: '' } }));
  };

  const onConfirmApproval = async (data) => {
    if (data) {
      const param = { id: dialog.data.id, status: dialog.data.status, reason: '' };
      await updateProductInventoryApproval(param)
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(snackbarSuccess('Success menerima status'));
            setInitList(true);
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    }
    setDialog((prev) => ({ ...prev, approval: false }));
  };

  const onSubmitReject = async (reason) => {
    const param = { id: dialog.data.id, status: dialog.data.status, reason };
    await updateProductInventoryApproval(param)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success menolak data product inventory'));
          setInitList(true);
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });

    setDialog((prev) => ({ ...prev, reject: false }));
  };

  return (
    <>
      <Grid container spacing={3}>
        <ListRequest columns={columns} isInitList={initList} />
      </Grid>
      <FormReject
        open={dialog.reject}
        title={'Konfirmasi dan harap isi alasan penolakan produk inventory!'}
        onSubmit={(param) => onSubmitReject(param)}
        onClose={() => setDialog((prevState) => ({ ...prevState, reject: false }))}
      />
      <ConfirmationC
        open={dialog.approval}
        title={<FormattedMessage id="confirmation" />}
        content="Anda yakin ingin menerima status product inventory ini ?"
        onClose={(response) => onConfirmApproval(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      <ProductInventoryApprovalDetail
        open={dialog.view}
        id={dialog.data.id}
        onClose={(e) => setDialog((prevState) => ({ ...prevState, view: !e }))}
      />
    </>
  );
};

export default RequestProduct;
