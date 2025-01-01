import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function StaffLogin({ data, setFilter }) {
  const tablesData = data?.data || [
    { name: 'Budi', date: '12 May 2022', time: '12:20 AM', ipAddress: '10.20.30.30', device: 'Mobile Ios' },
    { name: 'Agus', date: '12 May 2022', time: '12:20 AM', ipAddress: '10.20.30.30', device: 'Mobile Ios' },
    { name: 'Susi', date: '12 May 2022', time: '12:20 AM', ipAddress: '10.20.30.30', device: 'Mobile Ios' },
    { name: 'Tono', date: '12 May 2022', time: '12:20 AM', ipAddress: '10.20.30.30', device: 'Mobile Ios' },
    { name: 'Udin', date: '12 May 2022', time: '12:20 AM', ipAddress: '10.20.30.30', device: 'Mobile Ios' }
  ];
  const totalPagination = data?.totalPagination;

  const tableColumns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'name' },
      { Header: <FormattedMessage id="date" />, accessor: 'date' },
      { Header: <FormattedMessage id="time" />, accessor: 'time' },
      { Header: 'IP Address', accessor: 'ipAddress' },
      { Header: <FormattedMessage id="device" />, accessor: 'device' }
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
          onOrder={(event) => {
            setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
          }}
        />
      </ScrollX>
    </>
  );
}
