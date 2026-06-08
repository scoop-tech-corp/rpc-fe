import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Divider, Grid, IconButton, Stack, Tooltip, Typography, CircularProgress } from '@mui/material';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { getDisplayData } from './service';

// ── Theme tokens ──────────────────────────────────────────────────────────────

const THEMES = {
  dark: {
    page:          '#0d1117',
    card:          '#161b22',
    cardAlt:       '#1c2128',
    border:        '#30363d',
    divider:       '#30363d',
    textPrimary:   '#e6edf3',
    textSecondary: '#8b949e',
    textMuted:     '#484f58',
    header:        '#58a6ff',
    green:         '#3fb950',
    yellow:        '#d29922',
    blue:          '#58a6ff',
    toggleTip:     'Ganti ke Light Mode',
    inServiceText: '#e6edf3',
    inServiceSub:  '#8b949e',
  },
  light: {
    page:          '#f0f4f8',
    card:          '#ffffff',
    cardAlt:       '#f8fafc',
    border:        '#d0d7de',
    divider:       '#d0d7de',
    textPrimary:   '#1f2328',
    textSecondary: '#636c76',
    textMuted:     '#9a9fa7',
    header:        '#0969da',
    green:         '#1a7f37',
    yellow:        '#9a6700',
    blue:          '#0969da',
    toggleTip:     'Ganti ke Dark Mode',
    inServiceText: '#1f2328',
    inServiceSub:  '#636c76',
  }
};

const SERVICE_COLOR = {
  'Pet Clinic': '#1565C0',
  'Pet Hotel':  '#C62828',
  'Pet Salon':  '#D97706',
  'Breeding':   '#2E7D32'
};

const SERVICE_BG_DARK = {
  'Pet Clinic': '#0d2340',
  'Pet Hotel':  '#3b0d0d',
  'Pet Salon':  '#3b2800',
  'Breeding':   '#0d2e14'
};

const SERVICE_BG_LIGHT = {
  'Pet Clinic': '#dbeafe',
  'Pet Hotel':  '#fee2e2',
  'Pet Salon':  '#fef3c7',
  'Breeding':   '#dcfce7'
};

// ── CSS keyframe animations (injected once) ───────────────────────────────────

const ANIM_STYLE_ID = 'queue-display-animations';

const injectAnimations = () => {
  if (document.getElementById(ANIM_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = ANIM_STYLE_ID;
  style.textContent = `
    @keyframes queueFlash {
      0%   { box-shadow: 0 0 0 0 rgba(255, 200, 0, 0.9); transform: scale(1); }
      20%  { box-shadow: 0 0 24px 12px rgba(255, 200, 0, 0.7); transform: scale(1.02); }
      50%  { box-shadow: 0 0 8px 4px rgba(255, 200, 0, 0.4); transform: scale(1); }
      70%  { box-shadow: 0 0 20px 10px rgba(255, 200, 0, 0.6); transform: scale(1.01); }
      100% { box-shadow: 0 0 0 0 rgba(255, 200, 0, 0); transform: scale(1); }
    }
    @keyframes queuePulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.6; }
    }
    .queue-newly-called {
      animation: queueFlash 1.2s ease-in-out 3;
    }
    .queue-number-blink {
      animation: queuePulse 0.6s ease-in-out 6;
    }
  `;
  document.head.appendChild(style);
};

// ── Web Audio: generate notification beep ────────────────────────────────────

const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const playTone = (freq, startTime, duration, gainVal) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // 3-tone chime: C5 → E5 → G5
    const now = ctx.currentTime;
    playTone(523.25, now,        0.18, 0.4); // C5
    playTone(659.25, now + 0.22, 0.18, 0.4); // E5
    playTone(783.99, now + 0.44, 0.30, 0.5); // G5
  } catch (_) {
    // Silently ignore if audio not supported
  }
};

// ── Text-to-Speech ────────────────────────────────────────────────────────────

const speakQueueNumbers = (queues) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  queues.forEach((q, idx) => {
    const text = `Nomor antrian ${q.queueNumber.split('').join(' ')}, ${q.customerName?.trim() || ''}, silakan menuju ruang ${q.serviceType}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = 'id-ID';
    utterance.rate  = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Stagger if multiple queues called at once
    if (idx > 0) {
      setTimeout(() => window.speechSynthesis.speak(utterance), idx * 4500);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  });
};

// ── Main Component ────────────────────────────────────────────────────────────

const QueueDisplay = () => {
  const [searchParams] = useSearchParams();
  const token      = searchParams.get('token');
  const locationId = searchParams.get('locationId');

  const [data,        setData]        = useState(null);
  const [error,       setError]       = useState(null);
  const [lastUpdate,  setLastUpdate]  = useState(null);
  const [themeKey,    setThemeKey]    = useState(() => localStorage.getItem('queueDisplayTheme') || 'dark');
  const [newlyCalledIds, setNewlyCalledIds] = useState(new Set());

  const intervalRef    = useRef(null);
  const prevCalledIds  = useRef(new Set());

  const t         = THEMES[themeKey];
  const isDark    = themeKey === 'dark';
  const serviceBg = isDark ? SERVICE_BG_DARK : SERVICE_BG_LIGHT;

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setThemeKey(next);
    localStorage.setItem('queueDisplayTheme', next);
  };

  const fetchDisplay = useCallback(async () => {
    try {
      const res = await getDisplayData(token, locationId);
      const newData = res.data;

      const currentCalledIds = new Set((newData.called || []).map((q) => q.id));

      // Detect newly called: in current but not in previous
      const brandNew = [...currentCalledIds].filter((id) => !prevCalledIds.current.has(id));

      if (brandNew.length > 0) {
        const brandNewQueues = (newData.called || []).filter((q) => brandNew.includes(q.id));

        // 1. Sound
        playNotificationSound();

        // 2. TTS (slight delay so sound plays first)
        setTimeout(() => speakQueueNumbers(brandNewQueues), 600);

        // 3. Animation: mark as newly called
        setNewlyCalledIds(new Set(brandNew));

        // Clear animation after 4s (3 flash cycles × 1.2s + buffer)
        setTimeout(() => setNewlyCalledIds(new Set()), 4000);
      }

      prevCalledIds.current = currentCalledIds;
      setData(newData);
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));
      setError(null);
    } catch (err) {
      if (err?.response?.status === 401) setError('unauthorized');
      else setError('fetch_error');
    }
  }, [token, locationId]);

  useEffect(() => {
    injectAnimations();
    if (!token) { setError('unauthorized'); return; }
    fetchDisplay();
    intervalRef.current = setInterval(fetchDisplay, 5000);
    return () => clearInterval(intervalRef.current);
  }, [token, locationId, fetchDisplay]);

  // ── Error / Loading ───────────────────────────────────────────────────────

  if (error === 'unauthorized') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: t.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>🔒 Akses Ditolak</Typography>
          <Typography sx={{ color: t.textSecondary }}>Token tidak valid atau tidak ditemukan.</Typography>
        </Stack>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: t.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} sx={{ color: t.blue }} />
      </Box>
    );
  }

  const { inService = [], called = [], waiting = [] } = data;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: t.page, color: t.textPrimary, p: 3, transition: 'background-color 0.3s, color 0.3s' }}>

      {/* Header */}
      <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight={800} letterSpacing={3} sx={{ color: t.header }}>
          🐾 ANTRIAN RADHIYAN PET & CARE
        </Typography>
        <Typography variant="body2" sx={{ color: t.textSecondary, mt: 0.5 }}>
          Diperbarui: {lastUpdate}
        </Typography>
        <Tooltip title={t.toggleTip} arrow>
          <IconButton
            onClick={toggleTheme}
            sx={{
              position: 'absolute', top: 0, right: 0,
              color: t.yellow,
              bgcolor: isDark ? '#2d2d00' : '#fef9c3',
              border: `1px solid ${t.border}`,
              '&:hover': { bgcolor: isDark ? '#3d3d00' : '#fef08a' }
            }}
          >
            {isDark ? <BulbOutlined style={{ fontSize: 20 }} /> : <BulbFilled style={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>

        {/* ── Sedang Dilayani ── */}
        <Grid item xs={12} md={7}>
          <Box sx={{ bgcolor: t.card, border: `1px solid ${t.border}`, borderRadius: 3, p: 3, minHeight: 320, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: t.green, mb: 2 }}>✅ SEDANG DILAYANI</Typography>
            <Divider sx={{ borderColor: t.divider, mb: 3 }} />

            {inService.length === 0 ? (
              <Typography sx={{ color: t.textSecondary, textAlign: 'center', mt: 6 }}>Belum ada yang sedang dilayani</Typography>
            ) : (
              <Stack spacing={2}>
                {inService.map((q) => (
                  <Box
                    key={q.id}
                    sx={{
                      bgcolor: serviceBg[q.serviceType] || t.cardAlt,
                      border: `2px solid ${SERVICE_COLOR[q.serviceType] || t.blue}`,
                      borderRadius: 2, p: 2.5,
                      display: 'flex', alignItems: 'center', gap: 3,
                      transition: 'background-color 0.3s'
                    }}
                  >
                    <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, color: SERVICE_COLOR[q.serviceType] || t.blue, minWidth: 130, textAlign: 'center', lineHeight: 1 }}>
                      {q.queueNumber}
                    </Typography>
                    <Box>
                      <Typography sx={{ color: t.inServiceText, fontWeight: 700, fontSize: '1.1rem' }}>{q.customerName?.trim()}</Typography>
                      <Typography sx={{ color: t.inServiceSub, fontSize: '0.9rem' }}>🐶 {q.petName}&nbsp;|&nbsp;{q.serviceType}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Grid>

        {/* ── Dipanggil + Menunggu ── */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>

            {/* Dipanggil */}
            <Box sx={{ bgcolor: t.card, border: `1px solid ${t.border}`, borderRadius: 3, p: 3, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: t.yellow, mb: 2 }}>📣 DIPANGGIL</Typography>
              <Divider sx={{ borderColor: t.divider, mb: 2 }} />

              {called.length === 0 ? (
                <Typography sx={{ color: t.textSecondary, fontSize: '0.9rem' }}>Tidak ada</Typography>
              ) : (
                <Stack spacing={1}>
                  {called.map((q) => {
                    const isNew = newlyCalledIds.has(q.id);
                    return (
                      <Box
                        key={q.id}
                        className={isNew ? 'queue-newly-called' : ''}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 2,
                          bgcolor: isNew ? (isDark ? '#3d2e00' : '#fef9c3') : t.cardAlt,
                          borderRadius: 1.5, px: 2, py: 1.5,
                          border: `1px solid ${isNew ? '#f59e0b' : t.border}`,
                          transition: 'background-color 0.3s, border-color 0.3s'
                        }}
                      >
                        <Typography
                          className={isNew ? 'queue-number-blink' : ''}
                          sx={{ fontWeight: 800, fontSize: '1.6rem', color: isNew ? '#f59e0b' : t.yellow, minWidth: 80 }}
                        >
                          {q.queueNumber}
                        </Typography>
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: t.textPrimary }}>{q.customerName?.trim()}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: t.textSecondary }}>{q.petName} | {q.serviceType}</Typography>
                        </Box>
                        {isNew && (
                          <Typography sx={{ ml: 'auto', fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>
                            ← BARU DIPANGGIL
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Antrian Berikutnya */}
            <Box sx={{ bgcolor: t.card, border: `1px solid ${t.border}`, borderRadius: 3, p: 3, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: t.blue, mb: 2 }}>⏳ ANTRIAN BERIKUTNYA</Typography>
              <Divider sx={{ borderColor: t.divider, mb: 2 }} />

              {waiting.length === 0 ? (
                <Typography sx={{ color: t.textSecondary, fontSize: '0.9rem' }}>Tidak ada antrian</Typography>
              ) : (
                <Stack spacing={1}>
                  {waiting.map((q, idx) => (
                    <Box
                      key={q.id}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        bgcolor: t.cardAlt, borderRadius: 1.5, px: 2, py: 1,
                        border: `1px solid ${t.border}`,
                        opacity: idx === 0 ? 1 : Math.max(0.4, 0.9 - idx * 0.15)
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: t.blue, minWidth: 80 }}>{q.queueNumber}</Typography>
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: t.textPrimary }}>{q.customerName?.trim()}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: t.textSecondary }}>{q.petName} | {q.serviceType}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

          </Stack>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 5, color: t.textMuted, fontSize: '0.8rem' }}>
        Refresh otomatis setiap 5 detik &nbsp;•&nbsp; Radhiyan Pet &amp; Care
      </Box>

    </Box>
  );
};

export default QueueDisplay;
