import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, Grid, InputLabel, Stack, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';

import MainCard from 'components/MainCard';
import LocationDetailContext from '../location-detail-context';
import { FormattedMessage } from 'react-intl';

const TabPhoto = () => {
  const [photos, setPhotos] = useState([]);
  const { locationDetail, setLocationDetail } = useContext(LocationDetailContext);

  useEffect(() => {
    // fill context photos to photos
    if (locationDetail.photos.length) {
      const getDetailPhotos = locationDetail.photos;
      setPhotos(getDetailPhotos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (photos.length) {
      setLocationDetail((value) => ({ ...value, photos }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  const onAddPhotos = () => {
    setPhotos((val) => [...val, { label: '', imagePath: '', imageOriginalName: '', selectedFile: null }]);
  };

  const onDeletePhoto = (i) => {
    setPhotos((value) => {
      let getPhoto = [...value];
      getPhoto.splice(i, 1);

      return [...getPhoto];
    });
  };

  const onPhotoName = (event, idx) => {
    setPhotos((value) => {
      const getPhoto = [...value];
      getPhoto[idx].label = event.target.value;

      return getPhoto;
    });
  };

  const onSelectedPhoto = (event, idx) => {
    console.log(idx, event.target.files[0]);
    const getFile = event.target.files[0];
    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        setPhotos((value) => {
          const getPhoto = [...value];
          getPhoto[idx].selectedFile = getFile;
          getPhoto[idx].imagePath = this.result;

          return getPhoto;
        });
      };
      reader.readAsDataURL(getFile);
    }
  };

  // const readerPhotos = (file, idx) => {
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = function () {
  //       if (aImageRef.current[idx]) {
  //         // refShowImage.current[idx].setAttribute('src', setSrc);
  //         // aImageRef.current[idx].setAttribute('href', setHref);

  //         this.result

  //         aImageRef.current[idx].style.display = 'block';
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  //   // refShowImage.current[idx].setAttribute('src', URL.createObjectURL(getFile));
  //   // aImageRef.current[idx].setAttribute('href', URL.createObjectURL(getFile));
  // };

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
      {photos.map((ph, i) => (
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
                <input type="file" onChange={(event) => onSelectedPhoto(event, i)} />
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
                    onChange={(event) => onPhotoName(event, i)}
                    onBlur={(event) => onPhotoName(event, i)}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <DeleteFilled style={{ fontSize: '14px', color: 'red', cursor: 'pointer' }} onClick={() => onDeletePhoto(i)} />
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default TabPhoto;
