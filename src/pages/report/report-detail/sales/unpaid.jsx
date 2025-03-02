import { Link } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import iconWhatsapp from '../../../../../src/assets/images/ico-whatsapp.png';

export default function SalesUnpaid({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="sales" />,
        accessor: 'saleId',
        Cell: (data) => {
          const onClickDetail = () => {};

          return <Link onClick={() => onClickDetail()}>{data.value}</Link>; // href={`/product/product-list/sell/${getId}`}
        }
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      {
        Header: <FormattedMessage id="due-date" />,
        accessor: 'dueDate'
      },
      {
        Header: <FormattedMessage id="overdue" />,
        accessor: 'overDue'
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customerName'
      },
      {
        Header: <FormattedMessage id="phone" />,
        accessor: 'phoneNo',
        Cell: (data) => {
          return (
            <Link href={`https://api.whatsapp.com/send?phone=${data.value}&text=%20`} target="_blank">
              <span>{data.value}</span>&nbsp;&nbsp;
              <img src={iconWhatsapp} width="15" height="15" alt="icon-whatsapp" />
            </Link>
          );
        }
      },
      {
        Header: <FormattedMessage id="total-rp" />,
        accessor: 'totalAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="paid-rp" />,
        accessor: 'paidAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="outstanding-rp" />,
        accessor: 'outstandingAmount',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="reference" />,
        accessor: 'refNum'
      }
    ],
    []
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        saleId: 'INV-1234',
        location: 'RPC Duren',
        dueDate: '2022-01-01',
        overDue: 'Active',
        customerName: 'Customer 1',
        phoneNo: '08123456789',
        totalAmount: 80000,
        paidAmount: 80000,
        outstandingAmount: 80000,
        refNum: 'test refNum'
      },
      {
        saleId: 'INV-1234',
        location: 'RPC Duren',
        dueDate: '2022-01-01',
        overDue: 'Active',
        customerName: 'Customer 1',
        phoneNo: '08123456789',
        totalAmount: 80000,
        paidAmount: 80000,
        outstandingAmount: 80000,
        refNum: 'test refNum'
      },
      {
        saleId: 'INV-1234',
        location: 'RPC Duren',
        dueDate: '2022-01-01',
        overDue: 'Active',
        customerName: 'Customer 1',
        phoneNo: '08123456789',
        totalAmount: 80000,
        paidAmount: 80000,
        outstandingAmount: 80000,
        refNum: 'test refNum'
      },
      {
        saleId: 'INV-1234',
        location: 'RPC Duren',
        dueDate: '2022-01-01',
        overDue: 'Active',
        customerName: 'Customer 1',
        phoneNo: '08123456789',
        totalAmount: 80000,
        paidAmount: 80000,
        outstandingAmount: 80000,
        refNum: 'test refNum'
      }
    ],
    []
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
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
