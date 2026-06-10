import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BiotechIcon from '@mui/icons-material/Biotech';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealingIcon from '@mui/icons-material/Healing';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PetsIcon from '@mui/icons-material/Pets';
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import {
  getTransactionListDataBreath,
  getTransactionListDataHeart,
  getTransactionListDataSound,
  getTransactionListDataTemperature,
  getTransactionListDataVaginal,
  getTransactionListDataWeight
} from 'pages/transaction/service';
import {
  checkPetConditionTransactionPetClinic,
  CONSTANT_CHECK_PET_CONDITION_PET_CLINIC_FORM_VALUE,
  getLoadPetCheckTransactionPetClinic,
  getOrderNumberTransactionPetClinic
} from '../../service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SectionCard = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
    <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
    </Box>
    <Divider />
    <Box sx={{ px: 2, py: 2 }}>{children}</Box>
  </Paper>
);
SectionCard.propTypes = { icon: PropTypes.node, title: PropTypes.string, children: PropTypes.node };

// Checkbox + inline note field
const CheckNoteRow = ({ checked, onCheck, label, noteValue, onNote, placeholder = 'Catatan...' }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.5}
    sx={{
      p: 1.25,
      borderRadius: 1.5,
      border: '1px solid',
      borderColor: checked ? 'primary.light' : 'divider',
      bgcolor: checked ? 'primary.50' : 'transparent',
      transition: 'all 0.2s'
    }}
  >
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={onCheck} size="small" />}
      label={<Typography variant="body2" fontWeight={checked ? 600 : 400} noWrap>{label}</Typography>}
      sx={{ minWidth: 130, m: 0, flexShrink: 0 }}
    />
    <TextField
      size="small"
      fullWidth
      placeholder={placeholder}
      value={noteValue}
      onChange={onNote}
      disabled={!checked}
    />
  </Stack>
);
CheckNoteRow.propTypes = {
  checked: PropTypes.bool, onCheck: PropTypes.func, label: PropTypes.string,
  noteValue: PropTypes.string, onNote: PropTypes.func, placeholder: PropTypes.string
};

// Tab panel
const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);
TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number };

// ── Main Component ─────────────────────────────────────────────────────────────

const CheckPetConditionPetClinic = (props) => {
  const { data } = props;
  const [formValue, setFormValue] = useState({ ...CONSTANT_CHECK_PET_CONDITION_PET_CLINIC_FORM_VALUE });
  const [formDropdown, setFormDropdown] = useState({
    weightList: [], temperatureList: [], breathList: [],
    breathSoundList: [], heartList: [], vaginalList: []
  });
  const [disabledOke, setDisabledOk] = useState(false);
  const [tabActive, setTabActive] = useState(0);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const onSubmit = async () => {
    setDisabledOk(true);
    await checkPetConditionTransactionPetClinic(formValue)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Success check pet condition'));
          props.onClose(true);
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setDisabledOk(false));
  };

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);

      Promise.all([
        getOrderNumberTransactionPetClinic(data.transactionId),
        getLoadPetCheckTransactionPetClinic(data.transactionId),
        getTransactionListDataWeight(),
        getTransactionListDataTemperature(),
        getTransactionListDataBreath(),
        getTransactionListDataSound(),
        getTransactionListDataHeart(),
        getTransactionListDataVaginal()
      ])
        .then(([respOrderNumber, respLoadPetCheck, respWeight, respTemperature, respBreath, respSound, respHeart, respVaginal]) => {
          setFormValue((prevState) => ({
            ...prevState,
            transactionPetClinicId: data.transactionId,
            petCheckRegistrationNo: respOrderNumber.data,
            ownerName: respLoadPetCheck.data.ownerName,
            noTelp: respLoadPetCheck.data.phoneNumber,
            petType: respLoadPetCheck.data.type
          }));
          setFormDropdown({
            weightList: respWeight, temperatureList: respTemperature,
            breathList: respBreath, breathSoundList: respSound,
            heartList: respHeart, vaginalList: respVaginal
          });
        })
        .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
        .finally(() => {
          loaderGlobalConfig.setLoader(false);
          loaderService.setManualLoader(false);
        });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key, val) => setFormValue((prev) => ({ ...prev, [key]: val }));
  const onFieldHandler = (e) => set(e.target.name, e.target.value);

  const TABS = ['Identitas & Anamnesa', 'Pemeriksaan Fisik', 'Diagnosa & Lanjutan', 'Tindakan & Saran'];

  return (
    <ModalC
      title={<FormattedMessage id="check-pet-condition" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOke}
      onCancel={() => props.onClose(false)}
      fullWidth
      maxWidth="lg"
    >
      {/* ── Tab Navigation ── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs
          value={tabActive}
          onChange={(_, v) => setTabActive(v)}
          variant={matchDownSM ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
        >
          {TABS.map((label, i) => (
            <Tab
              key={i}
              label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Chip label={i + 1} size="small" color={tabActive === i ? 'primary' : 'default'} sx={{ minWidth: 22, height: 20, fontSize: 11 }} />
                  <Typography variant="caption" fontWeight={tabActive === i ? 700 : 400}>{label}</Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 0 — Identitas & Anamnesa                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabActive} index={0}>

        {/* Identitas */}
        <SectionCard icon={<AccountCircleIcon fontSize="small" color="primary" />} title="Identitas Pasien">
          <Grid container spacing={2}>
            {[
              { label: 'No. Registrasi', name: 'petCheckRegistrationNo' },
              { label: 'Nama Pemilik', name: 'ownerName' },
              { label: 'No. Telepon', name: 'noTelp' },
              { label: 'Nama / Jenis Hewan', name: 'petType' }
            ].map(({ label, name }) => (
              <Grid item xs={12} sm={6} key={name}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={formValue[name]}
                    inputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { bgcolor: 'action.hover', cursor: 'default' } }}
                  />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* Anamnesa */}
        <SectionCard icon={<AssignmentIcon fontSize="small" color="primary" />} title="Anamnesa">
          <Grid container spacing={2}>

            {/* Anthelmintic */}
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="anthelmintic" /></Typography>
                <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1}>
                  <Select size="small" value={formValue.isAnthelmintic} name="isAnthelmintic" onChange={onFieldHandler} sx={{ minWidth: 90 }}>
                    <MenuItem value="1"><FormattedMessage id="yes" /></MenuItem>
                    <MenuItem value="0"><FormattedMessage id="no" /></MenuItem>
                  </Select>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      value={formValue.anthelminticDate}
                      onChange={(v) => set('anthelminticDate', v)}
                      renderInput={(params) => <TextField {...params} size="small" sx={{ flex: 1 }} />}
                    />
                  </LocalizationProvider>
                  <TextField size="small" placeholder="Merk" value={formValue.anthelminticBrand} name="anthelminticBrand" onChange={onFieldHandler} sx={{ flex: 1 }} />
                </Stack>
              </Stack>
            </Grid>

            {/* Vaksinasi */}
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="vaccination" /></Typography>
                <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1}>
                  <Select size="small" value={formValue.isVaccination} name="isVaccination" onChange={onFieldHandler} sx={{ minWidth: 90 }}>
                    <MenuItem value="1"><FormattedMessage id="yes" /></MenuItem>
                    <MenuItem value="0"><FormattedMessage id="no" /></MenuItem>
                  </Select>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      value={formValue.vaccinationDate}
                      onChange={(v) => set('vaccinationDate', v)}
                      renderInput={(params) => <TextField {...params} size="small" sx={{ flex: 1 }} />}
                    />
                  </LocalizationProvider>
                  <TextField size="small" placeholder="Merk" value={formValue.vaccinationBrand} name="vaccinationBrand" onChange={onFieldHandler} sx={{ flex: 1 }} />
                </Stack>
              </Stack>
            </Grid>

            {/* Obat Kutu */}
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="flea-medicine" /></Typography>
                <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1}>
                  <Select size="small" value={formValue.isFleaMedicine} name="isFleaMedicine" onChange={onFieldHandler} sx={{ minWidth: 90 }}>
                    <MenuItem value="1"><FormattedMessage id="yes" /></MenuItem>
                    <MenuItem value="0"><FormattedMessage id="no" /></MenuItem>
                  </Select>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      inputFormat="DD/MM/YYYY"
                      value={formValue.fleaMedicineDate}
                      onChange={(v) => set('fleaMedicineDate', v)}
                      renderInput={(params) => <TextField {...params} size="small" sx={{ flex: 1 }} />}
                    />
                  </LocalizationProvider>
                  <TextField size="small" placeholder="Merk" value={formValue.fleaMedicineBrand} name="fleaMedicineBrand" onChange={onFieldHandler} sx={{ flex: 1 }} />
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="the-treatment-already-given-previously" /></Typography>
                <TextField size="small" fullWidth value={formValue.previousAction} name="previousAction" onChange={onFieldHandler} />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="other-complaints" /></Typography>
                <TextField size="small" fullWidth value={formValue.othersCompalints} name="othersCompalints" onChange={onFieldHandler} />
              </Stack>
            </Grid>

          </Grid>
        </SectionCard>
      </TabPanel>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1 — Pemeriksaan Fisik                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabActive} index={1}>

        {/* Berat & Suhu */}
        <SectionCard icon={<MonitorHeartIcon fontSize="small" color="primary" />} title="Berat Badan & Suhu">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="weight" /> (KG)</Typography>
                <TextField size="small" fullWidth type="number" name="weight" value={formValue.weight} inputProps={{ min: 0 }} onChange={onFieldHandler} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="weight-category" /></Typography>
                <Select size="small" fullWidth name="weightCategory" value={formValue.weightCategory} onChange={onFieldHandler}>
                  {formDropdown.weightList.map((dt, i) => <MenuItem key={i} value={dt.value}>{dt.label}</MenuItem>)}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="temperature" /></Typography>
                <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                    <TextField size="small" fullWidth type="number" name="temperature" value={formValue.temperature} inputProps={{ min: 0 }} onChange={onFieldHandler} />
                    <Typography variant="caption" noWrap>°C</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">s.d</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                    <TextField size="small" fullWidth type="number" name="temperatureBottom" value={formValue.temperatureBottom} inputProps={{ min: 0 }} onChange={onFieldHandler} />
                    <Typography variant="caption" noWrap>S.D</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                    <TextField size="small" fullWidth type="number" name="temperatureTop" value={formValue.temperatureTop} inputProps={{ min: 0 }} onChange={onFieldHandler} />
                    <Typography variant="caption" noWrap>°C</Typography>
                  </Stack>
                  <Select size="small" name="temperatureCategory" value={formValue.temperatureCategory} onChange={onFieldHandler} sx={{ flex: 1, minWidth: 120 }}>
                    {formDropdown.temperatureList.map((dt, i) => <MenuItem key={i} value={dt.value}>{dt.label}</MenuItem>)}
                  </Select>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Ektoparasit */}
        <SectionCard icon={<PetsIcon fontSize="small" color="primary" />} title="Temuan Ektoparasit & Endoparasit">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="caption" fontWeight={600} color="text.secondary"><FormattedMessage id="ectoparasite-findings" /></Typography>
                <CheckNoteRow checked={formValue.isLice} onCheck={(e) => set('isLice', e.target.checked)} label={<FormattedMessage id="lice-free" />} noteValue={formValue.noteLice} onNote={(e) => set('noteLice', e.target.value)} />
                <CheckNoteRow checked={formValue.isFlea} onCheck={(e) => set('isFlea', e.target.checked)} label={<FormattedMessage id="flea" />} noteValue={formValue.noteFlea} onNote={(e) => set('noteFlea', e.target.value)} />
                <CheckNoteRow checked={formValue.isCaplak} onCheck={(e) => set('isCaplak', e.target.checked)} label="Caplak" noteValue={formValue.noteCaplak} onNote={(e) => set('noteCaplak', e.target.value)} />
                <CheckNoteRow checked={formValue.isTungau} onCheck={(e) => set('isTungau', e.target.checked)} label="Tungau" noteValue={formValue.noteTungau} onNote={(e) => set('noteTungau', e.target.value)} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="caption" fontWeight={600} color="text.secondary"><FormattedMessage id="endoparasit-findings" /></Typography>
                <CheckNoteRow checked={formValue.isNematoda} onCheck={(e) => set('isNematoda', e.target.checked)} label="Nematoda" noteValue={formValue.noteNematoda} onNote={(e) => set('noteNematoda', e.target.value)} />
                <CheckNoteRow checked={formValue.isTermatoda} onCheck={(e) => set('isTermatoda', e.target.checked)} label="Trematoda" noteValue={formValue.noteTermatoda} onNote={(e) => set('noteTermatoda', e.target.value)} />
                <CheckNoteRow checked={formValue.isCestode} onCheck={(e) => set('isCestode', e.target.checked)} label="Cestode" noteValue={formValue.noteCestode} onNote={(e) => set('noteCestode', e.target.value)} />
              </Stack>
              <Stack spacing={1} mt={2}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Kategori & Jamur</Typography>
                <Stack direction="row" spacing={1}>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="caption"><FormattedMessage id="life-cycle-ectoparasite" /></Typography>
                    <Select size="small" fullWidth name="ectoParasitCategory" value={formValue.ectoParasitCategory} onChange={onFieldHandler}>
                      <MenuItem value="1">Badan Hewan</MenuItem>
                      <MenuItem value="2">Lingkungan</MenuItem>
                    </Select>
                  </Stack>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="caption"><FormattedMessage id="fungi-findings" /></Typography>
                    <Select size="small" fullWidth name="isFungiFound" value={formValue.isFungiFound} onChange={onFieldHandler}>
                      <MenuItem value="1"><FormattedMessage id="yes" /></MenuItem>
                      <MenuItem value="0"><FormattedMessage id="no" /></MenuItem>
                    </Select>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Mukosa */}
        <SectionCard icon={<FavoriteIcon fontSize="small" color="primary" />} title="Mukosa">
          <Grid container spacing={1.5}>
            {[
              { label: 'Konjung', name: 'konjung' }, { label: 'Ginggiva', name: 'ginggiva' },
              { label: 'Telinga', name: 'ear' }, { label: 'Lidah', name: 'tongue' },
              { label: 'Hidung', name: 'nose' }, { label: 'CRT', name: 'CRT' },
              { label: 'Genitalia', name: 'genitals' }
            ].map(({ label, name }) => (
              <Grid item xs={6} sm={4} md={3} key={name}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>{label}</Typography>
                  <TextField size="small" fullWidth name={name} value={formValue[name]} onChange={onFieldHandler} />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* Saraf & Lokomosi */}
        <SectionCard icon={<BiotechIcon fontSize="small" color="primary" />} title="Sistem Saraf & Lokomosi">
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="neurological-findings" /></Typography>
                <TextField size="small" fullWidth name="neurologicalFindings" value={formValue.neurologicalFindings} onChange={onFieldHandler} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="lokomosi-findings" /></Typography>
                <TextField size="small" fullWidth name="lokomosiFindings" value={formValue.lokomosiFindings} onChange={onFieldHandler} />
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Respirasi */}
        <SectionCard icon={<MonitorHeartIcon fontSize="small" color="primary" />} title="Sistem Respirasi">
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="snot" /></Typography>
                <Select size="small" fullWidth name="isSnot" value={formValue.isSnot} onChange={onFieldHandler}>
                  <MenuItem value="1"><FormattedMessage id="yes" /></MenuItem>
                  <MenuItem value="0"><FormattedMessage id="no" /></MenuItem>
                </Select>
              </Stack>
            </Grid>
            {formValue.isSnot === '1' && (
              <Grid item xs={12} sm={8}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>Catatan Ingus</Typography>
                  <TextField size="small" fullWidth name="noteSnot" value={formValue.noteSnot} onChange={onFieldHandler} placeholder="Keterangan..." />
                </Stack>
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="breath-type" /></Typography>
                <Select size="small" fullWidth name="breathType" value={formValue.breathType} onChange={onFieldHandler}>
                  {formDropdown.breathList.map((dt, i) => <MenuItem key={i} value={dt.value}>{dt.label}</MenuItem>)}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="breath-sound-type" /></Typography>
                <Select size="small" fullWidth name="breathSoundType" value={formValue.breathSoundType} onChange={onFieldHandler}>
                  {formDropdown.breathSoundList.map((dt, i) => <MenuItem key={i} value={dt.value}>{dt.label}</MenuItem>)}
                </Select>
              </Stack>
            </Grid>
            {formValue.breathSoundType === '4' && (
              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>Catatan Suara Nafas</Typography>
                  <TextField size="small" fullWidth name="breathSoundNote" value={formValue.breathSoundNote} onChange={onFieldHandler} />
                </Stack>
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="other-findings" /></Typography>
                <TextField size="small" fullWidth name="othersFoundBreath" value={formValue.othersFoundBreath} onChange={onFieldHandler} />
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Kardiovaskular */}
        <SectionCard icon={<FavoriteIcon fontSize="small" color="error" />} title="Sistem Kardiovaskular">
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}>Pulsus</Typography>
                <RadioGroup row name="pulsus" value={formValue.pulsus} onChange={onFieldHandler}>
                  <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="caption">Teraba</Typography>} />
                  <FormControlLabel value="2" control={<Radio size="small" />} label={<Typography variant="caption"><FormattedMessage id="no" /></Typography>} />
                </RadioGroup>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="heart-sound" /></Typography>
                <Select size="small" fullWidth name="heartSound" value={formValue.heartSound} onChange={onFieldHandler}>
                  {formDropdown.heartList.map((dt, i) => <MenuItem key={i} value={dt.value}>{dt.label}</MenuItem>)}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="other-findings" /></Typography>
                <TextField size="small" fullWidth name="othersFoundHeart" value={formValue.othersFoundHeart} onChange={onFieldHandler} />
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Kulit */}
        <SectionCard icon={<PetsIcon fontSize="small" color="primary" />} title="Sistem Kulit & Integumen">
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="skin-findings" /></Typography>
                <TextField size="small" fullWidth name="othersFoundSkin" value={formValue.othersFoundSkin} onChange={onFieldHandler} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="hair-findings" /></Typography>
                <TextField size="small" fullWidth name="othersFoundHair" value={formValue.othersFoundHair} onChange={onFieldHandler} />
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Urogenital */}
        <SectionCard icon={<BiotechIcon fontSize="small" color="primary" />} title="Sistem Urogenital">
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="male-testicles" /></Typography>
                <Select size="small" fullWidth name="maleTesticles" value={formValue.maleTesticles} onChange={onFieldHandler}>
                  <MenuItem value="1">Steril</MenuItem>
                  <MenuItem value="2">Normal</MenuItem>
                  <MenuItem value="3">Cryptorchid</MenuItem>
                  <MenuItem value="4">Lainnya</MenuItem>
                </Select>
              </Stack>
            </Grid>
            {formValue.maleTesticles === '4' && (
              <Grid item xs={12} sm={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>Keterangan Testis</Typography>
                  <TextField size="small" fullWidth name="othersMaleTesticles" value={formValue.othersMaleTesticles} onChange={onFieldHandler} />
                </Stack>
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="penis-condition" /></Typography>
                <TextField size="small" fullWidth name="penisCondition" value={formValue.penisCondition} onChange={onFieldHandler} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="vaginal-discharge" /></Typography>
                <Select size="small" fullWidth name="vaginalDischargeType" value={formValue.vaginalDischargeType} onChange={onFieldHandler}>
                  {formDropdown.vaginalList.map((dt, i) => <MenuItem key={i} value={dt.value}>{dt.label}</MenuItem>)}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}>Urinasi</Typography>
                <RadioGroup row name="urinationType" value={formValue.urinationType} onChange={onFieldHandler}>
                  <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="caption">Normal</Typography>} />
                  <FormControlLabel value="2" control={<Radio size="small" />} label={<Typography variant="caption">Anuria</Typography>} />
                  <FormControlLabel value="3" control={<Radio size="small" />} label={<Typography variant="caption">Disuria</Typography>} />
                </RadioGroup>
              </Stack>
            </Grid>
            {formValue.urinationType === '3' && (
              <Grid item xs={12} sm={5}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="with-character" /></Typography>
                  <TextField size="small" fullWidth name="othersUrination" value={formValue.othersUrination} onChange={onFieldHandler} />
                </Stack>
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="other-findings" /></Typography>
                <TextField size="small" fullWidth name="othersFoundUrogenital" value={formValue.othersFoundUrogenital} onChange={onFieldHandler} />
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Pencernaan */}
        <SectionCard icon={<HealingIcon fontSize="small" color="primary" />} title="Sistem Pencernaan">
          <Grid container spacing={1.5}>
            {[
              { label: 'Abnormalitas Cavum Oris', name: 'abnormalitasCavumOris' },
              { label: 'Peristaltik Usus', name: 'intestinalPeristalsis' },
              { label: 'Perkusi Abdomen', name: 'perkusiAbdomen' },
              { label: 'Rektum/Kloaka', name: 'rektumKloaka' },
              { label: 'Karakter Rektum/Kloaka', name: 'othersCharacterRektumKloaka' },
              { label: 'Bentuk Feses', name: 'fecesForm' },
              { label: 'Warna Feses', name: 'fecesColor' },
              { label: 'Karakter Feses', name: 'fecesWithCharacter' },
              { label: 'Temuan Lain', name: 'othersFoundDigesti' }
            ].map(({ label, name }) => (
              <Grid item xs={12} sm={4} key={name}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>{label}</Typography>
                  <TextField size="small" fullWidth name={name} value={formValue[name]} onChange={onFieldHandler} />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* Visual */}
        <SectionCard icon={<BiotechIcon fontSize="small" color="primary" />} title="Sistem Visual">
          <Grid container spacing={1.5}>
            {[
              { label: 'Refleks Pupil', name: 'reflectPupil' },
              { label: 'Kondisi Bola Mata', name: 'eyeBallCondition' },
              { label: 'Temuan Lain', name: 'othersFoundVision' }
            ].map(({ label, name }) => (
              <Grid item xs={12} sm={4} key={name}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}>{label}</Typography>
                  <TextField size="small" fullWidth name={name} value={formValue[name]} onChange={onFieldHandler} />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* Pendengaran */}
        <SectionCard icon={<BiotechIcon fontSize="small" color="primary" />} title="Sistem Pendengaran">
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="earlobe" /></Typography>
                <TextField size="small" fullWidth name="earlobe" value={formValue.earlobe} onChange={onFieldHandler} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="earwax" /></Typography>
                <RadioGroup row name="earwax" value={formValue.earwax} onChange={onFieldHandler}>
                  <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="caption">Normal</Typography>} />
                  <FormControlLabel value="2" control={<Radio size="small" />} label={<Typography variant="caption">Tidak</Typography>} />
                </RadioGroup>
              </Stack>
            </Grid>
            {formValue.earwax === '2' && (
              <Grid item xs={12} sm={5}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id="with-character" /></Typography>
                  <TextField size="small" fullWidth name="earwaxCharacter" value={formValue.earwaxCharacter} onChange={onFieldHandler} />
                </Stack>
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack spacing={0.5}>
                <Typography variant="caption" fontWeight={600}><FormattedMessage id="other-findings" /></Typography>
                <TextField size="small" fullWidth name="othersFoundEar" value={formValue.othersFoundEar} onChange={onFieldHandler} />
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

      </TabPanel>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2 — Diagnosa & Pemeriksaan Lanjutan                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabActive} index={2}>

        {/* Diagnosa */}
        <SectionCard icon={<AssignmentIcon fontSize="small" color="primary" />} title="Diagnosa Penyakit">
          <TextField
            multiline fullWidth rows={4} size="small"
            name="diagnoseDisease" value={formValue.diagnoseDisease} onChange={onFieldHandler}
            placeholder="Tuliskan diagnosa penyakit..."
          />
        </SectionCard>

        {/* Prognosa */}
        <SectionCard icon={<MonitorHeartIcon fontSize="small" color="primary" />} title="Prognosa Penyakit">
          <Stack spacing={1.5}>
            <TextField
              multiline fullWidth rows={4} size="small"
              name="prognoseDisease" value={formValue.prognoseDisease} onChange={onFieldHandler}
              placeholder="Tuliskan prognosa penyakit..."
            />
            <Stack spacing={0.5}>
              <Typography variant="caption" fontWeight={600}><FormattedMessage id="overview-of-the-disease-process" /></Typography>
              <TextField
                multiline fullWidth rows={3} size="small"
                name="diseaseProgressOverview" value={formValue.diseaseProgressOverview} onChange={onFieldHandler}
                placeholder="Gambaran perkembangan penyakit..."
              />
            </Stack>
          </Stack>
        </SectionCard>

        {/* Pemeriksaan Lanjutan */}
        <SectionCard icon={<BiotechIcon fontSize="small" color="primary" />} title="Pemeriksaan Lanjutan">
          <Grid container spacing={1.5}>
            {[
              { flag: 'isMicroscope', note: 'noteMicroscope', label: 'Mikroskop', placeholder: 'Sample...' },
              { flag: 'isEye', note: 'noteEye', label: 'Mata (Eye)', placeholder: 'Jenis tes...' },
              { flag: 'isTeskit', note: 'noteTeskit', label: 'Teskit', placeholder: 'Jenis tes...' },
              { flag: 'isUltrasonografi', note: 'noteUltrasonografi', label: 'USG (Ultrasonografi)', placeholder: 'Keterangan...' },
              { flag: 'isRontgen', note: 'noteRontgen', label: 'Rontgen (X-ray)', placeholder: 'Keterangan...' },
              { flag: 'isBloodReview', note: 'noteBloodReview', label: 'Pemeriksaan Darah', placeholder: 'Note...' },
              { flag: 'isSitologi', note: 'noteSitologi', label: 'Sitologi', placeholder: 'Note...' },
              { flag: 'isVaginalSmear', note: 'noteVaginalSmear', label: 'Vaginal Smear', placeholder: 'Note...' },
              { flag: 'isBloodLab', note: 'noteBloodLab', label: 'Lab Darah', placeholder: 'Jenis tes...' }
            ].map(({ flag, note, label, placeholder }) => (
              <Grid item xs={12} sm={6} key={flag}>
                <CheckNoteRow
                  checked={formValue[flag]}
                  onCheck={(e) => set(flag, e.target.checked)}
                  label={label}
                  noteValue={formValue[note]}
                  onNote={(e) => set(note, e.target.value)}
                  placeholder={placeholder}
                />
              </Grid>
            ))}
          </Grid>
        </SectionCard>

      </TabPanel>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 3 — Tindakan & Saran                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabActive} index={3}>

        {/* Tindakan */}
        <SectionCard icon={<HealingIcon fontSize="small" color="primary" />} title="Treatment (Tindakan)">
          <Stack spacing={1.5}>
            <CheckNoteRow
              checked={formValue.isSurgery}
              onCheck={(e) => set('isSurgery', e.target.checked)}
              label="Operasi"
              noteValue={formValue.noteSurgery}
              onNote={(e) => set('noteSurgery', e.target.value)}
              placeholder="Keterangan operasi..."
            />
            <Grid container spacing={1.5}>
              {[
                { label: 'Infus', name: 'infusion' },
                { label: 'Fisioterapi', name: 'fisioteraphy' },
                { label: 'Obat Injeksi', name: 'injectionMedicine' },
                { label: 'Obat Oral', name: 'oralMedicine' },
                { label: 'Obat Topikal', name: 'tropicalMedicine' },
                { label: 'Vaksinasi', name: 'vaccination' },
                { label: 'Lainnya', name: 'othersTreatment' }
              ].map(({ label, name }) => (
                <Grid item xs={12} sm={6} key={name}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={600}>{label}</Typography>
                    <TextField size="small" fullWidth name={name} value={formValue[name]} onChange={onFieldHandler} />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </SectionCard>

        {/* Saran */}
        <SectionCard icon={<LightbulbIcon fontSize="small" color="primary" />} title="Saran (Advice)">
          <Stack spacing={1.5}>

            {/* Rawat Inap */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={600}><FormattedMessage id="inpatient-care" /></Typography>
                    <RadioGroup row name="isInpatient" value={formValue.isInpatient} onChange={onFieldHandler}>
                      <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="caption"><FormattedMessage id="yes" /></Typography>} />
                      <FormControlLabel value="2" control={<Radio size="small" />} label={<Typography variant="caption"><FormattedMessage id="no" /></Typography>} />
                    </RadioGroup>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField size="small" fullWidth name="noteInpatient" value={formValue.noteInpatient} onChange={onFieldHandler} placeholder="Catatan rawat inap..." />
                </Grid>
              </Grid>
            </Paper>

            {/* Pakan Terapeutik */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={600}><FormattedMessage id="therapeutic-feed" /></Typography>
                    <RadioGroup row name="isTherapeuticFeed" value={formValue.isTherapeuticFeed} onChange={onFieldHandler}>
                      <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="caption"><FormattedMessage id="yes" /></Typography>} />
                      <FormControlLabel value="2" control={<Radio size="small" />} label={<Typography variant="caption"><FormattedMessage id="no" /></Typography>} />
                    </RadioGroup>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField size="small" fullWidth name="noteTherapeuticFeed" value={formValue.noteTherapeuticFeed} onChange={onFieldHandler} placeholder="Catatan pakan terapeutik..." />
                </Grid>
              </Grid>
            </Paper>

            {/* Grooming */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={600}>Grooming / Mandi</Typography>
                    <RadioGroup row name="isGrooming" value={formValue.isGrooming} onChange={onFieldHandler}>
                      <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="caption"><FormattedMessage id="yes" /></Typography>} />
                      <FormControlLabel value="2" control={<Radio size="small" />} label={<Typography variant="caption"><FormattedMessage id="no" /></Typography>} />
                    </RadioGroup>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField size="small" fullWidth name="noteGrooming" value={formValue.noteGrooming} onChange={onFieldHandler} placeholder="Catatan grooming..." />
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={1.5}>
              {[
                { label: 'Imun Booster / Multivitamin', name: 'imuneBooster' },
                { label: 'Suplemen Lain', name: 'suplement' },
                { label: 'Desinfeksi Lingkungan', name: 'desinfeksi' },
                { label: 'Perawatan (Kandang/Indoor/Outdoor)', name: 'care' },
                { label: 'Catatan Lain', name: 'othersNoteAdvice' }
              ].map(({ label, name }) => (
                <Grid item xs={12} sm={6} key={name}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={600}>{label}</Typography>
                    <TextField size="small" fullWidth name={name} value={formValue[name]} onChange={onFieldHandler} />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </SectionCard>

        {/* Jadwal Kontrol */}
        <SectionCard icon={<FavoriteIcon fontSize="small" color="primary" />} title="Jadwal Kontrol Berikutnya">
          <Grid container>
            <Grid item xs={12} sm={5}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  inputFormat="DD/MM/YYYY"
                  value={formValue.nextControlCheckup}
                  onChange={(v) => set('nextControlCheckup', v)}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </SectionCard>

      </TabPanel>
    </ModalC>
  );
};

CheckPetConditionPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default CheckPetConditionPetClinic;
