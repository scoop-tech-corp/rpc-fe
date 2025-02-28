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
        accessor: 'sales',
        Cell: (data) => {
          const onClickDetail = () => {};

          return <Link onClick={() => onClickDetail()}>{data.value}</Link>; // href={`/product/product-list/sell/${getId}`}
        }
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="due-date" />,
        accessor: 'dueDate'
      },
      {
        Header: <FormattedMessage id="overdue" />,
        accessor: 'overdue'
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customer'
      },
      {
        Header: <FormattedMessage id="phone" />,
        accessor: 'phoneNumber',
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
        accessor: 'total',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="paid-rp" />,
        accessor: 'paid',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="outstanding-rp" />,
        accessor: 'outstanding',
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="reference" />,
        accessor: 'reference'
      }
    ],
    []
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        sales: 'INV-1234',
        locationName: 'RPC Duren',
        dueDate: '2022-01-01',
        overdue: 'Active',
        customer: 'Customer 1',
        phoneNumber: '08123456789',
        total: 80000,
        paid: 80000,
        outstanding: 80000,
        reference: 'test Reference'
      },
      {
        sales: 'INV-1234',
        locationName: 'RPC Duren',
        dueDate: '2022-01-01',
        overdue: 'Active',
        customer: 'Customer 1',
        phoneNumber: '08123456789',
        total: 80000,
        paid: 80000,
        outstanding: 80000,
        reference: 'test Reference'
      },
      {
        sales: 'INV-1234',
        locationName: 'RPC Duren',
        dueDate: '2022-01-01',
        overdue: 'Active',
        customer: 'Customer 1',
        phoneNumber: '08123456789',
        total: 80000,
        paid: 80000,
        outstanding: 80000,
        reference: 'test Reference'
      },
      {
        sales: 'INV-1234',
        locationName: 'RPC Duren',
        dueDate: '2022-01-01',
        overdue: 'Active',
        customer: 'Customer 1',
        phoneNumber: '08123456789',
        total: 80000,
        paid: 80000,
        outstanding: 80000,
        reference: 'test Reference'
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
