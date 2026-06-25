import ScrollX from 'components/ScrollX';

import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function CustomerReferralSpend({ data, filter, setFilter }) {
  const tablesData = data?.data;
  const totalPagination = data?.totalPagination;

  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="referred-by" />,
        accessor: 'referenceBy'
      },
      { Header: <FormattedMessage id="referrer" />, accessor: 'reference' },
      { Header: <FormattedMessage id="customer" />, accessor: 'customer' },
      { Header: <FormattedMessage id="total-spend-rp" />, accessor: 'totalSpend' }
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
          colSpanPagination={4}
          setPageNumber={filter?.goToPage}
          onGotoPage={(page) => setFilter((e) => ({ ...e, goToPage: page }))}
          setPageRow={filter?.rowPerPage}
          onPageSize={(size) => setFilter((e) => ({ ...e, rowPerPage: size, goToPage: 1 }))}
          onOrder={(event) => setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }))}
        />
      </ScrollX>
    </>
  );
}
