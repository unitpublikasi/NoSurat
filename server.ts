import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_DIVISIONS,
  INITIAL_LETTER_TYPES,
  INITIAL_USERS,
  INITIAL_SURAT,
  INITIAL_AUDIT_LOGS
} from './src/data/initialData';
import {
  SuratItem,
  User,
  AuditLog,
  StatusSurat,
  PublicStats
} from './src/types/surat';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory / File-Persisted Data Store for Multi-User state
let divisions = [...INITIAL_DIVISIONS];
let letterTypes = [...INITIAL_LETTER_TYPES];
let users: User[] = [...INITIAL_USERS];
let suratList: SuratItem[] = [...INITIAL_SURAT];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

// Roman Numerals helper for Month in UGM letter numbers
function getRomanMonth(month: number): string {
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanMonths[month - 1] || 'I';
}

// Generate next official letter number string
function generateLetterNumber(
  nomorUrut: number,
  jenisSuratCode: string,
  divisiCode: string,
  dateString: string
): string {
  const dateObj = new Date(dateString);
  const year = dateObj.getFullYear() || 2026;
  const month = dateObj.getMonth() + 1;
  const romanMonth = getRomanMonth(month);
  const formattedNo = String(nomorUrut).padStart(3, '0');

  const letterTypeObj = letterTypes.find(t => t.code === jenisSuratCode);
  
  if (letterTypeObj && letterTypeObj.formatTemplate) {
    return letterTypeObj.formatTemplate
      .replace('{NO}', formattedNo)
      .replace('{TYPE}', jenisSuratCode)
      .replace('{DIV}', divisiCode)
      .replace('{ROMAN_MONTH}', romanMonth)
      .replace('{YEAR}', String(year));
  }

  // Fallback default UGM PKMK format
  if (jenisSuratCode === 'SPK' || jenisSuratCode === 'ND') {
    return `${formattedNo}/PKMK/${jenisSuratCode}/${divisiCode}/FK-KMK/${romanMonth}/${year}`;
  }
  return `${formattedNo}/PKMK/${jenisSuratCode}/FK-KMK/${romanMonth}/${year}`;
}

// Get highest sequential number for a given year or across existing data, continuing sequentially
function getNextSequenceNumber(year?: number): number {
  let maxFound = 0;

  for (const s of suratList) {
    if (year) {
      const sYear = new Date(s.tglSurat).getFullYear();
      if (sYear !== year) continue;
    }

    // Check numeric property
    if (typeof s.nomorUrut === 'number' && !isNaN(s.nomorUrut) && s.nomorUrut > maxFound) {
      maxFound = s.nomorUrut;
    }

    // Parse prefix number / range from nomorSurat
    if (s.nomorSurat) {
      const match = s.nomorSurat.match(/^([0-9]+)(?:-([0-9]+))?\//);
      if (match) {
        if (match[2]) {
          const endRange = parseInt(match[2], 10);
          if (!isNaN(endRange) && endRange > maxFound) maxFound = endRange;
        }
        const startNo = parseInt(match[1], 10);
        if (!isNaN(startNo) && startNo > maxFound) maxFound = startNo;
      } else {
        const leadingMatch = s.nomorSurat.match(/^([0-9]+)/);
        if (leadingMatch) {
          const val = parseInt(leadingMatch[1], 10);
          if (!isNaN(val) && val > maxFound) maxFound = val;
        }
      }
    }
  }

  // Fallback: If filtered by year but year had no records, check entire list
  if (maxFound === 0 && year && suratList.length > 0) {
    return getNextSequenceNumber(undefined);
  }

  return maxFound > 0 ? maxFound + 1 : 1;
}

// ==========================================
// PUBLIC API ENDPOINTS (Halaman Depan)
// ==========================================

// GET /api/public/surat - Search & List Letters for Public
app.get('/api/public/surat', (req, res) => {
  const { keyword, divisiCode, jenisSuratCode, year, status } = req.query;

  let filtered = [...suratList];

  if (keyword) {
    const q = String(keyword).toLowerCase().trim();
    filtered = filtered.filter(s =>
      s.nomorSurat.toLowerCase().includes(q) ||
      s.perihal.toLowerCase().includes(q) ||
      s.ditujukanKepada.toLowerCase().includes(q) ||
      s.pengajuName.toLowerCase().includes(q) ||
      s.divisiName.toLowerCase().includes(q)
    );
  }

  if (divisiCode && divisiCode !== 'ALL') {
    filtered = filtered.filter(s => s.divisiCode === divisiCode);
  }

  if (jenisSuratCode && jenisSuratCode !== 'ALL') {
    filtered = filtered.filter(s => s.jenisSuratCode === jenisSuratCode);
  }

  if (year && year !== 'ALL') {
    filtered = filtered.filter(s => {
      const sYear = new Date(s.tglSurat).getFullYear();
      return String(sYear) === String(year);
    });
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter(s => s.status === status);
  }

  // Sort descending by tglSurat & nomorUrut
  filtered.sort((a, b) => new Date(b.tglSurat).getTime() - new Date(a.tglSurat).getTime() || b.nomorUrut - a.nomorUrut);

  res.json({
    success: true,
    data: filtered,
    total: filtered.length
  });
});

// GET /api/public/verify/:nomor - Verifikasi Keaslian Nomor Surat
app.get('/api/public/verify/:query', (req, res) => {
  const rawQuery = decodeURIComponent(req.params.query).trim();
  
  const found = suratList.find(s =>
    s.nomorSurat.toLowerCase() === rawQuery.toLowerCase() ||
    s.qrCodeHash.toLowerCase() === rawQuery.toLowerCase() ||
    s.id.toLowerCase() === rawQuery.toLowerCase()
  );

  if (!found) {
    return res.status(404).json({
      success: false,
      message: `Nomor surat atau QR verification code "${rawQuery}" tidak ditemukan dalam pangkalan data resmi PKMK FK KMK UGM.`
    });
  }

  res.json({
    success: true,
    verified: true,
    data: found,
    verifiedAt: new Date().toISOString(),
    institution: 'Pusat Kebijakan dan Manajemen Kesehatan (PKMK) FK-KMK UGM'
  });
});

// GET /api/public/stats - Public Summary Dashboard Stats
app.get('/api/public/stats', (req, res) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const suratTahunIni = suratList.filter(s => new Date(s.tglSurat).getFullYear() === currentYear);
  const suratBulanIni = suratList.filter(s => {
    const d = new Date(s.tglSurat);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const countsByJenis: Record<string, number> = {};
  letterTypes.forEach(t => {
    countsByJenis[t.code] = suratList.filter(s => s.jenisSuratCode === t.code).length;
  });

  const countsByDivisi: Record<string, number> = {};
  divisions.forEach(d => {
    countsByDivisi[d.code] = suratList.filter(s => s.divisiCode === d.code).length;
  });

  const latestGenerated = [...suratList]
    .sort((a, b) => new Date(b.tglDibuat).getTime() - new Date(a.tglDibuat).getTime())
    .slice(0, 5);

  const stats: PublicStats = {
    totalSurat: suratList.length,
    suratTahunIni: suratTahunIni.length,
    suratBulanIni: suratBulanIni.length,
    totalDivisi: divisions.length,
    countsByJenis,
    countsByDivisi,
    latestGenerated
  };

  res.json({
    success: true,
    data: stats
  });
});

// GET /api/public/reference - Divisions and Letter Types reference
app.get('/api/public/reference', (req, res) => {
  res.json({
    success: true,
    divisions,
    letterTypes
  });
});

// ==========================================
// BACKEND MULTI-USER API (Auth & Admin)
// ==========================================

// POST /api/auth/login - Multi-User Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Username tidak ditemukan.'
    });
  }

  // Check password
  if (user.password && user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Password tidak sesuai. Silakan periksa kembali password Anda.'
    });
  }

  // Record audit log
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.roleName,
    action: 'LOGIN',
    details: `Pengguna ${user.name} (${user.roleName}) berhasil masuk ke Portal Backend.`
  };
  auditLogs.unshift(newLog);

  res.json({
    success: true,
    user,
    token: `token-simulated-${user.id}-${Date.now()}`
  });
});

// GET /api/admin/next-number - Preview Next Sequence Number
app.get('/api/admin/next-number', (req, res) => {
  const { date, jenisSuratCode, divisiCode } = req.query;
  const targetDate = String(date || new Date().toISOString().split('T')[0]);
  const year = new Date(targetDate).getFullYear() || 2026;

  const nextUrut = getNextSequenceNumber(year);
  const previewNomor = generateLetterNumber(
    nextUrut,
    String(jenisSuratCode || 'S.Tgs'),
    String(divisiCode || 'DMRS'),
    targetDate
  );

  res.json({
    success: true,
    nextUrut,
    year,
    previewNomor
  });
});

// POST /api/admin/surat - Generate New Official Letter Number
app.post('/api/admin/surat', (req, res) => {
  const {
    jenisSuratCode,
    divisiCode,
    perihal,
    tglSurat,
    ditujukanKepada,
    pengajuName,
    pembuatUserId,
    catatan,
    lampiranInfo,
    customUrut
  } = req.body;

  if (!jenisSuratCode || !divisiCode || !perihal || !tglSurat) {
    return res.status(400).json({
      success: false,
      message: 'Mohon lengkapi data wajib: Jenis Surat, Divisi, Perihal, dan Tanggal Surat.'
    });
  }

  const dateObj = new Date(tglSurat);
  const year = dateObj.getFullYear();

  let nomorUrut = customUrut ? parseInt(customUrut, 10) : getNextSequenceNumber(year);

  const jenisObj = letterTypes.find(t => t.code === jenisSuratCode);
  const divObj = divisions.find(d => d.code === divisiCode);
  const userObj = users.find(u => u.id === pembuatUserId) || users[0];

  const generatedNomorSurat = generateLetterNumber(
    nomorUrut,
    jenisSuratCode,
    divisiCode,
    tglSurat
  );

  // Check if duplicate exists
  const existingIndex = suratList.findIndex(s => s.nomorSurat === generatedNomorSurat);
  if (existingIndex !== -1) {
    return res.status(409).json({
      success: false,
      message: `Nomor surat "${generatedNomorSurat}" sudah terdaftar dalam sistem. Gunakan nomor urut lain.`
    });
  }

  const newSurat: SuratItem = {
    id: `srt-${Date.now()}`,
    nomorSurat: generatedNomorSurat,
    nomorUrut,
    jenisSuratCode,
    jenisSuratName: jenisObj ? jenisObj.name : jenisSuratCode,
    divisiCode,
    divisiName: divObj ? divObj.name : divisiCode,
    perihal,
    tglSurat,
    tglDibuat: new Date().toISOString(),
    ditujukanKepada: ditujukanKepada || 'Mitra / Instansi Terkait',
    pengajuName: pengajuName || userObj.name,
    pembuatUserId: userObj.id,
    pembuatUserName: userObj.name,
    status: 'Aktif',
    qrCodeHash: `PKMK-${year}-${String(nomorUrut).padStart(3, '0')}-${jenisSuratCode.replace('.', '')}-VERIFIED`,
    catatan,
    lampiranInfo
  };

  suratList.unshift(newSurat);

  // Add to Audit Log
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: userObj.id,
    userName: userObj.name,
    userRole: userObj.roleName,
    action: 'CREATE',
    details: `Menerbitkan nomor surat baru: ${newSurat.nomorSurat} (${newSurat.perihal.substring(0, 50)}...)`,
    nomorSuratTarget: newSurat.nomorSurat
  });

  res.json({
    success: true,
    data: newSurat,
    message: 'Nomor surat berhasil diterbitkan dan dicatat dalam sistem.'
  });
});

// PUT /api/admin/surat/:id - Edit full letter data or change status
app.put('/api/admin/surat/:id', (req, res) => {
  const { id } = req.params;
  const {
    nomorSurat,
    perihal,
    ditujukanKepada,
    pengajuName,
    tglSurat,
    jenisSuratCode,
    divisiCode,
    status,
    catatan,
    lampiranInfo,
    userId
  } = req.body;

  const index = suratList.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data surat tidak ditemukan.' });
  }

  const current = suratList[index];
  const oldStatus = current.status;

  if (nomorSurat) current.nomorSurat = nomorSurat;
  if (perihal) current.perihal = perihal;
  if (ditujukanKepada !== undefined) current.ditujukanKepada = ditujukanKepada;
  if (pengajuName !== undefined) current.pengajuName = pengajuName;
  if (tglSurat) current.tglSurat = tglSurat;
  if (catatan !== undefined) current.catatan = catatan;
  if (lampiranInfo !== undefined) current.lampiranInfo = lampiranInfo;

  if (jenisSuratCode) {
    current.jenisSuratCode = jenisSuratCode;
    const jObj = letterTypes.find(t => t.code === jenisSuratCode);
    if (jObj) current.jenisSuratName = jObj.name;
  }

  if (divisiCode) {
    current.divisiCode = divisiCode;
    const dObj = divisions.find(d => d.code === divisiCode);
    if (dObj) current.divisiName = dObj.name;
  }

  if (status && ['Aktif', 'Dibatalkan', 'Arsip'].includes(status)) {
    current.status = status as StatusSurat;
  }

  const updater = users.find(u => u.id === userId) || users[0];

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: updater.id,
    userName: updater.name,
    userRole: updater.roleName,
    action: status && status !== oldStatus ? (status === 'Dibatalkan' ? 'CANCEL' : 'ARCHIVE') : 'UPDATE',
    details: `Memperbarui data surat ${current.nomorSurat} (${current.perihal.substring(0, 40)}...)`,
    nomorSuratTarget: current.nomorSurat
  });

  res.json({
    success: true,
    data: current,
    message: 'Data kolom surat berhasil diperbarui.'
  });
});

// DELETE /api/admin/surat/:id - Delete letter (Admin strictly)
app.delete('/api/admin/surat/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  const index = suratList.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' });
  }

  const removed = suratList.splice(index, 1)[0];
  const adminUser = users.find(u => u.id === String(userId)) || users[0];

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: adminUser.roleName,
    action: 'DELETE',
    details: `Menghapus entri nomor surat: ${removed.nomorSurat} (${removed.perihal})`,
    nomorSuratTarget: removed.nomorSurat
  });

  res.json({
    success: true,
    message: `Nomor surat ${removed.nomorSurat} telah dihapus dari database.`
  });
});

// GET /api/admin/users - Multi-User Management
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    data: users
  });
});

// POST /api/admin/users - Create Multi-User Account
app.post('/api/admin/users', (req, res) => {
  const { name, username, password, email, role, divisiCode } = req.body;

  if (!name || !username || !email || !role || !divisiCode) {
    return res.status(400).json({
      success: false,
      message: 'Mohon isi semua bidang pengguna baru.'
    });
  }

  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Username sudah digunakan oleh akun lain.'
    });
  }

  const divObj = divisions.find(d => d.code === divisiCode);
  const roleNames: Record<string, string> = {
    admin: 'Administrator Sistem',
    sekretariat: 'Staf Sekretariat',
    staf: 'Staf Divisi / Unit',
    staff: 'Staf Divisi / Unit',
    verifikator: 'Verifikator / Pimpinan'
  };

  const newUser: User = {
    id: `usr-${Date.now()}`,
    username,
    password: password || 'pkmk4ugm!',
    name,
    email,
    role,
    roleName: roleNames[role] || role,
    divisiCode,
    divisiName: divObj ? divObj.name : divisiCode,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);

  res.json({
    success: true,
    data: newUser,
    message: 'Pengguna baru berhasil ditambahkan.'
  });
});

// PUT /api/admin/users/:id - Update User Account (Admin CRUD)
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, username, email, role, divisiCode } = req.body;

  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  }

  // Check username uniqueness if changed
  if (username) {
    const duplicate = users.find(u => u.id !== id && u.username.toLowerCase() === username.toLowerCase());
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Username sudah digunakan oleh akun lain.' });
    }
  }

  const roleNames: Record<string, string> = {
    admin: 'Administrator Sistem',
    sekretariat: 'Staf Sekretariat',
    staf: 'Staf Divisi / Unit',
    verifikator: 'Verifikator / Pimpinan'
  };

  const user = users[index];
  if (name) user.name = name;
  if (username) user.username = username;
  if (email) user.email = email;
  if (role) {
    user.role = role;
    user.roleName = roleNames[role] || role;
  }
  if (divisiCode) {
    user.divisiCode = divisiCode;
    const divObj = divisions.find(d => d.code === divisiCode);
    if (divObj) user.divisiName = divObj.name;
  }

  // Update avatar URL if name changed
  if (name) {
    user.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.roleName,
    action: 'UPDATE',
    details: `Memperbarui profil pengguna ${user.name} (${user.username})`,
  });

  res.json({
    success: true,
    data: user,
    message: 'Data pengguna berhasil diperbarui.'
  });
});

// DELETE /api/admin/users/:id - Delete User Account (Admin CRUD)
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;

  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  }

  if (users.length <= 1) {
    return res.status(400).json({ success: false, message: 'Sistem harus memiliki setidaknya satu pengguna.' });
  }

  const deletedUser = users.splice(index, 1)[0];

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'usr-1',
    userName: 'Admin System',
    userRole: 'Administrator Sistem',
    action: 'DELETE',
    details: `Menghapus akun pengguna: ${deletedUser.name} (${deletedUser.username})`,
  });

  res.json({
    success: true,
    message: `Pengguna ${deletedUser.name} berhasil dihapus.`
  });
});

// GET /api/admin/logs - Audit Trail History
app.get('/api/admin/logs', (req, res) => {
  res.json({
    success: true,
    data: auditLogs
  });
});

// POST /api/ai/suggest-perihal - Gemini AI Official Letter Subject Standardizer
app.post('/api/ai/suggest-perihal', async (req, res) => {
  const { draftText, jenisSuratCode, destination } = req.body;

  if (!draftText) {
    return res.status(400).json({ success: false, message: 'Draf teks perihal belum diisi.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY is not present
      const polishedDraft = `${draftText.trim()} - PKMK FK KMK UGM`;
      return res.json({
        success: true,
        suggestedTitle: polishedDraft,
        formalSummary: `Permohonan / penugasan mengenai ${draftText} yang ditujukan kepada ${destination || 'instansi mitra'}.`,
        isAiGenerated: false
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Anda adalah asisten administrasi tata persuratan resmi UGM (Universitas Gadjah Mada), khususnya Pusat Kebijakan dan Manajemen Kesehatan (PKMK) FK-KMK UGM.
    
Tolong perbaiki dan format kalimat perihal surat berikut agar menjadi judul perihal surat dinas yang sangat formal, baku, padat, dan sesuai tata bahasa persuratan resmi Indonesia:

Draf input user: "${draftText}"
Jenis Surat: "${jenisSuratCode || 'Surat Biasa'}"
Tujuan Surat: "${destination || 'Mitra Kerja'}"

Berikan respons JSON dalam format persis seperti ini:
{
  "suggestedTitle": "Perihal surat resmi yang sudah disempurnakan (baku, kapitalisasi benar, tanpa kata informal)",
  "formalSummary": "Ringkasan maksud surat dalam 1 kalimat formal"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    res.json({
      success: true,
      suggestedTitle: parsed.suggestedTitle || draftText,
      formalSummary: parsed.formalSummary || '',
      isAiGenerated: true
    });
  } catch (error: any) {
    console.error('Gemini AI error:', error);
    res.json({
      success: true,
      suggestedTitle: draftText.toUpperCase(),
      formalSummary: 'Format otomatis dari draf input.',
      isAiGenerated: false
    });
  }
});

// ==========================================
// VITE MIDDLEWARE & SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PKMK Letter App] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
