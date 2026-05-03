import axios from 'utils/axios';

export const createBooking = async (payload) => {
  const fd = new FormData();
  const { images, ...rest } = payload;
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, value);
    }
  });
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((file) => {
      fd.append('image', file);
    });
  }
  return await axios.post('booking', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getBookingList = async (params) => {
  const { locationId = [], doctorId = [], monthBooking, yearBooking } = params;
  return await axios.get('booking', {
    params: {
      locationId,
      doctorId,
      monthBooking,
      yearBooking
    }
  });
};

export const getBookingDetail = async (id) => {
  return await axios.get('booking/detail', { params: { id } });
};

export const updateBooking = async (payload) => {
  const { images, ...rest } = payload;
  const hasImages = Array.isArray(images) && images.length > 0;

  if (hasImages) {
    // Use FormData when uploading images
    const fd = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        fd.append(key, value);
      }
    });
    images.forEach((file) => {
      fd.append('image', file);
    });
    return await axios.put('booking', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  }

  // Use JSON when no images
  return await axios.put('booking', rest);
};

export const deleteBooking = async (ids) => {
  const idArray = Array.isArray(ids) ? ids : [ids];
  return await axios.delete('booking', { data: { id: idArray } });
};
