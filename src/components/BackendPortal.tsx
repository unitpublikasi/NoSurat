import React, { useState, useEffect } from 'react';
import {
  Plus,
  FileText,
  Users,
  History,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
  Trash2,
  Lock,
  UserCheck,
  ShieldAlert,
  Copy,
  Check,
  Building,
  Calendar,
  Key,
  Printer,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  SuratItem,
  User,
  Division,
  LetterType,
  AuditLog,
  Role,
  StatusSurat
} from '../types/surat';
import {
  extractHighestUrut,
  getNextUrutNumber,
  generateLetterNumberString
} from '../utils/numberGenerator';
import { Pagination } from './Pagination';

interface BackendPortalProps {
  currentUser: User | null;
  usersList: User[];
  suratList: SuratItem[];
  divisions: Division[];
  letterTypes: LetterType[];
  auditLogs: AuditLog[];
  onLoginAsDemo: (username: string) => void;
  onOpenLoginModal: () => void;
  onCreateSurat: (formData: any) => Promise<boolean>;
  onUpdateSurat?: (id: string, updatedData: Partial<SuratItem>) => Promise<boolean>;
  onUpdateSuratStatus: (id: string, status: StatusSurat) => Promise<void>;
  onDeleteSurat: (id: string) => Promise<boolean> | Promise<void>;
  onCreateUser: (userData: any) => Promise<boolean>;
  onUpdateUser?: (id: string, userData: Partial<User>) => Promise<boolean>;
  onDeleteUser?: (id: string) => Promise<boolean>;
  onOpenAiAssist: (draft: string, type: string, dest: string, callback: (suggested: string) => void) => void;
  onSelectSurat: (surat: SuratItem) => void;
  onRefresh: () => void;
}

export const BackendPortal: React.FC<BackendPortalProps> = ({
  currentUser,
  usersList,
  suratList,
  divisions,
  letterTypes,
  auditLogs,
  onLoginAsDemo,
  onOpenLoginModal,
  onCreateSurat,
  onUpdateSurat,
  onUpdateSuratStatus,
  onDeleteSurat,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onOpenAiAssist,
  onSelectSurat,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'users' | 'logs' | 'export'>('list');

  // Edit Surat Modal State
  const [editingSurat, setEditingSurat] = useState<SuratItem | null>(null);
  const [editSuratForm, setEditSuratForm] = useState<{
    nomorSurat: string;
    perihal: string;
    ditujukanKepada: string;
    pengajuName: string;
    tglSurat: string;
    jenisSuratCode: string;
    divisiCode: string;
    status: StatusSurat;
    lampiranInfo: string;
    catatan: string;
  }>({
    nomorSurat: '',
    perihal: '',
    ditujukanKepada: '',
    pengajuName: '',
    tglSurat: '',
    jenisSuratCode: 'S.Tgs',
    divisiCode: 'DMRS',
    status: 'Aktif',
    lampiranInfo: '',
    catatan: ''
  });
  const [editSuratSubmitting, setEditSuratSubmitting] = useState(false);
  const [editSuratMsg, setEditSuratMsg] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState<{
    name: string;
    username: string;
    email: string;
    role: Role;
    divisiCode: string;
  }>({
    name: '',
    username: '',
    email: '',
    role: 'staf',
    divisiCode: 'DMRS'
  });
  const [editUserSubmitting, setEditUserSubmitting] = useState(false);
  const [editUserMsg, setEditUserMsg] = useState<string | null>(null);

  // New Letter Form State
  const [jenisSuratCode, setJenisSuratCode] = useState('S.Tgs');
  const [divisiCode, setDivisiCode] = useState('DMRS');
  const [perihal, setPerihal] = useState('');
  const [tglSurat, setTglSurat] = useState(new Date().toISOString().split('T')[0]);
  const [ditujukanKepada, setDitujukanKepada] = useState('');
  const [pengajuName, setPengajuName] = useState('');
  const [catatan, setCatatan] = useState('');
  const [lampiranInfo, setLampiranInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Preview generated number state & sequence info
  const [previewNumber, setPreviewNumber] = useState('');
  const [autoNextUrut, setAutoNextUrut] = useState(() => getNextUrutNumber(suratList));
  const [highestExistingUrut, setHighestExistingUrut] = useState(() => extractHighestUrut(suratList));
  const [isCustomUrut, setIsCustomUrut] = useState(false);
  const [customUrutInput, setCustomUrutInput] = useState('');

  // Search & Filter State inside Backend Table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination for Backend Surat List
  const [suratPage, setSuratPage] = useState(1);
  const [suratPageSize, setSuratPageSize] = useState(10);

  // Pagination for Audit Logs
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(10);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('pkmk4ugm!');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('staf');
  const [newUserDivisi, setNewUserDivisi] = useState('DMRS');
  const [userFormMsg, setUserFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Copy indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync user division when logged in
  useEffect(() => {
    if (currentUser) {
      setDivisiCode(currentUser.divisiCode || 'DMRS');
      setPengajuName(currentUser.name);
    }
  }, [currentUser]);

  // Fetch / Calculate Preview Number & Auto Increment Sequence
  useEffect(() => {
    const year = new Date(tglSurat).getFullYear() || 2026;
    const highest = extractHighestUrut(suratList, year);
    const nextAuto = getNextUrutNumber(suratList, year);

    setHighestExistingUrut(highest);
    setAutoNextUrut(nextAuto);

    const effectiveUrut = isCustomUrut && parseInt(customUrutInput, 10) > 0
      ? parseInt(customUrutInput, 10)
      : nextAuto;

    const formatted = generateLetterNumberString(
      effectiveUrut,
      jenisSuratCode,
      divisiCode,
      tglSurat,
      letterTypes
    );

    setPreviewNumber(formatted);
  }, [tglSurat, jenisSuratCode, divisiCode, suratList, letterTypes, isCustomUrut, customUrutInput]);

  // Handle create letter submission
  const handleSubmitNewSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!perihal.trim()) {
      setFormError('Mohon perihal surat diisi.');
      return;
    }

    const effectiveUrut = isCustomUrut && parseInt(customUrutInput, 10) > 0
      ? parseInt(customUrutInput, 10)
      : autoNextUrut;

    setIsSubmitting(true);
    try {
      const ok = await onCreateSurat({
        jenisSuratCode,
        divisiCode,
        perihal: perihal.trim(),
        tglSurat,
        ditujukanKepada: ditujukanKepada.trim() || 'Mitra / Instansi Terkait',
        pengajuName: pengajuName.trim() || (currentUser ? currentUser.name : 'Staf PKMK'),
        pembuatUserId: currentUser ? currentUser.id : 'usr-1',
        catatan: catatan.trim(),
        lampiranInfo: lampiranInfo.trim(),
        customUrut: effectiveUrut
      });

      if (ok) {
        setFormSuccess(`Nomor surat baru berhasil diterbitkan: ${previewNumber}`);
        setPerihal('');
        setDitujukanKepada('');
        setCatatan('');
        setLampiranInfo('');
        setIsCustomUrut(false);
        setCustomUrutInput('');
        setTimeout(() => {
          setActiveTab('list');
          setFormSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setFormError('Gagal menerbitkan nomor surat. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new user creation
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormMsg(null);

    if (!newUserName || !newUserUsername || !newUserEmail) {
      setUserFormMsg({ type: 'error', text: 'Mohon isi semua data wajib pengguna.' });
      return;
    }

    const ok = await onCreateUser({
      name: newUserName,
      username: newUserUsername,
      password: newUserPassword || 'pkmk4ugm!',
      email: newUserEmail,
      role: newUserRole,
      divisiCode: newUserDivisi
    });

    if (ok) {
      setUserFormMsg({ type: 'success', text: `Akun multi-user ${newUserName} berhasil dibuat.` });
      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('pkmk4ugm!');
      setNewUserEmail('');
    } else {
      setUserFormMsg({ type: 'error', text: 'Username sudah digunakan atau terjadi kesalahan.' });
    }
  };

  // Open Edit Surat Modal
  const handleOpenEditSurat = (surat: SuratItem) => {
    setEditingSurat(surat);
    setEditSuratForm({
      nomorSurat: surat.nomorSurat,
      perihal: surat.perihal,
      ditujukanKepada: surat.ditujukanKepada,
      pengajuName: surat.pengajuName,
      tglSurat: surat.tglSurat,
      jenisSuratCode: surat.jenisSuratCode,
      divisiCode: surat.divisiCode,
      status: surat.status,
      lampiranInfo: surat.lampiranInfo || '',
      catatan: surat.catatan || ''
    });
    setEditSuratMsg(null);
  };

  // Save Edit Surat
  const handleSaveEditSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSurat) return;

    setEditSuratSubmitting(true);
    setEditSuratMsg(null);

    try {
      if (onUpdateSurat) {
        const ok = await onUpdateSurat(editingSurat.id, editSuratForm);
        if (ok) {
          setEditingSurat(null);
        } else {
          setEditSuratMsg('Gagal menyimpan perubahan kolom surat.');
        }
      }
    } catch (err) {
      setEditSuratMsg('Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setEditSuratSubmitting(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      divisiCode: user.divisiCode
    });
    setEditUserMsg(null);
  };

  // Save Edit User
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditUserSubmitting(true);
    setEditUserMsg(null);

    try {
      if (onUpdateUser) {
        const ok = await onUpdateUser(editingUser.id, editUserForm);
        if (ok) {
          setEditingUser(null);
        } else {
          setEditUserMsg('Gagal memperbarui data pengguna.');
        }
      }
    } catch (err) {
      setEditUserMsg('Terjadi kesalahan saat memperbarui akun pengguna.');
    } finally {
      setEditUserSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUserClick = async (user: User) => {
    if (confirm(`Yakin ingin menghapus pengguna "${user.name}" (${user.username})?`)) {
      if (onDeleteUser) {
        const ok = await onDeleteUser(user.id);
        if (ok) {
          onRefresh();
        }
      }
    }
  };

  // Filtered surat list in backend table
  const backendFilteredSurat = suratList.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.nomorSurat.toLowerCase().includes(q) ||
        s.perihal.toLowerCase().includes(q) ||
        s.ditujukanKepada.toLowerCase().includes(q) ||
        s.pengajuName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterDivisi !== 'ALL' && s.divisiCode !== filterDivisi) return false;
    if (filterType !== 'ALL' && s.jenisSuratCode !== filterType) return false;
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    return true;
  });

  // Reset page when filter changes
  useEffect(() => {
    setSuratPage(1);
  }, [searchQuery, filterDivisi, filterType, filterStatus]);

  // Paginated surat slice for backend table
  const paginatedBackendSurat = backendFilteredSurat.slice(
    (suratPage - 1) * suratPageSize,
    suratPage * suratPageSize
  );

  // Paginated audit logs
  const paginatedAuditLogs = auditLogs.slice(
    (logsPage - 1) * logsPageSize,
    logsPage * logsPageSize
  );

  // Handle copy number
  const handleCopy = (surat: SuratItem) => {
    navigator.clipboard.writeText(surat.nomorSurat);
    setCopiedId(surat.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['Nomor Surat', 'Nomor Urut', 'Jenis Surat', 'Divisi', 'Perihal', 'Tgl Surat', 'Penerima', 'Pengaju', 'Status'];
    const rows = backendFilteredSurat.map(s => [
      `"${s.nomorSurat}"`,
      s.nomorUrut,
      `"${s.jenisSuratName}"`,
      `"${s.divisiName}"`,
      `"${s.perihal.replace(/"/g, '""')}"`,
      s.tglSurat,
      `"${s.ditujukanKepada}"`,
      `"${s.pengajuName}"`,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nomor_Surat_PKMK_UGM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      
      {/* Backend Top Bar Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                Multi-User Access Portal
              </span>
              <span className="text-xs text-slate-400 font-medium">PKMK FK-KMK UGM</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              <Key className="w-6 h-6 text-amber-500" />
              <span>Sistem Pengelolaan & Penomoran Surat</span>
            </h1>
          </div>

          {/* Demo User Switcher Bar */}
          <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 px-1">
              Ganti Akses Multi-User (Demo Simulation):
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {usersList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onLoginAsDemo(u.username)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    currentUser?.id === u.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <span>{u.username}</span>
                  <span className="text-[9px] opacity-75 font-normal">({u.role})</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* User Role Access Notice Banner */}
        {currentUser && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border border-amber-500 object-cover"
              />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{currentUser.name}</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
                    {currentUser.roleName}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Unit/Divisi: <span className="font-semibold text-slate-800">{currentUser.divisiName} ({currentUser.divisiCode})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sesi Aktif: Multi-User Validated</span>
            </div>
          </div>
        )}

        {/* Backend Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Daftar Nomor Surat ({suratList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Nomor Surat Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Kelola User ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Log Aktivitas (Audit)</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'export'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Rekap & Ekspor</span>
          </button>
        </div>

        {/* TAB 1: LIST SURAT */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Table Search & Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nomor, perihal, penerima..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={filterDivisi}
                  onChange={(e) => setFilterDivisi(e.target.value)}
                  className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="ALL">Semua Divisi</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.code}>{d.code}</option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="ALL">Semua Jenis</option>
                  {letterTypes.map(t => (
                    <option key={t.id} value={t.code}>{t.code}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                  <option value="Arsip">Arsip</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Surat</th>
                    <th className="py-3 px-4">Perihal</th>
                    <th className="py-3 px-4">Divisi & Jenis</th>
                    <th className="py-3 px-4">Pembuat / Pengaju</th>
                    <th className="py-3 px-4">Tgl Surat</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {backendFilteredSurat.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        Tidak ada nomor surat yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedBackendSurat.map((surat) => (
                      <tr key={surat.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {surat.nomorSurat}
                            </span>
                            <button
                              onClick={() => handleCopy(surat)}
                              className="p-1 text-slate-400 hover:text-amber-600"
                              title="Salin Nomor"
                            >
                              {copiedId === surat.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{surat.perihal}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            Kepada: {surat.ditujukanKepada}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{surat.divisiCode}</div>
                          <div className="text-[10px] text-slate-500">{surat.jenisSuratName}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-900 font-semibold">{surat.pengajuName}</div>
                          <div className="text-[10px] text-slate-500">Oleh: {surat.pembuatUserName}</div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {surat.tglSurat}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {surat.status === 'Aktif' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Aktif
                            </span>
                          )}
                          {surat.status === 'Dibatalkan' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              Dibatalkan
                            </span>
                          )}
                          {surat.status === 'Arsip' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Arsip
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectSurat(surat)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1"
                              title="Lihat Detail & QR"
                            >
                              <span>Detail</span>
                            </button>

                            {/* Edit Surat Button */}
                            <button
                              onClick={() => handleOpenEditSurat(surat)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1 border border-amber-200"
                              title="Edit Data/Kolom Surat"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>Edit</span>
                            </button>

                            {/* Status Change Option */}
                            {surat.status === 'Aktif' ? (
                              <button
                                onClick={() => onUpdateSuratStatus(surat.id, 'Dibatalkan')}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[10px]"
                                title="Batalkan Surat Ini"
                              >
                                Batalkan
                              </button>
                            ) : (
                              <button
                                onClick={() => onUpdateSuratStatus(surat.id, 'Aktif')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px]"
                              >
                                Aktifkan
                              </button>
                            )}

                            {/* Delete Surat Button */}
                            <button
                              onClick={async () => {
                                if (confirm(`Yakin ingin menghapus permanen surat "${surat.nomorSurat}"?\n(${surat.perihal})`)) {
                                  await onDeleteSurat(surat.id);
                                  onRefresh();
                                }
                              }}
                              className="p-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 font-bold rounded-lg text-xs flex items-center gap-1 border border-red-200 transition-colors"
                              title="Hapus Surat Permanen"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {backendFilteredSurat.length > 0 && (
              <Pagination
                currentPage={suratPage}
                totalItems={backendFilteredSurat.length}
                pageSize={suratPageSize}
                onPageChange={setSuratPage}
                onPageSizeChange={setSuratPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                itemName="surat"
              />
            )}

          </div>
        )}

        {/* TAB 2: BUAT SURAT BARU */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-amber-600" />
                    <span>Terbitkan Nomor Surat Resmi</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sistem akan secara otomatis menghitung nomor urut resmi PKMK untuk tahun berkenaan.
                  </p>
                </div>
              </div>

              {/* Auto Increment Status Banner */}
              <div className="mb-5 p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                    #{isCustomUrut && parseInt(customUrutInput, 10) > 0 ? customUrutInput : autoNextUrut}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Auto-Increment Nomor Surat Aktif</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                        Melanjutkan Data
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Nomor terakhir dalam arsip: <strong className="text-slate-900 font-mono">#{highestExistingUrut}</strong> → Nomor berikutnya: <strong className="text-amber-700 font-mono font-bold">#{autoNextUrut}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={isCustomUrut}
                      onChange={(e) => {
                        setIsCustomUrut(e.target.checked);
                        if (e.target.checked && !customUrutInput) {
                          setCustomUrutInput(String(autoNextUrut));
                        }
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Kustomisasi Nomor Urut</span>
                  </label>
                </div>
              </div>

              {isCustomUrut && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Nomor Urut Manual:
                  </label>
                  <input
                    type="number"
                    value={customUrutInput}
                    onChange={(e) => setCustomUrutInput(e.target.value)}
                    placeholder={String(autoNextUrut)}
                    className="w-32 py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-500">
                    (Gunakan jika perlu mengisi nomor sela atau reservasi khusus)
                  </span>
                </div>
              )}

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSubmitNewSurat} className="space-y-4">
                
                {/* Row 1: Tanggal & Jenis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Surat <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tglSurat}
                      onChange={(e) => setTglSurat(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jenis Surat <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jenisSuratCode}
                      onChange={(e) => setJenisSuratCode(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                    >
                      {letterTypes.map(t => (
                        <option key={t.id} value={t.code}>
                          {t.code} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Divisi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Divisi / Unit Penanggung Jawab <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={divisiCode}
                    onChange={(e) => setDivisiCode(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    {divisions.map(d => (
                      <option key={d.id} value={d.code}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 3: Perihal with Gemini AI Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Perihal / Hal Surat <span className="text-red-500">*</span>
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAiAssist(perihal, jenisSuratCode, ditujukanKepada, (suggested) => {
                          setPerihal(suggested);
                        });
                      }}
                      className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Sempurnakan dengan AI (Gemini)</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={perihal}
                    onChange={(e) => setPerihal(e.target.value)}
                    placeholder="Contoh: Permohonan Narasumber dan Pendampingan Akreditasi Rumah Sakit..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* Row 4: Penerima & Pengaju */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ditujukan Kepada (Penerima)
                    </label>
                    <input
                      type="text"
                      value={ditujukanKepada}
                      onChange={(e) => setDitujukanKepada(e.target.value)}
                      placeholder="Cth: Direktur RSUD Dr. Soediran..."
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Pengaju / Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      value={pengajuName}
                      onChange={(e) => setPengajuName(e.target.value)}
                      placeholder="Cth: Budi Santoso, S.Kep..."
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Lampiran & Catatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lampiran / Keterangan Berkas
                    </label>
                    <input
                      type="text"
                      value={lampiranInfo}
                      onChange={(e) => setLampiranInfo(e.target.value)}
                      placeholder="Cth: 1 Berkas Jadwal & TOR..."
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Internal (Opsional)
                    </label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Catatan tambahan untuk arsip..."
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Nomor Surat'}</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Live Preview Column */}
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Pratinjau Nomor Surat Otomatis</span>
                </div>

                <div className="my-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-lg font-black text-amber-300 break-all shadow-inner">
                  {previewNumber}
                </div>

                <div className="space-y-2 text-xs text-slate-300 font-medium">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Nomor Urut Baru:</span>
                    <span className="font-mono font-bold text-amber-300">
                      #{isCustomUrut && parseInt(customUrutInput, 10) > 0 ? customUrutInput : autoNextUrut}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Nomor Terakhir Tercatat:</span>
                    <span className="font-mono font-bold text-slate-200">#{highestExistingUrut}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Instansi:</span>
                    <span className="font-bold text-white">PKMK FK-KMK UGM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Divisi:</span>
                    <span className="font-bold text-white">{divisiCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Jenis Surat:</span>
                    <span className="font-bold text-white">{jenisSuratCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Penerbit Sesi:</span>
                    <span className="font-bold text-amber-400">{currentUser?.name || 'Staf PKMK'}</span>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-400 leading-relaxed">
                  💡 Format nomor surat mengikuti standar pedoman tata naskah dinas resmi Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan UGM.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: KELOLA USER (MULTI-USER) */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Users List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span>Daftar Pengguna Multi-User Portal</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Pengguna</th>
                      <th className="py-3 px-4">Username & Email</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Divisi</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                              alt={u.name}
                              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[10px] text-slate-400">Terdaftar: {u.createdAt}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-800">{u.username}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {u.roleName}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {u.divisiCode}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg border border-amber-200 transition-all flex items-center gap-1"
                              title="Edit User / Peran"
                            >
                              <Edit3 className="w-3 h-3 text-amber-700" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => onLoginAsDemo(u.username)}
                              className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] rounded-lg hover:bg-amber-600 hover:text-slate-950 transition-all"
                            >
                              Masuk Sesi
                            </button>

                            <button
                              onClick={() => handleDeleteUserClick(u)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create User Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                <span>Tambah Pengguna Pengelola</span>
              </h3>

              {userFormMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                    userFormMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {userFormMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateUserSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Cth: Dr. Ahmad Dahlan, M.P.H."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="Cth: ahmad.dmrs"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email UGM / Resmi</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="ahmad@ugm.ac.id"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran Akses (Role)</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="admin">Administrator System (Full Access)</option>
                    <option value="sekretariat">Kepala / Staf Sekretariat</option>
                    <option value="staf">Staf / Peneliti Divisi</option>
                    <option value="verifikator">Verifikator / Pimpinan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Divisi Penempatan</label>
                  <select
                    value={newUserDivisi}
                    onChange={(e) => setNewUserDivisi(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {divisions.map(d => (
                      <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Simpan Pengguna Baru
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              <span>Log Jejak Audit (Audit Trail History)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Aksi</th>
                    <th className="py-3 px-4">Rincian Aktivitas</th>
                    <th className="py-3 px-4">Target Surat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-400">{log.userRole}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                            log.action === 'CANCEL' ? 'bg-red-100 text-red-800' :
                            log.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">
                        {log.nomorSuratTarget || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {auditLogs.length > 0 && (
              <Pagination
                currentPage={logsPage}
                totalItems={auditLogs.length}
                pageSize={logsPageSize}
                onPageChange={setLogsPage}
                onPageSizeChange={setLogsPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                itemName="log aktivitas"
              />
            )}
          </div>
        )}

        {/* TAB 5: EXPORT & REKAP */}
        {activeTab === 'export' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto text-center">
            <Download className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900">Rekapitulasi & Ekspor Data Surat</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-6">
              Unduh laporan rekap penomoran surat resmi PKMK FK KMK UGM dalam format CSV / Excel untuk keperluan pengarsipan universitas.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Total Record Terpilih:</span>
                <span className="font-bold text-slate-900">{backendFilteredSurat.length} Surat</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Filter Divisi Aktif:</span>
                <span className="font-bold text-slate-900">{filterDivisi}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 font-medium">Format Output:</span>
                <span className="font-bold text-emerald-700">CSV / Spreadsheet Compatible</span>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File CSV / Excel Now</span>
            </button>
          </div>
        )}

      </div>

      {/* MODAL EDIT SURAT (KOLOM SURAT BISA DI-EDIT) */}
      {editingSurat && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Kolom & Data Surat</h3>
                  <p className="text-xs text-amber-400 font-mono font-semibold">{editingSurat.nomorSurat}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingSurat(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Lock className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSurat} className="p-6 space-y-4 text-xs">
              {editSuratMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-medium">
                  {editSuratMsg}
                </div>
              )}

              {/* Nomor Surat */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Surat (Dapat disesuaikan jika perlu)</label>
                <input
                  type="text"
                  value={editSuratForm.nomorSurat}
                  onChange={(e) => setEditSuratForm(prev => ({ ...prev, nomorSurat: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  required
                />
              </div>

              {/* Perihal with Gemini AI */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Perihal Surat</label>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAiAssist(editSuratForm.perihal, editSuratForm.jenisSuratCode, editSuratForm.ditujukanKepada, (suggested) => {
                        setEditSuratForm(prev => ({ ...prev, perihal: suggested }));
                      });
                    }}
                    className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Sempurnakan AI</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editSuratForm.perihal}
                  onChange={(e) => setEditSuratForm(prev => ({ ...prev, perihal: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              {/* Row: Ditujukan Kepada & Pengaju */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ditujukan Kepada</label>
                  <input
                    type="text"
                    value={editSuratForm.ditujukanKepada}
                    onChange={(e) => setEditSuratForm(prev => ({ ...prev, ditujukanKepada: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pengaju / Penanggung Jawab</label>
                  <input
                    type="text"
                    value={editSuratForm.pengajuName}
                    onChange={(e) => setEditSuratForm(prev => ({ ...prev, pengajuName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Row: Tanggal, Jenis, Divisi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Surat</label>
                  <input
                    type="date"
                    value={editSuratForm.tglSurat}
                    onChange={(e) => setEditSuratForm(prev => ({ ...prev, tglSurat: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Surat</label>
                  <select
                    value={editSuratForm.jenisSuratCode}
                    onChange={(e) => setEditSuratForm(prev => ({ ...prev, jenisSuratCode: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {letterTypes.map(t => (
                      <option key={t.id} value={t.code}>{t.code} - {t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Divisi Penanggung Jawab</label>
                  <select
                    value={editSuratForm.divisiCode}
                    onChange={(e) => setEditSuratForm(prev => ({ ...prev, divisiCode: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {divisions.map(d => (
                      <option key={d.id} value={d.code}>{d.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Status & Lampiran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Surat</label>
                  <select
                    value={editSuratForm.status}
                    onChange={(e) => setEditSuratForm(prev => ({ ...prev, status: e.target.value as StatusSurat }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                    <option value="Arsip">Arsip</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Info Lampiran</label>
                  <input
                    type="text"
                    value={editSuratForm.lampiranInfo}
                    onChange={(e) => setEditSuratForm(prev => ({ ...prev, lampiranInfo: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    placeholder="Contoh: 1 Berkas Lampiran..."
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Internal</label>
                <input
                  type="text"
                  value={editSuratForm.catatan}
                  onChange={(e) => setEditSuratForm(prev => ({ ...prev, catatan: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  placeholder="Catatan tambahan..."
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSurat(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSuratSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editSuratSubmitting ? 'Simpan...' : 'Simpan Perubahan Kolom'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT USER (CRUD USER ADMINISTRATOR) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Akses & Profil Pengguna</h3>
                  <p className="text-xs text-amber-400 font-mono font-semibold">{editingUser.username}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Lock className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-3 text-xs">
              {editUserMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-medium">
                  {editUserMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email UGM / Resmi</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Peran Akses (Role)</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, role: e.target.value as Role }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="admin">Administrator Sistem (Full Access)</option>
                  <option value="sekretariat">Kepala / Staf Sekretariat</option>
                  <option value="staf">Staf / Peneliti Divisi</option>
                  <option value="verifikator">Verifikator / Pimpinan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Divisi Penempatan</label>
                <select
                  value={editUserForm.divisiCode}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, divisiCode: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {divisions.map(d => (
                    <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editUserSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editUserSubmitting ? 'Simpan...' : 'Simpan Data User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
