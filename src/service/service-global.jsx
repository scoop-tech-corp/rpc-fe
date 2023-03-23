import axios from 'utils/axios';

export const getLocationList = async () => {
  const getResp = await axios.get('location/list');

  return getResp.data.map((dt) => {
    return { label: dt.locationName, value: +dt.id };
  });
};

export const setFormDataImage = (sourcePhoto, fd, procedure = 'update') => {
  if (sourcePhoto.length) {
    const tempFileName = [];
    sourcePhoto.forEach((file) => {
      fd.append('images[]', file.selectedFile);

      const id = procedure === 'update' ? +file.id : '';
      tempFileName.push({ id, name: file.label, status: file.status });
    });
    fd.append('imagesName', JSON.stringify(tempFileName));
  } else {
    fd.append('images[]', []);
    fd.append('imagesName', JSON.stringify([]));
  }
};

export const breakdownDetailMessageBackend = (arrayMessageErr, isNewLine = false) => {
  let message = '';
  if (arrayMessageErr && Array.isArray(arrayMessageErr)) {
    arrayMessageErr.forEach((dt) => {
      if (isNewLine) {
        message += '\n' + dt;
      } else {
        message += '<li>' + dt + '</li>';
      }
    });
    // handle when arrayMessageErr only one string
  } else if (arrayMessageErr && typeof arrayMessageErr === 'string') {
    message = '<li>' + arrayMessageErr + '</li>';
  }

  return message;
};

export const createMessageBackend = (errResp, isBreakdownArrErr = false) => {
  let message = errResp.message ? errResp.message : 'Something went wrong';
  let detail = '';

  if (isBreakdownArrErr) {
    detail += breakdownDetailMessageBackend(errResp.errors);
    return { msg: message, detail };
  }

  return message;
};
