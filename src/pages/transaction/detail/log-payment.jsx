import { PrinterOutlined } from '@ant-design/icons';
import { Grid, IconButton, Tooltip } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import ScrollX from 'components/ScrollX';
import PropTypes from 'prop-types';

const LogPaymentDetailTransaction = (props) => {
  const [filter, setFilter] = useState(null);
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
      { Header: <FormattedMessage id="date" />, accessor: 'date', isNotSorting: true },
      {
        Header: 'Jenis',
        accessor: 'type',
        isNotSorting: true,
        Cell: ({ value }) => {
          const isDP = value === 'DP / Pembayaran Awal';
          return (
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              background: isDP ? '#fff3e0' : '#e8f5e9',
              color: isDP ? '#e65100' : '#2e7d32'
            }}>
              {value || '-'}
            </span>
          );
        }
      },
      { Header: 'Nota Number', accessor: 'notaNumber', isNotSorting: true },
      { Header: <FormattedMessage id="amount" />, accessor: 'amount', isNotSorting: true },
      { Header: <FormattedMessage id="payment-method" />, accessor: 'paymentMethod', isNotSorting: true },
      { Header: 'Catatan', accessor: 'note', isNotSorting: true, Cell: ({ value }) => value || '-' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy', isNotSorting: true },
      ...(props.onPrint ? [{
        Header: 'Cetak',
        accessor: 'cetak',
        isNotSorting: true,
        style: { textAlign: 'center' },
        Cell: ({ row }) => (
          <Tooltip title="Cetak Struk" arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={() => props.onPrint(row.original)}
            >
              <PrinterOutlined />
            </IconButton>
          </Tooltip>
        )
      }] : [])
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onPrint]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DateRangePicker onChange={(value) => onFilterDateRange(value)} value={selectedDateRange} format="dd/MM/yyy" />
      </Grid>
      <Grid item xs={12}>
        <ScrollX>
          <ReactTable columns={columns} data={props.data || []} />
        </ScrollX>
      </Grid>
    </Grid>
  );
};

LogPaymentDetailTransaction.propTypes = {
  data: PropTypes.array,
  onFetchData: PropTypes.func,
  onPrint: PropTypes.func
};

export default LogPaymentDetailTransaction;
