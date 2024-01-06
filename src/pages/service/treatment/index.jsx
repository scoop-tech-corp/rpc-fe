import React from 'react';

import { Button, Stack, useMediaQuery, Link, FormControl, Autocomplete, TextField, MenuItem, Menu } from '@mui/material';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { AlignCenterOutlined, DownOutlined, PlusOutlined, UndoOutlined } from '@ant-design/icons';
import { GlobalFilter } from 'utils/react-table';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import DownloadIcon from '@mui/icons-material/Download';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import useGetList from 'hooks/useGetList';
import { exportData } from 'utils/exportData.js';

import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList } from 'service/service-global';

// Usable
import { getTreatment, exportTreatment, deleteTreatment, getDiagnoseList, updateTreatment } from './service';
import FormTreatment from './form/form-treatment';

import { useTreatmentStore } from './treatment-form-store';
import { useNavigate } from 'react-router';

const defaultFilter = {
  diagnose_id: [],
  location_id: [],
  status: '',
  name: ''
};
export default function Index() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const { list, totalPagination, params, goToPage, setParams, orderingChange, changeLimit } = useGetList(getTreatment, {}, 'search');
  const [selectedRow, setSelectedRow] = useState([]);
  const locationList = useTreatmentStore((state) => state.dataSupport.locationList);
  const diagnoseList = useTreatmentStore((state) => state.dataSupport.diagnoseList);
  const statusList = useTreatmentStore((state) => state.dataSupport.statusList);

  const [dialog, setDialog] = useState(false);
  const [openFormCategory, setOpenFormCategory] = useState({ isOpen: false, id: '', categoryName: '' });

  const [isShowFilter, setIsShowFilter] = useState(false);
  const [filter, setFilter] = useState(defaultFilter);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisabled = () => {
    let params = {
      id: selectedRow,
      status: 3
    };
    updateTreatment(params)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Success update data'));
          setParams((_params) => ({ ..._params }));
        }
      })
      .catch((err) => {
        if (err) {
          console.log(err);
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
  };

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
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          const getId = data.row.original.id;
          const getName = data.row.original.treatmentName;
          return <Link onClick={() => navigate(`/service/treatment/${getId}`)}>{getName}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="diagnose" />,
        accessor: 'diagnoseName'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },

      {
        Header: <FormattedMessage id="duration" />,
        accessor: 'column',
        Cell: (data) => {
          return `${data.row.original.column || '0'} ${intl.formatMessage({ id: 'day' })}`;
        }
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: (data) => {
          if (data.row.original.status == 1) {
            return <FormattedMessage id="active" />;
          } else if (data.row.original.status == 2) {
            return <FormattedMessage id="draft" />;
          } else {
            return <FormattedMessage id="disabled" />;
          }
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
    return await exportData(exportTreatment, paramsExport);
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteTreatment(selectedRow)
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
  useEffect(() => {
    async function fetchData() {
      useTreatmentStore.setState({
        dataSupport: {
          locationList: await getLocationList(),
          diagnoseList: await getDiagnoseList(),
          statusList: [
            { label: intl.formatMessage({ id: 'active' }), value: '1' },
            { label: intl.formatMessage({ id: 'draft' }), value: '2' },
            { label: intl.formatMessage({ id: 'disabled' }), value: '3' }
          ]
        }
      });
    }

    fetchData();
  }, []);

  const handleFilter = () => {
    let tempFilter = {
      ...filter,
      location_id: filter.location_id?.map((e) => e.value),
      diagnose_id: filter.diagnose_id?.map((e) => e.value),
      status: filter.status?.value
    };
    setParams((e) => ({
      ...e,
      ...tempFilter
    }));
  };

  const handleReset = () => {
    setFilter(defaultFilter);
    setParams((e) => ({
      ...e,
      ...defaultFilter
    }));
  };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="treatment-plan" />} isBreadcrumb={true} />
      <MainCard content={false}>
        <div className="" style={{ margin: 20 }}>
          <ScrollX>
            <Stack spacing={3}>
              <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="end" alignItems="center" spacing={1} sx={{ p: 3, pb: 0 }}>
                <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                  <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                    <FormattedMessage id="export" />
                  </Button>
                  <Button
                    id="demo-customized-button"
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    disableElevation
                    color="secondary"
                    variant="contained"
                    onClick={handleClick}
                    endIcon={<DownOutlined />}
                  >
                    Actions
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button'
                    }}
                  >
                    <MenuItem onClick={handleDisabled}>
                      <FormattedMessage id="disabled" />
                    </MenuItem>
                    <MenuItem onClick={() => setDialog(true)}>
                      <FormattedMessage id="delete" />
                    </MenuItem>
                  </Menu>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<AlignCenterOutlined />}
                    onClick={() => setIsShowFilter(!isShowFilter)}
                  >
                    <FormattedMessage id="filter" />
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
              <MainCard content={false} sx={{ m: 3, pb: 0 }}>
                <ScrollX>
                  <Stack spacing={3}>
                    {isShowFilter && (
                      <>
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
                              globalFilter={filter.name}
                              setGlobalFilter={(e) => {
                                setFilter({
                                  ...filter,
                                  name: e
                                });
                              }}
                              style={{ height: '41.3px' }}
                            />
                            <Autocomplete
                              id="diagnose"
                              multiple
                              options={diagnoseList}
                              sx={{ minWidth: 250, maxWidth: 400, height: '100%' }}
                              limitTags={2}
                              value={filter.diagnose_id}
                              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                              onChange={(e, val) => setFilter({ ...filter, diagnose_id: val })}
                              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="diagnose" />} />}
                            />
                            <Autocomplete
                              id="location"
                              multiple
                              options={locationList}
                              sx={{ minWidth: 250, maxWidth: 400, height: '100%' }}
                              limitTags={2}
                              value={filter.location_id}
                              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                              onChange={(e, val) => setFilter({ ...filter, location_id: val })}
                              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                            />
                            <FormControl>
                              <Autocomplete
                                id="category"
                                sx={{ width: 200, height: '100%' }}
                                options={statusList}
                                value={filter.status}
                                onChange={(e, val) => setFilter({ ...filter, status: val })}
                                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="status" />} />}
                              />
                            </FormControl>
                          </Stack>
                        </Stack>
                        <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} sx={{ p: 3, pt: 0, pb: 0, mt: '10px !important' }}>
                          <Button variant="outlined" color="secondary" startIcon={<UndoOutlined />} onClick={handleReset}>
                            <FormattedMessage id="reset" />
                          </Button>
                          <Button variant="outlined" startIcon={<AlignCenterOutlined />} onClick={handleFilter}>
                            <FormattedMessage id="filter" />
                          </Button>
                        </Stack>
                      </>
                    )}
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
            </Stack>
          </ScrollX>
        </div>
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
        <FormTreatment
          open={true}
          data={{ ...openFormCategory }}
          onClose={() => {
            setOpenFormCategory({ isOpen: false, id: '', categoryName: '' });
          }}
          setParams={setParams}
        />
      )}
    </>
  );
}
