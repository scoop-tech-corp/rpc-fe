import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { getStaffLeave } from './service';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

const StaffLeaveRejected = (props) => {
  const [getStaffLeaveRejectData, setStaffLeaveRejectData] = useState({ data: [], totalPagination: 0 });
  const columns = useMemo(
    () => [
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
        accessor: 'leaveType'
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
      },
      {
        Header: <FormattedMessage id="rejected-by" />,
        accessor: 'rejectedBy'
      },
      {
        Header: <FormattedMessage id="rejected-reason" />,
        accessor: 'rejectedReason'
      },
      {
        Header: <FormattedMessage id="rejected-at" />,
        accessor: 'rejectedAt'
      }
    ],
    []
  );

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

    setStaffLeaveRejectData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  useEffect(() => {
    console.log('init rejected list');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.parameter]);

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={getStaffLeaveRejectData.data}
            totalPagination={getStaffLeaveRejectData.totalPagination}
            setPageNumber={props.parameter.goToPage}
            setPageRow={props.parameter.rowPerPage}
            colSpanPagination={11}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </ScrollX>
      </MainCard>
    </>
  );
};

StaffLeaveRejected.propTypes = {
  parameter: PropTypes.object
};

export default StaffLeaveRejected;
