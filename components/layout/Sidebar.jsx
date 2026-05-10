'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useWebsiteSettings } from '@/store/settingsStore';
import { usePWAInstall } from '@/components/ui/PWAInstallPrompt';
import { resolveAssetUrl } from '@/lib/assetUrl';

const menus = [
  { href: '/pos',       icon: PosIcon,      label: 'Kasir',     roles: ['admin','kasir'] },
  { href: '/dashboard', icon: DashIcon,     label: 'Dashboard', roles: ['admin'] },
  { href: '/products',  icon: ProductIcon,  label: 'Produk',    roles: ['admin'] },
  { href: '/stock',     icon: StockIcon,    label: 'Stok',      roles: ['admin','kasir'] },
  { href: '/reports',   icon: ReportIcon,   label: 'Laporan',   roles: ['admin'] },
  { href: '/users',     icon: UserIcon,     label: 'Tim Kasir', roles: ['admin'] },
  { href: '/admin/settings', icon: SettingsIcon, label: 'Pengaturan', roles: ['admin'] },
];

// ── SVG Icons (no emoji) ──────────────────────────────────────
function PosIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M7 8h2M7 12h2M11 8h6M11 12h6"/>
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
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>
  );
}
function SettingsIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
    </svg>
  );
}

// ── Sidebar utama ─────────────────────────────────────────────
export default function Sidebar() {
  const pathname        = usePathname();
  const { user, logout } = useAuthStore();
  const router          = useRouter();
  const { settings, loadSettings } = useWebsiteSettings();

  // State untuk mobile drawer & tablet collapse
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [tabletExpand, setTabletExpand] = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);
  const [isTablet,     setIsTablet]     = useState(false);
  const [hydrated,     setHydrated]     = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Hydrate component — deteksi ukuran window
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    check();
    setHydrated(true);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Tutup drawer saat navigasi
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => { logout(); router.replace('/login'); };
  const visible      = menus.filter(m => m.roles.includes(user?.role));
  const logoSrc = resolveAssetUrl(settings?.logo_url, '/images/assets/logo.png');

  // Nama singkat user
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  
  // PWA Install
  const { show: showInstall } = usePWAInstall();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInstalled(
        window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true
      );
    }
  }, []);

  // ── Konten sidebar (dipakai di semua breakpoint) ──
  const SidebarContent = ({ collapsed = false, noLogo = false }) => (
    <>
      {/* Logo area — skip kalau noLogo */}
      {!noLogo && (
        <div className={`border-b border-white/10 ${collapsed ? 'px-2 py-4' : 'px-4 py-5'}`}>
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                <img src={logoSrc} alt="Logo"
                  className="w-full h-full object-contain p-1"
                  onError={e => { e.currentTarget.src = '/images/branding/default-logo.svg'; }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                <img src={logoSrc} alt="Logo"
                  className="w-full h-full object-contain p-1"
                  onError={e => { e.currentTarget.src = '/images/branding/default-logo.svg'; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">
                  {settings?.store_name || 'Kebab POS'}
                </p>
                <p className="text-white/40 text-xs">Admin Dashboard</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav — sama persis, tidak berubah */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-3' : 'px-3 py-4'} space-y-1`}>
        {visible.map(m => {
          const active  = pathname === m.href;
          const IconCmp = m.icon;
          const primaryColor = settings?.primary_color || '#f97316';
          return (
            <Link key={m.href} href={m.href}
              title={collapsed ? m.label : undefined}
              className={`
                flex items-center rounded-xl transition-all duration-150 group relative
                ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                ${active
                  ? 'text-white shadow-lg'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
                }
              `}
              style={active ? { backgroundColor: primaryColor, boxShadow: `0 0 12px ${primaryColor}40` } : {}}
            >
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
              )}
              <IconCmp active={active} />
              {!collapsed && <span className="text-sm font-medium">{m.label}</span>}
              {collapsed && (
                <span className="
                  absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs
                  font-medium rounded-lg whitespace-nowrap pointer-events-none
                  opacity-0 group-hover:opacity-100 transition-opacity z-50
                  border border-white/10
                ">
                  {m.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {/* Tombol Install PWA — sembunyikan jika sudah install */}
      {!isInstalled && !collapsed && (
        <div className="px-3 pb-2">
          <button
            onClick={showInstall}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
              bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20
              hover:border-orange-500/40 text-orange-400 text-sm font-medium
              transition-all group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="shrink-0">
              <path d="M12 3v13M7 11l5 5 5-5M3 19h18"/>
            </svg>
            <span>Install Aplikasi</span>
          </button>
        </div>
      )}

      {/* Collapsed mode — icon only */}
      {!isInstalled && collapsed && (
        <div className="px-2 pb-2">
          <button
            onClick={showInstall}
            title="Install Aplikasi"
            className="w-full flex items-center justify-center p-2.5 rounded-xl
              bg-orange-500/10 hover:bg-orange-500/20 text-orange-400
              transition-all relative group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M12 3v13M7 11l5 5 5-5M3 19h18"/>
            </svg>
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900
              text-white text-xs font-medium rounded-lg whitespace-nowrap
              pointer-events-none opacity-0 group-hover:opacity-100
              transition-opacity z-50 border border-white/10">
              Install Aplikasi
            </span>
          </button>
        </div>
      )}

      {/* User + logout — sama persis */}
      <div className={`border-t border-white/10 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center
              text-white text-xs font-bold"
              style={{ backgroundColor: settings?.primary_color || '#f97316' }}>
              {initials}
            </div>
            <button onClick={handleLogout}
              title="Keluar"
              className="p-2 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
              <LogoutIcon />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center
                text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: settings?.primary_color || '#f97316' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-white/40 text-xs capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="
                w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-white/40 hover:text-red-400 hover:bg-red-400/10
                transition-all duration-150 group
              ">
              <LogoutIcon />
              <span>Keluar</span>
            </button>
          </>
        )}
      </div>
    </>
  );

  // ── MOBILE: Hamburger + Drawer ────────────────────────────────
  if (hydrated && isMobile) {
    return (
      <>
        {/* Topbar mobile */}
        <div className="fixed top-0 left-0 right-0 z-40 h-14
          bg-slate-900/95 backdrop-blur border-b border-white/10
          flex items-center justify-between px-4">
          <button onClick={() => setMobileOpen(true)}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/10">
              <img src={logoSrc} alt="Logo"
                className="w-full h-full object-contain p-0.5"
                onError={e => { e.currentTarget.src = '/images/assets/logo.png'; }} />
            </div>
            <span className="text-white font-bold text-sm">{settings?.store_name || 'Kebab POS'}</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center
            text-white text-xs font-bold"
            style={{ backgroundColor: settings?.primary_color || '#f97316' }}>
            {initials}
          </div>
        </div>

        {/* Spacer buat konten tidak ketutupan topbar */}
        <div className="h-14 shrink-0" />

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <div className={`
          fixed top-0 left-0 bottom-0 z-50 w-72
          bg-slate-900 flex flex-col
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Drawer header — logo ada di sini */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10">
                <img src={logoSrc} alt="Logo"
                  className="w-full h-full object-contain p-1"
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

          {/* Nav — tanpa logo (noLogo=true) */}
          <SidebarContent collapsed={false} noLogo />
        </div>
      </>
    );
  }

  // ── TABLET: Collapsed icon sidebar + toggle expand ────────────
  if (hydrated && isTablet) {
    return (
      <>
        {/* Overlay saat expand */}
        {tabletExpand && (
          <div
            className="fixed inset-0 bg-black/40 z-30"
            onClick={() => setTabletExpand(false)}
          />
        )}

        <aside className={`
          relative z-40 bg-slate-900 flex flex-col shrink-0
          border-r border-white/10
          transition-all duration-300 ease-out
          ${tabletExpand ? 'w-56' : 'w-16'}
        `}>
          {/* Toggle button */}
          <button
            onClick={() => setTabletExpand(v => !v)}
            className="absolute -right-3 top-6 z-10
              w-6 h-6 bg-slate-800 border border-white/10 rounded-full
              flex items-center justify-center text-white/60 hover:text-white
              hover:bg-slate-700 transition-all shadow-lg"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d={tabletExpand ? 'M7 2L3 5L7 8' : 'M3 2L7 5L3 8'}
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>

          <SidebarContent collapsed={!tabletExpand} />
        </aside>
      </>
    );
  }

  // ── DESKTOP: Full sidebar ─────────────────────────────────────
  return (
    <aside className="w-56 bg-slate-900 flex flex-col border-r border-white/10 shrink-0">
      <SidebarContent collapsed={false} />
    </aside>
  );
}
