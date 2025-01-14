import { Grid } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import ScrollX from 'components/ScrollX';
import PropTypes from 'prop-types';

const LogActivityDetailTransaction = (props) => {
  const [filter, setFilter] = useState(null); // { dateRange: null }
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);

  const onFilterDateRange = (selectedDate) => {
    setSelectedDateRange(selectedDate);
    setFilter((filterPrev) => ({ ...filterPrev, dateRange: selectedDate }));
  };

  useEffect(() => {
    props.onFetchData(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="date" />, accessor: 'createdAt', isNotSorting: true },
      { Header: <FormattedMessage id="activity" />, accessor: 'activity', isNotSorting: true },
      { Header: <FormattedMessage id="remark" />, accessor: 'remark', isNotSorting: true },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy', isNotSorting: true }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DateRangePicker onChange={(value) => onFilterDateRange(value)} value={selectedDateRange} format="dd/MM/yyy" />
      </Grid>
      <Grid item xs={12}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={props.data || []}
            // colSpanPagination={11}
            // totalPagination={totalPagination}
            // setPageNumber={params.goToPage}
            // setPageRow={params.rowPerPage}
            // onGotoPage={goToPage}
            // onOrder={orderingChange}
            // onPageSize={changeLimit}
          />
        </ScrollX>
      </Grid>
    </Grid>
  );
};

LogActivityDetailTransaction.propTypes = {
  data: PropTypes.array,
  onFetchData: PropTypes.func
};

export default LogActivityDetailTransaction;
