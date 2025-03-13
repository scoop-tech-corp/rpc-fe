import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

export default function SalesDailyAudit({ data, filter, setFilter }) {
  const { formatMessage } = useIntl();
  const tablesData = data?.table.data || [];
  const totalPagination = data?.table.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: '',
        id: 'empty-group',
        isNotSorting: true,
        columns: [
          {
            Header: <FormattedMessage id="day" />,
            accessor: 'day'
          },
          {
            Header: <FormattedMessage id="date" />,
            accessor: 'date'
          }
        ]
      },
      {
        Header: formatMessage({ id: 'sales-summary' }),
        isNotSorting: true,
        columns: [
          {
            Header: <FormattedMessage id="sales-value" />,
            id: 'salesValue',
            accessor: 'salesSummary.salesValue',
            Cell: (data) => formatThousandSeparator(data.value)
          },
          {
            Header: <FormattedMessage id="discounts" />,
            accessor: 'salesSummary.discounts',
            Cell: (data) => formatThousandSeparator(data.value)
          }
        ]
      },
      {
        Header: formatMessage({ id: 'payment-summary' }),
        isNotSorting: true,
        columns: [
          {
            Header: <FormattedMessage id="cash" />,
            accessor: 'paymentSummary.cash',
            Cell: (data) => formatThousandSeparator(data.value)
          },
          {
            Header: <FormattedMessage id="credit-card" />,
            accessor: 'paymentSummary.creditCard',
            Cell: (data) => formatThousandSeparator(data.value)
          },
          {
            Header: <FormattedMessage id="bank-transfer" />,
            accessor: 'paymentSummary.bankTransfer',
            Cell: (data) => formatThousandSeparator(data.value)
          },
          {
            Header: <FormattedMessage id="debit-card" />,
            accessor: 'paymentSummary.debitCard',
            Cell: (data) => formatThousandSeparator(data.value)
          },
          {
            Header: <FormattedMessage id="total-amount" />,
            accessor: 'paymentSummary.totalAmount',
            Cell: (data) => formatThousandSeparator(data.value)
          }
        ]
      }
    ],
    [formatMessage]
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        day: 1,
        date: '1/5/2022',
        salesSummary: {
          salesValue: 4343239.5,
          discounts: 189260.5
        },
        paymentSummary: {
          cash: 4343239.5,
          creditCard: 189260.5,
          bankTransfer: 189260.5,
          debitCard: 189260.5,
          totalAmount: 189260.5
        }
      }
    ],
    []
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
