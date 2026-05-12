import { useEffect, useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import {
  getDashboardUpbookingClinic,
  getDashboardUpbookingHotel,
  getDashboardUpbookingSalon,
  getDashboardUpbookingBreeding
} from '../service';

import TabPanel from 'components/TabPanelC';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

let paramClinicList = {};
let paramHotelList = {};
let paramSalonList = {};
let paramBreedingList = {};

const DashboardUpcomingBooking = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [clinicData, setClinicData] = useState({ data: [], totalPagination: 0 });
  const [hotelData, setHotelData] = useState({ data: [], totalPagination: 0 });
  const [salonData, setSalonData] = useState({ data: [], totalPagination: 0 });
  const [breedingData, setBreedingData] = useState({ data: [], totalPagination: 0 });
  const dispatch = useDispatch();

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="booking-time" />, accessor: 'bookingTime', isNotSorting: true },
      { Header: <FormattedMessage id="location" />, accessor: 'location', isNotSorting: true },
      { Header: <FormattedMessage id="customer" />, accessor: 'customer', isNotSorting: true },
      { Header: <FormattedMessage id="service-name" />, accessor: 'serviceName', isNotSorting: true },
      { Header: <FormattedMessage id="staff" />, accessor: 'staff', isNotSorting: true },
      { Header: <FormattedMessage id="status" />, accessor: 'status', isNotSorting: true },
      { Header: <FormattedMessage id="booking-note" />, accessor: 'bookingNote', isNotSorting: true }
    ],
    []
  );

  const fetchData = (procedure) => {
    const doFetchClinic = async () => {
      await getDashboardUpbookingClinic(paramClinicList)
        .then((resp) => {
          setClinicData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    };

    const doFetchHotel = async () => {
      await getDashboardUpbookingHotel(paramHotelList)
        .then((resp) => {
          setHotelData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    };

    const doFetchSalon = async () => {
      await getDashboardUpbookingSalon(paramSalonList)
        .then((resp) => {
          setSalonData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    };

    const doFetchBreeding = async () => {
      await getDashboardUpbookingBreeding(paramBreedingList)
        .then((resp) => {
          setBreedingData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    };

    if (procedure === 'clinic') doFetchClinic();
    else if (procedure === 'hotel') doFetchHotel();
    else if (procedure === 'salon') doFetchSalon();
    else if (procedure === 'breeding') doFetchBreeding();
    else {
      doFetchClinic();
      doFetchHotel();
      doFetchSalon();
      doFetchBreeding();
    }
  };

  const onGotoPageChange = (event, procedure) => {
    if (procedure === 'clinic') paramClinicList.goToPage = event;
    else if (procedure === 'hotel') paramHotelList.goToPage = event;
    else if (procedure === 'salon') paramSalonList.goToPage = event;
    else if (procedure === 'breeding') paramBreedingList.goToPage = event;
    fetchData(procedure);
  };

  const onPageSizeChange = (event, procedure) => {
    if (procedure === 'clinic') paramClinicList.rowPerPage = event;
    else if (procedure === 'hotel') paramHotelList.rowPerPage = event;
    else if (procedure === 'salon') paramSalonList.rowPerPage = event;
    else if (procedure === 'breeding') paramBreedingList.rowPerPage = event;
    fetchData(procedure);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <MainCard content={true}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => setTabSelected(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="dashboard upcoming booking tab"
          >
            <Tab label={'Pet Clinic'} id="dashboard-upcoming-booking-tab-0" aria-controls="dashboard-upcoming-booking-tabpanel-0" />
            <Tab label={'Pet Hotel'} id="dashboard-upcoming-booking-tab-1" aria-controls="dashboard-upcoming-booking-tabpanel-1" />
            <Tab label={'Pet Salon'} id="dashboard-upcoming-booking-tab-2" aria-controls="dashboard-upcoming-booking-tabpanel-2" />
            <Tab label={'Breeding'} id="dashboard-upcoming-booking-tab-3" aria-controls="dashboard-upcoming-booking-tabpanel-3" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="dashboard-upcoming-booking">
            <ScrollX>
              <ReactTable
                columns={columns}
                data={clinicData.data}
                totalPagination={clinicData.totalPagination}
                onGotoPage={(event) => onGotoPageChange(event, 'clinic')}
                onPageSize={(event) => onPageSizeChange(event, 'clinic')}
                colSpanPagination={7}
              />
            </ScrollX>
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="dashboard-upcoming-booking">
            <ScrollX>
              <ReactTable
                columns={columns}
                data={hotelData.data}
                totalPagination={hotelData.totalPagination}
                onGotoPage={(event) => onGotoPageChange(event, 'hotel')}
                onPageSize={(event) => onPageSizeChange(event, 'hotel')}
                colSpanPagination={7}
              />
            </ScrollX>
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="dashboard-upcoming-booking">
            <ScrollX>
              <ReactTable
                columns={columns}
                data={salonData.data}
                totalPagination={salonData.totalPagination}
                onGotoPage={(event) => onGotoPageChange(event, 'salon')}
                onPageSize={(event) => onPageSizeChange(event, 'salon')}
                colSpanPagination={7}
              />
            </ScrollX>
          </TabPanel>
          <TabPanel value={tabSelected} index={3} name="dashboard-upcoming-booking">
            <ScrollX>
              <ReactTable
                columns={columns}
                data={breedingData.data}
                totalPagination={breedingData.totalPagination}
                onGotoPage={(event) => onGotoPageChange(event, 'breeding')}
                onPageSize={(event) => onPageSizeChange(event, 'breeding')}
                colSpanPagination={7}
              />
            </ScrollX>
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default DashboardUpcomingBooking;
