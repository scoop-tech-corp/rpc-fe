import { useEffect, useMemo, useState } from 'react';
import { Chip, Grid, Stack } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { getProductInventoryApprovalHistory } from '../../service';
import { FormattedMessage } from 'react-intl';
import { EyeOutlined } from '@ant-design/icons';
import IconButton from 'components/@extended/IconButton';
import ProductInventoryApprovalDetail from './request/detail';

let paramHistoryList = {};

const History = () => {
  const [historyData, setHistoryData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [openModalDetail, setOpenModalDetail] = useState({ isOpen: false, id: '' });
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="requirement" />,
        accessor: 'requirementName'
      },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="applicant" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: 'Status',
        accessor: 'isApprovedOffice',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="warning" label="Waiting for Appoval" size="small" variant="light" />;
            case 1:
              return <Chip color="success" label="Accept" size="small" variant="light" />;
            case 2:
              return <Chip color="error" label="Reject" size="small" variant="light" />;
          }
        }
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        style: {
          textAlign: 'center'
        },
        Cell: (data) => {
          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              <IconButton size="large" color="info" onClick={() => onClickDetail(data.row.original)}>
                <EyeOutlined />
              </IconButton>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const onClickDetail = async (rowData) => {
    setOpenModalDetail({ isOpen: true, id: +rowData.id });
  };

  const onOrderingChange = (event) => {
    paramHistoryList.orderValue = event.order;
    paramHistoryList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramHistoryList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramHistoryList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramHistoryList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const clearParamFetchData = () => {
    paramHistoryList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  const fetchData = async () => {
    const resp = await getProductInventoryApprovalHistory(paramHistoryList);
    setHistoryData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  };

  const initList = () => {
    clearParamFetchData();
    fetchData();
  };

  useEffect(() => {
    initList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item>
          <GlobalFilter placeHolder={'Search...'} globalFilter={keywordSearch} setGlobalFilter={onSearch} style={{ height: '36.5px' }} />
        </Grid>
        <Grid item xs={12}>
          <ReactTable
            columns={columns}
            data={historyData.data}
            totalPagination={historyData.totalPagination}
            setPageNumber={paramHistoryList.goToPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Grid>
      </Grid>
      <ProductInventoryApprovalDetail
        open={openModalDetail.isOpen}
        id={openModalDetail.id}
        onClose={(e) => setOpenModalDetail({ isOpen: !e, id: '' })}
      />
    </>
  );
};

export default History;
