import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, Grid, InputLabel, Stack, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useRef, useState } from 'react';

import MainCard from 'components/MainCard';
import FacilityDetailContext from '../facility-detail-context';
import { FormattedMessage } from 'react-intl';

const TabPhoto = () => {
  const [photos, setPhotos] = useState([]);
  const { facilityDetail, setFacilityDetail } = useContext(FacilityDetailContext);

  const aImageRef = useRef([]);
  const refShowImage = useRef([]);
  aImageRef.current = [];
  refShowImage.current = [];

  useEffect(() => {
    // fill context photos to photos
    if (facilityDetail.photos.length) {
      const getDetailPhotos = facilityDetail.photos;
      setPhotos(getDetailPhotos);

      getDetailPhotos.forEach((ph, idx) => {
        readerPhotos(ph.selectedFile, idx);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imagesRef = (el) => {
    if (el && !refShowImage.current.includes(el)) {
      refShowImage.current.push(el);
    }
  };
  const anchorImageRef = (el) => {
    if (el && !aImageRef.current.includes(el)) {
      aImageRef.current.push(el);
    }
  };

  const onAddPhotos = () => {
    setPhotos((val) => {
      const photo = [...val, { name: '', selectedFile: null }];
      setFacilityDetail((value) => {
        return { ...value, photos: photo };
      });

      return photo;
    });
  };

  const onDeletePhoto = (i) => {
    setPhotos((value) => {
      let getPhoto = [...value];
      getPhoto.splice(i, 1);

      setFacilityDetail((value) => {
        return { ...value, photos: getPhoto };
      });

      return [...getPhoto];
    });
  };

  const onPhotoName = (event, idx) => {
    setPhotos((value) => {
      const getPhoto = [...value];
      getPhoto[idx].name = event.target.value;

      setFacilityDetail((value) => {
        return { ...value, photos: getPhoto };
      });

      return getPhoto;
    });
  };

  const onSelectedPhoto = (event, idx) => {
    console.log(idx, event.target.files[0]);
    const getFile = event.target.files[0];
    if (getFile) {
      setPhotos((value) => {
        const getPhoto = [...value];
        getPhoto[idx].selectedFile = getFile;

        setFacilityDetail((value) => {
          return { ...value, photos: getPhoto };
        });

        return getPhoto;
      });

      readerPhotos(getFile, idx);
    }
  };

  const readerPhotos = (file, idx) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        refShowImage.current[idx].setAttribute('src', this.result);
        aImageRef.current[idx].setAttribute('href', this.result);
        aImageRef.current[idx].style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
    // refShowImage.current[idx].setAttribute('src', URL.createObjectURL(getFile));
    // aImageRef.current[idx].setAttribute('href', URL.createObjectURL(getFile));
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
      {photos.map((ph, i) => (
        <Grid item xs={6} sm={3} key={i}>
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <div>
                  <a ref={anchorImageRef} style={{ display: 'none' }}>
                    <img alt={i} ref={imagesRef} width="100%" />
                  </a>
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
                    value={ph.name}
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
