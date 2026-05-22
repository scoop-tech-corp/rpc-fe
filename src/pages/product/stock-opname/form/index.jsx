import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { getStaffScheduleUser } from 'pages/staff/schedule/service';
import { snackbarError } from 'store/reducers/snackbar';
import { defaultStockOpnameForm, useStockOpnameFormStore } from './form-store';
import { getStockOpnameDetail } from '../service';
import { jsonCentralized } from 'utils/func';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import dayjs from 'dayjs';

import StockOpnameFormHeader from './form-header';
import StockOpnameFormBody from './form-body';

const StockOpnameForm = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const getDetail = async (locationList) => {
    await getStockOpnameDetail(id)
      .then(async (resp) => {
        const d = resp.data;
        const location = locationList.find((l) => l.value === +d.locationId) ?? null;
        let staffList = [];
        if (location) {
          staffList = await getStaffScheduleUser(location.value).catch(() => []);
        }
        useStockOpnameFormStore.setState({
          stockOpnameNumber: d.stockOpnameNumber ?? '',
          title: d.title ?? '',
          startTime: d.startTime ? dayjs(d.startTime) : null,
          locationId: location,
          users: (d.users ?? []).map((u) => ({ label: u.name, value: +u.id })),
          staffList
        });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const getData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getLocationList()
      .then(async (locationList) => {
        useStockOpnameFormStore.setState({ locationList });
        if (id) await getDetail(locationList);
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getData();

    return () => {
      useStockOpnameFormStore.setState(jsonCentralized(defaultStockOpnameForm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <StockOpnameFormHeader />
      <StockOpnameFormBody />
    </>
  );
};

export default StockOpnameForm;
