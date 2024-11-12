import { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, MoreOutlined, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, FormControl, FormHelperText, Grid, InputLabel, Menu, MenuItem, Select, Stack, TextField } from '@mui/material';

import IconButton from 'components/@extended/IconButton';
import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import FormDataStatic from 'components/FormDataStatic';

const PromotionPartnerPhone = ({ form, setForm, formError, setReloadData }) => {
  const [openMenu, setOpenMenu] = useState();
  const [modalDataStatic, setModalDataStatic] = useState({ is_open: false, procedure: '' });

  const renderExtendedMenu = () => {
    return (
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
          onClose={() => setOpenMenu(null)}
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
          <MenuItem
            onClick={() => {
              setModalDataStatic({ is_open: true, procedure: 'usage' });
            }}
          >
            <PlusCircleFilled style={{ color: '#1890ff' }} /> &nbsp;Usage
          </MenuItem>
          <MenuItem
            onClick={() => {
              setModalDataStatic({ is_open: true, procedure: 'type-phone' });
            }}
          >
            <PlusCircleFilled style={{ color: '#1890ff' }} /> &nbsp;Type
          </MenuItem>
        </Menu>
      </Stack>
    );
  };

  const onFieldHandler = (event, index = null) => {
    setForm((prevState) => {
      const phone_data = prevState.phone.data ?? [];

      if (typeof index === 'number') {
        phone_data[index][event.target.name] = event.target.value; // e.target.name -> usage, number, type
      }

      return {
        ...prevState,
        phone: {
          ...prevState.phone,
          data: phone_data
        },
        is_form_touched: true
      };
    });
  };

  const getErrorField = (keyFieldErr, i) => {
    const field = formError.phoneErr.find((p) => p.idx === i);
    return field ? field[keyFieldErr] : '';
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="phone" />} secondary={renderExtendedMenu()}>
        <Grid container spacing={3}>
          {form.phone.data.map(
            (dt, i) =>
              dt.status !== 'delete' && (
                <Fragment key={i}>
                  <Grid item xs={12} sm={4}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="status">
                        <FormattedMessage id="usage" />
                      </InputLabel>
                      <FormControl error={Boolean(getErrorField('usageErr', i))}>
                        <Select name="usage" value={dt.usage} onChange={(e) => onFieldHandler(e, i)}>
                          <MenuItem value="">
                            <em>Select usage</em>
                          </MenuItem>
                          {form.phone.usageList.map((dt, idxUsageList) => (
                            <MenuItem value={dt.value} key={idxUsageList}>
                              {dt.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {getErrorField('usageErr', i) && <FormHelperText error> {getErrorField('usageErr', i)} </FormHelperText>}
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="number">Number</InputLabel>
                      <TextField
                        fullWidth
                        id="number"
                        name="number"
                        type="number"
                        value={dt.number}
                        onChange={(e) => onFieldHandler(e, i)}
                        error={Boolean(getErrorField('numberErr', i))}
                        helperText={getErrorField('numberErr', i)}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="status">
                        <FormattedMessage id="type" />
                      </InputLabel>
                      <FormControl error={Boolean(getErrorField('typeErr', i))}>
                        <Select name="type" value={dt.type} onChange={(e) => onFieldHandler(e, i)}>
                          <MenuItem value="">
                            <em>Select type</em>
                          </MenuItem>
                          {form.phone.typeList.map((dt, idxTypeList) => (
                            <MenuItem value={dt.value} key={idxTypeList}>
                              {dt.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {getErrorField('typeErr', i) && <FormHelperText error> {getErrorField('typeErr', i)} </FormHelperText>}
                      </FormControl>
                    </Stack>
                  </Grid>

                  {form.phone.data.length > 1 && (
                    <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                      <IconButton
                        size="large"
                        color="error"
                        onClick={() => {
                          setForm((prevState) => {
                            const new_phone_data = [...prevState.phone.data];
                            // new_phone_data.splice(i, 1);
                            new_phone_data[i].status = 'delete';

                            return {
                              ...prevState,
                              phone: { ...prevState.phone, data: new_phone_data },
                              is_form_touched: true
                            };
                          });
                        }}
                      >
                        <DeleteFilled />
                      </IconButton>
                    </Grid>
                  )}
                </Fragment>
              )
          )}
        </Grid>

        <Button
          variant="contained"
          onClick={() => {
            setForm((prevState) => ({
              ...prevState,
              phone: { ...prevState.phone, data: [...prevState.phone.data, { id: '', usage: '', number: '', type: '', status: 'new' }] },
              is_form_touched: true
            }));
          }}
          startIcon={<PlusOutlined />}
          style={{ marginTop: '20px' }}
        >
          <FormattedMessage id="add" />
        </Button>
      </MainCard>
      <FormDataStatic
        open={modalDataStatic.is_open}
        onClose={(e) => {
          setModalDataStatic({ is_open: false, procedure: '' });
          if (e) setReloadData(true);
        }}
        procedure={modalDataStatic.procedure}
        module="promotion-partner"
      />
    </>
  );
};

PromotionPartnerPhone.propTypes = {
  form: PropTypes.object,
  setForm: PropTypes.func,
  formError: PropTypes.object,
  setReloadData: PropTypes.func
};

export default PromotionPartnerPhone;