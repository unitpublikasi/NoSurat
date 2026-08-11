import React from 'react';
import { ShieldCheck, UserCheck, LogOut, Key, Search, FileText, Sparkles, Building2 } from 'lucide-react';
import { User } from '../types/surat';

interface NavbarProps {
  activeTab: 'public' | 'backend';
  setActiveTab: (tab: 'public' | 'backend') => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenLoginModal
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('public')}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-inner border border-amber-300/30">
              UGM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Sistem Penomoran Surat</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  PKMK
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                FK-KMK Universitas Gadjah Mada
              </p>
            </div>
          </div>

          {/* Navigation View Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'public'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Halaman Depan (Publik)</span>
            </button>

            <button
              onClick={() => setActiveTab('backend')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'backend'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Portal Backend (Multi-User)</span>
              {currentUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
              )}
            </button>
          </div>

          {/* User Auth Action */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="hidden lg:block text-right">
                  <div className="text-sm font-semibold text-slate-100 line-clamp-1">{currentUser.name}</div>
                  <div className="text-xs text-amber-400 font-medium">{currentUser.roleName}</div>
                </div>
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full border-2 border-amber-500/80 object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center border border-amber-500/50">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title="Keluar dari Portal"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Masuk Staf / Admin</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Nav Switcher */}
      <div className="flex md:hidden border-t border-slate-800 bg-slate-950/90 p-2">
        <button
          onClick={() => setActiveTab('public')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg ${
            activeTab === 'public' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Halaman Depan</span>
        </button>
        <button
          onClick={() => setActiveTab('backend')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg ${
            activeTab === 'backend' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Portal Backend</span>
        </button>
      </div>
    </header>
  );
};
