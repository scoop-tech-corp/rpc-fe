import React from 'react';

import { Button, Stack, useMediaQuery, Link } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { GlobalFilter } from 'utils/react-table';
import IconButton from 'components/@extended/IconButton';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import DownloadIcon from '@mui/icons-material/Download';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import useGetList from 'hooks/useGetList';
import { exportData } from 'utils/exportData.js';

import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

// Usable
import FormServiceCategory from './form-category';
import { getServiceCategory, exportServiceCategory, deleteServiceCategory } from './service';
import ServiceCategoryDetail from './detail';

export default function Index() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getServiceCategory,
    {},
    'search'
  );
  const [selectedRow, setSelectedRow] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [openFormCategory, setOpenFormCategory] = useState({ isOpen: false, id: '', categoryName: '' });
  const [openDetail, setOpenDetail] = useState({ isOpen: false, id: '', categoryName: '' });

  const columns = useMemo(
    () => [
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
      },
      {
        Header: <FormattedMessage id="category-name" />,
        accessor: 'categoryName',
        Cell: (data) => {
          const getId = data.row.original.id;
          const getCateName = data.row.original.categoryName;

          const onDetail = () => setOpenDetail({ isOpen: true, id: getId, categoryName: getCateName });

          return <Link onClick={onDetail}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="total-service" />,
        accessor: 'totalServices'
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const getId = data.row.original.id;
          const getCateName = data.row.original.categoryName;

          const onEdit = () => {
            setOpenFormCategory({ isOpen: true, id: getId, categoryName: getCateName });
          };

          return (
            <IconButton size="large" color="warning" onClick={() => onEdit()}>
              <EditOutlined />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  const onExport = async () => {
    const paramsExport = {
      orderValue: params.orderValue,
      orderColumn: params.orderColumn,
      search: params.search
    };
    return await exportData(exportServiceCategory, paramsExport);
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteServiceCategory(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            setParams((_params) => ({ ..._params }));
          }
        })
        .catch((err) => {
          if (err) {
            setDialog(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="service-category" />} isBreadcrumb={true} />
      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            <Stack
              direction={matchDownSM ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <GlobalFilter
                  placeHolder={intl.formatMessage({ id: 'search' })}
                  globalFilter={keyword}
                  setGlobalFilter={changeKeyword}
                  style={{ height: '41.3px' }}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={() => setOpenFormCategory({ isOpen: true, id: '', categoryName: '' })}
                >
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={list || []}
              totalPagination={totalPagination}
              setPageNumber={params.goToPage}
              setPageRow={params.rowPerPage}
              onGotoPage={goToPage}
              onOrder={orderingChange}
              onPageSize={changeLimit}
            />
          </Stack>
        </ScrollX>
      </MainCard>
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      {openFormCategory.isOpen && (
        <FormServiceCategory
          open={true}
          data={{ ...openFormCategory }}
          onClose={() => {
            setOpenFormCategory({ isOpen: false, id: '', categoryName: '' });
          }}
          setParams={setParams}
        />
      )}

      {openDetail.isOpen && (
        <ServiceCategoryDetail
          open={openDetail.isOpen}
          data={{ ...openDetail }}
          onClose={() => setOpenDetail({ isOpen: false, id: '', categoryName: '' })}
        />
      )}
    </>
  );
}
