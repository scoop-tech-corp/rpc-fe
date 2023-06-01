import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { MoreOutlined } from '@ant-design/icons';
import { Menu, MenuItem } from '@mui/material';
import { getStaffLeaveBalance } from './service';
import { getAllState, useStaffLeaveIndexStore } from '.';

import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import FormRequestLeave from './form-request-leave';

const StaffLeaveBalance = () => {
  const keyword = useStaffLeaveIndexStore((state) => state.keyword);
  const locationId = useStaffLeaveIndexStore((state) => state.locationId);

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
    useStaffLeaveIndexStore.setState({ orderValue: event.order, orderColumn: event.column });
    fetchData();
  };

  const onGotoPageChange = (event) => {
    useStaffLeaveIndexStore.setState({ goToPage: event });
    fetchData();
  };

  const onPageSizeChange = (event) => {
    useStaffLeaveIndexStore.setState({ rowPerPage: event });
    fetchData();
  };

  const fetchData = async () => {
    const getData = await getStaffLeaveBalance(getAllState());

    setStaffLeaveBalanceData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
    handleClose();
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, locationId]);

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={getStaffLeaveBalanceData.data}
            totalPagination={getStaffLeaveBalanceData.totalPagination}
            setPageNumber={getAllState().goToPage}
            setPageRow={getAllState().rowPerPage}
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

export default StaffLeaveBalance;
