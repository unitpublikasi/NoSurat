import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Filter,
  FileText,
  Calendar,
  Building,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { SuratItem, Division, LetterType, PublicStats } from '../types/surat';

interface PublicHomeProps {
  suratList: SuratItem[];
  divisions: Division[];
  letterTypes: LetterType[];
  stats: PublicStats | null;
  onSelectSurat: (surat: SuratItem) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  suratList,
  divisions,
  letterTypes,
  stats,
  onSelectSurat,
  onRefresh,
  isLoading
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('Aktif');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick verify search state
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    searched: boolean;
    found?: SuratItem;
    message?: string;
  }>({ searched: false });

  // Handle direct verify button
  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    const query = verifyInput.trim().toLowerCase();
    const found = suratList.find(s =>
      s.nomorSurat.toLowerCase() === query ||
      s.qrCodeHash.toLowerCase() === query ||
      s.id.toLowerCase() === query
    );

    if (found) {
      setVerifyResult({ searched: true, found });
      onSelectSurat(found);
    } else {
      setVerifyResult({
        searched: true,
        message: `Nomor surat atau kode QR "${verifyInput}" tidak terdaftar dalam pangkalan data arsip resmi PKMK FK KMK UGM.`
      });
    }
  };

  // Copy letter number to clipboard
  const handleCopyNumber = (surat: SuratItem) => {
    navigator.clipboard.writeText(surat.nomorSurat);
    setCopiedId(surat.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered letters list
  const filteredSurat = useMemo(() => {
    return suratList.filter(s => {
      // Keyword match
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchesKeyword =
          s.nomorSurat.toLowerCase().includes(q) ||
          s.perihal.toLowerCase().includes(q) ||
          s.ditujukanKepada.toLowerCase().includes(q) ||
          s.pengajuName.toLowerCase().includes(q) ||
          s.divisiName.toLowerCase().includes(q) ||
          s.jenisSuratName.toLowerCase().includes(q);

        if (!matchesKeyword) return false;
      }

      // Division match
      if (selectedDivisi !== 'ALL' && s.divisiCode !== selectedDivisi) {
        return false;
      }

      // Type match
      if (selectedType !== 'ALL' && s.jenisSuratCode !== selectedType) {
        return false;
      }

      // Year match
      if (selectedYear !== 'ALL') {
        const sYear = new Date(s.tglSurat).getFullYear();
        if (String(sYear) !== selectedYear) return false;
      }

      // Status match
      if (selectedStatus !== 'ALL' && s.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [suratList, keyword, selectedDivisi, selectedType, selectedYear, selectedStatus]);

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    suratList.forEach(s => {
      const yr = new Date(s.tglSurat).getFullYear();
      if (!isNaN(yr)) years.add(String(yr));
    });
    return Array.from(years).sort().reverse();
  }, [suratList]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sistem Pangkalan Data Resmi PKMK UGM</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-4">
              Penomoran & Verifikasi Surat Resmi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                PKMK FK-KMK UGM
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
              Portal publik untuk pencarian, verifikasi keaslian, dan transparansi arsip penomoran surat Pusat Kebijakan dan Manajemen Kesehatan Universitas Gadjah Mada.
            </p>
          </div>

          {/* Quick Direct Verify Box */}
          <div className="max-w-2xl mx-auto bg-slate-800/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-700/80 shadow-2xl">
            <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="Masukkan Nomor Surat (Cth: 001/PKMK/S.Tgs/FK-KMK/I/2026)..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 text-white placeholder-slate-400 rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/80 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cek Keaslian</span>
              </button>
            </form>

            {verifyResult.searched && verifyResult.message && (
              <div className="mt-3 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{verifyResult.message}</span>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Metrics Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats?.totalSurat || suratList.length}</div>
              <div className="text-xs font-medium text-slate-500">Total Surat Terdaftar</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats?.suratTahunIni || 0}</div>
              <div className="text-xs font-medium text-slate-500">Diterbitkan Tahun Ini</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {suratList.filter(s => s.status === 'Aktif').length}
              </div>
              <div className="text-xs font-medium text-slate-500">Surat Aktif</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{divisions.length}</div>
              <div className="text-xs font-medium text-slate-500">Divisi / Unit PKMK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Section Title & Search Filters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>Pencarian Data Penomoran Surat</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan filter di bawah ini untuk menyaring arsip nomor surat PKMK FK KMK UGM.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Muat Ulang</span>
              </button>
            </div>
          </div>

          {/* Filter Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Keyword Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Kata Kunci</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Cari perihal, pengaju, instansi..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Division Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Divisi / Unit</label>
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                <option value="ALL">Semua Divisi ({divisions.length})</option>
                {divisions.map(d => (
                  <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>

            {/* Letter Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Surat</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                <option value="ALL">Semua Jenis ({letterTypes.length})</option>
                {letterTypes.map(t => (
                  <option key={t.id} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
            </div>

            {/* Year & Status Filter */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 text-slate-800"
                >
                  <option value="ALL">Semua</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 text-slate-800"
                >
                  <option value="ALL">Semua</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                  <option value="Arsip">Arsip</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Menampilkan {filteredSurat.length} data surat
            </div>
            
            {(keyword || selectedDivisi !== 'ALL' || selectedType !== 'ALL' || selectedYear !== 'ALL' || selectedStatus !== 'Aktif') && (
              <button
                onClick={() => {
                  setKeyword('');
                  setSelectedDivisi('ALL');
                  setSelectedType('ALL');
                  setSelectedYear('ALL');
                  setSelectedStatus('Aktif');
                }}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          {filteredSurat.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Tidak ada data penomoran surat ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Coba sesuaikan kata kunci pencarian atau ganti filter divisi/jenis surat.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Surat Resmi</th>
                    <th className="py-3 px-4">Perihal / Subject</th>
                    <th className="py-3 px-4">Divisi / Unit</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Tgl. Surat</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSurat.map((surat) => (
                    <tr
                      key={surat.id}
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      {/* Nomor Surat & Quick Copy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {surat.nomorSurat}
                          </span>
                          <button
                            onClick={() => handleCopyNumber(surat)}
                            title="Salin Nomor Surat"
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                          >
                            {copiedId === surat.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Perihal */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="text-slate-900 font-bold line-clamp-2 leading-relaxed">
                          {surat.perihal}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          Kepada: <span className="font-semibold text-slate-700">{surat.ditujukanKepada}</span>
                        </div>
                      </td>

                      {/* Divisi */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px]">
                          {surat.divisiCode}
                        </span>
                      </td>

                      {/* Jenis Surat */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-semibold">{surat.jenisSuratCode}</span>
                      </td>

                      {/* Tanggal Surat */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {surat.tglSurat}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {surat.status === 'Aktif' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aktif & Valid</span>
                          </span>
                        )}
                        {surat.status === 'Dibatalkan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>Dibatalkan</span>
                          </span>
                        )}
                        {surat.status === 'Arsip' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>Arsip</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectSurat(surat)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-amber-600 hover:text-slate-950 text-white font-bold text-[11px] rounded-lg transition-all shadow-sm"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>
    </div>
  );
};
