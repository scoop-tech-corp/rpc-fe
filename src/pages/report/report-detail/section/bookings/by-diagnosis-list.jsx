import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function BookingByDiagnosisList({ data }) {
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
      'start-time': '10:00',
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
      'start-time': '09:00',
      'end-date': '13 Jan 2024',
      'end-time': '11:00',
      location: 'RCP BANDUNG',
      customer: 'Bob Johnson',
      service: 'IGD',
      status: 'Pencilled-in',
      'value-rp': 'Rp 250.000'
    },
    {
      'start-date': '14 Jan 2024',
      'start-time': '15:30',
      'end-date': '14 Jan 2024',
      'end-time': '17:00',
      location: 'RPC JAKARTA',
      customer: 'Alice Brown',
      service: 'Emergency',
      status: 'Confirmed',
      'value-rp': 'Rp 750.000'
    },
    {
      'start-date': '15 Jan 2024',
      'start-time': '08:00',
      'end-date': '15 Jan 2024',
      'end-time': '10:30',
      location: 'RPC SURABAYA',
      customer: 'Charlie Davis',
      service: 'Surgery',
      status: 'Started',
      'value-rp': 'Rp 1.500.000'
    },
    // Data tambahan
    {
      'start-date': '16 Jan 2024',
      'start-time': '11:30',
      'end-date': '16 Jan 2024',
      'end-time': '13:00',
      location: 'RPC MAKASSAR',
      customer: 'Eva White',
      service: 'Consultation',
      status: 'Confirmed',
      'value-rp': 'Rp 300.000'
    },
    {
      'start-date': '17 Jan 2024',
      'start-time': '14:00',
      'end-date': '17 Jan 2024',
      'end-time': '16:30',
      location: 'RPC BALI',
      customer: 'David Lee',
      service: 'X-ray',
      status: 'Started',
      'value-rp': 'Rp 800.000'
    }
    // Tambahkan lebih banyak data jika diperlukan
  ];

  return (
    <div>
      <ReactTable
        columns={columns}
        data={dataDummy}
        // totalPagination={totalPagination}
        // setPageNumber={params.goToPage}
        // setPageRow={params.rowPerPage}
        // onGotoPage={goToPage}
        // onOrder={orderingChange}
        // onPageSize={changeLimit}
      />
    </div>
  );
}
