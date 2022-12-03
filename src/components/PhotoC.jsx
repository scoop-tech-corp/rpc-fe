import { Button, Grid, InputLabel, Stack, TextField, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import MainCard from './MainCard';
import PropTypes from 'prop-types';
import { jsonCentralized } from 'utils/json-centralized';

const PhotoC = (props) => {
  const { photoValue, photoOutput } = props;
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // fill context photos to photos
    if (photoValue.length) {
      setPhotos(photoValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddPhotos = () => {
    setPhotos((val) => {
      const newValue = [...val, { id: null, label: '', imagePath: '', status: '', selectedFile: null }];

      photoOutput(newValue);
      return newValue;
    });
  };

  const onDeletePhoto = (i) => {
    setPhotos((value) => {
      let getPhoto = [...value];
      getPhoto[i].status = 'del';

      photoOutput(getPhoto);
      return [...getPhoto];
    });
  };

  const onChangeLabel = (event, idx) => {
    setPhotos((value) => {
      const getPhoto = [...value];
      getPhoto[idx].label = event.target.value;

      return getPhoto;
    });
  };

  const onBlurLabel = (event, idx) => {
    const getPhoto = jsonCentralized(photos);
    getPhoto[idx].label = event.target.value;

    photoOutput(getPhoto);
  };

  const onSelectedPhoto = (event, idx) => {
    const getFile = event.target.files[0];
    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        setPhotos((value) => {
          const getPhoto = [...value];
          getPhoto[idx].selectedFile = getFile;
          getPhoto[idx].imagePath = this.result;

          photoOutput(getPhoto);
          return getPhoto;
        });
      };
      reader.readAsDataURL(getFile);
    }
  };

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container spacing={3}>
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
      {photos.map((ph, i) => {
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
                        onChange={(event) => onChangeLabel(event, i)}
                        onBlur={(event) => onBlurLabel(event, i)}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <DeleteFilled style={{ fontSize: '14px', color: 'red', cursor: 'pointer' }} onClick={() => onDeletePhoto(i)} />
                  </Grid>
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
  photoOutput: PropTypes.any
};

export default PhotoC;
