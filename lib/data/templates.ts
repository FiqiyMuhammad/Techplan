
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
    description: "Kurikulum standar keselamatan kerja untuk proyek bangunan.",
    category: "curriculum",
    prompt: "I want to build a training plan for K3 Konstruksi (Construction Health and Safety). Focus on high-rise building safety, personal protective equipment, and emergency response for a 3-day workshop."
  },
  {
    id: "curr-2",
    title: "Bahasa Inggris Dasar Grade 1",
    description: "Kurikulum interaktif untuk anak sekolah dasar.",
    category: "curriculum",
    prompt: "I want to build a curriculum for Grade 1 English. Focus on phonics, greetings, and basic vocabulary (colors, animals) using a play-based learning approach for a 4-week term."
  },
  {
    id: "curr-3",
    title: "Onboarding Admin Baru",
    description: "Rencana pelatihan operasional kantor.",
    category: "curriculum",
    prompt: "I want to build a professional training plan for a New Operational Admin. Include document management, office software proficiency, and internal communication protocols for the first 2 weeks."
  }
];

export const APPSCRIPT_TEMPLATES: Template[] = [
  {
    id: "as-1",
    title: "Otomasi Laporan Bulanan",
    description: "Generate PDF dari Google Sheets secara otomatis.",
    category: "appscript",
    prompt: "I want a script that automatically generates a PDF report from the 'Monthly Summary' sheet and sends it to my email every first day of the month."
  },
  {
    id: "as-2",
    title: "Sinkronisasi Agenda ke Drive",
    description: "Simpan detail meeting Kalender ke berkas teks.",
    category: "appscript",
    prompt: "I want a script that fetches all events from my Google Calendar for today and creates a daily log file in a specific Google Drive folder named 'Calendar Logs'."
  },
  {
    id: "as-3",
    title: "Pembersih Spreadsheet",
    description: "Hapus baris kosong dan duplikat secara instan.",
    category: "appscript",
    prompt: "I want a script that cleans my active spreadsheet by removing all empty rows and highlighting duplicate values in Column A with a red background."
  }
];
