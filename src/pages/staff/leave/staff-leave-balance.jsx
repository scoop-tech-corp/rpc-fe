import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { MoreOutlined } from '@ant-design/icons';
import { Menu, MenuItem } from '@mui/material';
import { getStaffLeaveBalance } from './service';

import IconButton from 'components/@extended/IconButton';
import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import FormRequestLeave from './form-request-leave';

const StaffLeaveBalance = (props) => {
  const [openMenu, setOpenMenu] = useState({ el: null, userId: null });
  const [getStaffLeaveBalanceData, setStaffLeaveBalanceData] = useState({ data: [], totalPagination: 0 });
  const [openFormRequest, setOpenFormRequest] = useState({ isOpen: false, userId: null });

  const handleClose = () => setOpenMenu({ el: null, userId: null });

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name'
      },
      {
        Header: <FormattedMessage id="vacation-allowance" />,
        accessor: 'annualLeaveAllowance',
        Cell: (data) => {
          return `${data.value} days`;
        }
      },
      {
        Header: <FormattedMessage id="vacation-balance" />,
        accessor: 'annualLeaveAllowanceRemaining',
        Cell: (data) => {
          return `${data.value} days`;
        }
      },
      {
        Header: <FormattedMessage id="sick-allowance" />,
        accessor: 'annualSickAllowance',
        Cell: (data) => {
          return `${data.value} days`;
        }
      },
      {
        Header: <FormattedMessage id="sick-balance" />,
        accessor: 'annualSickAllowanceRemaining',
        Cell: (data) => {
          return `${data.value} days`;
        }
      },
      {
        Header: '',
        accessor: 'action',
        isNotSorting: true,
        style: { width: '50px' },
        Cell: (data) => {
          const getUserId = data.row.original.usersId;

          return (
            <>
              <IconButton
                variant="light"
                color="secondary"
                id="basic-button"
                aria-controls={openMenu.el ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu.el ? 'true' : undefined}
                onClick={(e) => setOpenMenu({ el: e?.currentTarget, userId: getUserId })}
              >
                <MoreOutlined />
              </IconButton>
            </>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    props.parameter.orderValue = event.order;
    props.parameter.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    props.parameter.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    props.parameter.rowPerPage = event;
    fetchData();
  };

  const fetchData = async () => {
    const getData = await getStaffLeaveBalance(props.parameter);

    setStaffLeaveBalanceData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
    handleClose();
  };

  useEffect(() => {
    console.log('init balance list');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.parameter]);

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={getStaffLeaveBalanceData.data}
            totalPagination={getStaffLeaveBalanceData.totalPagination}
            setPageNumber={props.parameter.goToPage}
            setPageRow={props.parameter.rowPerPage}
            colSpanPagination={11}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
          <Menu
            id="basic-menu"
            anchorEl={openMenu.el}
            open={Boolean(openMenu.el)}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <MenuItem>
              <FormattedMessage id="adjust-balance" />
            </MenuItem>
            <MenuItem onClick={() => setOpenFormRequest({ isOpen: true, userId: openMenu.userId })}>
              <FormattedMessage id="request-leave" />
            </MenuItem>
          </Menu>
        </ScrollX>
      </MainCard>
      {/* usersId */}
      {openFormRequest.isOpen && (
        <FormRequestLeave
          open={openFormRequest.isOpen}
          onClose={() => {
            setOpenFormRequest({ isOpen: false, userId: null });
            fetchData();
          }}
          userId={openFormRequest.userId}
        />
      )}
    </>
  );
};

StaffLeaveBalance.propTypes = {
  parameter: PropTypes.object
};

export default StaffLeaveBalance;
