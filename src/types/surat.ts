export type Role = 'admin' | 'sekretariat' | 'staf' | 'verifikator' | 'staff';

export type StatusSurat = 'Aktif' | 'Dibatalkan' | 'Arsip';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: Role;
  roleName: string;
  divisiCode: string;
  divisiName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Division {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface LetterType {
  id: string;
  code: string;
  name: string;
  description: string;
  formatTemplate: string; // e.g. "{NO}/PKMK/{TYPE}/FK-KMK/{ROMAN_MONTH}/{YEAR}" or "{NO}/{DIV}/PKMK/{TYPE}/{ROMAN_MONTH}/{YEAR}"
}

export interface SuratItem {
  id: string;
  nomorSurat: string;
  nomorUrut: number;
  jenisSuratCode: string;
  jenisSuratName: string;
  divisiCode: string;
  divisiName: string;
  perihal: string;
  tglSurat: string; // YYYY-MM-DD
  tglDibuat: string; // ISO string
  ditujukanKepada: string;
  pengajuName: string;
  pembuatUserId: string;
  pembuatUserName: string;
  status: StatusSurat;
  fileUrl?: string;
  qrCodeHash: string;
  catatan?: string;
  lampiranInfo?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'ARCHIVE' | 'LOGIN' | 'DELETE' | 'EXPORT';
  details: string;
  nomorSuratTarget?: string;
}

export interface PublicSearchFilter {
  keyword: string;
  divisiCode: string;
  jenisSuratCode: string;
  year: string;
  status: string;
}

export interface PublicStats {
  totalSurat: number;
  suratTahunIni: number;
  suratBulanIni: number;
  totalDivisi: number;
  countsByJenis: Record<string, number>;
  countsByDivisi: Record<string, number>;
  latestGenerated: SuratItem[];
}
