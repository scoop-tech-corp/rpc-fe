import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useMediaQuery, Box, Dialog, SpeedDial, Tooltip } from '@mui/material';

// third-party
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timelinePlugin from '@fullcalendar/timeline';

// project import
import CalendarStyled from './components/CalendarStyled';
import Toolbar from './components/Toolbar';
import AddEventForm from './components/AddEventForm';
import { getEvents, selectEvent, toggleModal, updateCalendarView, updateEvent } from './store/reducer/index';
import { getBookingDetail, updateBooking } from './service';

// assets
import { PlusOutlined } from '@ant-design/icons';
import FilterBooking from './components/filter-booking';

// ==============================|| CALENDAR - MAIN ||============================== //

const Booking = () => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const calendar = useSelector((state) => state.calendar);
  const { calendarView, events, isModalOpen, selectedEventId } = calendar;
  const selectedEvent = selectedEventId ? events.find((e) => e.id === selectedEventId) : null;

  const calendarRef = useRef(null);
  const containerRef = useRef(null);
  const dateRef = useRef(new Date());
  const [date, setDate] = useState(new Date());
  const [filterParams, setFilterParams] = useState({ locationId: [], doctorId: [] });

  const fetchEvents = useCallback(
    (currentDate) => {
      const d = currentDate || dateRef.current;
      const monthBooking = d.getMonth() + 1; // JS months are 0-indexed
      const yearBooking = d.getFullYear();

      dispatch(
        getEvents({
          locationId: filterParams.locationId,
          doctorId: filterParams.doctorId,
          monthBooking,
          yearBooking
        })
      );
    },
    [dispatch, filterParams]
  );

  // Refetch when filterParams change
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = matchDownSM ? 'listMonth' : 'dayGridMonth';
      calendarApi.changeView(newView);
      dispatch(updateCalendarView(newView));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownSM]);

  // Auto-resize calendar when container size changes (e.g. sidebar toggle)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.updateSize();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const updateDateAndFetch = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newDate = calendarApi.getDate();
      dateRef.current = newDate;
      setDate(newDate);
      fetchEvents(newDate);
    }
  };

  // calendar toolbar events
  const handleDateToday = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.today();
      updateDateAndFetch();
    }
  };

  const handleViewChange = (newView) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.changeView(newView);
      dispatch(updateCalendarView(newView));
    }
  };

  const handleDatePrev = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.prev();
      updateDateAndFetch();
    }
  };

  const handleDateNext = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.next();
      updateDateAndFetch();
    }
  };

  // calendar events
  const handleEventSelect = (arg) => {
    dispatch(selectEvent(arg.event.id));
  };

  const handleEventUpdate = async ({ event }) => {
    try {
      // Get full booking detail first
      const response = await getBookingDetail(event.id);
      const apiData = response.data?.data || response.data || {};
      const booking = apiData.booking || {};
      const detail = apiData.detail || {};

      // Format new bookingTime from the dropped date
      const newDate = event.start;
      const bookingTime = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')} ${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`;

      await updateBooking({
        id: event.id,
        locationId: booking.locationId,
        doctorId: booking.doctorId,
        customerId: booking.customerId,
        petId: booking.petId,
        services: booking.serviceType,
        bookingTime,
        title: booking.title,
        color: booking.color,
        additionalInfo: detail.additionalInfo || '',
        consultationType: detail.consultationType || '',
        drugAllergy: detail.drugAllergy || '',
        petName: detail.petName || '',
        socializationType: detail.socializationType || '',
        emergencyContactName: detail.emergencyContactName || '',
        inventoryProducts: detail.inventoryProducts || '',
        furCondition: detail.furCondition || '',
        skinSensitivity: detail.skinSensitivity || '',
        stambum: detail.stambum || '',
        healthClearance: detail.healthClearance || ''
      });

      // Update local state and refresh
      dispatch(updateEvent(event.id, { allDay: event.allDay, start: event.start, end: event.end }));
      fetchEvents();
    } catch (error) {
      // Revert the event position on error
      event.revert();
      console.error(error);
    }
  };

  const handleModal = () => {
    dispatch(toggleModal());
  };

  const handleAppliedFilter = (filters) => {
    setFilterParams(filters);
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative' }}>
      <FilterBooking onAppliedFilter={handleAppliedFilter} />
      <CalendarStyled>
        <Toolbar
          date={date}
          view={calendarView}
          onClickNext={handleDateNext}
          onClickPrev={handleDatePrev}
          onClickToday={handleDateToday}
          onChangeView={handleViewChange}
        />

        <FullCalendar
          weekends
          editable
          droppable
          events={events}
          ref={calendarRef}
          rerenderDelay={10}
          initialDate={date}
          initialView={calendarView}
          dayMaxEventRows={3}
          eventDisplay="block"
          headerToolbar={false}
          allDayMaintainDuration
          eventResizableFromStart
          eventDrop={handleEventUpdate}
          eventClick={handleEventSelect}
          eventResize={handleEventUpdate}
          height={matchDownSM ? 'auto' : 720}
          plugins={[listPlugin, dayGridPlugin, timelinePlugin, interactionPlugin]}
        />
      </CalendarStyled>

      {/* Dialog renders its body even if not open */}
      <Dialog maxWidth="sm" fullWidth onClose={handleModal} open={isModalOpen} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
        {isModalOpen && selectedEvent && (
          <AddEventForm mode="edit" eventId={selectedEventId} onCancel={handleModal} onCreated={fetchEvents} />
        )}
        {isModalOpen && !selectedEvent && <AddEventForm onCancel={handleModal} onCreated={fetchEvents} />}
      </Dialog>
      <Tooltip title="Add New Booking">
        <SpeedDial
          ariaLabel="add-event-fab"
          sx={{ display: 'inline-flex', position: 'sticky', bottom: 24, left: '100%', transform: 'translate(-50%, -50% )' }}
          icon={<PlusOutlined style={{ fontSize: '1.5rem' }} />}
          onClick={handleModal}
        />
      </Tooltip>
    </Box>
  );
};

export default Booking;
