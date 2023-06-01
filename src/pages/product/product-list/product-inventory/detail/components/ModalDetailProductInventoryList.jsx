import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Chip, Grid, InputLabel } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductInventoryDetail } from 'pages/product/product-list/service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import configGlobal from '../../../../../../../src/config';

const ModalDetailProductInventoryList = (props) => {
  const [detailData, setDetailData] = useState([]);
  const [detailHeaderData, setDetailHeaderData] = useState({});

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
      { Header: <FormattedMessage id="date-condition" />, isNotSorting: true, accessor: 'dateCondition' },
      { Header: <FormattedMessage id="item-condition" />, isNotSorting: true, accessor: 'itemCondition' },
      { Header: <FormattedMessage id="quantity" />, isNotSorting: true, accessor: 'quantity' },
      {
        Header: <FormattedMessage id="image" />,
        accessor: 'imagePath',
        isNotSorting: true,
        style: {
          width: '150px'
        },
        Cell: (data) => {
          return (
            <>
              {data.value ? (
                <a href={`${configGlobal.apiUrl}${data.value}`} target="_blank" rel="noreferrer">
                  <img src={`${configGlobal.apiUrl}${data.value}`} width="80%" alt="img" />
                </a>
              ) : (
                '-'
              )}
            </>
          );
        }
      },
      {
        Header: <FormattedMessage id="status-approval" />,
        isNotSorting: true,
        accessor: 'statusApproval',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="warning" label="Waiting" size="small" variant="light" />;
            case 1:
              return <Chip color="success" label="Accept" size="small" variant="light" />;
            case 2:
              return <Chip color="error" label="Reject" size="small" variant="light" />;
            default:
              return '';
          }
        }
      },
      { Header: <FormattedMessage id="office-approved-by" />, isNotSorting: true, accessor: 'officeApprovedBy' },
      { Header: <FormattedMessage id="office-approved-at" />, isNotSorting: true, accessor: 'officeApprovedAt' },
      { Header: <FormattedMessage id="office-reason" />, isNotSorting: true, accessor: 'reasonOffice' },
      { Header: <FormattedMessage id="admin-approved-by" />, isNotSorting: true, accessor: 'adminApprovedBy' },
      { Header: <FormattedMessage id="admin-approved-at" />, isNotSorting: true, accessor: 'adminApprovedAt' },
      { Header: <FormattedMessage id="admin-reason" />, isNotSorting: true, accessor: 'reasonAdmin' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchData = async () => {
    if (props.id) {
      const getResp = await getProductInventoryDetail(props.id);
      setDetailData(getResp.data.data);
      setDetailHeaderData(getResp.data.header);
    }
  };

  const onCancel = () => {
    props.onClose(true);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps, react/prop-types
  }, [props.id]);

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-product-inventory" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="xl"
      >
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <InputLabel>{<FormattedMessage id="request-name" />}</InputLabel>
              </Grid>
              <Grid item xs={12} md={4}>
                {detailHeaderData.requirementName}
              </Grid>
              <Grid item xs={12} md={2}>
                <InputLabel>{<FormattedMessage id="product-location" />}</InputLabel>
              </Grid>
              <Grid item xs={12} md={4}>
                {detailHeaderData.locationName}
              </Grid>
              <Grid item xs={12} md={2}>
                <InputLabel>{<FormattedMessage id="created-by" />}</InputLabel>
              </Grid>
              <Grid item xs={12} md={4}>
                {detailHeaderData.createdBy}
              </Grid>
              <Grid item xs={12} md={2}>
                <InputLabel>{<FormattedMessage id="created-at" />}</InputLabel>
              </Grid>
              <Grid item xs={12} md={4}>
                {detailHeaderData.createdAt}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <ReactTable columns={columns} data={detailData} />
          </Grid>
        </Grid>
      </ModalC>
    </>
  );
};

ModalDetailProductInventoryList.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func
};

export default ModalDetailProductInventoryList;
