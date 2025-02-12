import { Autocomplete, Button, Grid, InputLabel, Menu, MenuItem, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, MoreOutlined, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import { defaultIdentification, useStaffFormStore } from '../../staff-form-store';
import { Fragment, useState } from 'react';
import { useParams } from 'react-router';
import { getDropdownStaffDataStatic } from 'pages/staff/static-data/service';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormTypeId from 'components/FormTypeId';

const Background = () => {
  let { id } = useParams();
  // const typeId = useStaffFormStore((state) => state.typeId);
  const typeIdList = useStaffFormStore((state) => state.typeIdList);
  // const typeIdValue = typeIdList.find((val) => val.value === typeId) || null;
  // const identificationNumber = useStaffFormStore((state) => state.identificationNumber);
  // const imagePath = useStaffFormStore((state) => state.imagePath);

  const typeIdentifications = useStaffFormStore((state) => state.typeIdentifications);

  const additionalInfo = useStaffFormStore((state) => state.additionalInfo);

  const [openFormTypeId, setOpenFormTypeId] = useState(false);

  const [openMenu, setOpenMenu] = useState();

  const onAddTypeId = () => setOpenFormTypeId(true);

  const onCloseFormTypeId = async (val) => {
    if (val) {
      const { dataStaticTypeId } = await getDropdownStaffDataStatic();
      useStaffFormStore.setState({ typeIdList: dataStaticTypeId });
    }
    setOpenFormTypeId(false);
  };

  const onFieldHandler = (event, i = null) => {
    useStaffFormStore.setState((prevState) => {
      if (i !== null) {
        let newData = [...prevState.typeIdentifications];
        newData[i][event.target.name] = event.target.value;

        return { typeIdentifications: newData, staffFormTouch: true };
      } else {
        return { [event.target.name]: event.target.value, staffFormTouch: true };
      }
    });
  };

  const onDropdownHandler = (selected, procedure, i) => {
    useStaffFormStore.setState((prevState) => {
      let newData = [...prevState.typeIdentifications];
      newData[i][procedure] = selected ? selected : null;

      return { typeIdentifications: newData, staffFormTouch: true };
    });
  };

  const onDeleteTypeIdentification = (i) => {
    useStaffFormStore.setState((prevState) => {
      let newData = [...prevState.typeIdentifications];
      newData.splice(i, 1);
      // newData[i].command = 'del';

      return { typeIdentifications: newData, staffFormTouch: true };
    });
  };

  const clearImage = (i) => {
    document.getElementById(`importImage-${i}`).value = '';

    useStaffFormStore.setState((prevState) => {
      let newData = [...prevState.typeIdentifications];

      newData[i].imagePath = '';
      newData[i].image = {
        id: '',
        selectedFile: '',
        isChange: true
      };
      return { typeIdentifications: newData, staffFormTouch: true };
    });
  };

  const onSelectedPhoto = (e, index) => {
    const getFile = e.target.files[0];

    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        useStaffFormStore.setState((prevState) => {
          let newData = [...prevState.typeIdentifications];

          const newId = id && newData[index].image?.id ? newData[index].image.id : '';
          const objFile = {
            id: newId,
            selectedFile: getFile,
            isChange: true
          };

          newData[index].imagePath = this.result;
          newData[index].image = objFile;

          return { typeIdentifications: newData, staffFormTouch: true };
        });
      };
      reader.readAsDataURL(getFile);
    } else {
      clearImage();
    }
  };

  const renderExtendedMenu = () => {
    const handleClose = () => setOpenMenu(null);

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
          onClose={handleClose}
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
          <MenuItem onClick={onAddTypeId}>
            <PlusCircleFilled style={{ color: '#1890ff' }} /> &nbsp; <FormattedMessage id="type-of-id" />
          </MenuItem>
        </Menu>
      </Stack>
    );
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="background" />} secondary={renderExtendedMenu()}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <MainCard content={true}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      useStaffFormStore.setState((prevState) => {
                        const newRow = { ...defaultIdentification };
                        let newData = [...prevState.typeIdentifications, newRow];

                        return { typeIdentifications: newData, staffFormTouch: true };
                      });
                    }}
                    startIcon={<PlusOutlined />}
                  >
                    Add
                  </Button>
                </Grid>
                {typeIdentifications.map((dt, i) => (
                  <Fragment key={i}>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          <FormattedMessage id="type-of-id" />
                        </InputLabel>
                        <Autocomplete
                          id="type-of-id"
                          options={typeIdList}
                          value={dt.typeId}
                          onChange={(_, selected) => onDropdownHandler(selected, 'typeId', i)}
                          isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="identification">{<FormattedMessage id="identification" />}</InputLabel>
                        <TextField
                          id="identification"
                          name="identificationNumber"
                          fullWidth
                          value={dt.identificationNumber}
                          onChange={(event) => onFieldHandler(event, i)}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="import-image">{<FormattedMessage id="import-image" />}</InputLabel>
                        <Stack spacing={1} flexDirection="row">
                          {dt.imagePath && (
                            <>
                              <a href={dt.imagePath} target="blank" style={{ flexBasis: '20%', marginRight: '10px' }}>
                                <img alt={dt.imagePath} src={dt.imagePath} width="100%" />
                              </a>
                              <DeleteFilled
                                style={{ fontSize: '14px', color: 'red', cursor: 'pointer', marginRight: '10px' }}
                                onClick={() => clearImage(i)}
                              />
                            </>
                          )}
                          <input
                            type="file"
                            id={`importImage-${i}`}
                            onChange={(event) => onSelectedPhoto(event, i)}
                            accept="image/x-png,image/jpeg,image/png,image/heic"
                          />
                        </Stack>
                      </Stack>
                    </Grid>
                    {typeIdentifications.length > 1 && (
                      <Grid item xs={12} sm={1}>
                        <IconButton size="large" color="error" onClick={() => onDeleteTypeIdentification(i)}>
                          <DeleteFilled />
                        </IconButton>
                      </Grid>
                    )}
                  </Fragment>
                ))}
              </Grid>
            </MainCard>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="additional-remarks">{<FormattedMessage id="additional-remarks" />}</InputLabel>
              <TextField id="additionalInfo" name="additionalInfo" fullWidth value={additionalInfo} onChange={onFieldHandler} />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      <FormTypeId open={openFormTypeId} onClose={onCloseFormTypeId} module="staff" />
    </>
  );
};

export default Background;
