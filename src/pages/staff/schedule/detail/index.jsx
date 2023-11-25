import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Typography } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import StaffScheduleDetailAction from './action-detail';

const StaffScheduleDetail = (props) => {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="master-menu" />,
        accessor: 'masterName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="menu-list" />,
        accessor: 'menuName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="type-access" />,
        accessor: 'accessType',
        isNotSorting: true
      },
      { Header: <FormattedMessage id="start-time" />, accessor: 'startTime', isNotSorting: true },
      { Header: <FormattedMessage id="end-time" />, accessor: 'endTime', isNotSorting: true },
      { Header: <FormattedMessage id="duration" />, accessor: 'duration', isNotSorting: true }
    ],
    []
  );

  return (
    <ModalC
      title="Detail Schedule"
      open={props.open}
      onCancel={() => props.onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="md"
      action={{
        element: <StaffScheduleDetailAction id={props.data?.id} onRefreshIndex={(e) => props.onRefreshIndex(e)} />,
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h5">
                <FormattedMessage id="branch" />
              </Typography>
              <Typography variant="body1">{props.data?.location}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h5">
                <FormattedMessage id="name" />
              </Typography>
              <Typography variant="body1">{props.data?.name}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <ReactTable columns={columns} data={props.data?.details ?? []} />
        </Grid>
      </Grid>
    </ModalC>
  );
};

StaffScheduleDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshIndex: PropTypes.func
};

export default StaffScheduleDetail;
