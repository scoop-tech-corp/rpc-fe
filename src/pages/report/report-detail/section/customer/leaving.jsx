import { useMemo } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function CustomerLeaving({ data }) {
  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name'
      },
      { Header: <FormattedMessage id="location" />, accessor: 'location' },
      { Header: <FormattedMessage id="date" />, accessor: 'date' },
      { Header: <FormattedMessage id="customer-group" />, accessor: 'customer_group' },
      { Header: <FormattedMessage id="customer-for" />, accessor: 'customer_for' },
      { Header: <FormattedMessage id="total-rp" />, accessor: 'total' }
    ],
    []
  );

  const tableData = useMemo(
    () => [
      {
        name: 'Budi',
        location: 'RPC Condet',
        date: '12 May 2022',
        customer_group: 'VIP',
        customer_for: '10 Days',
        total: '50,000.00'
      },
      {
        name: 'Agus',
        location: 'RPC Bandung',
        date: '12 May 2022',
        customer_group: 'VIP',
        customer_for: '10 Days',
        total: '0'
      },
      {
        name: 'Susi',
        location: 'RPC Bandung',
        date: '12 May 2022',
        customer_group: 'VIP',
        customer_for: '10 Days',
        total: '0'
      },
      {
        name: 'Tono',
        location: 'RPC Bandung',
        date: '12 May 2022',
        customer_group: 'VIP',
        customer_for: '10 Days',
        total: '0'
      },
      {
        name: 'Udin',
        location: 'RPC Bandung',
        date: '12 May 2022',
        customer_group: 'VIP',
        customer_for: '10 Days',
        total: '0'
      }
    ],
    []
  );

  return (
    <>
      <ScrollX>
        <ReactTable columns={tableColumns} data={tableData} />
      </ScrollX>
    </>
  );
}
