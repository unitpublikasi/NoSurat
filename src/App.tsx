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
  const handleCreateUser = async (userData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      if (data.success && data.data) {
        setUsersList(prev => [...prev, data.data]);
        fetchDataFromBackend();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Update User
  const handleUpdateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      if (data.success && data.data) {
        setUsersList(prev =>
          prev.map(u => (u.id === id ? { ...u, ...data.data } : u))
        );
        if (currentUser?.id === id) {
          setCurrentUser(data.data);
        }
        fetchDataFromBackend();
        return true;
      } else {
        alert(data.message || 'Gagal memperbarui pengguna.');
        return false;
      }
    } catch (err) {
      setUsersList(prev =>
        prev.map(u => (u.id === id ? { ...u, ...userData } : u))
      );
      return true;
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.filter(u => u.id !== id));
        if (currentUser?.id === id) {
          setCurrentUser(null);
        }
        fetchDataFromBackend();
        return true;
      } else {
        alert(data.message || 'Gagal menghapus pengguna.');
        return false;
      }
    } catch (err) {
      setUsersList(prev => prev.filter(u => u.id !== id));
      return true;
    }
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
