import { FormattedMessage } from 'react-intl';
import { Button, Chip, Link, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { deleteSecurityGroup, getSecurityGroup } from './service';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { useDispatch } from 'react-redux';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationC from 'components/ConfirmationC';
import useAuth from 'hooks/useAuth';

let paramSecurityGroup = {};
const SecurityGroup = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const roleHighest = ['administrator'];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getSecurityGroupData, setSecurityGroupData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [dialog, setDialog] = useState({ isOpen: false, id: [] });
  const { user } = useAuth();

  const checkboxColumn = roleHighest.includes(user?.role)
    ? []
    : [
        {
          title: 'Row Selection',
          Header: (header) => {
            useEffect(() => {
              const selectRows = header.selectedFlatRows.map(({ original }) => original.id);
              setSelectedRow(selectRows);
            }, [header.selectedFlatRows]);

            return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
          },
          accessor: 'selection',
          Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
          disableSortBy: true,
          style: {
            width: '10px'
          }
        }
      ];

  const allColumn = [
    {
      Header: 'Role',
      accessor: 'roleName',
      Cell: (data) => {
        // const getId = data.row.original.id;
        return <Link>{data.value}</Link>;
      }
    },
    {
      Header: <FormattedMessage id="total-user" />,
      accessor: 'totalUser'
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: (data) => {
        switch (+data.value) {
          case 1:
            return <Chip color="success" label={<FormattedMessage id="active" />} size="small" variant="light" />;
          default:
            return <Chip color="error" label={<FormattedMessage id="non-active" />} size="small" variant="light" />;
        }
      }
    },
    {
      Header: <FormattedMessage id="action" />,
      accessor: 'action',
      isNotSorting: true,
      Cell: (data) => {
        const getId = data.row.original.id;

        const onEdit = () => {};

        return (
          <>
            <IconButton size="large" color="warning" onClick={() => onEdit()}>
              <EditOutlined />
            </IconButton>
            <IconButton
              size="large"
              color="error"
              disabled={roleHighest.includes(user?.role)}
              onClick={() => setDialog({ isOpen: true, id: [getId] })}
            >
              <DeleteFilled />
            </IconButton>
          </>
        );
      }
    }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => [...checkboxColumn, ...allColumn], []);

  const onOrderingChange = (event) => {
    paramSecurityGroup.orderValue = event.order;
    paramSecurityGroup.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramSecurityGroup.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramSecurityGroup.rowPerPage = event;
    fetchData();
  };

  const fetchData = async () => {
    const getData = await getSecurityGroup(paramSecurityGroup);
    setSecurityGroupData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramSecurityGroup = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '' };
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteSecurityGroup(dialog.id)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog({ isOpen: false, id: [] });
            dispatch(snackbarSuccess('Success delete data'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            setDialog({ isOpen: false, id: [] });
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDialog({ isOpen: false, id: [] });
    }
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="security-group" />} isBreadcrumb={true} />
      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            <Stack
              direction={matchDownSM ? 'column' : 'row'}
              justifyContent="flex-end"
              alignItems="center"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                {selectedRow.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<DeleteFilled />}
                    color="error"
                    onClick={() => setDialog({ isOpen: true, id: selectedRow })}
                  >
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
                  <RefreshIcon />
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={() => navigate('/staff/security-group/form', { replace: true })}
                >
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getSecurityGroupData.data}
              totalPagination={getSecurityGroupData.totalPagination}
              setPageNumber={paramSecurityGroup.goToPage}
              setPageRow={paramSecurityGroup.rowPerPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
        </ScrollX>
      </MainCard>
      <ConfirmationC
        open={dialog.isOpen}
        title={<FormattedMessage id="are-you-sure-you-want-to-delete-this-role" />}
        content={
          <FormattedMessage id="deleting-this-role-makes-existing-accounts-in-this-role-unable-to-login-and-will-need-to-reset-the-accounts-role" />
        }
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
      />
    </>
  );
};

export default SecurityGroup;
