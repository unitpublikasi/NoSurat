import React, { useState } from 'react';
import { X, ShieldCheck, Printer, Copy, Check, QrCode, Calendar, Building2, User, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SuratItem } from '../types/surat';

interface LetterDetailModalProps {
  surat: SuratItem | null;
  onClose: () => void;
}

export const LetterDetailModal: React.FC<LetterDetailModalProps> = ({ surat, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!surat) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(surat.nomorSurat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
              UGM
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Lembar Verifikasi Nomor Surat</h3>
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

        {/* Printable Verification Sheet Content */}
        <div className="p-6 sm:p-8 space-y-6 print:p-0">
          
          {/* Institutional Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="text-xs font-bold text-slate-500 tracking-widest uppercase">
              UNIVERSITAS GADJAH MADA
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              FAKULTAS KEDOKTERAN, KESEHATAN MASYARAKAT, DAN KEPERAWATAN
            </div>
            <div className="text-xs font-bold text-amber-700 mt-0.5">
              PUSAT KEBIJAKAN DAN MANAJEMEN KESEHATAN (PKMK)
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Gedung IKM FK-KMK UGM, Jl. Farmako Sekip Utara Yogyakarta 55281 | Telp: (0274) 549425
            </div>
          </div>

          {/* Verification Status Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  STATUS KEASLIAN RESMI
                </div>
                <div className="text-sm font-black text-emerald-950">
                  {surat.status === 'Aktif' ? 'SURAT TERDAFTAR & SAH (VALID)' : `STATUS: ${surat.status.toUpperCase()}`}
                </div>
                <div className="text-[11px] text-emerald-800">
                  Terverifikasi dalam Sistem Penomoran Surat PKMK FK-KMK UGM
                </div>
              </div>
            </div>

            {/* QR Code Simulation */}
            <div className="p-2 bg-white rounded-xl border border-emerald-200 shadow-sm text-center shrink-0">
              <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-amber-400 mx-auto">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="text-[9px] font-mono text-slate-600 font-bold mt-1">
                {surat.qrCodeHash.substring(0, 14)}...
              </div>
            </div>
          </div>

          {/* Official Letter Details Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-200 gap-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Nomor Surat Resmi:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-300">
                  {surat.nomorSurat}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div className="py-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Perihal / Subject:</span>
              <p className="text-sm font-bold text-slate-900 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                {surat.perihal}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Jenis Surat:</span>
                <span className="font-bold text-slate-800">{surat.jenisSuratName} ({surat.jenisSuratCode})</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Divisi Penanggung Jawab:</span>
                <span className="font-bold text-slate-800">{surat.divisiName} ({surat.divisiCode})</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Ditujukan Kepada:</span>
                <span className="font-bold text-slate-800">{surat.ditujukanKepada}</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Tanggal Diterbitkan:</span>
                <span className="font-bold text-slate-800">{surat.tglSurat}</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Pengaju / Penanggungjawab:</span>
                <span className="font-bold text-slate-800">{surat.pengajuName}</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Petugas Penerbit:</span>
                <span className="font-bold text-slate-800">{surat.pembuatUserName}</span>
              </div>
            </div>

            {surat.lampiranInfo && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Keterangan Lampiran:</span>
                <span className="font-semibold text-slate-800">{surat.lampiranInfo}</span>
              </div>
            )}

            {surat.catatan && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Catatan Tambahan:</span>
                <span className="italic text-slate-600">{surat.catatan}</span>
              </div>
            )}

          </div>

          <div className="text-center text-[10px] text-slate-400 leading-relaxed italic border-t border-slate-100 pt-3">
            Halaman ini merupakan hasil verifikasi elektronik resmi pangkalan data penomoran surat PKMK FK-KMK UGM. Validitas nomor surat dapat diverifikasi publik kapan saja melalui portal resmi.
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Bukti Verifikasi</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
