import React from 'react';
import { Building2, Mail, Phone, Globe, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
                UGM
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">PKMK FK-KMK UGM</h4>
                <p className="text-xs text-amber-400 font-medium">Pusat Kebijakan dan Manajemen Kesehatan</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Sistem Informasi Penomoran Surat Resmi dan Pangkalan Data Arsip Kebijakan & Manajemen Kesehatan Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan UGM.
            </p>
          </div>

          {/* Col 2: Institution Contact */}
          <div className="space-y-2 text-xs text-slate-300">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] text-amber-400 mb-2">
              Alamat & Kontak Resmi
            </h5>
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Gedung IKM FK-KMK UGM, Jl. Farmako Sekip Utara, Yogyakarta 55281</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span>(0274) 549425 / 587552</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span>pkmk@ugm.ac.id</span>
            </div>
          </div>

          {/* Col 3: System Verification Note */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs">
            <div className="flex items-center gap-2 font-bold text-white mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pangkalan Data Terverifikasi</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Seluruh penomoran surat yang diterbitkan secara resmi melalui portal backend tercatat secara otomatis untuk transparansi dan verifikasi publik.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            &copy; {new Date().getFullYear()} PKMK FK-KMK UGM. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors">Universitas Gadjah Mada</span>
            <span>&bull;</span>
            <span className="hover:text-slate-300 transition-colors">FK-KMK UGM</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
