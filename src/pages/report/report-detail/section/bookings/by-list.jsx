import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function BookingByList({ data }) {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="start-date" />,
        accessor: 'start-date'
      },
      {
        Header: <FormattedMessage id="start-time" />,
        accessor: 'start-time'
      },
      {
        Header: <FormattedMessage id="end-date" />,
        accessor: 'end-date'
      },
      {
        Header: <FormattedMessage id="end-time" />,
        accessor: 'end-time'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customer'
      },
      {
        Header: <FormattedMessage id="service" />,
        accessor: 'service'
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status'
      },
      {
        Header: <FormattedMessage id="value-rp" />,
        accessor: 'value-rp'
      }
    ],
    []
  );
  const dataDummy = [
    {
      'start-date': '11 Jan 2024',
      'start-time': '10:00 ',
      'end-date': '11 Jan 2024',
      'end-time': '12:00',
      location: 'RPC ACEH',
      customer: 'John Doe',
      service: 'UGD',
      status: 'Confirmed',
      'value-rp': 'Rp 500.000'
    },
    {
      'start-date': '12 Jan 2024',
      'start-time': '02:00',
      'end-date': '12 Jan 2024',
      'end-time': '04:00',
      location: 'RPC SUMATERA UTARA',
      customer: 'Jane Smith',
      service: 'UGD',
      status: 'Started',
      'value-rp': 'Rp 1.000.000'
    },
    {
      'start-date': '13 Jan 2024',
      'start-time': '09:00 ',
      'end-date': '13 Jan 2024',
      'end-time': '11:00 ',
      location: 'RCP BANDUNG',
      customer: 'Bob Johnson',
      service: 'IGD',
      status: 'Pencilled-in',
      'value-rp': 'Rp 250.000'
    }
    // Add more data as needed
  ];

  return (
    <div>
      <ReactTable
        columns={columns}
        data={dataDummy}
        // totalPagination={totalPagination}
        // setPageNumber={pars.goToPage}
        // setPageRow={pars.rowPerPage}
        // onGotoPage={goToPage}
        // onOrder={orderingChange}
        // onPageSize={changeLimit}
      />
    </div>
  );
}
