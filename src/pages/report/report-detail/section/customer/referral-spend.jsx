import ScrollX from 'components/ScrollX';
import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function CustomerReferralSpend({ data }) {
  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="referred-by" />,
        accessor: 'referred_by'
      },
      { Header: <FormattedMessage id="referrer" />, accessor: 'referrer' },
      { Header: <FormattedMessage id="customer" />, accessor: 'customer' },
      { Header: <FormattedMessage id="total-spend-rp" />, accessor: 'total_spend' }
    ],
    []
  );

  const tableData = useMemo(
    () => [
      {
        referred_by: 'Other',
        referrer: 'Langsung Datang',
        customer: 'Budi',
        total_spend: '290,000'
      },
      {
        referred_by: 'Other',
        referrer: 'Langsung Datang',
        customer: 'Agus',
        total_spend: '290,000'
      },
      {
        referred_by: 'Other',
        referrer: 'Langsung Datang',
        customer: 'Susi',
        total_spend: '290,000'
      },
      {
        referred_by: 'Other',
        referrer: 'Langsung Datang',
        customer: 'Tina',
        total_spend: '290,000'
      },
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
