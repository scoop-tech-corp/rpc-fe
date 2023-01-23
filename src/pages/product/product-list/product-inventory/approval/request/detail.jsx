/* eslint-disable jsx-a11y/alt-text */
import { Chip, Grid, Stack } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { useEffect, useMemo, useState } from 'react';
import { getProductInventoryDetail, updateProductInventoryApproval } from 'pages/product/product-list/service';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { useDispatch } from 'react-redux';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import configGlobal from '../../../../../../../src/config';

const ProductInventoryApprovalDetail = (props) => {
  const [detailData, setDetailData] = useState([]);
  const [dialog, setDialog] = useState({ approval: false, reject: false, data: { id: '', status: '' } });
  const { user } = useAuth();
  const dispatch = useDispatch();

  const columnOffice = [
    {
      Header: <FormattedMessage id="licensing-status" />,
      isNotSorting: true,
      accessor: 'isApprovedOffice',
      Cell: (data) => {
        switch (+data.value) {
          case 0:
            return <Chip color="warning" label="Waiting" size="small" variant="light" />;
          case 1:
            return <Chip color="success" label="Accept" size="small" variant="light" />;
          case 2:
            return <Chip color="error" label="Reject" size="small" variant="light" />;
        }
      }
    },
    { Header: <FormattedMessage id="reason" />, isNotSorting: true, accessor: 'reasonOffice' },
    { Header: <FormattedMessage id="given-by" />, isNotSorting: true, accessor: 'officeApprovedBy' },
    { Header: <FormattedMessage id="given-at" />, isNotSorting: true, accessor: 'officeApprovedAt' }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columnAdmin = [
    {
      Header: <FormattedMessage id="licensing-status-admin" />,
      isNotSorting: true,
      accessor: 'isApprovedAdmin',
      Cell: (data) => {
        switch (+data.value) {
          case 0:
            return <Chip color="warning" label="Waiting" size="small" variant="light" />;
          case 1:
            return <Chip color="success" label="Accept" size="small" variant="light" />;
          case 2:
            return <Chip color="error" label="Reject" size="small" variant="light" />;
        }
      }
    },
    { Header: <FormattedMessage id="reason" />, isNotSorting: true, accessor: 'reasonAdmin' },
    { Header: <FormattedMessage id="given-by-(admin)" />, isNotSorting: true, accessor: 'adminApprovedBy' },
    { Header: <FormattedMessage id="given-at-(admin)" />, isNotSorting: true, accessor: 'adminApprovedAt' },
    { Header: <FormattedMessage id="given-by-(office)" />, isNotSorting: true, accessor: 'officeApprovedBy' },
    { Header: <FormattedMessage id="given-at-(office)" />, isNotSorting: true, accessor: 'officeApprovedAt' }
  ];

  const columnDefault = [
    {
      Header: <FormattedMessage id="product-type" />,
      isNotSorting: true,
      accessor: 'productType',
      Cell: (data) => {
        if (data.value) {
          return data.value
            .split('product')
            .map((dt) => (!dt ? 'Product' : dt))
            .join(' ');
        } else {
          return '-';
        }
      }
    },
    { Header: <FormattedMessage id="product-name" />, isNotSorting: true, accessor: 'productName' },
    { Header: <FormattedMessage id="usage" />, isNotSorting: true, accessor: 'usage' },
    { Header: <FormattedMessage id="date-condition" />, isNotSorting: true, accessor: 'dateCondition' },
    { Header: <FormattedMessage id="item-condition" />, isNotSorting: true, accessor: 'itemCondition' },
    {
      Header: <FormattedMessage id="image" />,
      accessor: 'imagePath',
      isNotSorting: true,
      style: {
        width: '150px'
      },
      Cell: (data) => {
        return (
          <a href={`${configGlobal.apiUrl}${data.value}`} target="_blank" rel="noreferrer">
            <img src={`${configGlobal.apiUrl}${data.value}`} width="80%" />
          </a>
        );
      }
    }
  ];

  const columnDynamic = () => {
    let finalColumn = user.role === 'administrator' ? columnAdmin : columnOffice;

    if (props.parentProcedure === 'list-request') {
      finalColumn = [
        ...finalColumn,
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
              </Stack>
            );
          }
        }
      ];
    }

    return finalColumn;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(
    () => [...columnDefault, ...columnDynamic()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchData = async () => {
    if (props.id) {
      const getDetail = await getProductInventoryDetail(props.id);
      setDetailData(getDetail.data);
    }
  };

  const onClickApproval = (rowData) => {
    setDialog((prev) => ({ ...prev, approval: true, data: { id: +rowData.id, status: 1 } }));
  };

  const onClickReject = (rowData) => {
    setDialog((prev) => ({ ...prev, reject: true, data: { id: +rowData.id, status: 2 } }));
  };

  const onConfirmApproval = async (data) => {
    if (data) {
      const param = { id: dialog.data.id, status: dialog.data.status, reason: '' };
      await updateProductInventoryApproval(param)
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(snackbarSuccess('Success menerima status'));
            fetchData();
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
          fetchData();
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });

    setDialog((prev) => ({ ...prev, reject: false }));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  const onCancel = () => {
    props.onClose(true);
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-requirement" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="xl"
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ReactTable columns={columns} data={detailData} />
          </Grid>
        </Grid>
      </ModalC>
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
    </>
  );
};

ProductInventoryApprovalDetail.propTypes = {
  open: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.any),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  parentProcedure: PropTypes.string
};

export default ProductInventoryApprovalDetail;
