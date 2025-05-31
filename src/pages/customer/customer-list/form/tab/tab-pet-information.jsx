import { DeleteFilled, MoreOutlined, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getPetCategoryList } from 'pages/customer/service';
import { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useCustomerFormStore } from '../customer-form-store';

import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import FormPetCategory from '../components/FormPetCategory';

const TabPetInformation = () => {
  const customerPets = useCustomerFormStore((state) => state.customerPets);
  const petCategoryList = useCustomerFormStore((state) => state.petCategoryList);

  const onDeletePets = (i) => {
    useCustomerFormStore.setState((prevState) => {
      let newData = [...prevState.customerPets];
      newData[i].command = 'del';

      return { customerPets: newData, customerFormTouch: true };
    });
  };

  const onAddPets = () => {
    useCustomerFormStore.setState((prevState) => {
      return {
        customerPets: [
          ...prevState.customerPets,
          {
            id: '',
            petName: '',
            petCategoryId: null,
            races: '',
            condition: '',
            petGender: '',
            isSteril: '',
            birthDateType: '', // dateBirth || monthAndYear
            dateOfBirth: null,
            petMonth: '',
            petYear: '',
            color: '',
            remark: '',
            command: '',
            error: {
              petNameErr: '',
              petCategoryErr: '',
              conditionErr: '',
              petGenderErr: '',
              isSterilErr: ''
            }
          }
        ],
        customerFormTouch: true
      };
    });
  };

  const onCheckValidation = () => {};

  const onFieldHandler = (event, i) => {
    if (event.target.name === 'petYear' && +event.target.value > 9999) return;

    useCustomerFormStore.setState((prevState) => {
      let newData = [...prevState.customerPets];
      newData[i][event.target.name] = event.target.value;

      return { customerPets: newData, customerFormTouch: true };
    });
    onCheckValidation();
  };

  const onDropdownHandler = (selected, procedure, i) => {
    useCustomerFormStore.setState((prevState) => {
      let newData = [...prevState.customerPets];
      newData[i][procedure] = selected ? selected : null;

      return { customerPets: newData, customerFormTouch: true };
    });
    onCheckValidation();
  };

  const [openMenu, setOpenMenu] = useState(); // el: null
  const [openFormPetCategory, setOpenFormPetCategory] = useState(false);

  const onCloseFormPetCategory = async (val) => {
    if (val) {
      const getData = await getPetCategoryList();
      useCustomerFormStore.setState({ petCategoryList: getData });
    }
    setOpenFormPetCategory(false);
  };

  return (
    <>
      <MainCard
        title={<FormattedMessage id="pet-information" />}
        secondary={
          <Stack direction="row" justifyContent="flex-end">
            <IconButton
              variant="light"
              color="secondary"
              id="basic-button"
              aria-controls={openMenu ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              onClick={(e) => setOpenMenu(e?.currentTarget)}
            >
              <MoreOutlined />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={openMenu}
              open={Boolean(openMenu)}
              onClose={() => setOpenMenu()}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem onClick={() => setOpenFormPetCategory(true)}>
                <PlusCircleFilled style={{ color: '#1890ff' }} /> &nbsp; <FormattedMessage id="pet-category" />
              </MenuItem>
            </Menu>
          </Stack>
        }
      >
        <Grid container spacing={3}>
          {customerPets.map(
            (dt, i) =>
              dt.command !== 'del' && (
                <Fragment key={i}>
                  <Grid item xs={12} sm={11}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
                          <TextField
                            fullWidth
                            id="petName"
                            name="petName"
                            value={dt.petName}
                            onChange={(event) => onFieldHandler(event, i)}
                            inputProps={{ maxLength: 100 }}
                            error={Boolean(dt.error.petNameErr && dt.error.petNameErr.length > 0)}
                            helperText={dt.error.petNameErr}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel>
                            <FormattedMessage id="pet-category" />
                          </InputLabel>
                          <Autocomplete
                            id="pet-category"
                            options={petCategoryList}
                            value={dt.petCategoryId}
                            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                            onChange={(_, value) => onDropdownHandler(value, 'petCategoryId', i)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={Boolean(dt.error.petCategoryErr && dt.error.petCategoryErr.length > 0)}
                                helperText={dt.error.petCategoryErr}
                                variant="outlined"
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="breed">{<FormattedMessage id="breed" />}</InputLabel>
                          <TextField
                            fullWidth
                            id="breed"
                            name="races"
                            value={dt.races}
                            onChange={(event) => onFieldHandler(event, i)}
                            inputProps={{ maxLength: 100 }}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="condition">{<FormattedMessage id="condition" />}</InputLabel>
                          <TextField
                            fullWidth
                            id="condition"
                            name="condition"
                            value={dt.condition}
                            onChange={(event) => onFieldHandler(event, i)}
                            inputProps={{ maxLength: 100 }}
                            error={Boolean(dt.error.conditionErr && dt.error.conditionErr.length > 0)}
                            helperText={dt.error.conditionErr}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="gender">
                            <FormattedMessage id="gender" />
                          </InputLabel>
                          <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <Select
                              id={`petGender${i}`}
                              name="petGender"
                              value={dt.petGender}
                              onChange={(event) => onFieldHandler(event, i)}
                            >
                              <MenuItem value="">
                                <em>
                                  <FormattedMessage id="select-gender" />
                                </em>
                              </MenuItem>
                              <MenuItem value={'J'}>Jantan</MenuItem>
                              <MenuItem value={'B'}>Betina</MenuItem>
                            </Select>
                            {dt.error.petGenderErr.length > 0 && <FormHelperText error> {dt.error.petGenderErr} </FormHelperText>}
                          </FormControl>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="sterile">
                            <FormattedMessage id="sterile" />
                          </InputLabel>
                          <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <Select id={`isSteril${i}`} name="isSteril" value={dt.isSteril} onChange={(event) => onFieldHandler(event, i)}>
                              <MenuItem value="">
                                <em>
                                  <FormattedMessage id="select" />
                                </em>
                              </MenuItem>
                              <MenuItem value={'1'}>
                                <FormattedMessage id="yes" />
                              </MenuItem>
                              <MenuItem value={'0'}>
                                <FormattedMessage id="no" />
                              </MenuItem>
                            </Select>
                            {dt.error.isSterilErr.length > 0 && <FormHelperText error> {dt.error.isSterilErr} </FormHelperText>}
                          </FormControl>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <Stack spacing={1} flexDirection="row" alignItems="center">
                            <InputLabel htmlFor="birth-date">
                              <FormattedMessage id="birth-date" />
                            </InputLabel>
                            <RadioGroup
                              name="birthDateType"
                              value={dt.birthDateType} // birthDate || monthAndYear
                              style={{ flexDirection: 'row', height: '20px', marginLeft: '16px', marginTop: '0px' }}
                              onChange={(e) => {
                                useCustomerFormStore.setState((prevState) => {
                                  let newData = [...prevState.customerPets];
                                  newData[i].birthDateType = e.target.value;
                                  newData[i].dateOfBirth = null;
                                  newData[i].petMonth = '';
                                  newData[i].petYear = '';

                                  return { customerPets: newData, customerFormTouch: true };
                                });
                              }}
                            >
                              <FormControlLabel
                                value="birthDate"
                                control={<Radio />}
                                label={<FormattedMessage id="birth-date" />}
                                style={{ height: '20px' }}
                              />
                              <FormControlLabel
                                value="monthAndYear"
                                control={<Radio />}
                                label={<FormattedMessage id="month-and-year" />}
                                style={{ height: '20px' }}
                              />
                            </RadioGroup>
                          </Stack>

                          {dt.birthDateType === 'birthDate' && (
                            <Fragment>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DesktopDatePicker
                                  value={dt.dateOfBirth}
                                  onChange={(selected) => onDropdownHandler(selected, 'dateOfBirth', i)}
                                  renderInput={(params) => <TextField {...params} />}
                                />
                              </LocalizationProvider>
                            </Fragment>
                          )}

                          {dt.birthDateType === 'monthAndYear' && (
                            <Fragment>
                              <Stack spacing={1} flexDirection={'row'} gap={'10px'}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label={<FormattedMessage id="year" />}
                                  id={`petYear${i}`}
                                  name="petYear"
                                  value={dt.petYear}
                                  onChange={(event) => onFieldHandler(event, i)}
                                  inputProps={{ min: 0, max: 9999 }}
                                />
                                <FormControl sx={{ m: 1, minWidth: '120px' }} style={{ marginTop: 'unset' }}>
                                  <Select
                                    id={`petMonth${i}`}
                                    name="petMonth"
                                    value={dt.petMonth}
                                    onChange={(event) => onFieldHandler(event, i)}
                                  >
                                    <MenuItem value="">
                                      <em>
                                        <FormattedMessage id="select-month" />
                                      </em>
                                    </MenuItem>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((dt, idx) => (
                                      <MenuItem value={dt} key={idx}>
                                        {dt}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Stack>
                            </Fragment>
                          )}
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="color">{<FormattedMessage id="color" />}</InputLabel>
                          <TextField fullWidth id="color" name="color" value={dt.color} onChange={(event) => onFieldHandler(event, i)} />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="remark">{<FormattedMessage id="remark" />}</InputLabel>
                          <TextField fullWidth id="remark" name="remark" value={dt.remark} onChange={(event) => onFieldHandler(event, i)} />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  {customerPets.length > 1 && (
                    <Grid item xs={12} sm={1}>
                      <IconButton size="large" color="error" onClick={() => onDeletePets(i)}>
                        <DeleteFilled />
                      </IconButton>
                    </Grid>
                  )}
                </Fragment>
              )
          )}
        </Grid>
        <Button variant="contained" onClick={onAddPets} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
          Add
        </Button>
      </MainCard>
      <FormPetCategory open={openFormPetCategory} onClose={onCloseFormPetCategory} />
    </>
  );
};

export default TabPetInformation;
