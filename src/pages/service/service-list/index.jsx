import React from 'react';

import { Button, Stack, useMediaQuery, Link } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { GlobalFilter } from 'utils/react-table';
import IconButton from 'components/@extended/IconButton';
import { useNavigate } from 'react-router';

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

import ServiceListDetail from './detail';

// Usable
import { getServiceList, exportServiceList, deleteServiceList, downloadTemplateServiceList, importServiceList } from './service';
import ModalImport from 'pages/product/product-list/components/ModalImport';

export default function Index() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getServiceList,
    {},
    'search'
  );
  const [modalImport, setModalImport] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState({ isOpen: false, id: null, categoryName: '' });

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
        Header: <FormattedMessage id="full-name" />,
        accessor: 'fullName',
        Cell: (data) => {
          const getId = data.row.original.id;

          const onDetail = () => setOpenDetail({ isOpen: true, id: getId });

          return <Link onClick={onDetail}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="color" />,
        accessor: 'color',
        Cell: (data) => {
          return <div style={{ backgroundColor: data.value, width: 20, height: 20 }}></div>;
        }
      },
      {
        Header: <FormattedMessage id="type" />,
        accessor: 'type',
        Cell: (data) => {
          const val = data.value == 1 ? 'Petshop' : data.value == 2 ? 'Grooming' : 'Klinik';
          return <span>{val}</span>;
        }
      },
      {
        Header: <FormattedMessage id="bookable-online" />,
        accessor: 'optionPolicy1',
        Cell: (data) => {
          const val = data.value ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />;
          return <span>{val}</span>;
        }
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: (data) => {
          const val = data.value == 1 ? <FormattedMessage id="active" /> : <FormattedMessage id="non-active" />;
          return <span>{val}</span>;
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    []
  );

  const onExport = async () => {
    const paramsExport = {
      orderValue: params.orderValue,
      orderColumn: params.orderColumn,
      search: params.search
    };
    return await exportData(exportServiceList, paramsExport);
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteServiceList(selectedRow)
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

  const onImportFile = async (file) => {
    await importServiceList(file)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success import file'));
          setModalImport(false);
          setParams((_params) => ({ ..._params }));
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };
  const onDownloadTemplate = async () => {
    await downloadTemplateServiceList()
      .then((resp) => {
        let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
        let downloadUrl = URL.createObjectURL(blob);
        let a = document.createElement('a');
        const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

        a.href = downloadUrl;
        a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
        document.body.appendChild(a);
        a.click();
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
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
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => setModalImport(true)} color="primary">
                  <FormattedMessage id="import" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate('/service/list/form', { replace: true })}>
                  <FormattedMessage id="add-service" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={list || []}
              totalPagination={totalPagination}
              setPageNumber={params.goToPage}
              colSpanPagination={8}
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

      {openDetail.isOpen && (
        <ServiceListDetail
          open={openDetail.isOpen}
          data={{ ...openDetail }}
          setParams={setParams}
          onClose={() => setOpenDetail({ isOpen: false, id: '', categoryName: '' })}
        />
      )}
      {modalImport && (
        <ModalImport open={true} onTemplate={onDownloadTemplate} onImport={(e) => onImportFile(e)} onClose={(e) => setModalImport(!e)} />
      )}
    </>
  );
}
