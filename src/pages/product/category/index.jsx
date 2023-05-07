import { Button, Stack, useMediaQuery, Link } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteProductCategory, exportProductCategory, getProductCategory } from './service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import ConfirmationC from 'components/ConfirmationC';
import FormProductCategory from './form-category';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ProductCategoryDetail from './detail';

let paramProductCategoryList = {};

const ProductCategory = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const intl = useIntl();

  const [productCategoryData, setProductCategoryData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [openFormCategory, setOpenFormCategory] = useState({ isOpen: false, id: '', categoryName: '', expiredDay: '' });
  const [openDetail, setOpenDetail] = useState({ isOpen: false, id: '', categoryName: '', expiredDay: '' });

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
          const getExpiredDay = data.row.original.expiredDay;

          const onDetail = () => setOpenDetail({ isOpen: true, id: getId, categoryName: getCateName, expiredDay: getExpiredDay });

          return <Link onClick={onDetail}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="expired-days" />,
        accessor: 'expiredDay'
      },
      {
        Header: <FormattedMessage id="total-product" />,
        accessor: 'totalProduct'
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
          const getExpiredDay = data.row.original.expiredDay;

          const onEdit = () => {
            setOpenFormCategory({ isOpen: true, id: getId, categoryName: getCateName, expiredDay: getExpiredDay });
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

  const onOrderingChange = (event) => {
    paramProductCategoryList.orderValue = event.order;
    paramProductCategoryList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductCategoryList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductCategoryList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductCategoryList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  async function fetchData() {
    const resp = await getProductCategory(paramProductCategoryList);
    setProductCategoryData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramProductCategoryList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  const onCloseForm = (e) => {
    setOpenFormCategory({ isOpen: false, id: '', categoryName: '', expiredDay: '' });

    if (e) {
      fetchData();
    }
  };

  const onExport = async () => {
    await exportProductCategory(paramProductCategoryList)
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

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductCategory(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            clearParamFetchData();
            fetchData();
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

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="product-category" />} isBreadcrumb={true} />
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
                  onClick={() => setOpenFormCategory({ isOpen: true, id: '', categoryName: '', expiredDay: '' })}
                >
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={productCategoryData.data}
              totalPagination={productCategoryData.totalPagination}
              setPageNumber={paramProductCategoryList.goToPage}
              setPageRow={paramProductCategoryList.rowPerPage}
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
      {openFormCategory.isOpen && (
        <FormProductCategory open={openFormCategory.isOpen} data={{ ...openFormCategory }} onClose={onCloseForm} />
      )}
      {openDetail.isOpen && (
        <ProductCategoryDetail
          open={openDetail.isOpen}
          data={{ ...openDetail }}
          onClose={() => setOpenDetail({ isOpen: false, id: '', categoryName: '', expiredDay: '' })}
        />
      )}
    </>
  );
};

export default ProductCategory;
