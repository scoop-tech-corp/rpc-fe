import { useMemo } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function CustomerSubAccountList({ data, filter, setFilter }) {
  const tablesData = data?.data;
  const totalPagination = data?.totalPagination;

  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="customer-name" />,
        accessor: 'customerName'
      },
      { Header: <FormattedMessage id="pet-name" />, accessor: 'petName' },
      { Header: <FormattedMessage id="condition" />, accessor: 'condition' },
      { Header: <FormattedMessage id="type" />, accessor: 'type' },
      { Header: <FormattedMessage id="race" />, accessor: 'race' },
      { Header: <FormattedMessage id="gender" />, accessor: 'gender' },
      { Header: <FormattedMessage id="sterile" />, accessor: 'sterile' },
      { Header: <FormattedMessage id="birth-date" />, accessor: 'birthDate' },
      { Header: <FormattedMessage id="color" />, accessor: 'color' }
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
          colSpanPagination={9}
        />
      </ScrollX>
    </>
  );
}
