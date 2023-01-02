import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { getProductInventoryApproval } from 'pages/product/product-list/service';
import PropTypes from 'prop-types';

let paramRequestProductList = {};

const ListRequest = (props) => {
  const [requestProductData, setRequestProductData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');

  const onOrderingChange = (event) => {
    paramRequestProductList.orderValue = event.order;
    paramRequestProductList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramRequestProductList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramRequestProductList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramRequestProductList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const clearParamFetchData = () => {
    paramRequestProductList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '' };
    setKeywordSearch('');
  };

  async function fetchData() {
    const resp = await getProductInventoryApproval(paramRequestProductList);
    setRequestProductData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const initList = () => {
    clearParamFetchData();
    fetchData();
  };

  useEffect(() => {
    initList();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.isInitList) {
      initList();
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isInitList]);

  return (
    <>
      <Grid item>
        <GlobalFilter placeHolder={'Search...'} globalFilter={keywordSearch} setGlobalFilter={onSearch} style={{ height: '36.5px' }} />
      </Grid>
      <Grid item xs={12}>
        <ReactTable
          columns={props.columns}
          data={requestProductData.data}
          totalPagination={requestProductData.totalPagination}
          setPageNumber={paramRequestProductList.goToPage}
          onOrder={onOrderingChange}
          onGotoPage={onGotoPageChange}
          onPageSize={onPageSizeChange}
        />
      </Grid>
    </>
  );
};

ListRequest.propTypes = {
  columns: PropTypes.array,
  isInitList: PropTypes.bool
};

export default ListRequest;
