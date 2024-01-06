import axios from 'utils/axios';

export const getLocationList = async () => {
  const getResp = await axios.get('location/list');
  return getResp.data.map((dt) => {
    return { label: dt.locationName, value: +dt.id };
  });
};

export const getCustomerGroupList = async () => {
  const getResp = await axios.get('customer/group');
  return getResp.data.map((dt) => {
    return { label: dt.customerGroup, value: +dt.id };
  });
};

export const setFormDataImage = (sourcePhoto, fd, procedure = 'update') => {
  if (sourcePhoto.length) {
    const tempFileName = [];
    sourcePhoto.forEach((file) => {
      if (file.selectedFile) {
        fd.append('images[]', file.selectedFile);

        const id = procedure === 'update' ? +file.id : '';
        tempFileName.push({ id, name: file.label, status: file.status });
      } else if (file.created_at) {
        const id = procedure === 'update' ? +file.id : '';
        fd.append('images[]', []);
        tempFileName.push({ id, name: file.label, status: file.status, created_at: file.created_at });
      }
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

export const createMessageBackend = (errResp, isBreakdownArrErr = false, isBreakdownErrOnSnackBar = false) => {
  let message = errResp.message ? errResp.message : 'Something went wrong';
  let detail = '';

  if (isBreakdownArrErr) {
    detail += breakdownDetailMessageBackend(errResp.errors);

    if (isBreakdownErrOnSnackBar) {
      return `${message}, ${detail ? detail.replaceAll('<li>', '').replaceAll('</li>', '') : ''}`;
    } else {
      return { msg: message, detail };
    }
  }

  return message;
};

export const processDownloadExcel = (resp) => {
  let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
  let downloadUrl = URL.createObjectURL(blob);
  let a = document.createElement('a');
  const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

  a.href = downloadUrl;
  a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
  document.body.appendChild(a);
  a.click();
};

export const swapKeysAndValuesForObject = (obj) => {
  const swapped = Object.entries(obj).map(([key, value]) => [value, key]);

  return Object.fromEntries(swapped);
};

export const generateUniqueIdByDate = () => {
  const date = new Date();
  const dateString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
  const randomId = Math.ceil(Math.random() * 9999999999);
  const uniqueId = parseInt(dateString + randomId);
  return uniqueId;
};
