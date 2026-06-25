import { Link } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import PaymentDialog from 'pages/finance/sales/components/PaymentDialog';

import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatDateString, formatThousandSeparator } from 'utils/func';
import iconWhatsapp from '../../../../../src/assets/images/ico-whatsapp.png';

export default function SalesUnpaid({ data, filter, setFilter }) {
  const { locale } = useIntl();
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const [detailDialog, setDetailDialog] = useState({ open: false, row: null });

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="sale-id" />,
        accessor: 'saleId',
        Cell: (data) => {
          const original = data.row.original;
          return (
            <Link
              onClick={() =>
                setDetailDialog({
                  open: true,
                  row: { invoiceNumber: original.saleId, serviceType: original.serviceType }
                })
              }
              sx={{ cursor: 'pointer' }}
            >
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
        Header: <FormattedMessage id="due-date" />,
        accessor: 'dueDate',
        Cell: (data) => formatDateString(data.value, locale)
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
    [locale]
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

      <PaymentDialog open={detailDialog.open} row={detailDialog.row} onClose={() => setDetailDialog({ open: false, row: null })} />
    </div>
  );
}
