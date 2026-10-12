import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Users,
  HardDrive,
  History,
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowLeft,
  FileText,
  Database,
  Building,
  UserCheck,
  X,
  FileCheck
} from 'lucide-react';
import type { UserAccount, AccessLog, StorageStatus } from '../types';

interface OfficerSettingsViewProps {
  onBack: () => void;
  onToast?: (text: string, type?: 'success' | 'error') => void;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const SECURITY_STORAGE_KEY = 'jobcomm_officer_pin_auth';

export const OfficerSettingsView: React.FC<OfficerSettingsViewProps> = ({ onBack, onToast }) => {
  // Security PIN Verification State
  const [isPinAuthenticated, setIsPinAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SECURITY_STORAGE_KEY) === 'true';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // Active Sub-tab in Officer Settings: 'users' | 'storage' | 'logs'
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'storage' | 'logs'>('users');

  // 1. Users state
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [userFormError, setUserFormError] = useState('');

  // 2. Storage state
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [isStorageLoading, setIsStorageLoading] = useState(false);

  // 3. Access logs state
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  // Helper headers with PIN
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-security-pin': '164381'
  });

  // Verify PIN (164381)
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput !== '164381') {
      setPinError('รหัสรักษาความปลอดภัยไม่ถูกต้อง');
      return;
    }

    try {
      setIsVerifyingPin(true);
      const res = await fetch(`${API_BASE}/auth/verify-security-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'รหัสรักษาความปลอดภัยไม่ถูกต้อง');
      }

      setIsPinAuthenticated(true);
      sessionStorage.setItem(SECURITY_STORAGE_KEY, 'true');
      setPinError('');
      onToast?.('ยืนยันรหัสความปลอดภัยถูกต้อง เข้าสู่ระบบจัดการเจ้าหน้าที่');
    } catch (err: any) {
      setPinError(err.message || 'รหัสไม่ถูกต้อง');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Fetch Storage
  const fetchStorage = async () => {
    try {
      setIsStorageLoading(true);
      const res = await fetch(`${API_BASE}/storage/status`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setStorageStatus(data.data || null);
      }
    } catch (err) {
      console.error('Fetch storage error:', err);
    } finally {
      setIsStorageLoading(false);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
    try {
      setIsLogsLoading(true);
      const res = await fetch(`${API_BASE}/access-logs?limit=100`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAccessLogs(data.data || []);
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setIsLogsLoading(false);
    }
  };

  // When PIN unlocked, fetch initial tab data
  useEffect(() => {
    if (isPinAuthenticated) {
      if (activeSubTab === 'users') fetchUsers();
      if (activeSubTab === 'storage') fetchStorage();
      if (activeSubTab === 'logs') fetchLogs();
    }
  }, [isPinAuthenticated, activeSubTab]);

  // Handle Save User (Create or Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setUserFormError('กรุณากรอกชื่อผู้ใช้งาน');
      return;
    }
    if (!editingUser && !passwordInput.trim()) {
      setUserFormError('กรุณากำหนดรหัสผ่าน');
      return;
    }

    try {
      setUserFormError('');
      const payload: any = {
        username: usernameInput.trim(),
        department: departmentInput.trim()
      };
      if (passwordInput.trim()) {
        payload.password = passwordInput.trim();
      }

      let res;
      if (editingUser) {
        res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }

      onToast?.(editingUser ? 'แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว' : 'สร้างผู้ใช้งานใหม่เรียบร้อยแล้ว');
      setIsUserModalOpen(false);
      setEditingUser(null);
      setUsernameInput('');
      setDepartmentInput('');
      setPasswordInput('');
      fetchUsers();
    } catch (err: any) {
      setUserFormError(err.message || 'บันทึกไม่สำเร็จ');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: UserAccount) => {
    if (!window.confirm(`ยืนยันการลบผู้ใช้งาน "${user.username}" หรือไม่?`)) return;

    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        onToast?.('ลบผู้ใช้งานเรียบร้อยแล้ว');
        fetchUsers();
      } else {
        throw new Error('ไม่สามารถลบผู้ใช้ได้');
      }
    } catch (err: any) {
      onToast?.(err.message || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  // Handle Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm('คุณต้องการล้างประวัติการเข้าใช้งานทั้งหมดใช่หรือไม่?')) return;
    try {
      setIsClearingLogs(true);
      const res = await fetch(`${API_BASE}/access-logs`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        onToast?.('ล้างประวัติเข้าใช้งานเรียบร้อยแล้ว');
        fetchLogs();
      }
    } catch (err: any) {
      onToast?.(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setIsClearingLogs(false);
    }
  };

  // If not authenticated with PIN 164381, show PIN entry modal
  if (!isPinAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 mb-1.5">
              พื้นที่ควบคุมความปลอดภัย
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              ยืนยันรหัสรักษาความปลอดภัย
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              กรุณากรอกรหัสรักษาความปลอดภัยเฉพาะเจ้าหน้าที่เพื่อเข้าสู่เมนูผู้ดูแลระบบ
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="กรอกรหัสรักษาความปลอดภัย..."
                  autoFocus
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2.5 text-center text-base font-bold tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-800 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
                />
              </div>
              {pinError && (
                <p className="text-xs text-red-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก / ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={isVerifyingPin}
                className="flex-1 py-2.5 px-4 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isVerifyingPin ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัสผ่าน'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-300 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                เมนูสำหรับเจ้าหน้าที่ (Officer Panel)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              จัดการบัญชีผู้ใช้งาน • ตรวจสอบพื้นที่ Supabase Storage • บันทึกประวัติการเข้าใช้งาน
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>จัดการผู้ใช้งาน</span>
          </button>
          <button
            onClick={() => setActiveSubTab('storage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'storage'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>พื้นที่จัดเก็บ</span>
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัติเข้าใช้งาน</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: USERS MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                <span>รายชื่อผู้ใช้งานและรหัสผ่านเข้าสู่ระบบ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                รหัสผ่านที่กำหนดตรงนี้ จะใช้สำหรับเจ้าหน้าที่หรือผู้บังคับบัญชาพิมพ์รหัสผ่านเพื่อเข้าสู่ระบบ
              </p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setUsernameInput('');
                setDepartmentInput('');
                setPasswordInput('');
                setUserFormError('');
                setIsUserModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>สร้างผู้ใช้งานใหม่</span>
            </button>
          </div>

          {/* User List Table */}
          {isUsersLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>กำลังโหลดรายชื่อผู้ใช้งาน...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              ยังไม่มีข้อมูลผู้ใช้งานในระบบ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">ลำดับ</th>
                    <th className="py-2.5 px-3">ชื่อผู้ใช้งาน</th>
                    <th className="py-2.5 px-3">หน่วยงาน / สังกัด</th>
                    <th className="py-2.5 px-3">วันที่สร้าง</th>
                    <th className="py-2.5 px-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">
                          {u.username.substring(0, 1)}
                        </div>
                        <span>{u.username}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          <Building className="w-3 h-3 text-slate-400" />
                          {u.department || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUsernameInput(u.username);
                              setDepartmentInput(u.department || '');
                              setPasswordInput('');
                              setUserFormError('');
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล / เปลี่ยนรหัสผ่าน"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบผู้ใช้งาน"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: STORAGE USAGE */}
      {activeSubTab === 'storage' && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-700" />
                <span>ตรวจสอบพื้นที่จัดเก็บไฟล์แนบ (Supabase Storage)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ติดตามขนาดพื้นที่ที่ใช้ไป และพื้นที่ที่เหลืออยู่ของ Bucket "attachments" (โควตามาตรฐาน 1 GB)
              </p>
            </div>
            <button
              onClick={fetchStorage}
              disabled={isStorageLoading}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="รีเฟรชข้อมูลพื้นที่"
            >
              <RefreshCw className={`w-4 h-4 ${isStorageLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isStorageLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>กำลังตรวจสอบขนาดพื้นที่...</span>
            </div>
          ) : storageStatus ? (
            <div className="space-y-6">
              {/* Storage Gauge / Progress */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">ประเภทพื้นที่จัดเก็บ:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${storageStatus.isSupabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className="font-bold text-sm text-slate-800">
                        {storageStatus.isSupabase ? 'Supabase Cloud Storage (Bucket: attachments)' : 'เซิร์ฟเวอร์จำลอง (Local Storage)'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">จำนวนไฟล์ทั้งหมด:</span>
                    <p className="text-base font-black text-slate-800">{storageStatus.fileCount} ไฟล์</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-blue-900">ใช้ไปแล้ว {storageStatus.usedFormatted} ({storageStatus.percentUsed}%)</span>
                    <span className="text-emerald-700">คงเหลือ {storageStatus.remainingFormatted}</span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        storageStatus.percentUsed > 90
                          ? 'bg-red-600'
                          : storageStatus.percentUsed > 75
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.max(2, storageStatus.percentUsed)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>0 B</span>
                    <span>โควตามาตรฐาน {storageStatus.quotaFormatted}</span>
                  </div>
                </div>
              </div>

              {/* File list preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>รายการไฟล์ที่บันทึกล่าสุด ({storageStatus.files.length} รายการ)</span>
                </h3>
                {storageStatus.files.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">ยังไม่มีไฟล์เอกสารหรือรูปภาพแนบในระบบ</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {storageStatus.files.map((file, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2 truncate pr-4">
                          <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{file.name}</span>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="font-mono text-slate-600 font-semibold">{file.sizeFormatted}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">ไม่สามารถเชื่อมต่อข้อมูลพื้นที่จัดเก็บได้</p>
          )}
        </div>
      )}

      {/* SUB-TAB 3: ACCESS LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                <span>ประวัติการเข้าใช้งานระบบ (Access Logs)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                บันทึกวันเวลา, บัญชีผู้ใช้งาน, สังกัดหน่วยงาน, หมายเลข IP และผลการยืนยันรหัสผ่าน
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={fetchLogs}
                disabled={isLogsLoading}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="รีเฟรชประวัติ"
              >
                <RefreshCw className={`w-4 h-4 ${isLogsLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleClearLogs}
                disabled={isClearingLogs || accessLogs.length === 0}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างประวัติ</span>
              </button>
            </div>
          </div>

          {isLogsLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>กำลังโหลดประวัติการเข้าใช้งาน...</span>
            </div>
          ) : accessLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              ยังไม่มีประวัติการเข้าใช้งาน
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">วัน-เวลา</th>
                    <th className="py-2.5 px-3">ผู้ใช้งาน</th>
                    <th className="py-2.5 px-3">หน่วยงาน</th>
                    <th className="py-2.5 px-3">หมายเลข IP</th>
                    <th className="py-2.5 px-3">การกระทำ</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString('th-TH') : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {log.username || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {log.department || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {log.ip || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            สำเร็จ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            ไม่สำเร็จ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USER CREATE / EDIT MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-800">
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'สร้างผู้ใช้งานใหม่'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน / ตำแหน่ง *
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="เช่น เจ้าหน้าที่สำนักงาน หรือ ร.อ.สมชาย"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หน่วยงาน / สังกัด
                </label>
                <input
                  type="text"
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  placeholder="เช่น สำนักงานผู้บังคับบัญชา อย. หรือ ฝ่ายการสื่อสาร"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser ? 'รหัสผ่านใหม่ (หากไม่ต้องการเปลี่ยนให้เว้นว่างไว้)' : 'รหัสผ่านสำหรับเข้าสู่ระบบ *'}
                </label>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กำหนดรหัสผ่าน เช่น 123456"
                  required={!editingUser}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-800 focus:bg-white"
                />
              </div>

              {userFormError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{userFormError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
