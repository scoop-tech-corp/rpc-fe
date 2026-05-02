import { createSlice } from '@reduxjs/toolkit';

// project import
import { getBookingList, deleteBooking } from '../../service';
import { dispatch } from 'store';

const initialState = {
  calendarView: 'dayGridMonth',
  error: false,
  events: [],
  isLoader: false,
  isModalOpen: false,
  selectedEventId: null,
  selectedRange: null
};

// ==============================|| CALENDAR - SLICE ||============================== //

const calendar = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // loader
    loading(state) {
      state.isLoader = true;
    },

    // error
    hasError(state, action) {
      state.isLoader = false;
      state.error = action.payload;
    },

    // event list
    setEvents(state, action) {
      state.isLoader = false;
      state.events = action.payload;
    },

    // update calendar view
    updateCalendarView(state, action) {
      state.calendarView = action.payload;
    },

    // select event
    selectEvent(state, action) {
      const eventId = action.payload;
      state.isModalOpen = true;
      state.selectedEventId = eventId;
    },

    // create event
    createEvent(state, action) {
      const newEvent = action.payload;
      state.isLoader = false;
      state.isModalOpen = false;
      state.events = [...state.events, newEvent];
    },

    // update event
    updateEvent(state, action) {
      const event = action.payload;
      const eventUpdate = state.events.map((item) => {
        if (item.id === event.id) {
          return event;
        }
        return item;
      });

      state.isLoader = false;
      state.isModalOpen = false;
      state.events = eventUpdate;
    },

    // delete event
    deleteEvent(state, action) {
      const { eventId } = action.payload;
      state.isModalOpen = false;
      const deleteEvent = state.events.filter((user) => user.id !== eventId);
      state.events = deleteEvent;
    },

    // select date range
    selectRange(state, action) {
      const { start, end } = action.payload;
      state.isModalOpen = true;
      state.selectedRange = { start, end };
    },

    // modal toggle
    toggleModal(state) {
      state.isModalOpen = !state.isModalOpen;
      if (state.isModalOpen === false) {
        state.selectedEventId = null;
        state.selectedRange = null;
      }
    }
  }
});

export default calendar.reducer;

export const { selectEvent, toggleModal, updateCalendarView } = calendar.actions;

export function getEvents(params = {}) {
  return async () => {
    dispatch(calendar.actions.loading());
    try {
      const response = await getBookingList(params);
      const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const events = rawData.map((item) => ({
        ...item,
        title: item.title || 'Booking',
        start: item.start?.replace(' ', 'T') || null,
        end: item.start?.replace(' ', 'T') || null,
        //end: item.end ? item.end.replace(' ', 'T') : null,
        allDay: item.allDay === '1' || item.allDay === true
      }));
      dispatch(calendar.actions.setEvents(events));
    } catch (error) {
      dispatch(calendar.actions.hasError(error));
    }
  };
}

export function updateEvent(eventId, updateEventData) {
  return async () => {
    dispatch(calendar.actions.loading());
    try {
      dispatch(
        calendar.actions.updateEvent({
          id: eventId,
          ...updateEventData
        })
      );
    } catch (error) {
      dispatch(calendar.actions.hasError(error));
    }
  };
}

export function deleteEvent(eventId) {
  return async () => {
    dispatch(calendar.actions.loading());
    try {
      await deleteBooking(eventId);
      dispatch(calendar.actions.deleteEvent({ eventId }));
    } catch (error) {
      dispatch(calendar.actions.hasError(error));
    }
  };
}
