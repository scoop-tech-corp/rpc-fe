import { useState, useEffect } from 'react';

export default function (getListFunc, initialParams, searchKey) {
  const [keyword, setKeyword] = useState('');
  const [params, setParams] = useState({
    goToPage: 1,
    rowPerPage: 5,
    orderValue: '',
    orderColumn: '',
    ...initialParams
  });
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [hasSearch, setHasSearch] = useState(false);

  const [listInfo, setListInfo] = useState({
    list: [],
    totalPagination: 0,
    isLoading: false,
    called: false
  });

  const clear = () => {
    setListInfo((_info) => ({ list: [], totalPagination: 0, isLoading: false }));
  };

  const { list, totalPagination, isLoading, called } = listInfo;
  const getList = (_params) => {
    setListInfo((_info) => ({ ..._info, isLoading: true }));
    getListFunc(_params)
      .then((res) => {
        setListInfo((_info) => ({
          list: res.data.data,
          totalPagination: res.data.totalPagination,
          isLoading: false,
          called: true
        }));
      })
      .catch((error) => {
        setListInfo((_info) => ({
          isLoading: false,
          error
        }));
      });
  };
  useEffect(() => {
    getList(params);
  }, [params]);

  const goToPage = (page) => {
    setParams((_params) => ({
      ..._params,
      goToPage: page
    }));
  };

  const search = () => {
    setParams((_params) => {
      return { ..._params, [searchKey]: keyword, goToPage: 1 };
    });
  };

  const orderingChange = (event) => {
    setParams((_params) => {
      return { ..._params, orderValue: event.order, orderColumn: event.column };
    });
  };

  const onKeyPressEnter = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  const changeKeyword = (e) => {
    setKeyword(e);
    setHasSearch(true);
  };

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (hasSearch) {
        search();
      }
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [keyword]);

  const changeLimit = (e) => {
    setParams((_params) => {
      return { ..._params, rowPerPage: e, goToPage: 1 };
    });
  };

  return {
    list,
    totalPagination,
    isLoading,
    called,
    params,
    setParams,
    goToPage,
    clear,
    keyword,
    onKeyPressEnter,
    search,
    changeKeyword,
    changeLimit,
    orderingChange
  };
}
