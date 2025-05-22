import { Link } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import iconWhatsapp from '../../../../../../src/assets/images/ico-whatsapp.png';

export default function ProductsReminders({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customerName',
        Cell: (data) => {
          const onClickDetail = () => {};

          return <Link onClick={() => onClickDetail()}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="sub-account" />,
        accessor: 'subAccount'
      },
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'productName',
        Cell: (data) => {
          const onClickDetail = () => {};

          return <Link onClick={() => onClickDetail()}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="phone-number" />,
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
        Header: <FormattedMessage id="due-date" />,
        accessor: 'dueDate'
      }
    ],
    []
  );

  const dataDummy = [
    {
      customerName: 'Fariez Tachsin',
      subAccount: 'Kimi',
      productName: 'Vaksin Felocell 4 / F4 (1 pcs)',
      phoneNumber: '62811999338',
      dueDate: '2022-05-31'
    },
    {
      customerName: 'Fariez Tachsin',
      subAccount: 'Kimi',
      productName: 'Vaksin Felocell 4 / F4 (1 pcs)',
      phoneNumber: '62811999338',
      dueDate: '2022-05-31'
    },
    {
      customerName: 'Belia',
      subAccount: 'Pino',
      productName: 'Vaksin Felocell 4 / F4 (1 pcs)',
      phoneNumber: '62812299338',
      dueDate: '2022-05-31'
    },
    {
      customerName: 'Fariez Tachsin',
      subAccount: 'Kimi',
      productName: 'Vaksin Felocell 4 / F4 (1 pcs)',
      phoneNumber: '62811999338',
      dueDate: '2022-05-31'
    },
    {
      customerName: 'Fariez Tachsin',
      subAccount: 'Kimi',
      productName: 'Vaksin Felocell 4 / F4 (1 pcs)',
      phoneNumber: '62811999338',
      dueDate: '2022-05-31'
    },
    {
      customerName: 'Fariez Tachsin',
      subAccount: 'Kimi',
      productName: 'Vaksin Felocell 4 / F4 (1 pcs)',
      phoneNumber: '62811999338',
      dueDate: '2022-05-31'
    }
  ];

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
