import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductRestockDetailHistory } from '../service';
import { FormattedMessage } from 'react-intl';

import ScrollX from 'components/ScrollX';
import PropTypes from 'prop-types';

let parameter = {};

const ProductRestockDetailHistory = (props) => {
  const [historyData, setHistoryData] = useState({ data: [], totalPagination: 0 });

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="date" />,
        accessor: 'date'
      },
      {
        Header: <FormattedMessage id="time" />,
        accessor: 'time'
      },
      {
        Header: 'Staff',
        accessor: 'createdBy'
      },
      {
        Header: <FormattedMessage id="event" />,
        accessor: 'event'
      },
      {
        Header: 'Details',
        accessor: 'details',
        isNotSorting: true
      }
    ],
    []
  );

  const fetchData = async () => {
    const getResp = await getProductRestockDetailHistory({ id: props.id, ...parameter });
    setHistoryData({ data: getResp.data.data, totalPagination: getResp.data.totalPagination });
  };

  const clearParamFetchData = () => {
    parameter = {
      orderValue: '',
      orderColumn: '',
      goToPage: 1,
      rowPerPage: 5
    };
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollX>
      <ReactTable
        columns={columns}
        data={historyData.data}
        totalPagination={historyData.totalPagination}
        setPageNumber={parameter.goToPage}
        setPageRow={parameter.rowPerPage}
        onOrder={(event) => {
          parameter.orderValue = event.order;
          parameter.orderColumn = event.column;
          fetchData();
        }}
        onGotoPage={(event) => {
          parameter.goToPage = event;
          fetchData();
        }}
        onPageSize={(event) => {
          parameter.rowPerPage = event;
          fetchData();
        }}
      />
    </ScrollX>
  );
};

ProductRestockDetailHistory.propTypes = {
  id: PropTypes.number
};

export default ProductRestockDetailHistory;
