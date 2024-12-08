import { useMemo } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function CustomerList({ data }) {
  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="no-member" />,
        accessor: 'member_no'
      },
      { Header: <FormattedMessage id="name" />, accessor: 'name' },
      { Header: <FormattedMessage id="location" />, accessor: 'location' },
      { Header: 'Status', accessor: 'status' },
      { Header: <FormattedMessage id="gender" />, accessor: 'gender' },
      { Header: <FormattedMessage id="telephone" />, accessor: 'telephone' },
      { Header: 'Email', accessor: 'email' }
    ],
    []
  );

  const tableData = useMemo(
    () => [
      {
        member_no: 'RPC 123',
        name: 'Budi',
        location: 'RPC Condet',
        status: 'Active',
        gender: 'Male',
        telephone: '081123123321',
        email: 'test@gmail.com'
      },
      {
        member_no: 'RPC 123',
        name: 'Tono',
        location: 'RPC Condet',
        status: 'Active',
        gender: 'Male',
        telephone: '081123123321',
        email: 'test@gmail.com'
      },
      {
        member_no: 'RPC 123',
        name: 'Susi',
        location: 'RPC Condet',
        status: 'Active',
        gender: 'Female',
        telephone: '081123123321',
        email: 'test@gmail.com'
      },
      {
        member_no: 'RPC 123',
        name: 'Agus',
        location: 'RPC Condet',
        status: 'Active',
        gender: 'Male',
        telephone: '081123123321',
        email: 'test@gmail.com'
      },
      {
        member_no: 'RPC 123',
        name: 'Joko',
        location: 'RPC Condet',
        status: 'Active',
        gender: 'Male',
        telephone: '081123123321',
        email: 'test@gmail.com'
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
