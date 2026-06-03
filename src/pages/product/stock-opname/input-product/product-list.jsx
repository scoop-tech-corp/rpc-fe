import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Chip, IconButton, TextField } from '@mui/material';
import { DeleteOutlined } from '@ant-design/icons';
import { ReactTable } from 'components/third-party/ReactTable';
import PropTypes from 'prop-types';

const getDifferenceStatus = (difference) => {
  if (difference === '' || difference === undefined) return null;
  const val = Number(difference);
  if (val < 0) return { label: 'Selisih Lebih', color: 'error' };
  if (val === 0) return { label: 'Sesuai', color: 'success' };
  return { label: 'Selisih Kurang', color: 'warning' };
};

const ProductList = ({ products, onUpdate, onRemove }) => {
  const columns = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: 'SKU', accessor: 'sku', isNotSorting: true },
      { Header: <FormattedMessage id="product" />, accessor: 'productName', isNotSorting: true },
      { Header: <FormattedMessage id="system-quantity" />, accessor: 'stockSystem', isNotSorting: true },
      {
        Header: <FormattedMessage id="actual-quantity" />,
        accessor: 'stockPhysical',
        isNotSorting: true,
        Cell: (data) => (
          <TextField
            type="number"
            size="small"
            value={data.value}
            onChange={(e) => onUpdate(data.row.original.productId, 'stockPhysical', e.target.value)}
            inputProps={{ min: 0 }}
            sx={{ width: 100 }}
          />
        )
      },
      {
        Header: <FormattedMessage id="difference" />,
        accessor: 'difference',
        isNotSorting: true,
        Cell: (data) => (data.value !== undefined && data.value !== '' ? data.value : '-')
      },
      {
        Header: 'Status',
        id: 'status',
        isNotSorting: true,
        Cell: (data) => {
          const status = getDifferenceStatus(data.row.original.difference);
          return status ? <Chip label={status.label} color={status.color} size="small" variant="light" /> : '-';
        }
      },
      {
        Header: <FormattedMessage id="note" />,
        accessor: 'note',
        isNotSorting: true,
        Cell: (data) => (
          <TextField
            size="small"
            value={data.value}
            onChange={(e) => onUpdate(data.row.original.productId, 'note', e.target.value)}
            sx={{ width: 160 }}
          />
        )
      },
      {
        Header: '',
        id: 'action',
        isNotSorting: true,
        Cell: (data) => (
          <IconButton color="error" size="small" onClick={() => onRemove(data.row.original.productId)}>
            <DeleteOutlined />
          </IconButton>
        )
      }
    ],
    [onUpdate, onRemove]
  );

  return <ReactTable columns={columns} data={products} hidePagination colSpanPagination={9} />;
};

ProductList.propTypes = {
  products: PropTypes.array,
  onUpdate: PropTypes.func,
  onRemove: PropTypes.func
};

export default ProductList;
