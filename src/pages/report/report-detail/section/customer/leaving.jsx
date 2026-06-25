import { useMemo } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function CustomerLeaving({ data, filter, setFilter }) {
  const tablesData = data?.data;
  const totalPagination = data?.totalPagination;

  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name'
      },
      { Header: <FormattedMessage id="location" />, accessor: 'location' },
      { Header: <FormattedMessage id="date" />, accessor: 'date' },
      { Header: <FormattedMessage id="customer-group" />, accessor: 'customerGroup' },
      { Header: <FormattedMessage id="customer-for" />, accessor: 'customerFor' },
      { Header: <FormattedMessage id="total-rp" />, accessor: 'total' }
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
          setPageNumber={filter?.goToPage}
          setPageRow={filter?.rowPerPage}
          onOrder={(event) => setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }))}
          onGotoPage={(page) => setFilter((e) => ({ ...e, goToPage: page }))}
          onPageSize={(size) => setFilter((e) => ({ ...e, rowPerPage: size, goToPage: 1 }))}
        />
      </ScrollX>
    </>
  );
}
