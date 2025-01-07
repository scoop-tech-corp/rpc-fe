import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function StaffLogin({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const tableColumns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'name' },
      { Header: <FormattedMessage id="date" />, accessor: 'date' },
      { Header: <FormattedMessage id="time" />, accessor: 'time' },
      { Header: 'IP Address', accessor: 'ipAddress' },
      { Header: <FormattedMessage id="device" />, accessor: 'device' }
    ],
    []
  );

  return (
    <>
      <ScrollX>
        <ReactTable
          columns={tableColumns}
          data={tablesData || []}
          totalPagination={totalPagination || 0}
          setPageNumber={filter.goToPage}
          onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
          setPageRow={filter.rowPerPage}
          onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event }))}
          onOrder={(event) => {
            setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
          }}
        />
      </ScrollX>
    </>
  );
}
