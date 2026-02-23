
export interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: "curriculum" | "appscript";
  icon?: string;
}

export const CURRICULUM_TEMPLATES: Template[] = [
  {
    id: "curr-1",
    title: "Pelatihan K3 Konstruksi",
    description: "Rencana pelatihan keselamatan kerja untuk proyek bangunan.",
    category: "curriculum",
    prompt: "Buatkan rencana pelatihan untuk K3 Konstruksi. Fokus pada keselamatan gedung tinggi, penggunaan alat pelindung diri, dan tanggap darurat untuk workshop selama 11 pertemuan."
  },
  {
    id: "curr-2",
    title: "Bahasa Inggris Dasar Grade 1",
    description: "Rencana pembelajaran interaktif untuk anak sekolah dasar.",
    category: "curriculum",
    prompt: "Buatkan kurikulum Bahasa Inggris untuk kelas 1 SD. Fokus pada pengenalan bunyi (phonics), sapaan, dan kosakata dasar seperti warna dan hewan dengan metode belajar sambil bermain selama 4 minggu."
  },
  {
    id: "curr-3",
    title: "Onboarding Admin Baru",
    description: "Rencana pelatihan operasional kantor.",
    category: "curriculum",
    prompt: "Buatkan rencana pelatihan untuk Admin Operasional baru. Masukkan materi pengelolaan dokumen, penggunaan perangkat lunak kantor, dan tata cara komunikasi internal untuk 2 minggu pertama."
  }
];

export const APPSCRIPT_TEMPLATES: Template[] = [
  {
    id: "as-1",
    title: "Formulir Input Data",
    description: "Aplikasi web untuk input data ke Google Sheets.",
    category: "appscript",
    prompt: "Buatkan formulir input data karyawan dengan latar belakang cerah. Form ini meminta Nama, Email, dan Departemen. Munculkan pesan konfirmasi setelah data berhasil disimpan. Pastikan posisi formulir berada tepat di tengah layar."
  },
  {
    id: "as-2",
    title: "Dashboard Rekap Data",
    description: "Menampilkan data Sheets dengan tabel interaktif.",
    category: "appscript",
    prompt: "Buatkan sistem rekap keuangan (Pemasukan/Pengeluaran). Di bagian atas, buatkan formulir input untuk menambah transaksi (Tanggal, Deskripsi, Jumlah, Tipe). Di bawahnya, tampilkan ringkasan Saldo. Paling bawah, buatkan tabel data yang jelas dengan fitur pencarian. Pastikan ada tombol Simpan yang bekerja sempurna."
  },
  {
    id: "as-3",
    title: "Sistem Absensi (Check-in)",
    description: "Aplikasi web absensi dengan jam otomatis.",
    category: "appscript",
    prompt: "Buatkan aplikasi Absensi Shift Kerja. Tampilkan tombol 'Check-in' dengan warna biru dan sertakan jam yang berjalan otomatis di layar. Setelah tombol diklik, tampilkan pesan sukses dan simpan data Nama, Shift, dan Waktu ke Google Sheet."
  }
];
