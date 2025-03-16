import axios from 'utils/axios';

const url = 'menu/timekeeper';

export const getTimeKeeperAbsent = async (payload) => {
  return await axios.get(url, {
    params: {
      rowPerPage: payload.rowPerPage,
      goToPage: payload.goToPage,
      orderValue: payload.orderValue,
      orderColumn: payload.orderColumn,
      search: payload.search
    }
  });
};

export const deleteTimeKeeperAbsent = async (id) => {
  return await axios.delete(url, {
    data: { id }
  });
};

const formatTime = (time) => {
  return time.toString().length === 1 ? `0${time}` : time;
};

export const createTimeKeeperAbsent = async (payload) => {
  const jobTitle = payload.jobTitleId?.value || null;
  const time = `${formatTime(payload.time.$H)}:${formatTime(payload.time.$m)}`;

  const formData = new FormData();
  formData.append('jobTitleId', jobTitle);
  formData.append('shiftId', +payload.shiftId);
  formData.append('time', time);

  return await axios.post(url, formData);
};

export const updateTimeKeeperAbsent = async (payload) => {
  const jobTitle = payload.jobTitleId?.value || payload.jobTitleId || null;
  const time = `${formatTime(payload.time.$H)}:${formatTime(payload.time.$m)}`;

  const parameter = {
    id: payload.id,
    jobTitleId: jobTitle,
    shiftId: payload.shiftId,
    time
  };

  return await axios.put(url, parameter);
};
