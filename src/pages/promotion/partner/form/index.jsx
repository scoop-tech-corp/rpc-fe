import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useIntl } from 'react-intl';
import { Grid } from '@mui/material';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { getPromotionDataStaticType, getPromotionDataStaticUsage } from 'pages/promotion/static-data/service';
import { getPromotionPartnerDetail } from '../service';

import MainCard from 'components/MainCard';
import PromotionPartnerFormHeader from './promotion-partner-header';
import PromotionPartnerBasicDetail from './sections/section-basic-detail';
import PromotionPartnerPhone from './sections/section-phone';
import PromotionPartnerEmail from './sections/section-email';
import PromotionPartnerMessenger from './sections/section-messenger';

const PromotionPartnerForm = () => {
  let { id } = useParams();
  const intl = useIntl();
  const [formPromotionPartner, setFormPromotionPartner] = useState({
    basicDetail: { name: '', status: '' },
    phone: { usageList: [], typeList: [], data: [{ id: '', usage: '', number: '', type: '', status: '' }] },
    email: { usageList: [], data: [{ id: '', usage: '', address: '', status: '' }] },
    messenger: { usageList: [], typeList: [], data: [{ id: '', usage: '', username: '', type: '', status: '' }] },
    is_form_touched: false
  });
  const [formError, setFormError] = useState({ nameErr: '', statusErr: '', phoneErr: [], emailErr: [], messengerErr: [] });
  const [reloadData, setReloadData] = useState(false);

  // CHECK FORM ERROR
  useEffect(() => {
    if (formPromotionPartner.is_form_touched) {
      let objErr = { nameErr: '', statusErr: '', phoneErr: [], emailErr: [], messengerErr: [] };

      if (!formPromotionPartner.basicDetail.name) {
        objErr.nameErr = intl.formatMessage({ id: 'name-is-required' });
      }

      if (!formPromotionPartner.basicDetail.status) {
        objErr.statusErr = intl.formatMessage({ id: 'status-is-required' });
      }

      if (formPromotionPartner.phone.data.length) {
        formPromotionPartner.phone.data.forEach((dt, idx) => {
          const setPhoneErrObj = { idx, usageErr: '', numberErr: '', typeErr: '' };

          if (!dt.usage || !dt.number || !dt.type) {
            if (!dt.usage) {
              setPhoneErrObj.usageErr = intl.formatMessage({ id: 'usage-is-required' });
            }

            if (!dt.number) {
              setPhoneErrObj.numberErr = intl.formatMessage({ id: 'number-is-required' });
            }

            if (!dt.type) {
              setPhoneErrObj.typeErr = intl.formatMessage({ id: 'type-is-required' });
            }

            objErr.phoneErr.push(setPhoneErrObj);
          }
        });
      }

      // if (formPromotionPartner.email.data.length) {
      //   formPromotionPartner.email.data.forEach((dt, idx) => {
      //     const setEmailErrObj = { idx, usageErr: '', addressErr: '' };
      //     if (!dt.usage) {
      //       setEmailErrObj.usageErr = intl.formatMessage({ id: 'usage-is-required' });
      //     }

      //     if (!dt.address) {
      //       setEmailErrObj.addressErr = intl.formatMessage({ id: 'address-is-required' });
      //     }

      //     objErr.emailErr.push(setEmailErrObj);
      //   });
      // }

      // if (formPromotionPartner.messenger.data.length) {
      //   formPromotionPartner.messenger.data.forEach((dt, idx) => {
      //     const setMessengerErrObj = { idx, usageErr: '', usernameErr: '', typeErr: '' };
      //     if (!dt.usage) {
      //       setMessengerErrObj.usageErr = intl.formatMessage({ id: 'usage-is-required' });
      //     }

      //     if (!dt.username) {
      //       setMessengerErrObj.usernameErr = intl.formatMessage({ id: 'username-is-required' });
      //     }

      //     if (!dt.type) {
      //       setMessengerErrObj.typeErr = intl.formatMessage({ id: 'type-is-required' });
      //     }

      //     objErr.messengerErr.push(setMessengerErrObj);
      //   });
      // }

      setFormError((prevState) => ({ ...prevState, ...objErr }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formPromotionPartner]);

  const getData = async () => {
    const getDropdownData = () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve) => {
        const getDataStaticUsage = await getPromotionDataStaticUsage();
        const getDataStaticTypePhone = await getPromotionDataStaticType('phone');
        const getDataStaticTypeMessenger = await getPromotionDataStaticType('messenger');

        setFormPromotionPartner((prevState) => ({
          ...prevState,
          phone: { ...prevState.phone, usageList: getDataStaticUsage, typeList: getDataStaticTypePhone },
          email: { ...prevState.email, usageList: getDataStaticUsage, typeList: getDataStaticTypePhone },
          messenger: { ...prevState.messenger, usageList: getDataStaticUsage, typeList: getDataStaticTypeMessenger }
        }));
        resolve(true);
      });
    };

    const getDetailData = async () => {
      const getResp = await getPromotionPartnerDetail(id);
      const data = getResp.data;

      const phone = data.phones.map((dt) => ({ id: dt.id, usage: dt.usageId, number: dt.phoneNumber, type: dt.typeId, status: '' }));
      const email = data.emails.map((dt) => ({ id: dt.id, usage: dt.usageId, address: dt.email, status: '' }));
      const messenger = data.messengers.map((dt) => ({
        id: dt.id,
        usage: dt.usageId,
        username: dt.messengerName,
        type: dt.typeId,
        status: ''
      }));
      setFormPromotionPartner((prevState) => ({
        basicDetail: { name: data.name, status: data.status },
        phone: { ...prevState.phone, data: phone },
        email: { ...prevState.email, data: email },
        messenger: { ...prevState.messenger, data: messenger }
      }));
    };

    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    await getDropdownData();
    if (id) getDetailData();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => getData(), [id]); // load data

  useEffect(() => {
    if (reloadData) {
      getData();
      setReloadData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadData]); // load data

  return (
    <>
      <PromotionPartnerFormHeader form={formPromotionPartner} formError={formError} />
      <MainCard content={true}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <PromotionPartnerBasicDetail form={formPromotionPartner} setForm={setFormPromotionPartner} formError={formError} />
          </Grid>
          <Grid item xs={12}>
            <PromotionPartnerPhone
              form={formPromotionPartner}
              setForm={setFormPromotionPartner}
              formError={formError}
              setReloadData={setReloadData}
            />
          </Grid>
          <Grid item xs={12}>
            <PromotionPartnerEmail
              form={formPromotionPartner}
              setForm={setFormPromotionPartner}
              formError={formError}
              setReloadData={setReloadData}
            />
          </Grid>
          <Grid item xs={12}>
            <PromotionPartnerMessenger
              form={formPromotionPartner}
              setForm={setFormPromotionPartner}
              formError={formError}
              setReloadData={setReloadData}
            />
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default PromotionPartnerForm;
