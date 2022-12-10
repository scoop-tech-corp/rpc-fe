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

export const breakdownMessageBackend = (arrayMessageErr) => {
  let message = '';
  if (arrayMessageErr && Array.isArray(arrayMessageErr)) {
    arrayMessageErr.forEach((dt) => {
      message += '<li>' + dt + '</li>';
    });
  }

  return message;
};
