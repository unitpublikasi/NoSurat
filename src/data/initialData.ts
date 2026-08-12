import { Division, LetterType, User, SuratItem, AuditLog } from '../types/surat';

export const INITIAL_DIVISIONS: Division[] = [
  {
    id: 'div-1',
    code: 'SEKRED',
    name: 'Sekretariat & Keuangan',
    description: 'Unit Tata Usaha, Keuangan, dan Administrasi Umum PKMK FK KMK UGM'
  },
  {
    id: 'div-2',
    code: 'DMRS',
    name: 'Divisi Manajemen Rumah Sakit',
    description: 'Divisi Pendampingan, Pelatihan & Konsultasi Manajemen Rumah Sakit'
  },
  {
    id: 'div-3',
    code: 'DMM',
    name: 'Divisi Manajemen Mutu',
    description: 'Divisi Pengembangan Mutu Pelayanan Kesehatan dan Keselamatan Pasien'
  },
  {
    id: 'div-4',
    code: 'DKKP',
    name: 'Divisi Kebijakan Kesehatan & Pembiayaan',
    description: 'Divisi Analisis Kebijakan Kesehatan, JKN, dan Pembiayaan Kesehatan'
  },
  {
    id: 'div-5',
    code: 'DEH',
    name: 'Divisi e-Health & Digital Health',
    description: 'Divisi Pengembangan Sistem Informasi Kesehatan & Rekam Medis Elektronik'
  },
  {
    id: 'div-6',
    code: 'UPK',
    name: 'Unit Publikasi & Komunikasi',
    description: 'Unit Publikasi Ilmiah, Website, Jurnal, dan Diseminasi Informasi PKMK'
  }
];

export const INITIAL_LETTER_TYPES: LetterType[] = [
  {
    id: 'type-1',
    code: 'S.Tgs',
    name: 'Surat Tugas',
    description: 'Surat penugasan staf/peneliti/narasumber untuk kegiatan kedinasan',
    formatTemplate: '{NO}/PKMK/{TYPE}/FK-KMK/{ROMAN_MONTH}/{YEAR}'
  },
  {
    id: 'type-2',
    code: 'S.Und',
    name: 'Surat Undangan',
    description: 'Surat undangan pertemuan, webinar, workshop, atau seminar',
    formatTemplate: '{NO}/PKMK/{TYPE}/FK-KMK/{ROMAN_MONTH}/{YEAR}'
  },
  {
    id: 'type-3',
    code: 'S.Kel',
    name: 'Surat Keluar / Biasa',
    description: 'Surat korespondensi eksternal ke instansi atau mitra kerja',
    formatTemplate: '{NO}/PKMK/{TYPE}/FK-KMK/{ROMAN_MONTH}/{YEAR}'
  },
  {
    id: 'type-4',
    code: 'SPK',
    name: 'Surat Perjanjian / Kerjasama',
    description: 'Surat Perjanjian Kerja / Memorandum of Agreement dengan mitra',
    formatTemplate: '{NO}/PKMK/{TYPE}/{DIV}/FK-KMK/{ROMAN_MONTH}/{YEAR}'
  },
  {
    id: 'type-5',
    code: 'SK',
    name: 'Surat Keputusan',
    description: 'Surat Keputusan Pengelola / Ketua PKMK FK KMK UGM',
    formatTemplate: '{NO}/PKMK/{TYPE}/FK-KMK/{ROMAN_MONTH}/{YEAR}'
  },
  {
    id: 'type-6',
    code: 'ND',
    name: 'Nota Dinas',
    description: 'Surat komunikasi dan koordinasi internal antar unit di PKMK / FK-KMK',
    formatTemplate: '{NO}/PKMK/{TYPE}/{DIV}/{ROMAN_MONTH}/{YEAR}'
  },
  {
    id: 'type-7',
    code: 'S.Ket',
    name: 'Surat Keterangan',
    description: 'Surat keterangan magang, peneliti, alumni pelatihan, atau aktivitas PKMK',
    formatTemplate: '{NO}/PKMK/{TYPE}/FK-KMK/{ROMAN_MONTH}/{YEAR}'
  },
  {
    id: 'type-8',
    code: 'S.Pmh',
    name: 'Surat Permohonan',
    description: 'Surat permohonan narasumber, perizinan, atau dukungan fasilitas',
    formatTemplate: '{NO}/PKMK/{TYPE}/FK-KMK/{ROMAN_MONTH}/{YEAR}'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin.pkmk',
    name: 'Rina Sulistyaningsih, M.Kom',
    email: 'rina.sulistya@ugm.ac.id',
    role: 'admin',
    roleName: 'Administrator Sistem',
    divisiCode: 'SEKRED',
    divisiName: 'Sekretariat & Keuangan',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10'
  },
  {
    id: 'usr-2',
    username: 'sekred.pkmk',
    name: 'Siti Rahmawati, A.Md',
    email: 'siti.rahmawati@pkmkugm.id',
    role: 'sekretariat',
    roleName: 'Kepala Sekretariat & Tata Usaha',
    divisiCode: 'SEKRED',
    divisiName: 'Sekretariat & Keuangan',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-15'
  },
  {
    id: 'usr-3',
    username: 'staf.dmrs',
    name: 'Budi Santoso, S.Kep, M.P.H.',
    email: 'budi.santoso@pkmkugm.id',
    role: 'staf',
    roleName: 'Staf Divisi DMRS',
    divisiCode: 'DMRS',
    divisiName: 'Divisi Manajemen Rumah Sakit',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01'
  },
  {
    id: 'usr-4',
    username: 'staf.dmm',
    name: 'Dr. Tri Astuti, M.P.H.',
    email: 'tri.astuti@pkmkugm.id',
    role: 'staf',
    roleName: 'Peneliti Divisi Mutu',
    divisiCode: 'DMM',
    divisiName: 'Divisi Manajemen Mutu',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-10'
  },
  {
    id: 'usr-5',
    username: 'pimpinan.pkmk',
    name: 'Prof. Dr. Laksono Trisnantoro, M.Sc., Ph.D.',
    email: 'laksono.trisnantoro@ugm.ac.id',
    role: 'verifikator',
    roleName: 'Pengarah / Verifikator Utama',
    divisiCode: 'SEKRED',
    divisiName: 'Sekretariat & Keuangan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-01'
  }
];

export const INITIAL_SURAT: SuratItem[] = [
  {
    id: 'srt-2026-1519',
    nomorSurat: '1519/PKMK/S.Tgs/FK-KMK/I/2026',
    nomorUrut: 1519,
    jenisSuratCode: 'S.Tgs',
    jenisSuratName: 'Surat Tugas',
    divisiCode: 'DMRS',
    divisiName: 'Divisi Manajemen Rumah Sakit',
    perihal: 'Tugas Pendampingan Akreditasi dan Manajemen Strategis RSUD Dr. Soediran Mangun Sumarso Wonogiri',
    tglSurat: '2026-01-08',
    tglDibuat: '2026-01-08T08:30:00Z',
    ditujukanKepada: 'Budi Santoso, S.Kep, M.P.H. & Tim DMRS PKMK',
    pengajuName: 'Budi Santoso, S.Kep, M.P.H.',
    pembuatUserId: 'usr-2',
    pembuatUserName: 'Siti Rahmawati, A.Md',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1519-STGS-VERIFIED',
    lampiranInfo: '1 Berkas Jadwal Pendampingan',
    catatan: 'Pendampingan lapangan 12-16 Januari 2026'
  },
  {
    id: 'srt-2026-1520',
    nomorSurat: '1520/PKMK/S.Und/FK-KMK/I/2026',
    nomorUrut: 1520,
    jenisSuratCode: 'S.Und',
    jenisSuratName: 'Surat Undangan',
    divisiCode: 'DKKP',
    divisiName: 'Divisi Kebijakan Kesehatan & Pembiayaan',
    perihal: 'Undangan Webinar Forum Kebijakan Kesehatan Indonesia XV: Evaluasi Kebijakan JKN 2026',
    tglSurat: '2026-01-14',
    tglDibuat: '2026-01-14T09:15:00Z',
    ditujukanKepada: 'Kepala Dinas Kesehatan Provinsi & Kabupaten/Kota se-Indonesia',
    pengajuName: 'Dr. Dwi Handono, M.Kes',
    pembuatUserId: 'usr-2',
    pembuatUserName: 'Siti Rahmawati, A.Md',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1520-SUND-VERIFIED',
    lampiranInfo: 'Kerangka Acuan Kerja (TOR)',
    catatan: 'Acara daring via Zoom Webinar'
  },
  {
    id: 'srt-2026-1521',
    nomorSurat: '1521/PKMK/S.Kel/FK-KMK/I/2026',
    nomorUrut: 1521,
    jenisSuratCode: 'S.Kel',
    jenisSuratName: 'Surat Keluar / Biasa',
    divisiCode: 'DMM',
    divisiName: 'Divisi Manajemen Mutu',
    perihal: 'Permohonan Data Indikator Mutu Nasional Rumah Sakit Rujukan Nasional',
    tglSurat: '2026-01-20',
    tglDibuat: '2026-01-20T11:00:00Z',
    ditujukanKepada: 'Direktur Pelayanan Kesehatan Rujukan Kementerian Kesehatan RI',
    pengajuName: 'Dr. Tri Astuti, M.P.H.',
    pembuatUserId: 'usr-4',
    pembuatUserName: 'Dr. Tri Astuti, M.P.H.',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1521-SKEL-VERIFIED',
    catatan: 'Untuk studi riset mutu layanan kesehatan'
  },
  {
    id: 'srt-2026-1522',
    nomorSurat: '1522/PKMK/SPK/DEH/FK-KMK/II/2026',
    nomorUrut: 1522,
    jenisSuratCode: 'SPK',
    jenisSuratName: 'Surat Perjanjian / Kerjasama',
    divisiCode: 'DEH',
    divisiName: 'Divisi e-Health & Digital Health',
    perihal: 'Perjanjian Kerjasama Pengembangan Dashboard Sistem Informasi Kesehatan Daerah (SIKDA) Kabupaten Sleman',
    tglSurat: '2026-02-02',
    tglDibuat: '2026-02-02T14:20:00Z',
    ditujukanKepada: 'Kepala Dinas Kesehatan Kabupaten Sleman',
    pengajuName: 'Anis Fuad, S.Ked, M.T.',
    pembuatUserId: 'usr-1',
    pembuatUserName: 'Rina Sulistyaningsih, M.Kom',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1522-SPK-VERIFIED',
    lampiranInfo: 'Naskah Kerjasama (MoU/MoA) 2 Rangkap',
    catatan: 'Masa berlaku kerjasama Feb 2026 - Feb 2027'
  },
  {
    id: 'srt-2026-1523',
    nomorSurat: '1523/PKMK/S.Tgs/FK-KMK/II/2026',
    nomorUrut: 1523,
    jenisSuratCode: 'S.Tgs',
    jenisSuratName: 'Surat Tugas',
    divisiCode: 'UPK',
    divisiName: 'Unit Publikasi & Komunikasi',
    perihal: 'Tugas Liputan dan Pengelolaan Media pada Simposium Nasional Manajemen Kesehatan UGM 2026',
    tglSurat: '2026-02-10',
    tglDibuat: '2026-02-10T10:00:00Z',
    ditujukanKepada: 'Tim Unit Publikasi & Komunikasi PKMK FK KMK UGM',
    pengajuName: 'Tim Publikasi PKMK',
    pembuatUserId: 'usr-2',
    pembuatUserName: 'Siti Rahmawati, A.Md',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1523-STGS-VERIFIED'
  },
  {
    id: 'srt-2026-1524',
    nomorSurat: '1524/PKMK/SK/FK-KMK/II/2026',
    nomorUrut: 1524,
    jenisSuratCode: 'SK',
    jenisSuratName: 'Surat Keputusan',
    divisiCode: 'SEKRED',
    divisiName: 'Sekretariat & Keuangan',
    perihal: 'Keputusan Pengelola PKMK tentang Pembentukan Panitia Pelatihan Manajemen Risiko Klinis RS Tipe B & C',
    tglSurat: '2026-02-18',
    tglDibuat: '2026-02-18T13:45:00Z',
    ditujukanKepada: 'Seluruh Anggota Panitia Pelatihan yang Tercantum dalam Lampiran',
    pengajuName: 'Prof. Dr. Laksono Trisnantoro',
    pembuatUserId: 'usr-5',
    pembuatUserName: 'Prof. Dr. Laksono Trisnantoro, M.Sc., Ph.D.',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1524-SK-VERIFIED',
    lampiranInfo: 'Susunan Panitia & Deskripsi Tugas'
  },
  {
    id: 'srt-2026-1525',
    nomorSurat: '1525/PKMK/S.Ket/FK-KMK/III/2026',
    nomorUrut: 1525,
    jenisSuratCode: 'S.Ket',
    jenisSuratName: 'Surat Keterangan',
    divisiCode: 'DMRS',
    divisiName: 'Divisi Manajemen Rumah Sakit',
    perihal: 'Surat Keterangan Selesai Magang dan Research Assistant Program Kebijakan Kesehatan',
    tglSurat: '2026-03-01',
    tglDibuat: '2026-03-01T09:00:00Z',
    ditujukanKepada: 'Aulia Rahmah, S.KM (Mahasiswa Pascasarjana IKM FK-KMK UGM)',
    pengajuName: 'Budi Santoso, S.Kep, M.P.H.',
    pembuatUserId: 'usr-3',
    pembuatUserName: 'Budi Santoso, S.Kep, M.P.H.',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1525-SKET-VERIFIED'
  },
  {
    id: 'srt-2026-1526',
    nomorSurat: '1526/PKMK/ND/DMM/III/2026',
    nomorUrut: 1526,
    jenisSuratCode: 'ND',
    jenisSuratName: 'Nota Dinas',
    divisiCode: 'DMM',
    divisiName: 'Divisi Manajemen Mutu',
    perihal: 'Permohonan Pencairan Dana Operasional Kegiatan Workshop Akreditasi Puskesmas Kabupaten Bantul',
    tglSurat: '2026-03-05',
    tglDibuat: '2026-03-05T15:10:00Z',
    ditujukanKepada: 'Kepala Bagian Keuangan PKMK FK KMK UGM',
    pengajuName: 'Dr. Tri Astuti, M.P.H.',
    pembuatUserId: 'usr-4',
    pembuatUserName: 'Dr. Tri Astuti, M.P.H.',
    status: 'Aktif',
    qrCodeHash: 'PKMK-2026-1526-ND-VERIFIED'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-03-05T15:10:00Z',
    userId: 'usr-4',
    userName: 'Dr. Tri Astuti, M.P.H.',
    userRole: 'Peneliti Divisi Mutu',
    action: 'CREATE',
    details: 'Menerbitkan Nomor Surat Nota Dinas (1526/PKMK/ND/DMM/III/2026)',
    nomorSuratTarget: '1526/PKMK/ND/DMM/III/2026'
  },
  {
    id: 'log-2',
    timestamp: '2026-03-01T09:00:00Z',
    userId: 'usr-3',
    userName: 'Budi Santoso, S.Kep, M.P.H.',
    userRole: 'Staf Divisi DMRS',
    action: 'CREATE',
    details: 'Menerbitkan Nomor Surat Keterangan Magang (1525/PKMK/S.Ket/FK-KMK/III/2026)',
    nomorSuratTarget: '1525/PKMK/S.Ket/FK-KMK/III/2026'
  },
  {
    id: 'log-3',
    timestamp: '2026-02-18T13:45:00Z',
    userId: 'usr-5',
    userName: 'Prof. Dr. Laksono Trisnantoro, M.Sc., Ph.D.',
    userRole: 'Pengarah / Verifikator Utama',
    action: 'CREATE',
    details: 'Menerbitkan Surat Keputusan Pengelola (1524/PKMK/SK/FK-KMK/II/2026)',
    nomorSuratTarget: '1524/PKMK/SK/FK-KMK/II/2026'
  }
];
