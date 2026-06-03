import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getPapanKerjaVetnurse, markPapanKerjaVetnurseDone } from '../../service';
import MarkDoneDialog from '../mark-done-dialog';

const PapanKerjaVetnurse = (props) => {
  const { data } = props;
  const [rows, setRows] = useState([]);
  const [markDoneDialog, setMarkDoneDialog] = useState({ open: false, row: null });
  const dispatch = useDispatch();

  const fetchData = async () => {
    await getPapanKerjaVetnurse(data.transactionId)
      .then((resp) => {
        if (resp?.data) setRows(resp.data);
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMarkDone = async (formValue) => {
    await markPapanKerjaVetnurseDone(formValue)
      .then((resp) => {
        if (resp?.status === 200) {
          dispatch(snackbarSuccess('Aktivitas berhasil ditandai selesai'));
          setMarkDoneDialog({ open: false, row: null });
          fetchData();
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="papan-kerja-vetnurse" />}
        open={props.open}
        onCancel={() => props.onClose(false)}
        isModalAction={false}
        fullWidth
        maxWidth="xl"
      >
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', whiteSpace: 'nowrap' } }}>
                <TableCell>No. Kandang</TableCell>
                <TableCell>Nama Kucing</TableCell>
                <TableCell>Jam</TableCell>
                <TableCell>Aktivitas</TableCell>
                <TableCell>Detail Instruksi &amp; Kebutuhan Spesifik</TableCell>
                <TableCell align="center">Aksi / Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ verticalAlign: 'top' }}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cageNo}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {row.petName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.petBreed} ({row.petWeight} Kg)
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.time}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.activity}</TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      {(row.instructions || []).map((inst, i) => (
                        <Typography key={i} variant="body2">
                          &bull; {inst}
                        </Typography>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    {row.isDone ? (
                      <Box>
                        <Chip
                          icon={<CheckCircleOutlineIcon />}
                          label={`Selesai (${row.completedAt})`}
                          color="success"
                          size="small"
                        />
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          Oleh: {row.completedBy}
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setMarkDoneDialog({ open: true, row })}
                      >
                        🔘 Centang Selesai
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tidak ada data
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ModalC>

      <MarkDoneDialog
        open={markDoneDialog.open}
        row={markDoneDialog.row}
        onSubmit={onMarkDone}
        onClose={() => setMarkDoneDialog({ open: false, row: null })}
      />
    </>
  );
};

PapanKerjaVetnurse.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default PapanKerjaVetnurse;
