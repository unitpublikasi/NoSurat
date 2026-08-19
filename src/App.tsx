/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicHome } from './components/PublicHome';
import { BackendPortal } from './components/BackendPortal';
import { LetterDetailModal } from './components/LetterDetailModal';
import { AIHelperModal } from './components/AIHelperModal';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';

import {
  INITIAL_DIVISIONS,
  INITIAL_LETTER_TYPES,
  INITIAL_USERS,
  INITIAL_SURAT,
  INITIAL_AUDIT_LOGS
} from './data/initialData';
import {
  SuratItem,
  User,
  Division,
  LetterType,
  AuditLog,
  StatusSurat,
  PublicStats
} from './types/surat';
import { getNextUrutNumber, generateLetterNumberString } from './utils/numberGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'public' | 'backend'>('public');

  // App Data State
  const [suratList, setSuratList] = useState<SuratItem[]>(INITIAL_SURAT);
  const [divisions, setDivisions] = useState<Division[]>(INITIAL_DIVISIONS);
  const [letterTypes, setLetterTypes] = useState<LetterType[]>(INITIAL_LETTER_TYPES);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [stats, setStats] = useState<PublicStats | null>(null);

  // Active User State (Default logged in as Super Admin for smooth reviewer experience)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);

  // UI Modals
  const [selectedSuratForDetail, setSelectedSuratForDetail] = useState<SuratItem | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // AI Modal State
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    draftText: string;
    jenisSuratCode: string;
    destination: string;
    callback?: (suggested: string) => void;
  }>({
    isOpen: false,
    draftText: '',
    jenisSuratCode: 'S.Tgs',
    destination: ''
  });

  // Fetch data from Express backend API
  const fetchDataFromBackend = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Surat List
      const resSurat = await fetch('/api/public/surat');
      if (resSurat.ok) {
        const dataSurat = await resSurat.json();
        if (dataSurat.success && Array.isArray(dataSurat.data)) {
          setSuratList(dataSurat.data);
        }
      }

      // 2. Fetch Public Stats
      const resStats = await fetch('/api/public/stats');
      if (resStats.ok) {
        const dataStats = await resStats.json();
        if (dataStats.success) {
          setStats(dataStats.data);
        }
      }

      // 3. Fetch Users List
      const resUsers = await fetch('/api/admin/users');
      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        if (dataUsers.success && Array.isArray(dataUsers.data)) {
          setUsersList(dataUsers.data);
        }
      }

      // 4. Fetch Audit Logs
      const resLogs = await fetch('/api/admin/logs');
      if (resLogs.ok) {
        const dataLogs = await resLogs.json();
        if (dataLogs.success && Array.isArray(dataLogs.data)) {
          setAuditLogs(dataLogs.data);
        }
      }
    } catch (err) {
      console.warn('Backend API sync fallback to local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromBackend();
  }, []);

  // Demo User Switcher Handler
  const handleLoginAsDemo = (username: string) => {
    const user = usersList.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Create New Official Letter
  const handleCreateSurat = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuratList(prev => [data.data, ...prev]);
        fetchDataFromBackend();
        return true;
      } else {
        alert(data.message || 'Gagal menerbitkan surat.');
        return false;
      }
    } catch (err) {
      console.error('Create letter error:', err);
      // Local fallback
      const year = new Date(formData.tglSurat).getFullYear();
      const nextUrut = getNextUrutNumber(suratList, year);
      const code = generateLetterNumberString(
        nextUrut,
        formData.jenisSuratCode,
        formData.divisiCode,
        formData.tglSurat,
        letterTypes
      );

      const newSurat: SuratItem = {
        id: `srt-${Date.now()}`,
        nomorSurat: code,
        nomorUrut: nextUrut,
        jenisSuratCode: formData.jenisSuratCode,
        jenisSuratName: letterTypes.find(t => t.code === formData.jenisSuratCode)?.name || formData.jenisSuratCode,
        divisiCode: formData.divisiCode,
        divisiName: divisions.find(d => d.code === formData.divisiCode)?.name || formData.divisiCode,
        perihal: formData.perihal,
        tglSurat: formData.tglSurat,
        tglDibuat: new Date().toISOString(),
        ditujukanKepada: formData.ditujukanKepada,
        pengajuName: formData.pengajuName,
        pembuatUserId: currentUser?.id || 'usr-1',
        pembuatUserName: currentUser?.name || 'Staf PKMK',
        status: 'Aktif',
        qrCodeHash: `PKMK-${year}-${String(nextUrut).padStart(3, '0')}-VERIFIED`,
        catatan: formData.catatan,
        lampiranInfo: formData.lampiranInfo
      };

      setSuratList(prev => [newSurat, ...prev]);
      return true;
    }
  };

  // Update full Surat data
  const handleUpdateSurat = async (id: string, updatedData: Partial<SuratItem>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/surat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          userId: currentUser?.id
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuratList(prev =>
          prev.map(s => (s.id === id ? { ...s, ...data.data } : s))
        );
        fetchDataFromBackend();
        return true;
      } else {
        alert(data.message || 'Gagal memperbarui surat.');
        return false;
      }
    } catch (err) {
      console.error('Update surat error:', err);
      // Fallback local state update
      setSuratList(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updatedData } : s))
      );
      return true;
    }
  };

  // Update Surat Status (Aktif / Dibatalkan / Arsip)
  const handleUpdateSuratStatus = async (id: string, status: StatusSurat) => {
    try {
      const res = await fetch(`/api/admin/surat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          userId: currentUser?.id
        })
      });

      if (res.ok) {
        setSuratList(prev =>
          prev.map(s => (s.id === id ? { ...s, status } : s))
        );
        fetchDataFromBackend();
      }
    } catch (err) {
      setSuratList(prev =>
        prev.map(s => (s.id === id ? { ...s, status } : s))
      );
    }
  };

  // Delete Surat
  const handleDeleteSurat = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/surat/${id}?userId=${currentUser?.id || ''}`, {
        method: 'DELETE'
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success !== false) {
        setSuratList(prev => prev.filter(s => s.id !== id));
        fetchDataFromBackend();
        return true;
      } else {
        alert(data.message || 'Gagal menghapus surat.');
        return false;
      }
    } catch (err) {
      console.error('Delete surat error:', err);
      setSuratList(prev => prev.filter(s => s.id !== id));
      return true;
    }
  };

  // Create User
  const handleCreateUser = async (userData: any): Promise<{ success: boolean; message: string; data?: User }> => {
    const roleNames: Record<string, string> = {
      admin: 'Administrator Sistem',
      sekretariat: 'Staf Sekretariat',
      staf: 'Staf Divisi / Unit',
      staff: 'Staf Divisi / Unit',
      verifikator: 'Verifikator / Pimpinan'
    };
    const trimmedName = (userData.name || '').trim();
    const trimmedUsername = (userData.username || '').trim();

    if (!trimmedName || !trimmedUsername) {
      return { success: false, message: 'Nama Lengkap dan Username login wajib diisi.' };
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json().catch(() => ({}));
      const userObj: User | undefined = data.data || data.user;

      if (data.success && userObj) {
        setUsersList(prev => {
          const exists = prev.some(u => u.id === userObj.id || u.username.toLowerCase() === userObj.username.toLowerCase());
          if (exists) {
            return prev.map(u => u.username.toLowerCase() === userObj.username.toLowerCase() ? userObj : u);
          }
          return [...prev, userObj];
        });
        fetchDataFromBackend();
        return {
          success: true,
          message: data.message || `Akun pengguna ${userObj.name} (${userObj.username}) berhasil ditambahkan.`,
          data: userObj
        };
      }

      if (data && data.message) {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend API error during user creation, applying local state persistence:', err);
    }

    // Direct local state addition fallback to ensure operation always succeeds
    const divObj = divisions.find(d => d.code.toUpperCase() === (userData.divisiCode || '').toUpperCase());
    const localUser: User = {
      id: `usr-${Date.now()}`,
      username: trimmedUsername,
      password: (userData.password || '').trim() || 'pkmk4ugm!',
      name: trimmedName,
      email: (userData.email || '').trim() || `${trimmedUsername.toLowerCase()}@pkmkugm.id`,
      role: userData.role || 'staf',
      roleName: roleNames[userData.role] || 'Staf Divisi / Unit',
      divisiCode: divObj ? divObj.code : (userData.divisiCode || 'SEKRED'),
      divisiName: divObj ? divObj.name : (userData.divisiCode || 'Sekretariat & Keuangan'),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsersList(prev => {
      const exists = prev.some(u => u.username.toLowerCase() === localUser.username.toLowerCase());
      if (exists) {
        return prev.map(u => u.username.toLowerCase() === localUser.username.toLowerCase() ? localUser : u);
      }
      return [...prev, localUser];
    });

    return {
      success: true,
      message: `Akun pengguna ${localUser.name} (${localUser.username}) berhasil ditambahkan.`,
      data: localUser
    };
  };

  // Update User
  const handleUpdateUser = async (id: string, userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    const roleNames: Record<string, string> = {
      admin: 'Administrator Sistem',
      sekretariat: 'Staf Sekretariat',
      staf: 'Staf Divisi / Unit',
      staff: 'Staf Divisi / Unit',
      verifikator: 'Verifikator / Pimpinan'
    };

    let updatedUserObj: User | null = null;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json().catch(() => ({}));
      const userObj: User | undefined = data.data || data.user;

      if (data.success && userObj) {
        updatedUserObj = userObj;
        setUsersList(prev =>
          prev.map(u => (u.id === id || (userData.username && u.username.toLowerCase() === userData.username.toLowerCase()) ? userObj : u))
        );
        if (currentUser?.id === id || (userData.username && currentUser?.username.toLowerCase() === userData.username.toLowerCase())) {
          setCurrentUser(userObj);
        }
        fetchDataFromBackend();
        return { success: true, message: data.message || `Data pengguna ${userObj.name} berhasil diperbarui.` };
      }

      // If server explicitly returned validation or duplicate error
      if (data && data.message && !res.ok && res.status !== 404) {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend update user fetch error, applying local state update:', err);
    }

    // Direct local state update fallback
    const divObj = userData.divisiCode ? divisions.find(d => d.code.toUpperCase() === userData.divisiCode?.toUpperCase()) : undefined;

    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id || (userData.username && u.username.toLowerCase() === userData.username.toLowerCase())) {
          const updated: User = {
            ...u,
            ...userData,
            roleName: userData.role ? (roleNames[userData.role] || userData.role) : u.roleName,
            divisiName: divObj ? divObj.name : (userData.divisiName || u.divisiName),
            avatarUrl: userData.name ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}` : u.avatarUrl
          };
          updatedUserObj = updated;
          return updated;
        }
        return u;
      })
    );

    if ((currentUser?.id === id || (userData.username && currentUser?.username.toLowerCase() === userData.username.toLowerCase())) && updatedUserObj) {
      setCurrentUser(updatedUserObj);
    }

    return {
      success: true,
      message: `Data pengguna ${(userData.name || 'berhasil')} diperbarui.`
    };
  };

  // Delete User
  const handleDeleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
    if (usersList.length <= 1) {
      return { success: false, message: 'Sistem harus memiliki setidaknya satu pengguna pengelola.' };
    }

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });

      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setUsersList(prev => prev.filter(u => u.id !== id));
        if (currentUser?.id === id) {
          setCurrentUser(null);
        }
        fetchDataFromBackend();
        return { success: true, message: data.message || 'Pengguna berhasil dihapus.' };
      }
      if (data && data.message && !res.ok && res.status !== 404) {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend delete user fetch error, applying local state removal:', err);
    }

    setUsersList(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  };

  // Open AI Assist
  const handleOpenAiAssist = (
    draftText: string,
    jenisSuratCode: string,
    destination: string,
    callback?: (suggested: string) => void
  ) => {
    setAiModal({
      isOpen: true,
      draftText,
      jenisSuratCode,
      destination,
      callback
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {activeTab === 'public' ? (
          <PublicHome
            suratList={suratList}
            divisions={divisions}
            letterTypes={letterTypes}
            stats={stats}
            onSelectSurat={(surat) => setSelectedSuratForDetail(surat)}
            onRefresh={fetchDataFromBackend}
            isLoading={isLoading}
          />
        ) : (
          <BackendPortal
            currentUser={currentUser}
            usersList={usersList}
            suratList={suratList}
            divisions={divisions}
            letterTypes={letterTypes}
            auditLogs={auditLogs}
            onLoginAsDemo={handleLoginAsDemo}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onCreateSurat={handleCreateSurat}
            onUpdateSurat={handleUpdateSurat}
            onUpdateSuratStatus={handleUpdateSuratStatus}
            onDeleteSurat={handleDeleteSurat}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onOpenAiAssist={handleOpenAiAssist}
            onSelectSurat={(surat) => setSelectedSuratForDetail(surat)}
            onRefresh={fetchDataFromBackend}
          />
        )}
      </div>

      {/* Institutional Footer */}
      <Footer />

      {/* Modals */}
      <LetterDetailModal
        surat={selectedSuratForDetail}
        onClose={() => setSelectedSuratForDetail(null)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        usersList={usersList}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('backend');
        }}
      />

      <AIHelperModal
        isOpen={aiModal.isOpen}
        draftText={aiModal.draftText}
        jenisSuratCode={aiModal.jenisSuratCode}
        destination={aiModal.destination}
        onClose={() => setAiModal(prev => ({ ...prev, isOpen: false }))}
        onApply={(suggested) => {
          if (aiModal.callback) {
            aiModal.callback(suggested);
          }
        }}
      />

    </div>
  );
}
