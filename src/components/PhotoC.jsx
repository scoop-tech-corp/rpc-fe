import { Button, Grid, InputLabel, Stack, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import MainCard from './MainCard';
import PropTypes from 'prop-types';

const PhotoC = (props) => {
  const { photoValue, photoOutput, disabled } = props;

  const onAddPhotos = () => {
    photoOutput([...photoValue, { id: null, label: '', imagePath: '', status: '', originalName: '', selectedFile: null }]);
  };

  const onDeletePhoto = (i) => {
    let getPhoto = [...photoValue];
    getPhoto[i].status = 'del';
    photoOutput(getPhoto);
  };

  const onChangeLabel = (event, idx) => {
    let getPhoto = [...photoValue];
    getPhoto[idx].label = event.target.value;
    photoOutput(getPhoto);
  };

  const onSelectedPhoto = (event, idx) => {
    const getFile = event.target.files[0];
    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        const getPhoto = [...photoValue];
        getPhoto[idx].originalName = getFile.name;
        getPhoto[idx].selectedFile = getFile;
        getPhoto[idx].imagePath = this.result;
        photoOutput(getPhoto);
      };
      reader.readAsDataURL(getFile);
    }
  };

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container spacing={3}>
      {!disabled && (
        <Grid item xs={12}>
          <Grid container justifyContent="flex-start" sx={{ position: 'relative', zIndex: 5 }}>
            <Grid
              item
              sx={{ mx: matchDownSM ? 2 : 3, my: matchDownSM ? 1 : 0, mb: matchDownSM ? 2 : 0 }}
              xs={matchDownSM ? 12 : 'auto'}
              style={{ margin: '0px' }}
            >
              <Button variant="contained" fullWidth={matchDownSM} onClick={onAddPhotos} startIcon={<PlusOutlined />}>
                <FormattedMessage id="add" />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
      {photoValue.map((ph, i) => {
        if (ph.status === '') {
          return (
            <Grid item xs={6} sm={3} key={i}>
              <MainCard>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <div>
                      {ph.imagePath && (
                        <a href={ph.imagePath} target="blank">
                          <img alt={i} src={ph.imagePath} width="100%" />
                        </a>
                      )}
                    </div>
                    {!ph.imagePath && <input type="file" onChange={(event) => onSelectedPhoto(event, i)} />}
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>
                        <FormattedMessage id="name" />
                      </InputLabel>
                      <TextField
                        fullWidth
                        id={`photo-name-${i}`}
                        name={`photo-name-${i}`}
                        value={ph.label}
                        disabled={disabled}
                        inputProps={{ readOnly: disabled }}
                        onChange={(event) => onChangeLabel(event, i)}
                      />
                    </Stack>
                  </Grid>
                  {!disabled && (
                    <Grid item xs={12}>
                      <DeleteFilled style={{ fontSize: '14px', color: 'red', cursor: 'pointer' }} onClick={() => onDeletePhoto(i)} />
                    </Grid>
                  )}
                </Grid>
              </MainCard>
            </Grid>
          );
        }
      })}
    </Grid>
  );
};

PhotoC.propTypes = {
  photoValue: PropTypes.array,
  setPhotos: PropTypes.func,
  photoOutput: PropTypes.any
};

export default PhotoC;
