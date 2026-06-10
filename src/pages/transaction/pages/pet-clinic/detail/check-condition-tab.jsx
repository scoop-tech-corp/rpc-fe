import AssignmentIcon from '@mui/icons-material/Assignment';
import BiotechIcon from '@mui/icons-material/Biotech';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealingIcon from '@mui/icons-material/Healing';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError } from 'store/reducers/snackbar';
import { getCheckConditionPetClinic } from '../service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const yesNo = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  return +val === 1 ? 'Ya' : 'Tidak';
};

const dash = (val) => (val !== null && val !== undefined && val !== '' ? String(val) : '-');

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
    <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
    </Box>
    <Divider />
    <Box sx={{ px: 2, py: 1.5 }}>{children}</Box>
  </Paper>
);
SectionCard.propTypes = { icon: PropTypes.node, title: PropTypes.string, children: PropTypes.node };

const InfoRow = ({ label, value, fullWidth = false }) => (
  <Grid item xs={12} sm={fullWidth ? 12 : 6}>
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Stack>
  </Grid>
);
InfoRow.propTypes = { label: PropTypes.string, value: PropTypes.any, fullWidth: PropTypes.bool };

const BoolChip = ({ val }) => {
  if (val === null || val === undefined || val === '') return <Typography variant="body2" fontWeight={500}>-</Typography>;
  const isYes = +val === 1;
  return <Chip label={isYes ? 'Ya' : 'Tidak'} size="small" color={isYes ? 'success' : 'default'} variant="outlined" />;
};
BoolChip.propTypes = { val: PropTypes.any };

const BoolWithNote = ({ label, flagVal, noteVal }) => (
  <Grid item xs={12} sm={6}>
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <BoolChip val={flagVal} />
        {noteVal && <Typography variant="body2">{noteVal}</Typography>}
      </Stack>
    </Stack>
  </Grid>
);
BoolWithNote.propTypes = { label: PropTypes.string, flagVal: PropTypes.any, noteVal: PropTypes.any };

// ── Main Component ─────────────────────────────────────────────────────────────

const CheckConditionTab = ({ transactionId }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [condData, setCondData] = useState(null);

  useEffect(() => {
    if (!transactionId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await getCheckConditionPetClinic(transactionId);
        setCondData(resp.data);
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!condData || (!condData.anamnesis && !condData.checkUpResult && !condData.diagnose && !condData.treatment && !condData.advice)) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <Typography color="text.secondary">Belum ada data cek kondisi pet untuk transaksi ini.</Typography>
      </Box>
    );
  }

  const { anamnesis: a, checkUpResult: c, diagnose: d, treatment: t, advice: v } = condData;

  return (
    <Stack spacing={2}>

      {/* ── 1. Anamnesa ── */}
      {a && (
        <SectionCard icon={<AssignmentIcon fontSize="small" color="primary" />} title="Anamnesa">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">Anthelmintic</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BoolChip val={a.isAnthelmintic} />
                  {a.anthelminticDate && <Typography variant="body2">{a.anthelminticDate}</Typography>}
                  {a.anthelminticBrand && <Typography variant="body2">({a.anthelminticBrand})</Typography>}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">Vaksinasi</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BoolChip val={a.isVaccination} />
                  {a.vaccinationDate && <Typography variant="body2">{a.vaccinationDate}</Typography>}
                  {a.vaccinationBrand && <Typography variant="body2">({a.vaccinationBrand})</Typography>}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">Obat Kutu</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BoolChip val={a.isFleaMedicine} />
                  {a.fleaMedicineDate && <Typography variant="body2">{a.fleaMedicineDate}</Typography>}
                  {a.fleaMedicineBrand && <Typography variant="body2">({a.fleaMedicineBrand})</Typography>}
                </Stack>
              </Stack>
            </Grid>
            <InfoRow label="Tindakan Sebelumnya" value={dash(a.previousAction)} fullWidth={false} />
            <InfoRow label="Keluhan Lain" value={dash(a.othersCompalints)} fullWidth />
          </Grid>
        </SectionCard>
      )}

      {/* ── 2. Hasil Pemeriksaan Fisik ── */}
      {c && (
        <SectionCard icon={<MonitorHeartIcon fontSize="small" color="primary" />} title="Hasil Pemeriksaan Fisik">
          <Stack spacing={2}>

            {/* Berat & Suhu */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Berat Badan & Suhu
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Berat Badan (KG)" value={dash(c.weight)} />
                <InfoRow label="Kategori Berat" value={dash(c.weightCategory)} />
                <InfoRow label="Suhu (°C)" value={dash(c.temperature)} />
                <InfoRow label="S.D" value={dash(c.temperatureBottom)} />
                <InfoRow label="Suhu Atas (°C)" value={dash(c.temperatureTop)} />
                <InfoRow label="Kategori Suhu" value={dash(c.temperatureCategory)} />
              </Grid>
            </Box>

            <Divider />

            {/* Ektoparasit */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Temuan Ektoparasit
              </Typography>
              <Grid container spacing={2}>
                <BoolWithNote label="Kutu (Lice)" flagVal={c.isLice} noteVal={c.noteLice} />
                <BoolWithNote label="Pinjal (Flea)" flagVal={c.isFlea} noteVal={c.noteFlea} />
                <BoolWithNote label="Caplak" flagVal={c.isCaplak} noteVal={c.noteCaplak} />
                <BoolWithNote label="Tungau" flagVal={c.isTungau} noteVal={c.noteTungau} />
                <InfoRow label="Kategori Ektoparasit" value={c.ectoParasitCategory === '1' || c.ectoParasitCategory === 1 ? 'Badan Hewan' : c.ectoParasitCategory === '2' || c.ectoParasitCategory === 2 ? 'Lingkungan' : dash(c.ectoParasitCategory)} />
                <InfoRow label="Ditemukan Jamur" value={yesNo(c.isFungiFound)} />
              </Grid>
            </Box>

            <Divider />

            {/* Endoparasit */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Temuan Endoparasit
              </Typography>
              <Grid container spacing={2}>
                <BoolWithNote label="Nematoda" flagVal={c.isNematoda} noteVal={c.noteNematoda} />
                <BoolWithNote label="Trematoda" flagVal={c.isTermatoda} noteVal={c.noteTermatoda} />
                <BoolWithNote label="Cestode" flagVal={c.isCestode} noteVal={c.noteCestode} />
              </Grid>
            </Box>

            <Divider />

            {/* Mukosa */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Mukosa
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Konjung" value={dash(c.konjung)} />
                <InfoRow label="Ginggiva" value={dash(c.ginggiva)} />
                <InfoRow label="Telinga" value={dash(c.ear)} />
                <InfoRow label="Lidah" value={dash(c.tongue)} />
                <InfoRow label="Hidung" value={dash(c.nose)} />
                <InfoRow label="CRT" value={dash(c.CRT)} />
                <InfoRow label="Genitalia" value={dash(c.genitals)} />
              </Grid>
            </Box>

            <Divider />

            {/* Saraf & Lokomosi */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Saraf & Lokomosi
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Temuan Neurologis" value={dash(c.neurologicalFindings)} />
                <InfoRow label="Temuan Lokomosi" value={dash(c.lokomosiFindings)} />
              </Grid>
            </Box>

            <Divider />

            {/* Respirasi */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Respirasi
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Ingus" value={yesNo(c.isSnot)} />
                {(+c.isSnot === 1) && <InfoRow label="Catatan Ingus" value={dash(c.noteSnot)} />}
                <InfoRow label="Tipe Nafas" value={dash(c.breathType)} />
                <InfoRow label="Suara Nafas" value={dash(c.breathSoundType)} />
                {c.breathSoundNote && <InfoRow label="Catatan Suara Nafas" value={dash(c.breathSoundNote)} />}
                <InfoRow label="Temuan Lain (Respirasi)" value={dash(c.othersFoundBreath)} />
              </Grid>
            </Box>

            <Divider />

            {/* Kardiovaskular */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Kardiovaskular
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Pulsus" value={c.pulsus === '1' || c.pulsus === 1 ? 'Teraba' : c.pulsus === '2' || c.pulsus === 2 ? 'Tidak' : dash(c.pulsus)} />
                <InfoRow label="Suara Jantung" value={dash(c.heartSound)} />
                <InfoRow label="Temuan Lain (Jantung)" value={dash(c.othersFoundHeart)} />
              </Grid>
            </Box>

            <Divider />

            {/* Kulit */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Kulit & Integumen
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Temuan Kulit" value={dash(c.othersFoundSkin)} />
                <InfoRow label="Temuan Rambut" value={dash(c.othersFoundHair)} />
              </Grid>
            </Box>

            <Divider />

            {/* Urogenital */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Urogenital
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Kondisi Testis" value={
                  c.maleTesticles === '1' || c.maleTesticles === 1 ? 'Steril' :
                    c.maleTesticles === '2' || c.maleTesticles === 2 ? 'Normal' :
                      c.maleTesticles === '3' || c.maleTesticles === 3 ? 'Cryptorchid' :
                        c.maleTesticles === '4' || c.maleTesticles === 4 ? `Lainnya: ${dash(c.othersMaleTesticles)}` :
                          dash(c.maleTesticles)
                } />
                <InfoRow label="Kondisi Penis" value={dash(c.penisCondition)} />
                <InfoRow label="Tipe Vaginal Discharge" value={dash(c.vaginalDischargeType)} />
                <InfoRow label="Urinasi" value={
                  c.urinationType === '1' || c.urinationType === 1 ? 'Normal' :
                    c.urinationType === '2' || c.urinationType === 2 ? 'Anuria' :
                      c.urinationType === '3' || c.urinationType === 3 ? `Disuria: ${dash(c.othersUrination)}` :
                        dash(c.urinationType)
                } />
                <InfoRow label="Temuan Lain (Urogenital)" value={dash(c.othersFoundUrogenital)} />
              </Grid>
            </Box>

            <Divider />

            {/* Digestif */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Pencernaan
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Abnormalitas Cavum Oris" value={dash(c.abnormalitasCavumOris)} />
                <InfoRow label="Peristaltik Usus" value={dash(c.intestinalPeristalsis)} />
                <InfoRow label="Perkusi Abdomen" value={dash(c.perkusiAbdomen)} />
                <InfoRow label="Kondisi Rektum/Kloaka" value={dash(c.rektumKloaka)} />
                <InfoRow label="Karakter Lain Rektum/Kloaka" value={dash(c.othersCharacterRektumKloaka)} />
                <InfoRow label="Bentuk Feses" value={dash(c.fecesForm)} />
                <InfoRow label="Warna Feses" value={dash(c.fecesColor)} />
                <InfoRow label="Karakter Feses" value={dash(c.fecesWithCharacter)} />
                <InfoRow label="Temuan Lain (Digestif)" value={dash(c.othersFoundDigesti)} />
              </Grid>
            </Box>

            <Divider />

            {/* Visual */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Visual
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Refleks Pupil" value={dash(c.reflectPupil)} />
                <InfoRow label="Kondisi Bola Mata" value={dash(c.eyeBallCondition)} />
                <InfoRow label="Temuan Lain (Visual)" value={dash(c.othersFoundVision)} />
              </Grid>
            </Box>

            <Divider />

            {/* Pendengaran */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Sistem Pendengaran
              </Typography>
              <Grid container spacing={2}>
                <InfoRow label="Daun Telinga" value={dash(c.earlobe)} />
                <InfoRow label="Serumen" value={c.earwax === '1' || c.earwax === 1 ? 'Normal' : c.earwax === '2' || c.earwax === 2 ? `Tidak Normal: ${dash(c.earwaxCharacter)}` : dash(c.earwax)} />
                <InfoRow label="Temuan Lain (Telinga)" value={dash(c.othersFoundEar)} />
              </Grid>
            </Box>

          </Stack>
        </SectionCard>
      )}

      {/* ── 3. Diagnosa & Prognosa ── */}
      {d && (
        <SectionCard icon={<BiotechIcon fontSize="small" color="primary" />} title="Diagnosa, Prognosa & Pemeriksaan Lanjutan">
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <InfoRow label="Diagnosa Penyakit" value={dash(d.diagnoseDisease)} fullWidth />
              <InfoRow label="Prognosa Penyakit" value={dash(d.prognoseDisease)} fullWidth />
              <InfoRow label="Overview Perkembangan Penyakit" value={dash(d.diseaseProgressOverview)} fullWidth />
            </Grid>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Pemeriksaan Lanjutan
              </Typography>
              <Grid container spacing={2}>
                <BoolWithNote label="Mikroskop" flagVal={d.isMicroscope} noteVal={d.noteMicroscope} />
                <BoolWithNote label="Mata (Eye)" flagVal={d.isEye} noteVal={d.noteEye} />
                <BoolWithNote label="Teskit" flagVal={d.isTeskit} noteVal={d.noteTeskit} />
                <BoolWithNote label="Ultrasonografi (USG)" flagVal={d.isUltrasonografi} noteVal={d.noteUltrasonografi} />
                <BoolWithNote label="Rontgen (X-ray)" flagVal={d.isRontgen} noteVal={d.noteRontgen} />
                <BoolWithNote label="Pemeriksaan Darah" flagVal={d.isBloodReview} noteVal={d.noteBloodReview} />
                <BoolWithNote label="Sitologi" flagVal={d.isSitologi} noteVal={d.noteSitologi} />
                <BoolWithNote label="Vaginal Smear" flagVal={d.isVaginalSmear} noteVal={d.noteVaginalSmear} />
                <BoolWithNote label="Lab Darah" flagVal={d.isBloodLab} noteVal={d.noteBloodLab} />
              </Grid>
            </Box>
          </Stack>
        </SectionCard>
      )}

      {/* ── 4. Tindakan (Treatment) ── */}
      {t && (
        <SectionCard icon={<HealingIcon fontSize="small" color="primary" />} title="Treatment (Tindakan)">
          <Grid container spacing={2}>
            <BoolWithNote label="Operasi" flagVal={t.isSurgery} noteVal={t.noteSurgery} />
            <InfoRow label="Infus" value={dash(t.infusion)} />
            <InfoRow label="Fisioterapi" value={dash(t.fisioteraphy)} />
            <InfoRow label="Obat Injeksi" value={dash(t.injectionMedicine)} />
            <InfoRow label="Obat Oral" value={dash(t.oralMedicine)} />
            <InfoRow label="Obat Topikal" value={dash(t.tropicalMedicine)} />
            <InfoRow label="Vaksinasi" value={dash(t.vaccination)} />
            <InfoRow label="Lainnya" value={dash(t.othersTreatment)} />
          </Grid>
        </SectionCard>
      )}

      {/* ── 5. Saran (Advice) ── */}
      {v && (
        <SectionCard icon={<LightbulbIcon fontSize="small" color="primary" />} title="Saran">
          <Grid container spacing={2}>
            <BoolWithNote label="Rawat Inap" flagVal={v.inpatient} noteVal={v.noteInpatient} />
            <BoolWithNote label="Pakan Terapeutik" flagVal={v.therapeuticFeed} noteVal={v.noteTherapeuticFeed} />
            <InfoRow label="Imun Booster / Multivitamin" value={dash(v.imuneBooster)} />
            <InfoRow label="Suplemen Lain" value={dash(v.suplement)} />
            <InfoRow label="Desinfeksi Lingkungan" value={dash(v.desinfeksi)} />
            <InfoRow label="Perawatan (Kandang/Indoor/Outdoor)" value={dash(v.care)} />
            <BoolWithNote label="Grooming / Mandi" flagVal={v.grooming} noteVal={v.noteGrooming} />
            <InfoRow label="Catatan Lain" value={dash(v.othersNoteAdvice)} />
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">Jadwal Kontrol Berikutnya</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FavoriteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{dash(v.nextControlCheckup)}</Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>
      )}

    </Stack>
  );
};

CheckConditionTab.propTypes = {
  transactionId: PropTypes.number
};

export default CheckConditionTab;
