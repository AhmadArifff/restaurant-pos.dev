// 'use client';
// import Sidebar from './Sidebar';
// import AuthGuard from '@/components/ui/AuthGuard';

// export default function AdminLayout({ children, adminOnly = true }) {
//   return (
//     <AuthGuard adminOnly={adminOnly}>
//       <div className="flex h-screen bg-slate-950 overflow-hidden">
//         <Sidebar />
//         <main className="flex-1 overflow-y-auto">
//           {/* Padding atas khusus mobile (karena topbar fixed) */}
//           <div className="p-4 md:p-6">
//             {children}
//           </div>
//         </main>
//       </div>
//     </AuthGuard>
//   );
// }
'use client';
import Sidebar from './Sidebar';
import AuthGuard from '@/components/ui/AuthGuard';
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt';

export default function AdminLayout({ children, noPadding = false }) {
  return (
    <AuthGuard>
      <div className="admin-theme admin-shell flex h-screen overflow-hidden">
        <Sidebar />
        <main className={`admin-main flex-1 overflow-hidden ${noPadding ? '' : 'overflow-y-auto p-4 sm:p-6'}`}>
          {children}
          <PWAInstallPrompt />
        </main>
      </div>
    </AuthGuard>
  );
}
