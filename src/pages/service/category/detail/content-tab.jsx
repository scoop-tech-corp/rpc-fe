import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Autocomplete, Stack, TextField, useMediaQuery } from '@mui/material';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { findServiceCategory } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';

let paramCategoryDetailList = {};

const CategoryDetailContent = (props) => {
  const [categoryDetailData, setCategoryDetailData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);

  const dispatch = useDispatch();
  const intl = useIntl();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="service-name" />, accessor: 'fullName' },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName',
        style: { maxWidth: '50%' },
        Cell: (data) => {
          let dataOrigin = data.row.original;

          return (
            <div>
              {dataOrigin?.location_list?.map((e, i) => `${e.locationName}${i == dataOrigin.location_list.length - 1 ? '' : ', '}`)}
            </div>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramCategoryDetailList.orderValue = event.order;
    paramCategoryDetailList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramCategoryDetailList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramCategoryDetailList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramCategoryDetailList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramCategoryDetailList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const fetchData = async () => {
    const catchSuccess = (resp) => {
      setCategoryDetailData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
    };

    const catchError = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    };

    await findServiceCategory({ ...paramCategoryDetailList, id: props.data.id })
      .then(catchSuccess)
      .catch(catchError);
  };

  const clearParamFetchData = () => {
    paramCategoryDetailList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ScrollX>
        <Stack spacing={3}>
          <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ pt: 1 }}>
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
                limitTags={1}
                options={props.filterLocationList || []}
                value={selectedFilterLocation}
                sx={{ width: 300 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onFilterLocation(value)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
              />
            </Stack>
          </Stack>
          <ReactTable
            columns={columns}
            data={categoryDetailData.data}
            totalPagination={categoryDetailData.totalPagination}
            setPageNumber={paramCategoryDetailList.goToPage}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>
    </>
  );
};

CategoryDetailContent.propTypes = {
  data: PropTypes.object,
  filterLocationList: PropTypes.array
};

export default CategoryDetailContent;
