import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';

const ProductBundleDetailHistory = (props) => {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="date" />,
        accessor: 'createdAt',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="staff" />,
        accessor: 'createdBy',
        isNotSorting: true
      },
      {
        Header: 'Event',
        accessor: 'event',
        isNotSorting: true
      },
      {
        Header: 'Detail',
        accessor: 'details',
        isNotSorting: true
      }
    ],
    []
  );

  return (
    <ScrollX>
      <ReactTable columns={columns} data={props.data} />
    </ScrollX>
  );
};

ProductBundleDetailHistory.propTypes = {
  data: PropTypes.array
};

export default ProductBundleDetailHistory;
