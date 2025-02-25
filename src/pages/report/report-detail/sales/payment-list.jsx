import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesPaymentList({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="sales" />,
        accessor: 'sales'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="method" />,
        accessor: 'method'
      },
      {
        Header: <FormattedMessage id="paid" />,
        accessor: 'paid'
      },
      {
        Header: <FormattedMessage id="created-by" />,
        accessor: 'createdBy'
      },
      {
        Header: <FormattedMessage id="created-at" />,
        accessor: 'createdAt'
      },
      {
        Header: <FormattedMessage id="amount-rp" />,
        accessor: 'amount',
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    []
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        sales: 'INV-12324',
        locationName: 'RPC Duren',
        method: 'Transfer',
        paid: '2025-01-03 11:55',
        createdBy: 'Agus',
        createdAt: '2025-01-03 11:50',
        amount: 100000
      },
      {
        sales: 'INV-12324',
        locationName: 'RPC Duren',
        method: 'Transfer',
        paid: '2025-01-03 11:55',
        createdBy: 'Agus',
        createdAt: '2025-01-03 11:50',
        amount: 100000
      },
      {
        sales: 'INV-12324',
        locationName: 'RPC Duren',
        method: 'Transfer',
        paid: '2025-01-03 11:55',
        createdBy: 'Agus',
        createdAt: '2025-01-03 11:50',
        amount: 100000
      }
    ],
    []
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={dummyTableData}
        totalPagination={totalPagination || 10}
        colSpanPagination={14}
        setPageNumber={filter.goToPage}
        onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
        setPageRow={filter.rowPerPage}
        onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event }))}
        onOrder={(event) => {
          setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
        }}
      />
    </div>
  );
}
