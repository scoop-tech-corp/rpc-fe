import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { getStaffLeave, staffLeaveApprovedRejected } from './service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { useDispatch } from 'react-redux';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';

const StaffLeavePending = (props) => {
  const { user } = useAuth();
  const [getStaffLeavePendingData, setStaffLeavePendingData] = useState({ data: [], totalPagination: 0 });
  const [dialog, setDialog] = useState({ isOpen: false, id: null });
  const [dialogReject, setDialogReject] = useState({ isOpen: false, id: null });
  const dispatch = useDispatch();
  const roleHaveAction = ['administrator', 'office'];

  const columnDefault = [
    {
      Header: <FormattedMessage id="requester" />,
      accessor: 'requesterName'
    },
    {
      Header: <FormattedMessage id="role" />,
      accessor: 'jobName'
    },
    {
      Header: <FormattedMessage id="location" />,
      accessor: 'locationName'
    },
    {
      Header: <FormattedMessage id="leave-type" />,
      accessor: 'leaveType',
      style: { width: '150px' }
    },
    {
      Header: <FormattedMessage id="date" />,
      accessor: 'fromDate'
    },
    {
      Header: <FormattedMessage id="days" />,
      accessor: 'duration'
    },
    {
      Header: <FormattedMessage id="remark" />,
      accessor: 'remark'
    },
    {
      Header: <FormattedMessage id="created-at" />,
      accessor: 'createdAt'
    }
  ];

  const colAction = [
    {
      Header: '',
      accessor: 'action',
      isNotSorting: true,
      style: { width: '210px' },
      Cell: (data) => {
        const getId = data.row.original.leaveRequestId;

        return (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialog({ isOpen: true, id: getId })}
              style={{ marginRight: '5px' }}
            >
              <FormattedMessage id="approve" />
            </Button>
            <Button variant="contained" color="error" onClick={() => setDialogReject({ isOpen: true, id: getId })}>
              <FormattedMessage id="reject" />
            </Button>
          </>
        );
      }
    }
  ];

  const columnDynamic = roleHaveAction.includes(user?.role) ? colAction : [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => [...columnDefault, ...columnDynamic], []);

  const onOrderingChange = (event) => {
    props.parameter.orderValue = event.order;
    props.parameter.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    props.parameter.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    props.parameter.rowPerPage = event;
    fetchData();
  };

  const fetchData = async () => {
    const getData = await getStaffLeave(props.parameter);

    setStaffLeavePendingData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const onApprove = async (val) => {
    if (val) {
      await staffLeaveApprovedRejected({ leaveRequestId: dialog.id, status: 'approve', reason: '' })
        .then((resp) => {
          if (resp.status === 200) {
            setDialog({ isOpen: false, id: null });
            dispatch(snackbarSuccess('Success approved request staff leave'));
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog({ isOpen: false, id: null });
    }
  };
  const onReject = async (val) => {
    if (val) {
      await staffLeaveApprovedRejected({ leaveRequestId: dialogReject.id, status: 'reject', reason: val })
        .then((resp) => {
          if (resp.status === 200) {
            setDialogReject({ isOpen: false, id: null });
            dispatch(snackbarSuccess('Success reject request staff leave'));
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    }
  };

  useEffect(() => {
    console.log('init pending list');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.parameter]);

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={getStaffLeavePendingData.data}
            totalPagination={getStaffLeavePendingData.totalPagination}
            setPageNumber={props.parameter.goToPage}
            setPageRow={props.parameter.rowPerPage}
            colSpanPagination={9}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </ScrollX>
      </MainCard>
      <FormReject
        open={dialogReject.isOpen}
        title={'Konfirmasi dan harap isi alasan penolakan cuti!'}
        onSubmit={(param) => onReject(param)}
        onClose={() => setDialogReject({ isOpen: false, id: null })}
      />
      <ConfirmationC
        open={dialog.isOpen}
        title={<FormattedMessage id="approval" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-approve-this-request" />}
        onClose={(response) => onApprove(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

StaffLeavePending.propTypes = {
  parameter: PropTypes.object
};

export default StaffLeavePending;
