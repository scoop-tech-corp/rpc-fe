import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Grid, Typography, Button } from '@mui/material';
import { getDetailProfile } from '../service';
import { FormattedMessage } from 'react-intl';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import avatarMen from 'assets/images/users/avatar-1.png';
import avatarGirl from 'assets/images/users/avatar-5.png';
import avatarUnknown from 'assets/images/users/avatar-unknown.jpg';
import configGlobal from '../../../../config';

const StaffViewProfile = () => {
  let { id } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    const getResp = await getDetailProfile({ id: id, type: 'view' });
    setData(getResp.data);
  };

  const renderPhoto = () => {
    const profilePhoto = `${configGlobal.apiUrl}${data?.imagePath}`;

    if (data?.imagePath) {
      return <Avatar alt="profile user" src={profilePhoto} size="xl" />;
    } else {
      return (
        <>
          {data?.gender.toLowerCase() === 'male' && <Avatar alt="profile user default men" src={avatarMen} size="xl" />}
          {data?.gender.toLowerCase() === 'female' && <Avatar alt="profile user default men" src={avatarGirl} size="xl" />}
          {!data?.gender && <Avatar alt="profile user default men" src={avatarUnknown} size="xl" />}
        </>
      );
    }
  };

  useEffect(() => {
    loadData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom
        title="View Profile"
        isBreadcrumb={false}
        action={
          <>
            <Button variant="contained" color="warning" onClick={() => navigate(`/staff/profile/edit/${id}`, { replace: true })}>
              <FormattedMessage id="edit" />
            </Button>
          </>
        }
      />
      <MainCard border={false} boxShadow>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="personal-information" />}>
              <Grid container spacing={3}>
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                  {renderPhoto()}
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="first-name" />
                  </Typography>
                  <Typography variant="body1">{data?.firstName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="middle-name" />
                  </Typography>
                  <Typography variant="body1">{data?.middleName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="last-name" />
                  </Typography>
                  <Typography variant="body1">{data?.lastName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="nick-name" />
                  </Typography>
                  <Typography variant="body1">{data?.nickName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="gender" />
                  </Typography>
                  <Typography variant="body1">{data?.gender}</Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="position" />}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="job-title" />
                  </Typography>
                  <Typography variant="body1">{data?.jobName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="start-date" />
                  </Typography>
                  <Typography variant="body1">{data?.startDate}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="end-date" />
                  </Typography>
                  <Typography variant="body1">{data?.endDate}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="registration-no" />
                  </Typography>
                  <Typography variant="body1">{data?.registrationNo}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="designation" />
                  </Typography>
                  <Typography variant="body1">{data?.designation}</Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="compensation" />}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="annual-sick-allowance" />
                  </Typography>
                  <Typography variant="body1">{data?.annualSickAllowance}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="annual-sick-remaining" />
                  </Typography>
                  <Typography variant="body1">{data?.annualSickAllowanceRemaining}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="annual-leave-allowance" />
                  </Typography>
                  <Typography variant="body1">{data?.annualLeaveAllowance}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="annual-leave-remaining" />
                  </Typography>
                  <Typography variant="body1">{data?.annualLeaveAllowanceRemaining}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="pay-period" />
                  </Typography>
                  <Typography variant="body1">{data?.periodName}</Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="contact-information" />}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="phone-number" />
                  </Typography>
                  <Typography variant="body1">{data?.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    Messenger
                  </Typography>
                  <Typography variant="body1">{data?.messengerNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    <FormattedMessage id="address" />
                  </Typography>
                  <Typography variant="body1">{data?.addressName}</Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="general-setting" />}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    Username
                  </Typography>
                  <Typography variant="body1">{data?.userName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight={'bold'}>
                    Email
                  </Typography>
                  <Typography variant="body1">{data?.email}</Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default StaffViewProfile;
