import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, useMediaQuery, Button, Link, Autocomplete, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import {
  getProductInventory,
  deleteProductInventory,
  exportProductInventory,
  downloadTemplateProductInventory,
  importProductInventory
} from '../service';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import ModalImport from '../components/ModalImport';
import ModalDetailProductInventoryList from './detail/components/ModalDetailProductInventoryList';

let paramProductInventoryList = {};

const ProductInventoryList = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [productInventoryData, setProductInventoryData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [isModalImport, setModalImport] = useState(false);
  const [isModalDetail, setModalDetail] = useState({ isOpen: false, id: null });

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
        Header: <FormattedMessage id="requirement-name" />,
        accessor: 'requirementName',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link onClick={() => setModalDetail({ isOpen: true, id: getId })}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="total-product" />, accessor: 'totalItem' },
      { Header: <FormattedMessage id="location-product" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
      // {
      //   Header: <FormattedMessage id="status-approval-office" />,
      //   accessor: 'isApprovedOffice',
      //   Cell: (data) => {
      //     switch (+data.value) {
      //       case 0:
      //         return <Chip color="warning" label="Waiting for Appoval" size="small" variant="light" />;
      //       case 1:
      //         return <Chip color="success" label="Accept" size="small" variant="light" />;
      //       case 2:
      //         return <Chip color="error" label="Reject" size="small" variant="light" />;
      //     }
      //   }
      // },
      // { Header: <FormattedMessage id="approved-by-(office)" />, accessor: 'officeApprovedBy' },
      // { Header: <FormattedMessage id="approved-at-(office)" />, accessor: 'officeApprovedAt' },
      // {
      //   Header: <FormattedMessage id="status-approval-admin" />,
      //   accessor: 'isApprovedAdmin',
      //   Cell: (data) => {
      //     switch (+data.value) {
      //       case 0:
      //         return <Chip color="warning" label="Waiting for Appoval" size="small" variant="light" />;
      //       case 1:
      //         return <Chip color="success" label="Accept" size="small" variant="light" />;
      //       case 2:
      //         return <Chip color="error" label="Reject" size="small" variant="light" />;
      //     }
      //   }
      // },
      // { Header: <FormattedMessage id="approved-by-(admin)" />, accessor: 'adminApprovedBy' },
      // { Header: <FormattedMessage id="approved-at-(admin)" />, accessor: 'adminApprovedAt' }
    ],
    []
  );

  const onOrderingChange = (event) => {
    paramProductInventoryList.orderValue = event.order;
    paramProductInventoryList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductInventoryList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductInventoryList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductInventoryList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramProductInventoryList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onClickAdd = () => {
    navigate('/product/product-list/inventory/add', { replace: true });
  };

  async function fetchData() {
    const resp = await getProductInventory(paramProductInventoryList);
    setProductInventoryData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramProductInventoryList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductInventory(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
        });
    } else {
      setDialog(false);
    }
  };

  const onExport = async () => {
    await exportProductInventory(paramProductInventoryList)
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

  const onDownloadTemplate = async () => {
    await downloadTemplateProductInventory()
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

  const onImportFile = async (file) => {
    await importProductInventory(file)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success import file'));
          setModalImport(false);
          fetchData();
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
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
                  globalFilter={keywordSearch}
                  setGlobalFilter={onSearch}
                  style={{ height: '41.3px' }}
                />
                <Autocomplete
                  id="filterLocation"
                  multiple
                  options={props.facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 300 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button variant="contained" startIcon={<FileUploadIcon />} onClick={() => setModalImport(true)}>
                  <FormattedMessage id="import" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="add-product-inventory" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={productInventoryData.data}
              totalPagination={productInventoryData.totalPagination}
              setPageNumber={paramProductInventoryList.goToPage}
              setPageRow={paramProductInventoryList.rowPerPage}
              colSpanPagination={10}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
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
      {isModalImport && (
        <ModalImport
          open={isModalImport}
          onTemplate={onDownloadTemplate}
          onImport={(e) => onImportFile(e)}
          onClose={(e) => setModalImport(!e)}
        />
      )}
      {isModalDetail.isOpen && (
        <ModalDetailProductInventoryList open={isModalDetail.isOpen} id={isModalDetail.id} onClose={(e) => setModalDetail(!e)} />
      )}
    </>
  );
};

ProductInventoryList.propTypes = {
  facilityLocationList: PropTypes.array
};

export default ProductInventoryList;
