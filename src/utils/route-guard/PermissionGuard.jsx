import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import { detectUserPrivilage } from 'service/service-global';

/**
 * PermissionGuard — cek hak akses user ke route saat ini.
 *
 * Cek dilakukan SYNCHRONOUS di render phase (bukan useEffect),
 * sehingga tidak ada flash konten sebelum redirect ke /403.
 *
 * Logic:
 *  - Route ada di profileMenu / settingMenu → langsung render (bypass)
 *  - accessType === 3 (None)  → redirect /403
 *  - accessType === null      → route tidak ada di masterMenu user → redirect /403
 *  - accessType 1, 2, 4       → render children
 *
 * Catatan: profileMenu dan settingMenu adalah menu khusus (profil user &
 * konfigurasi sistem) yang tidak masuk ke sistem accessControl masterMenu,
 * sehingga harus di-bypass secara eksplisit.
 */

/** Prefix path yang selalu boleh diakses tanpa cek permission */
const STATIC_BYPASS = ['/403', '/sample-page'];

/**
 * Ekstrak array URL dari menu list (profileMenu / settingMenu).
 * Format menu dari BE: { items: [{ url, title, icon }, ...] }
 */
const extractMenuUrls = (menuObj) => {
  if (!menuObj?.items) return [];
  return menuObj.items.map((item) => item.url).filter(Boolean);
};

const PermissionGuard = ({ children }) => {
  const { user }      = useAuth();
  const { pathname }  = useLocation();

  // ── 1. Static bypass (403, sample-page, dll) ─────────────────────────────
  if (STATIC_BYPASS.some((p) => pathname.startsWith(p))) {
    return children;
  }

  // ── 2. Bypass untuk profileMenu (profile, absent, salary) ────────────────
  const profileUrls = extractMenuUrls(user?.profileMenu);
  if (profileUrls.some((url) => pathname.startsWith(url))) {
    return children;
  }

  // ── 3. Bypass untuk settingMenu (menu management pages) ──────────────────
  const settingUrls = extractMenuUrls(user?.settingMenu);
  if (settingUrls.some((url) => pathname.startsWith(url))) {
    return children;
  }

  // ── 4. Cek akses dari masterMenu ─────────────────────────────────────────
  const accessType = detectUserPrivilage(user?.extractMenu?.masterMenu);

  if (accessType === 3 || accessType === null) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

PermissionGuard.propTypes = {
  children: PropTypes.node
};

export default PermissionGuard;
