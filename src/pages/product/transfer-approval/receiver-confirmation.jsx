import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { DeleteFilled } from '@ant-design/icons';
import { receiveTransferProduct } from './service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const ReceiverConfirmation = (props) => {
  const [reference, setReference] = useState('');
  const [selectedImage, setSelectedImage] = useState({ imagePath: '', selectedFile: '' });
  const dispatch = useDispatch();

  const onSubmit = async () => {
    await receiveTransferProduct({ id: props.id, reference, image: selectedImage })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Success receive transfer product'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };
  const onCancel = () => {
    props.onClose(false);
    setReference('');
    clearImage();
  };

  const clearImage = () => {
    document.getElementById('importImage').value = '';
    setSelectedImage({ imagePath: '', selectedFile: '' });
  };

  const onSelectedImage = (e) => {
    const getFile = e.target.files[0];

    if (getFile) {
      const reader = new FileReader();
      reader.onload = function () {
        setSelectedImage({
          imagePath: this.result,
          selectedFile: getFile
        });
      };
      reader.readAsDataURL(getFile);
    } else {
      clearImage();
    }
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="receiver-product" />}
        open={props.open}
        onCancel={onCancel}
        okText={<FormattedMessage id="receive" />}
        onOk={onSubmit}
        fullWidth
        maxWidth="xs"
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="reference">{<FormattedMessage id="reference" />}</InputLabel>
              <TextField
                fullWidth
                id="reference"
                name="reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <InputLabel htmlFor="image">{<FormattedMessage id="image" />}</InputLabel>
            <Stack spacing={1} flexDirection="row">
              {selectedImage.imagePath && (
                <>
                  <a href={selectedImage.imagePath} target="blank" style={{ flexBasis: '20%', marginRight: '10px' }}>
                    <img alt={selectedImage.imagePath} src={selectedImage.imagePath} width="100%" />
                  </a>
                  <DeleteFilled
                    style={{ fontSize: '14px', color: 'red', cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => clearImage()}
                  />
                </>
              )}
              <input type="file" id="importImage" onChange={onSelectedImage} />
            </Stack>
          </Grid>
        </Grid>
      </ModalC>
    </>
  );
};

ReceiverConfirmation.propTypes = {
  id: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ReceiverConfirmation;
