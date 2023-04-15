import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
// import { useTheme } from '@mui/material/styles';
// useMediaQuery
import { Grid, Typography, Button, Stack } from '@mui/material';

// project imports
import MainCard from '../MainCard';
import { LeftOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const HeaderPageCustom = ({ title, isBreadcrumb, locationBackConfig, action }) => {
  // const theme = useTheme();
  // const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [breadcrumb, setBreadcrumb] = useState([]);
  const intl = useIntl();

  useEffect(() => {
    const routerList = location.pathname.split('/').splice(1);
    const tempBreadcrumb = [{ name: <FormattedMessage id="home" />, link: '/dashboard' }];
    const hideBreadcrumb = ['location', 'product', 'staff', 'customer'];

    routerList.forEach((dt, index) => {
      const hideCrumb = hideBreadcrumb.find((x) => x === dt);

      const generateName = (sentence) => {
        const words = sentence.split(' ');
        let finalWord = '';

        words.forEach((dt, idx) => {
          let newWord = dt.charAt(0).toUpperCase() + dt.slice(1);
          finalWord += `${newWord}${idx !== words.length - 1 ? ' ' : ''}`;
        });
        return finalWord;
      };

      const setName = generateName(dt.replace('-', ' '));

      let setLink = routerList.slice(0, index + 1).map((i) => {
        return i;
      });
      setLink = setLink.map((lk) => lk).join('/');
      setLink = '/' + setLink;

      if (!hideCrumb) {
        const urlNameDisplay = setName.replace(' ', '-').toLowerCase();

        const checkIsTranslate = () => {
          return Object.keys(intl.messages).find((msg) => msg === urlNameDisplay);
        };

        const newObj = { name: checkIsTranslate() ? <FormattedMessage id={urlNameDisplay} /> : setName, link: setLink };

        tempBreadcrumb.push(newObj);
      }
    });

    setBreadcrumb(tempBreadcrumb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const onLocationBack = () => {
    const setUrl = locationBackConfig.customUrl ? locationBackConfig.customUrl : -1;
    navigate(setUrl, { replace: true });
  };

  return (
    <MainCard sx={{ mb: 3 }} content={true}>
      <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
        {isBreadcrumb && (
          <Grid item>
            {breadcrumb.length && (
              <Breadcrumbs aria-label="breadcrumb">
                {breadcrumb.map((bd, i) => (
                  <Link key={i} underline="hover" color={i === breadcrumb.length - 1 ? 'text.primary' : 'inherit'} href={bd.link}>
                    {bd.name}
                  </Link>
                ))}
              </Breadcrumbs>
            )}
          </Grid>
        )}
        {/* direction={matchDownSM ? 'column' : 'row'} */}
        <Grid item>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="h3">{title}</Typography>
            {locationBackConfig?.setLocationBack && (
              <Button variant="text" onClick={onLocationBack} startIcon={<LeftOutlined />} color="secondary">
                <FormattedMessage id="back" />
              </Button>
            )}
            {action}
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

HeaderPageCustom.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  isBreadcrumb: PropTypes.bool,
  locationBackConfig: PropTypes.shape({ setLocationBack: PropTypes.bool, customUrl: PropTypes.string }),
  action: PropTypes.node
};

export default HeaderPageCustom;
