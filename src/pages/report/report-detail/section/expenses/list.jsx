import { Link } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import { useNavigate } from 'react-router-dom';

export default function ExpensesList({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="expense" />,
        accessor: 'expenseId',
        Cell: (data) => {
          const id = data.row.original.id;
          return (
            <Link onClick={() => navigate(`/finance/expenses?expenseId=${id}`)} sx={{ cursor: 'pointer' }}>
              {data.value}
            </Link>
          );
        }
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      {
        Header: <FormattedMessage id="receipt-date" />,
        accessor: 'receiptDate'
      },
      {
        Header: <FormattedMessage id="submiter" />,
        accessor: 'submitter'
      },
      {
        Header: <FormattedMessage id="recipient" />,
        accessor: 'recipient'
      },
      {
        Header: <FormattedMessage id="supplier" />,
        accessor: 'supplier'
      },
      {
        Header: <FormattedMessage id="reference" />,
        accessor: 'reference'
      },
      {
        Header: <FormattedMessage id="total-rp" />,
        accessor: 'totalAmount',
        Cell: (data) => formatThousandSeparator(data.value ?? 0)
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status'
      }
    ],
    [navigate]
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination || 0}
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
