import { Grid } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { useEffect, useMemo, useState } from 'react';
import { getProductInventoryDetail } from 'pages/product/product-list/service';
import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const ProductInventoryApprovalDetail = (props) => {
  const [detailData, setDetailData] = useState([]);

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product-type" />,
        isNotSorting: true,
        accessor: 'productType',
        Cell: (data) => {
          if (data.value) {
            return data.value
              .split('product')
              .map((dt) => (!dt ? 'Product' : dt))
              .join(' ');
          } else {
            return '-';
          }
        }
      },
      { Header: <FormattedMessage id="product-name" />, isNotSorting: true, accessor: 'productName' },
      { Header: <FormattedMessage id="usage" />, isNotSorting: true, accessor: 'usage' },
      { Header: <FormattedMessage id="quantity" />, isNotSorting: true, accessor: 'quantity' }
    ],
    []
  );

  const fetchData = async () => {
    if (props.id) {
      const getDetail = await getProductInventoryDetail(props.id);
      setDetailData(getDetail.data);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  const onCancel = () => {
    props.onClose(true);
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-requirement" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ReactTable columns={columns} data={detailData} />
          </Grid>
        </Grid>
      </ModalC>
    </>
  );
};

ProductInventoryApprovalDetail.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func
};

export default ProductInventoryApprovalDetail;
