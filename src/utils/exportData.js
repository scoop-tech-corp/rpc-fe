export const exportData = async (functionExport, params) => {
  await functionExport(params)
    .then((resp) => {
      let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
      let downloadUrl = URL.createObjectURL(blob);
      let a = document.createElement('a');
      const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

      a.href = downloadUrl;
      a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
      document.body.appendChild(a);
      a.click();
    })
    .catch((err) => {
      console.log(err);
      // if (err) {
      //   dispatch(snackbarError(createMessageBackend(err)));
      // }
    });
};
