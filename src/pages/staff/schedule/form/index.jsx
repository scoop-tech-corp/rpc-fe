import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { DesktopDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormattedMessage } from 'react-intl';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { createStaffSchedule, getStaffScheduleMenuList, getStaffScheduleUser, updateStaffSchedule } from '../service';
import { getAccessControlMasterMenu, getAccessControlTypeAccess } from 'pages/staff/access-control/service';
import { formateDateDDMMYYY } from 'utils/func';
import { DeleteFilled, EditFilled, PlusOutlined } from '@ant-design/icons';
import { ReactTable } from 'components/third-party/ReactTable';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';

const configCoreErr = {
  locationErr: '',
  usersErr: '',
  schedulesErr: ''
};

const configScheduleCoreErr = {
  masterMenuErr: '',
  menuErr: '',
  typeAccessErr: '',
  giveAccessErr: '',
  durationErr: '',
  startTimeErr: '',
  endTimeErr: ''
};

const StaffScheduleForm = (props) => {
  const [formValue, setFormValue] = useState({
    id: null,
    locationId: null,
    usersId: null,
    masterMenuId: null,
    menuListId: null,
    accessTypeId: null,
    giveAccessNow: '',
    startTime: null,
    endTime: null,
    tempStartTime: null,
    tempEndTime: null,
    duration: '',
    schedules: [],
    editMode: false,
    detailId: null // use to identify schedule to edit
  });
  const [locationList, setLocationList] = useState([]);
  const [accessTypeList, setAccessTypeList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [masterMenuList, setMasterMenuList] = useState([]);
  const [menuList, setMenuList] = useState([]);

  const [formError, setFormError] = useState(configCoreErr);
  const [formErrorSchedule, setFormErrorSchedule] = useState(configScheduleCoreErr);
  const [isFormTouch, setFormTouch] = useState(false);

  const dispatch = useDispatch();
  const firstRender = useRef(true);

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="master-menu" />,
        accessor: 'masterMenuId',
        isNotSorting: true,
        Cell: (data) => (!data.value ? '-' : data.value.label)
      },
      {
        Header: <FormattedMessage id="menu-list" />,
        accessor: 'menuListId',
        isNotSorting: true,
        Cell: (data) => (!data.value ? '-' : data.value.label)
      },
      {
        Header: <FormattedMessage id="type-access" />,
        accessor: 'accessTypeId',
        isNotSorting: true,
        Cell: (data) => (!data.value ? '-' : data.value.label)
      },
      { Header: <FormattedMessage id="start-time" />, accessor: 'startTime', isNotSorting: true },
      { Header: <FormattedMessage id="end-time" />, accessor: 'endTime', isNotSorting: true },
      { Header: <FormattedMessage id="duration" />, accessor: 'durationView', isNotSorting: true },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const rowData = data.row.original;
          const onDeleteDetailSchedule = () => {
            setFormValue((prevState) => {
              const newData = [...prevState.schedules];
              newData[data.row.index].command = 'del';

              return { ...prevState, schedules: newData };
            });

            if (!formValue.schedules.filter((pd) => pd.command == '').length) {
              onCheckValidation();
            }
          };

          const renderDeleteButton = () => {
            if (props.data && !rowData.isEdited) return false;

            return (
              <IconButton size="large" color="error" onClick={() => onDeleteDetailSchedule()} disabled={rowData.editMode}>
                <DeleteFilled />
              </IconButton>
            );
          };

          return (
            <>
              <Stack spacing={1} flexDirection={'row'} alignItems={'baseline'} justifyContent={'center'}>
                {props.data && Boolean(rowData.isEdited) && (
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => {
                      setFormValue((prevState) => {
                        const findIdx = prevState.schedules.findIndex((dt) => dt.detailId === rowData.detailId);
                        const newSchedules = [...prevState.schedules];
                        newSchedules[findIdx].editMode = true;

                        return {
                          ...prevState,
                          detailId: rowData.detailId,
                          editMode: true,
                          masterMenuId: rowData.masterMenuId,
                          menuListId: rowData.menuListId,
                          accessTypeId: rowData.accessTypeId,
                          giveAccessNow: rowData.giveAccessNow,
                          tempStartTime: rowData.startTime,
                          tempEndTime: rowData.endTime,
                          schedules: newSchedules,
                          startTime: null,
                          endTime: null
                        };
                      });
                    }}
                    disabled={rowData.editMode}
                  >
                    <EditFilled />
                  </IconButton>
                )}

                {renderDeleteButton()}
              </Stack>
            </>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onSubmit = async () => {
    const isObject = (variable) => variable && typeof variable == 'object';
    let param = {
      id: props.data ? formValue.id : undefined,
      locationId: isObject(formValue.locationId) ? formValue.locationId.value : formValue.locationId,
      usersId: isObject(formValue.locationId) ? formValue.usersId.value : formValue.usersId,

      details: formValue.schedules.map((s) => ({
        detailId: props.data ? (s.detailId ? s.detailId : '') : undefined,
        masterMenuId: isObject(s.masterMenuId) ? s.masterMenuId.value : s.masterMenuId,
        listMenuId: isObject(s.menuListId) ? s.menuListId.value : s.menuListId,
        accessTypeId: isObject(s.accessTypeId) ? s.accessTypeId.value : s.accessTypeId,
        giveAccessNow: s.giveAccessNow,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration ? s.duration : s.durationView,
        command: s.command
      }))
    };

    const respSuccess = (resp) => {
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(`Success ${!props.data ? 'create' : 'update'} data`));
        props.onClose(true);
      }
    };

    const respError = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
    };

    if (!props.data) {
      await createStaffSchedule(param).then(respSuccess).catch(respError);
    } else {
      await updateStaffSchedule(param).then(respSuccess).catch(respError);
    }
  };

  const onLoadUsersByLocId = (locId, procedure) => {
    const doFetch = async () => {
      const getLocId = typeof locId === 'object' && locId?.value ? locId.value : locId;
      if (getLocId) {
        const getUsers = await getStaffScheduleUser(getLocId);
        setUsersList(getUsers);
        return getUsers;
      } else {
        return [];
      }
    };

    if (procedure === 'need_waiting') return new Promise((resolve) => resolve(doFetch()));
    else doFetch();
  };

  const onLoadMenusByMasterId = (masterMenuId, procedure) => {
    const doFetch = async () => {
      const getMenuMasterId = typeof masterMenuId === 'object' && masterMenuId.value ? masterMenuId.value : masterMenuId;
      if (getMenuMasterId) {
        const getData = await getStaffScheduleMenuList(getMenuMasterId);
        setMenuList(getData);
        return getData;
      } else {
        return [];
      }
    };

    if (procedure === 'need_waiting') return new Promise((resolve) => resolve(doFetch()));
    else doFetch();
  };

  const doFetchData = async () => {
    const getLoc = await getLocationList();
    const getMasterMenu = await getAccessControlMasterMenu();
    const getTypeAccess = await getAccessControlTypeAccess();

    if (props.data) {
      const dataDetail = { ...props.data };
      const usersList = await onLoadUsersByLocId(+dataDetail.locationId, 'need_waiting');

      const mappingDetails = () => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
          let tempSchedules = [];
          for (const dt of dataDetail.details) {
            const menuList = await onLoadMenusByMasterId(+dt.masterMenuId, 'need_waiting');
            tempSchedules.push({
              detailId: +dt.detailId,
              masterMenuId: getMasterMenu.find((m) => m.value === +dt.masterMenuId),
              menuListId: menuList.find((m) => m.value === +dt.listMenuId),
              accessTypeId: getTypeAccess.find((t) => t.value === +dt.accessTypeId),
              giveAccessNow: +dt.giveAccessNow,
              startTime: dt.startTime,
              endTime: dt.endTime,
              duration: dt.duration,
              durationView: dt.duration,
              isEdited: +dt.isEdited,
              command: '',
              editMode: false
            });
          }
          resolve(tempSchedules);
        });
      };

      const newSchedules = await mappingDetails();

      const newSetFormValue = {
        id: dataDetail.id,
        locationId: getLoc.find((dt) => +dt.value === +dataDetail.locationId),
        usersId: usersList.find((dt) => +dt.value === +dataDetail.usersId),
        schedules: newSchedules
      };

      setFormValue((prevState) => ({ ...prevState, ...newSetFormValue }));
    }

    setLocationList(getLoc);
    setMasterMenuList(getMasterMenu);
    setAccessTypeList(getTypeAccess);
  };

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await doFetchData();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  const onDateChange = (selected, key) => {
    setFormValue((prevState) => ({ ...prevState, [key]: selected }));
  };

  const constructDiffDate = (startDate, endDate) => {
    const date_now = new Date(startDate);
    const date_future = new Date(endDate);

    let seconds = Math.floor((date_future - date_now) / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours = hours - days * 24;
    minutes = minutes - days * 24 * 60 - hours * 60;
    seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

    return { days, hours, minutes, seconds };
  };

  const onAddSchedule = () => {
    if (formValue.editMode) {
      setFormValue((prevState) => {
        const findIdx = prevState.schedules.findIndex((dt) => dt.detailId === formValue.detailId);
        const tempSchedule = [...prevState.schedules];
        tempSchedule[findIdx].masterMenuId = formValue.masterMenuId;
        tempSchedule[findIdx].menuListId = formValue.menuListId;
        tempSchedule[findIdx].accessTypeId = formValue.accessTypeId;
        tempSchedule[findIdx].giveAccessNow = formValue.giveAccessNow;
        tempSchedule[findIdx].startTime = formValue.startTime
          ? formateDateDDMMYYY(new Date(formValue.startTime), {
              isWithTime: { show: true, withSecond: false },
              separator: '/'
            })
          : formValue.tempStartTime;
        tempSchedule[findIdx].endTime = formValue.endTime
          ? formateDateDDMMYYY(new Date(formValue.endTime), {
              isWithTime: { show: true, withSecond: false },
              separator: '/'
            })
          : formValue.tempEndTime;
        tempSchedule[findIdx].duration = formValue.duration ? formValue.duration : '';
        tempSchedule[findIdx].durationView = formValue.duration ? formValue.duration : tempSchedule[findIdx].durationView;
        tempSchedule[findIdx].editMode = false;

        return {
          ...prevState,
          masterMenuId: null,
          menuListId: null,
          accessTypeId: null,
          giveAccessNow: '',
          startTime: null,
          endTime: null,
          tempStartTime: null,
          tempEndTime: null,
          duration: '',
          editMode: false,
          detailId: null,
          schedules: tempSchedule
        };
      });
    } else {
      setFormValue((prevState) => {
        const newSchedule = [
          {
            masterMenuId: formValue.masterMenuId,
            menuListId: formValue.menuListId,
            accessTypeId: formValue.accessTypeId,
            giveAccessNow: formValue.giveAccessNow,
            startTime: formateDateDDMMYYY(new Date(formValue.startTime), { isWithTime: { show: true, withSecond: false }, separator: '/' }),
            endTime: formateDateDDMMYYY(new Date(formValue.endTime), { isWithTime: { show: true, withSecond: false }, separator: '/' }),
            duration: 0,
            durationView: formValue.duration,
            command: '',
            isEdited: true,
            editMode: false
          },
          ...prevState.schedules
        ];

        return {
          ...prevState,
          masterMenuId: null,
          menuListId: null,
          accessTypeId: null,
          giveAccessNow: '',
          startTime: null,
          endTime: null,
          duration: '',
          schedules: newSchedule
        };
      });
    }
    setFormTouch(true);
    // onCheckValidation();
  };

  const onCheckValidationSchedule = () => {
    let masterMenuErr = '';
    let menuErr = '';
    let typeAccessErr = '';
    let giveAccessErr = '';
    let startTimeErr = '';
    let endTimeErr = '';

    if (!formValue.masterMenuId) masterMenuErr = <FormattedMessage id="master-menu-is-required" />;
    if (!formValue.menuListId) menuErr = <FormattedMessage id="menu-is-required" />;
    if (!formValue.accessTypeId) typeAccessErr = <FormattedMessage id="type-access-is-required" />;
    if (!formValue.giveAccessNow && typeof formValue.giveAccessNow !== 'number')
      giveAccessErr = <FormattedMessage id="give-access-now-is-required" />;
    if (!formValue.startTime && !props.data) startTimeErr = <FormattedMessage id="start-time-is-required" />;
    if (!formValue.endTime && !props.data) endTimeErr = <FormattedMessage id="end-time-is-required" />;

    if (masterMenuErr || menuErr || typeAccessErr || giveAccessErr || startTimeErr || endTimeErr) {
      setFormErrorSchedule((prevState) => ({
        ...prevState,
        masterMenuErr,
        menuErr,
        typeAccessErr,
        giveAccessErr,
        startTimeErr,
        endTimeErr
      }));
    } else {
      setFormErrorSchedule((prevState) => ({
        ...prevState,
        masterMenuErr: '',
        menuErr: '',
        typeAccessErr: '',
        giveAccessErr: '',
        startTimeErr: '',
        endTimeErr: ''
      }));
    }
  };

  const onCheckValidation = () => {
    let locationErr = '';
    let usersErr = '';
    let schedulesErr = '';

    if (!formValue.locationId) locationErr = <FormattedMessage id="location-is-required" />;
    if (!formValue.usersId) usersErr = <FormattedMessage id="user-is-required" />;
    if (!formValue.schedules.length) schedulesErr = <FormattedMessage id="schedules-at-least-one" />;

    if (locationErr || usersErr || schedulesErr) {
      setFormError((prevState) => ({
        ...prevState,
        locationErr,
        usersErr,
        schedulesErr
      }));
    } else {
      setFormError((prevState) => ({
        ...prevState,
        locationErr: '',
        usersErr: '',
        schedulesErr: ''
      }));
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formValue.startTime && formValue.endTime) {
      const getDiffDate = constructDiffDate(formValue.startTime, formValue.endTime);
      setFormValue((prevState) => ({ ...prevState, duration: `${getDiffDate.days} Hari ${getDiffDate.hours} Jam` }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue.startTime, formValue.endTime]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!firstRender.current) {
      onCheckValidation();
      onCheckValidationSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue]);

  const renderForm = () => {
    const doRender = () => {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InputLabel htmlFor="branch">{<FormattedMessage id="branch" />}</InputLabel>
            <Autocomplete
              id="location"
              options={locationList}
              value={formValue.locationId}
              isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
              onChange={async (_, selected) => {
                setFormValue((prevState) => ({ ...prevState, locationId: selected }));
                setFormTouch(true);

                // load menu list user
                setUsersList([]);
                onLoadUsersByLocId(selected);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formError.locationErr && formError.locationErr.toString().length > 0)}
                  helperText={formError.locationErr ? formError.locationErr : ''}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <InputLabel htmlFor="user">{<FormattedMessage id="user" />}</InputLabel>
            <Autocomplete
              id="user"
              options={usersList}
              value={formValue.usersId}
              isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
              onChange={(_, selected) => {
                setFormValue((prevState) => ({ ...prevState, usersId: selected }));
                setFormTouch(true);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formError.usersErr && formError.usersErr.toString().length > 0)}
                  helperText={formError.usersErr ? formError.usersErr : ''}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <InputLabel htmlFor="master-menu">{<FormattedMessage id="master-menu" />}</InputLabel>
            <Autocomplete
              id="master-menu"
              options={masterMenuList}
              value={formValue.masterMenuId}
              isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
              onChange={async (_, selected) => {
                setFormValue((prevState) => ({ ...prevState, menuListId: null, masterMenuId: selected }));
                setFormTouch(true);

                // load menu list dropdown
                onLoadMenusByMasterId(selected);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formErrorSchedule.masterMenuErr && formErrorSchedule.masterMenuErr.toString().length > 0)}
                  helperText={formErrorSchedule.masterMenuErr ? formErrorSchedule.masterMenuErr : ''}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <InputLabel htmlFor="menu-list">{<FormattedMessage id="menu-list" />}</InputLabel>
            <Autocomplete
              id="menu-list"
              options={menuList}
              value={formValue.menuListId}
              isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
              onChange={(_, selected) => {
                setFormValue((prevState) => ({ ...prevState, menuListId: selected }));
                setFormTouch(true);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formErrorSchedule.menuErr && formErrorSchedule.menuErr.toString().length > 0)}
                  helperText={formErrorSchedule.menuErr ? formErrorSchedule.menuErr : ''}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <InputLabel htmlFor="type-access">{<FormattedMessage id="type-access" />}</InputLabel>
            <Autocomplete
              id="type-access"
              options={accessTypeList}
              value={formValue.accessTypeId}
              isOptionEqualToValue={(option, val) => val === '' || option?.value === val?.value}
              onChange={(_, selected) => {
                setFormValue((prevState) => ({ ...prevState, accessTypeId: selected }));
                setFormTouch(true);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(formErrorSchedule.typeAccessErr && formErrorSchedule.typeAccessErr.toString().length > 0)}
                  helperText={formErrorSchedule.typeAccessErr ? formErrorSchedule.typeAccessErr : ''}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="give-access-now">{<FormattedMessage id="give-access-now" />}</InputLabel>
              <FormControl>
                <Select
                  id="give-access-now"
                  name="give-access-now"
                  value={formValue.giveAccessNow}
                  onChange={(event) => {
                    setFormValue((prevState) => ({ ...prevState, giveAccessNow: event.target.value }));
                    setFormTouch(true);
                  }}
                  placeholder="Select give access now"
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-give-access" />
                    </em>
                  </MenuItem>
                  <MenuItem value={1}>{<FormattedMessage id="yes" />}</MenuItem>
                  <MenuItem value={0}>{<FormattedMessage id="no" />}</MenuItem>
                </Select>
                {formErrorSchedule.giveAccessErr.toString().length > 0 && (
                  <FormHelperText error> {formErrorSchedule.giveAccessErr} </FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="start-time">
                <FormattedMessage id="start-time" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDateTimePicker
                  value={formValue.startTime}
                  onChange={(e) => onDateChange(e, 'startTime')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(formErrorSchedule.startTimeErr && formErrorSchedule.startTimeErr.toString().length > 0)}
                      helperText={formErrorSchedule.startTimeErr ? formErrorSchedule.startTimeErr : ''}
                      variant="outlined"
                    />
                  )}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="end-time">
                <FormattedMessage id="end-time" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDateTimePicker
                  value={formValue.endTime}
                  onChange={(e) => onDateChange(e, 'endTime')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(formErrorSchedule.endTimeErr && formErrorSchedule.endTimeErr.toString().length > 0)}
                      helperText={formErrorSchedule.endTimeErr ? formErrorSchedule.endTimeErr : ''}
                      variant="outlined"
                    />
                  )}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="duration">{<FormattedMessage id="duration" />}</InputLabel>
              <TextField
                fullWidth
                id="duration"
                name="duration"
                value={formValue.duration}
                error={Boolean(formErrorSchedule.durationErr && formErrorSchedule.durationErr.toString().length > 0)}
                helperText={formErrorSchedule.durationErr ? formErrorSchedule.durationErr : ''}
                inputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>

          <Grid item xs={6}>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={onAddSchedule}
              disabled={Boolean(Object.values(formErrorSchedule).find((dt) => dt))}
            >
              <FormattedMessage id="schedule" />
            </Button>
          </Grid>
          <Grid item xs={6} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {formError.schedulesErr.toString().length > 0 && <FormHelperText error> {formError.schedulesErr}*</FormHelperText>}
          </Grid>

          <Grid item xs={12}>
            <ReactTable columns={columns} data={formValue.schedules ? formValue.schedules?.filter((s) => s.command == '') : []} />
          </Grid>
        </Grid>
      );
    };
    const canRender = () => {
      let result = false;
      if (!props.data) result = true;
      else if (props.data && formValue.id) result = true;

      return result;
    };

    return canRender() && doRender();
  };

  return (
    <ModalC
      fullWidth
      title={<FormattedMessage id={`${props.data ? 'edit' : 'create'}-schedule`} />}
      open={props.open}
      onOk={onSubmit}
      onCancel={() => props.onClose()}
      disabledOk={!isFormTouch || Boolean(Object.values(formError).find((dt) => dt))}
      maxWidth="lg"
    >
      {renderForm()}
    </ModalC>
  );
};

StaffScheduleForm.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default StaffScheduleForm;
