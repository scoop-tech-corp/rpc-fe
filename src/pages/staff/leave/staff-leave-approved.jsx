import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { getStaffLeave } from './service';
import { getAllState, useStaffLeaveIndexStore } from '.';

import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';

const StaffLeaveApproved = () => {
  const keyword = useStaffLeaveIndexStore((state) => state.keyword);
  const locationId = useStaffLeaveIndexStore((state) => state.locationId);
  const isRefresh = useStaffLeaveIndexStore((state) => state.isRefresh);
  const dateRange = useStaffLeaveIndexStore((state) => state.dateRange);

  const [getStaffLeaveApproveData, setStaffLeaveApproveData] = useState({ data: [], totalPagination: 0 });
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
        Header: <FormattedMessage id="approved-by" />,
        accessor: 'approvedBy'
      },
      {
        Header: <FormattedMessage id="approved-at" />,
        accessor: 'approvedAt'
      }
    ],
    []
  );

  const onOrderingChange = (event) => {
    useStaffLeaveIndexStore.setState({ orderValue: event.order, orderColumn: event.column });
    fetchData();
  };

  const onGotoPageChange = (event) => {
    useStaffLeaveIndexStore.setState({ goToPage: event });
    fetchData();
  };

  const onPageSizeChange = (event) => {
    useStaffLeaveIndexStore.setState({ rowPerPage: event });
    fetchData();
  };

  const fetchData = async () => {
    const getData = await getStaffLeave(getAllState());

    setStaffLeaveApproveData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  useEffect(() => {
    fetchData();
  }, [keyword, locationId, dateRange]);

  useEffect(() => {
    if (isRefresh) {
      fetchData();
    }

    useStaffLeaveIndexStore.setState({ isRefresh: false });
  }, [isRefresh]);

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={getStaffLeaveApproveData.data}
            totalPagination={getStaffLeaveApproveData.totalPagination}
            setPageNumber={getAllState().goToPage}
            setPageRow={getAllState().rowPerPage}
            colSpanPagination={10}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </ScrollX>
      </MainCard>
    </>
  );
};

export default StaffLeaveApproved;
