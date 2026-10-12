export interface Mission {
  id: number;
  title: string;
  category: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  location: string;
  description: string;
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  department?: string;
  created_by?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ActiveTab = 'today' | 'other' | 'add' | 'tv' | 'table' | 'calendar' | 'admin';

export interface UserAccount {
  id: number;
  username: string;
  department: string;
  password?: string;
  created_at?: string;
}

export interface AccessLog {
  id: number;
  username?: string;
  department?: string;
  ip?: string;
  status: 'success' | 'failed';
  action: string;
  created_at: string;
}

export interface StorageStatus {
  isSupabase: boolean;
  totalBytes: number;
  usedFormatted: string;
  quotaBytes: number;
  quotaFormatted: string;
  remainingBytes: number;
  remainingFormatted: string;
  percentUsed: number;
  fileCount: number;
  files: {
    name: string;
    size: number;
    sizeFormatted: string;
    updated_at?: string;
  }[];
}

export interface Stats {
  total: number;
  todayCount: number;
  inProgress: number;
  completed: number;
  pending: number;
}

export interface PresetItem {
  id: number;
  name: string;
  role?: string;
}

export interface Presets {
  categories: PresetItem[];
  locations: PresetItem[];
  personnel: PresetItem[];
}

export const MISSION_CATEGORIES = [
  'ประชุม',
  'ซ่อมบำรุง',
  'ตรวจเช็คระบบ',
  'วางสายสัญญาณ',
  'วิทยุสื่อสาร',
  'ภารกิจพิเศษ'
] as const;

