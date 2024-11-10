import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Grid, InputLabel } from '@mui/material';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/Download';

const ModalImport = (props) => {
  const { onClose, onImport, onTemplate, open, isTemplate = true } = props;

  const [selectedFile, setFile] = useState('');

  const handleOnCancel = () => {
    document.getElementById('file-import').value = '';
    setFile('');
    onClose(true);
  };

  const handleOnOk = () => {
    onImport(selectedFile);
  };

  const onChangeFile = (event) => {
    const getFile = event.target.files[0];
    if (!getFile) {
      document.getElementById('file-import').value = '';
      setFile('');
      return;
    }

    setFile(getFile);
  };

  return (
    <ModalC
      title={<FormattedMessage id="import-data" />}
      okText={<FormattedMessage id="import" />}
      open={open}
      onOk={handleOnOk}
      onCancel={handleOnCancel}
      disabledOk={Boolean(!selectedFile)}
      sm={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 600 } }}
      maxWidth="sm"
    >
      <p>
        <b>
          <FormattedMessage id="notes" />
        </b>
        : <FormattedMessage id="before-you-import-the-data-you-must-download-the-template-first" />
      </p>
      <Grid container spacing={3}>
        {isTemplate && (
          <>
            <Grid item xs={12} sm={3}>
              <InputLabel htmlFor="template">{<FormattedMessage id="template" />}</InputLabel>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onTemplate}>
                <FormattedMessage id="download" />
              </Button>
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={3}>
          <InputLabel htmlFor="upload">{<FormattedMessage id="upload-file" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          <input
            id="file-import"
            type="file"
            onChange={onChangeFile}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
        </Grid>
      </Grid>
    </ModalC>
  );
};

ModalImport.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onImport: PropTypes.func,
  onTemplate: PropTypes.func
};

export default ModalImport;
