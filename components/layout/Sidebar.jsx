'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useWebsiteSettings, DEFAULT_SETTINGS } from '@/store/settingsStore';
import { usePWAInstall } from '@/components/ui/PWAInstallPrompt';
import { resolveAssetUrl } from '@/lib/assetUrl';

// ── Definisi menu dengan animasi unik tiap item ───────────────
const menus = [
  { href: '/pos',                       label: 'Kasir',        roles: ['admin','kasir'], anim: 'pop'    },
  { href: '/pos/history',               label: 'Riwayat POS',   roles: ['admin'],        anim: 'slide'  },
  { href: '/dashboard',                 label: 'Dashboard',    roles: ['admin'],          anim: 'bounce' },
  { href: '/products',                  label: 'Produk',       roles: ['admin'],          anim: 'flip'   },
  { href: '/stock',                     label: 'Stok',         roles: ['admin','kasir'],  anim: 'wave'   },
  { href: '/reports',                   label: 'Laporan',      roles: ['admin'],          anim: 'pulse'  },
  { href: '/users',                     label: 'Tim Kasir',    roles: ['admin'],          anim: 'shake'  },
  { href: '/admin/settings',            label: 'Pengaturan',   roles: ['admin'],          anim: 'spin'   },
  { href: '/admin/landing-page-settings', label: 'Landing Page', roles: ['admin'],        anim: 'bounce' },
];

// ── Unique SVG icons ──────────────────────────────────────────
function PosIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M7 8h2M11 8h6M7 12h2M11 12h4"/>
    </svg>
  );
}
function HistoryIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function DashIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function ProductIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function StockIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function ReportIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function UserIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function SettingsIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9 2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9 2.83-2.83"/>
    </svg>
  );
}
function LandingIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6"  y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function InstallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13M7 11l5 5 5-5M3 19h18"/>
    </svg>
  );
}

// Map href ke icon component
const iconMap = {
  '/pos':                         PosIcon,
  '/pos/history':                 HistoryIcon,
  '/dashboard':                   DashIcon,
  '/products':                    ProductIcon,
  '/stock':                       StockIcon,
  '/reports':                     ReportIcon,
  '/users':                       UserIcon,
  '/admin/settings':              SettingsIcon,
  '/admin/landing-page-settings': LandingIcon,
};

// ── Global keyframes (inject sekali) ─────────────────────────
const ICON_KEYFRAMES = `
  @keyframes iconPop    { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 70%{transform:scale(0.9)} 100%{transform:scale(1)} }
  @keyframes iconSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes iconBounce { 0%{transform:translateY(0)} 30%{transform:translateY(-5px)} 60%{transform:translateY(1px)} 100%{transform:translateY(0)} }
  @keyframes iconPulse  { 0%{transform:scale(1)} 50%{transform:scale(1.28)} 100%{transform:scale(1)} }
  @keyframes iconShake  { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-14deg)} 40%{transform:rotate(14deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
  @keyframes iconWave   { 0%{transform:scaleY(1)} 25%{transform:scaleY(0.65)} 50%{transform:scaleY(1.2)} 75%{transform:scaleY(0.85)} 100%{transform:scaleY(1)} }
  @keyframes iconFlip   { 0%{transform:rotateY(0)} 50%{transform:rotateY(180deg)} 100%{transform:rotateY(360deg)} }
  @keyframes iconSlide  { 0%{transform:translateX(-8px);opacity:0} 100%{transform:translateX(0);opacity:1} }
  @keyframes rippleBurst{ 0%{transform:scale(0.6);opacity:0.5} 100%{transform:scale(2.4);opacity:0} }
  @keyframes activeBarIn{ from{height:0;opacity:0} to{height:20px;opacity:1} }
  @keyframes sidebarLabelIn{ from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
`;

// ── NavItem Component ─────────────────────────────────────────
function NavItem({ menu, active, collapsed, primaryColor, onClick }) {
  const [animClass, setAnimClass] = useState('');
  const [showRipple, setShowRipple] = useState(false);

  const IconCmp = iconMap[menu.href];

  const handleClick = () => {
    if (!active) {
      setAnimClass(`icon-anim-${menu.anim}`);
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 500);
    }
    onClick?.();
  };

  return (
    <Link
      href={menu.href}
      title={collapsed ? menu.label : undefined}
      onClick={handleClick}
      className={`
        relative flex items-center rounded-xl transition-all duration-150 group overflow-visible
        ${collapsed ? 'justify-center p-[10px]' : 'gap-[10px] px-[10px] py-[9px]'}
        ${active ? 'text-white' : 'text-white/45 hover:text-white hover:bg-white/5'}
      `}
      style={active ? { backgroundColor: primaryColor } : {}}
    >
      {/* Active bar kiri */}
      {active && !collapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-white"
          style={{ height: 20, animation: 'activeBarIn 0.25s ease-out' }}
        />
      )}

      {/* Ripple burst saat klik */}
      {showRipple && (
        <span
          className="absolute inset-0 rounded-xl border pointer-events-none"
          style={{
            borderColor: primaryColor,
            animation: 'rippleBurst 0.5s ease-out forwards',
          }}
        />
      )}

      {/* Icon dengan animasi */}
      <span
        className={`flex-shrink-0 flex items-center justify-center ${animClass}`}
        style={{ width: 20, height: 20, transformOrigin: 'center' }}
        onAnimationEnd={() => setAnimClass('')}
      >
        <IconCmp active={active} />
      </span>

      {/* Label — slide in saat expand */}
      {!collapsed && (
        <span
          className="text-[12.5px] font-medium whitespace-nowrap overflow-hidden"
          style={{ animation: 'sidebarLabelIn 0.2s ease-out 0.05s both' }}
        >
          {menu.label}
        </span>
      )}

      {/* Tooltip collapsed */}
      {collapsed && (
        <span className="
          absolute left-full ml-3 px-2.5 py-1.5
          bg-[#1E1A14] border border-white/10 rounded-lg
          text-white text-xs font-medium whitespace-nowrap
          pointer-events-none opacity-0 group-hover:opacity-100
          transition-opacity duration-150 z-50
        ">
          {menu.label}
        </span>
      )}
    </Link>
  );
}

// ── Sidebar content (shared) ──────────────────────────────────
function SidebarContent({ collapsed, noLogo, pathname, user, settings, visible,
  logoSrc, initials, primaryColor, onLogout, showInstall, isInstalled }) {

  return (
    <>
      {/* Logo */}
      {!noLogo && (
        <div className={`border-b border-white/[0.07] ${collapsed ? 'px-2 py-4' : 'px-4 py-5'}`}>
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                <img src={logoSrc} alt="Logo"
                  className="w-full h-full object-contain p-1"
                  onError={e => { e.currentTarget.src = '/images/assets/logo.png'; }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                <img src={logoSrc} alt="Logo"
                  className="w-full h-full object-contain p-1"
                  onError={e => { e.currentTarget.src = '/images/assets/logo.png'; }}
                />
              </div>
              <div className="min-w-0" style={{ animation: 'sidebarLabelIn 0.2s ease-out' }}>
                <p className="text-white font-bold text-sm leading-tight truncate">
                  {settings?.store_name || 'Kebab POS'}
                </p>
                <p className="text-white/40 text-xs">Admin Dashboard</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto scrollbar-none ${collapsed ? 'px-2 py-3' : 'px-2 py-3'} space-y-0.5`}>
        {visible.map(m => (
          <NavItem
            key={m.href}
            menu={m}
            active={pathname === m.href}
            collapsed={collapsed}
            primaryColor={primaryColor}
          />
        ))}
      </nav>

      {/* Install PWA */}
      {!isInstalled && (
        <div className={collapsed ? 'px-2 pb-2' : 'px-2 pb-2'}>
          <button
            onClick={showInstall}
            title={collapsed ? 'Install Aplikasi' : undefined}
            className={`
              flex items-center rounded-xl transition-all duration-150 group relative
              bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20
              hover:border-orange-500/40 text-orange-400
              ${collapsed ? 'w-full justify-center p-[10px]' : 'w-full gap-2.5 px-3 py-2.5'}
            `}
          >
            <InstallIcon />
            {!collapsed && <span className="text-sm font-medium">Install Aplikasi</span>}
            {collapsed && (
              <span className="
                absolute left-full ml-3 px-2.5 py-1.5
                bg-[#1E1A14] border border-white/10 rounded-lg
                text-white text-xs font-medium whitespace-nowrap
                pointer-events-none opacity-0 group-hover:opacity-100
                transition-opacity z-50
              ">
                Install Aplikasi
              </span>
            )}
          </button>
        </div>
      )}

      {/* User + logout */}
      <div className={`border-t border-white/[0.07] ${collapsed ? 'px-2 py-3' : 'px-2 py-3'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {initials}
            </div>
            <button
              onClick={onLogout}
              title="Keluar"
              className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-xl"
            >
              <LogoutIcon />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2 px-2 py-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0" style={{ animation: 'sidebarLabelIn 0.2s ease-out 0.05s both' }}>
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-white/40 text-xs capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="
                w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                text-white/40 hover:text-red-400 hover:bg-red-400/10
                transition-all duration-150
              "
            >
              <LogoutIcon />
              <span>Keluar</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ── Main Sidebar Component ────────────────────────────────────
export default function Sidebar() {
  const pathname            = usePathname();
  const { user, logout }    = useAuthStore();
  const router              = useRouter();
  const { settings, loadSettings } = useWebsiteSettings();

  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [collapsed,     setCollapsed]     = useState(false); // desktop
  const [tabletCollapsed, setTabletCollapsed] = useState(true);
  const [isMobile,      setIsMobile]      = useState(false);
  const [isTablet,      setIsTablet]      = useState(false);
  const [hydrated,      setHydrated]      = useState(false);

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('sb-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'sb-keyframes';
    style.textContent = ICON_KEYFRAMES;
    document.head.appendChild(style);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    check();
    const t = setTimeout(() => setHydrated(true), 0);
    window.addEventListener('resize', check);
    return () => { clearTimeout(t); window.removeEventListener('resize', check); };
  }, []);

  useEffect(() => {
    setTimeout(() => setMobileOpen(false), 0);
  }, [pathname]);

  const handleLogout = () => { logout(); router.replace('/login'); };
  const visible      = menus.filter(m => m.roles.includes(user?.role));
  const logoSrc      = resolveAssetUrl(settings?.logo_url, '/images/assets/logo.png');
  const primaryColor = settings?.primary_color || DEFAULT_SETTINGS.primary_color;
  const initials     = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const { show: showInstall } = usePWAInstall();
  const [isInstalled] = useState(() =>
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)
  );

  const sharedProps = { pathname, user, settings, visible, logoSrc, initials,
    primaryColor, onLogout: handleLogout, showInstall, isInstalled };

  // ── MOBILE ──────────────────────────────────────────────────
  if (hydrated && isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4"
          style={{ backgroundColor: '#13100A', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setMobileOpen(true)}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/10">
              <img src={logoSrc} alt="Logo" className="w-full h-full object-contain p-0.5"
                onError={e => { e.currentTarget.src = '/images/assets/logo.png'; }} />
            </div>
            <span className="text-white font-bold text-sm">{settings?.store_name || 'Kebab POS'}</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: primaryColor }}>
            {initials}
          </div>
        </div>
        <div className="h-14 shrink-0" />

        {mobileOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
        )}

        <div className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `} style={{ backgroundColor: '#13100A' }}>
          <div className="flex items-center justify-between px-4 py-4"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10">
                <img src={logoSrc} alt="Logo" className="w-full h-full object-contain p-1"
                  onError={e => { e.currentTarget.src = '/images/assets/logo.png'; }} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{settings?.store_name || 'Kebab POS'}</p>
                <p className="text-white/40 text-xs">Admin Dashboard</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)}
              className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
              <CloseIcon />
            </button>
          </div>
          <SidebarContent collapsed={false} noLogo={true} {...sharedProps} />
        </div>
      </>
    );
  }

  // ── TABLET ──────────────────────────────────────────────────
  if (hydrated && isTablet) {
    return (
      <>
        {!tabletCollapsed && (
          <div className="fixed inset-0 bg-black/40 z-30"
            onClick={() => setTabletCollapsed(true)} />
        )}
        <aside
          className="relative z-40 flex flex-col shrink-0 transition-all duration-300 ease-out"
          style={{
            backgroundColor: '#13100A',
            borderRight: '0.5px solid rgba(255,255,255,0.07)',
            width: tabletCollapsed ? 64 : 220,
          }}
        >
          {/* Toggle button */}
          <button
            onClick={() => setTabletCollapsed(v => !v)}
            className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full
              flex items-center justify-center text-white/60 hover:text-white
              transition-all"
            style={{ background: '#1E1A14', border: '0.5px solid rgba(255,255,255,0.12)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d={tabletCollapsed ? 'M3 2L7 5L3 8' : 'M7 2L3 5L7 8'}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
          <SidebarContent collapsed={tabletCollapsed} noLogo={false} {...sharedProps} />
        </aside>
      </>
    );
  }

  // ── DESKTOP ─────────────────────────────────────────────────
  return (
    <aside
      className="flex flex-col shrink-0 transition-all duration-300 ease-out"
      style={{
        backgroundColor: '#13100A',
        borderRight: '0.5px solid rgba(255,255,255,0.07)',
        width: collapsed ? 64 : 220,
        position: 'relative',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full
          flex items-center justify-center text-white/60 hover:text-white transition-all"
        style={{ background: '#1E1A14', border: '0.5px solid rgba(255,255,255,0.12)' }}
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}
        >
          <path d="M7 2L3 5L7 8" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <SidebarContent collapsed={collapsed} noLogo={false} {...sharedProps} />
    </aside>
  );
}