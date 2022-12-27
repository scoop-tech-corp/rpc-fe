import { Chip, Grid, TableCell, TableRow, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { formatThousandSeparator } from 'utils/func';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';

const ProductBundleDetailOverview = (props) => {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="item-name" />,
        accessor: 'fullName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="price" />,
        accessor: 'price',
        isNotSorting: true,
        style: { width: '200px' },
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity',
        isNotSorting: true,
        style: { width: '200px' },
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: 'Total',
        accessor: 'total',
        isNotSorting: true,
        style: { width: '200px' },
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    []
  );

  const renderBedgeStatus = () => {
    switch (+props.data.productBundle?.status) {
      case 1:
        return <Chip color="success" label="Active" size="small" variant="light" />;
      case 0:
        return <Chip color="error" label="Disabled" size="small" variant="light" />;
      default:
        return '-';
    }
  };

  const sumQuantity = () => {
    return props.data.detailBundle.length ? props.data.detailBundle.map((p) => +p.quantity).reduce((a, b) => a + b) : '-';
  };

  const sumTotal = () => {
    return props.data.detailBundle.length
      ? formatThousandSeparator(props.data.detailBundle.map((p) => +p.total).reduce((a, b) => a + b))
      : '-';
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title="Details">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">
                  <FormattedMessage id="name" />
                </Typography>
                <Typography variant="body1">{props.data.productBundle?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">
                  <FormattedMessage id="created-by" />
                </Typography>
                <Typography variant="body1">{props.data.productBundle?.createdBy}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">
                  <FormattedMessage id="created-at" />
                </Typography>
                <Typography variant="body1">{props.data.productBundle?.createdAt}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">
                  <FormattedMessage id="category" />
                </Typography>
                <Typography variant="body1">{props.data.productBundle?.categoryName}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">
                  <FormattedMessage id="location" />
                </Typography>
                <Typography variant="body1">{props.data.productBundle?.locationName}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">Status</Typography>
                {renderBedgeStatus()}
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="product" />}>
            <ScrollX>
              <ReactTable
                columns={columns}
                data={props.data.detailBundle}
                extensionRow={
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>
                      <b>Total</b>
                    </TableCell>
                    <TableCell>{sumQuantity()}</TableCell>
                    <TableCell>{sumTotal()}</TableCell>
                  </TableRow>
                }
              />
            </ScrollX>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

ProductBundleDetailOverview.propTypes = {
  data: PropTypes.object
};

export default ProductBundleDetailOverview;
