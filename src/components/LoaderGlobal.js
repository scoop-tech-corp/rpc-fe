import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useEffect } from 'react';

import { BehaviorSubject } from 'rxjs';

const subject = new BehaviorSubject();
let loaderStatus = false;
let loaderBatch = [];

export class LoaderService {
  constructor() {}

  startLoader() {
    if (loaderBatch.length === 0) {
      this.showLoader();
    }
    loaderBatch.push(true);
  }

  showLoader() {
    if (!loaderStatus) {
      loaderGlobalConfig.setLoader(true);
    } else {
      loaderGlobalConfig.setLoader(false);
    }
  }

  hideLoader() {
    loaderGlobalConfig.setLoader(false);
  }

  checkLoader() {
    if (loaderBatch.length > 0) {
      loaderBatch.pop();

      if (loaderBatch.length === 0) {
        return this.hideLoader();
      }
    } else {
      return this.hideLoader();
    }
  }
}

export const loaderGlobalConfig = {
  setLoader: (isLoader) => subject.next({ isLoader }),
  getLoaderStatus: () => subject.asObservable()
};

// loader style
const LoaderGlobalWrapper = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  margin: 'auto',
  top: 0,
  left: 0,
  position: 'fixed',
  zIndex: 999999,
  background: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& > * + *': {
    marginTop: theme.spacing(2)
  }
}));

const LoaderGlobal = () => {
  const [isLoading, setShowLoading] = useState(false);

  useEffect(() => {
    loaderGlobalConfig.getLoaderStatus().subscribe((resp) => {
      if (resp) {
        setShowLoading(resp.isLoader);
      }
    });
  }, []);

  return (
    <>
      {isLoading && (
        <LoaderGlobalWrapper id="loader-global">
          <CircularProgress />
        </LoaderGlobalWrapper>
      )}
    </>
  );
};

export default LoaderGlobal;
