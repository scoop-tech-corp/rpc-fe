import { useState, useEffect } from 'react';

export default function (getDetailFunc, key, id, handleSuccess = () => {}, handleError = () => {}) {
  const [detail, setDetail] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [reload, setReload] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    if (id) {
      getDetailFunc({ [key]: id })
        .then((res) => {
          setDetail(res.data.data[0]);
          setIsLoading(false);
          handleSuccess(res);
        })
        .catch((error) => {
          setIsLoading(false);
          handleError(error);
          setDetail({
            error
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, detail?.reload, reload]);
  return { detail, setDetail, isLoading, setReload };
}
