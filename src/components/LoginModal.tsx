import React, { useState } from 'react';
import { X, Key, UserCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { User } from '../types/surat';

interface LoginModalProps {
  isOpen: boolean;
  usersList: User[];
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  usersList,
  onClose,
  onLoginSuccess
}) => {
  const [selectedUsername, setSelectedUsername] = useState('admin.pkmk');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.username === selectedUsername);
    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      setErrorMsg('Pengguna tidak ditemukan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Masuk Portal Multi-User</h3>
              <p className="text-xs text-amber-400 font-medium">PKMK FK-KMK Universitas Gadjah Mada</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Silakan pilih profil pengguna multi-user di bawah ini untuk menguji hak akses sesuai bidang/divisi masing-masing:
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Akun Multi-User (Demo Simulation):
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {usersList.map((u) => (
                  <label
                    key={u.id}
                    onClick={() => setSelectedUsername(u.username)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedUsername === u.username
                        ? 'bg-amber-50 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                        alt={u.name}
                        className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.roleName} &bull; <span className="font-semibold text-amber-700">{u.divisiCode}</span></div>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="username"
                      value={u.username}
                      checked={selectedUsername === u.username}
                      onChange={() => setSelectedUsername(u.username)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk Sebagai {selectedUsername}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Akses multi-user terhubung dengan server backend untuk pencatatan jejak audit (audit log).
        </div>

      </div>
    </div>
  );
};
