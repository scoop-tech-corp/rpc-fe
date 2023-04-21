import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useStaffFormStore } from '../../staff-form-store';
import { getTypeIdList } from 'pages/staff/staff-list/service';
import { useState } from 'react';
import { useParams } from 'react-router';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormTypeId from 'components/FormTypeId';

const Background = () => {
  let { id } = useParams();
  const typeId = useStaffFormStore((state) => state.typeId);
  const typeIdList = useStaffFormStore((state) => state.typeIdList);
  const typeIdValue = typeIdList.find((val) => val.value === typeId) || null;

  const identificationNumber = useStaffFormStore((state) => state.identificationNumber);
  const additionalInfo = useStaffFormStore((state) => state.additionalInfo);
  const imagePath = useStaffFormStore((state) => state.imagePath);

  const [openFormTypeId, setOpenFormTypeId] = useState(false);

  const onAddTypeId = () => setOpenFormTypeId(true);

  const onCloseFormTypeId = async (val) => {
    if (val) {
      const getTypeId = await getTypeIdList();
      useStaffFormStore.setState({ typeIdList: getTypeId });
    }
    setOpenFormTypeId(false);
  };

  const onFieldHandler = (event) => {
    useStaffFormStore.setState({ [event.target.name]: event.target.value, staffFormTouch: true });
  };

  const clearImage = () => {
    document.getElementById('importImage').value = '';
    useStaffFormStore.setState({
      imagePath: '',
      image: {
        id: '',
        selectedFile: '',
        isChange: true
      }
    });
  };

  const onSelectedPhoto = (e) => {
    const getFile = e.target.files[0];

    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        useStaffFormStore.setState((prevState) => {
          const newId = id && prevState.image?.id ? prevState.image.id : '';
          const objFile = {
            id: newId,
            selectedFile: getFile,
            isChange: true
          };

          return { imagePath: this.result, image: objFile, staffFormTouch: true };
        });
      };
      reader.readAsDataURL(getFile);
    } else {
      clearImage();
    }
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="background" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="type-of-id" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddTypeId}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="type-of-id"
                      options={typeIdList}
                      value={typeIdValue}
                      onChange={(_, selected) => {
                        useStaffFormStore.setState({ typeId: selected ? selected.value : null, staffFormTouch: true });
                      }}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="identification">{<FormattedMessage id="identification" />}</InputLabel>
              <TextField id="identification" name="identificationNumber" fullWidth value={identificationNumber} onChange={onFieldHandler} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="import-image">{<FormattedMessage id="import-image" />}</InputLabel>
              <Stack spacing={1} flexDirection="row">
                {imagePath && (
                  <>
                    <a href={imagePath} target="blank" style={{ flexBasis: '20%', marginRight: '10px' }}>
                      <img alt={imagePath} src={imagePath} width="100%" />
                    </a>
                    <DeleteFilled
                      style={{ fontSize: '14px', color: 'red', cursor: 'pointer', marginRight: '10px' }}
                      onClick={() => clearImage()}
                    />
                  </>
                )}
                <input type="file" id="importImage" onChange={onSelectedPhoto} />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="additional-remarks">{<FormattedMessage id="additional-remarks" />}</InputLabel>
              <TextField id="additionalInfo" name="additionalInfo" fullWidth value={additionalInfo} onChange={onFieldHandler} />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      <FormTypeId open={openFormTypeId} onClose={onCloseFormTypeId} />
    </>
  );
};

export default Background;
