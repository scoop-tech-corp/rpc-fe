import { Box, Grid, Typography, Accordion, AccordionDetails, AccordionSummary, Stack, Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { Fragment, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { PlusOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';
import FormTracking from './ModalTracking';

const ProductRestockDetailOverview = (props) => {
  const { data } = props;
  const [expanded, setExpanded] = useState(false);
  const [openFormTracking, setOpenFormTracking] = useState(false);

  const theme = useTheme();

  const handleChangeAccordion = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const columnTableTracking = useMemo(
    () => [
      {
        Header: 'Progress',
        accessor: 'progress',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="created-at" />,
        accessor: 'createdAt',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="created-by" />,
        accessor: 'createdBy',
        isNotSorting: true
      }
    ],
    []
  );

  const columnTableSupplier = useMemo(
    () => [
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'fullName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit-cost" />,
        accessor: 'unitCost',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="order-quantity" />,
        accessor: 'orderQuantity',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="rejected" />,
        accessor: 'rejected',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="cancelled" />,
        accessor: 'canceled',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="accepted" />,
        accessor: 'accepted',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="received" />,
        accessor: 'received',
        isNotSorting: true
      }
    ],
    []
  );

  const DetailsC = () => {
    return (
      <MainCard title="Details">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight={'bold'}>
              <FormattedMessage id="location-name" />
            </Typography>
            <Typography variant="body1">{data?.locationName ?? '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight={'bold'}>
              <FormattedMessage id="created-by" />
            </Typography>
            <Typography variant="body1">{data?.createdBy ?? '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight={'bold'}>
              <FormattedMessage id="created-at" />
            </Typography>
            <Typography variant="body1">{data?.createdAt ?? '-'}</Typography>
          </Grid>
        </Grid>
      </MainCard>
    );
  };

  const TrackingC = () => {
    return (
      <MainCard title={<FormattedMessage id="tracking" />}>
        <ScrollX>
          <div style={{ marginBottom: '10px' }}>
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenFormTracking(true)}>
              <FormattedMessage id="new" />
            </Button>
          </div>
          <ReactTable columns={columnTableTracking} data={data?.tracking ?? []} />
          {openFormTracking && (
            <FormTracking
              open={openFormTracking}
              id={data.id}
              output={(e) => {
                setOpenFormTracking(false);
                props.output(e);
              }}
            />
          )}
        </ScrollX>
      </MainCard>
    );
  };

  const SupplierC = () => {
    return (
      <MainCard title={<FormattedMessage id="supplier" />}>
        <Box
          sx={{
            '& .MuiAccordion-root': {
              borderColor: theme.palette.divider,
              '& .MuiAccordionSummary-root': {
                bgcolor: 'transparent',
                flexDirection: 'row',
                '&:focus-visible': {
                  bgcolor: 'primary.lighter'
                }
              },
              '& .MuiAccordionDetails-root': {
                borderColor: theme.palette.divider
              },
              '& .Mui-expanded': {
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <Fragment>
            {data?.dataSupplier.map((dt, i) => (
              <Accordion expanded={expanded === 'panel1'} onChange={handleChangeAccordion('panel1')} key={i}>
                <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="h6">
                      {dt.supplierName} ({dt.quantity}) {dt.purchaseOrderNumber}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <ScrollX>
                    <ReactTable columns={columnTableSupplier} data={dt.detail ?? []} />
                  </ScrollX>
                </AccordionDetails>
              </Accordion>
            ))}
          </Fragment>
        </Box>
      </MainCard>
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DetailsC />
      </Grid>
      <Grid item xs={12}>
        <TrackingC />
      </Grid>
      <Grid item xs={12}>
        <SupplierC />
      </Grid>
    </Grid>
  );
};

ProductRestockDetailOverview.propTypes = {
  data: PropTypes.object,
  output: PropTypes.func
};

export default ProductRestockDetailOverview;
