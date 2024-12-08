import { useMemo } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';

export default function CustomerSubAccountList({ data }) {
  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="customer-name" />,
        accessor: 'customer_name'
      },
      { Header: <FormattedMessage id="pet-name" />, accessor: 'pet_name' },
      { Header: <FormattedMessage id="condition" />, accessor: 'condition' },
      { Header: <FormattedMessage id="type" />, accessor: 'type' },
      { Header: <FormattedMessage id="race" />, accessor: 'race' },
      { Header: <FormattedMessage id="gender" />, accessor: 'gender' },
      { Header: <FormattedMessage id="sterile" />, accessor: 'sterile' },
      { Header: <FormattedMessage id="birth-date" />, accessor: 'birth_date' },
      { Header: <FormattedMessage id="color" />, accessor: 'color' }
    ],
    []
  );

  const tableData = useMemo(
    () => [
      {
        customer_name: 'Rizki',
        pet_name: 'Kuki',
        condition: 'Sehat',
        type: 'Kucing',
        race: 'Anggora',
        gender: 'Jantan',
        sterile: 'belum',
        birth_date: '01/10/2021',
        color: 'orange'
      },
      {
        customer_name: 'Udin',
        pet_name: 'Bubu',
        condition: 'Sehat',
        type: 'Kucing',
        race: 'Anggora',
        gender: 'Jantan',
        sterile: 'belum',
        birth_date: '01/10/2021',
        color: 'orange'
      },
      {
        customer_name: 'Susi',
        pet_name: 'Lilo',
        condition: 'Sehat',
        type: 'Kucing',
        race: 'Anggora',
        gender: 'Jantan',
        sterile: 'belum',
        birth_date: '01/10/2021',
        color: 'orange'
      },
      {
        customer_name: 'Agus',
        pet_name: 'Susi',
        condition: 'Sehat',
        type: 'Kucing',
        race: 'Anggora',
        gender: 'Jantan',
        sterile: 'belum',
        birth_date: '01/10/2021',
        color: 'orange'
      },
      {
        customer_name: 'Ajeng',
        pet_name: 'Gege',
        condition: 'Sehat',
        type: 'Kucing',
        race: 'Anggora',
        gender: 'Jantan',
        sterile: 'belum',
        birth_date: '01/10/2021',
        color: 'orange'
      },
      {
        customer_name: 'Siti',
        pet_name: 'Tietik',
        condition: 'Sehat',
        type: 'Kucing',
        race: 'Anggora',
        gender: 'Jantan',
        sterile: 'belum',
        birth_date: '01/10/2021',
        color: 'orange'
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