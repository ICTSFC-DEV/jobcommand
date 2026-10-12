import React from 'react';
import {
  X,
  CalendarCheck,
  TableProperties,
  Shield,
  Radio,
  CalendarDays,
  ShieldAlert,
  LogOut,
  Building,
  UserCheck
} from 'lucide-react';
import type { ActiveTab, UserAccount } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout
}) => {
  if (!isOpen) return null;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    {
      id: 'today' as ActiveTab,
      label: 'ภารกิจวันนี้',
      sublabel: 'รายการภารกิจประจำวันและการติดตามเวลา',
      icon: CalendarCheck
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'ปฏิทินรายเดือน',
      sublabel: 'ดูภาพรวมและจำนวนภารกิจตลอดเดือน',
      icon: CalendarDays
    },
    {
      id: 'table' as ActiveTab,
      label: 'ตารางสรุป / ส่งออกรายงาน',
      sublabel: 'สำหรับจอคอมพิวเตอร์และพิมพ์รายงานทางการ',
      icon: TableProperties
    },
    {
      id: 'admin' as ActiveTab,
      label: 'เมนูสำหรับเจ้าหน้าที่',
      sublabel: 'จัดการผู้ใช้งาน • ตรวจสอบพื้นที่ • ประวัติการใช้งาน',
      icon: ShieldAlert
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-80 sm:w-88 bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header (Clean - removed วันนี้ / กำลังทำ / เสร็จสิ้น counters) */}
          <div>
            <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white p-5 border-b border-blue-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-700/80 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                    <Radio className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base tracking-wide leading-tight">
                      ภารกิจผู้บังคับบัญชา
                    </h2>
                    <p className="text-xs text-blue-200 mt-0.5 font-light">
                      หน่วยบัญชาการอากาศโยธิน (อย.)
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 mt-1 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                      <Shield className="w-3 h-3" />
                      ระบบบันทึกภารกิจ (JobCommand)
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="ปิดเมนู"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Menu List */}
            <div className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-blue-800 text-white font-medium shadow-md'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm truncate block">{item.label}</span>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer with User Info & Logout */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            {currentUser && (
              <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {currentUser.username}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{currentUser.department || 'สำนักงาน อย.'}</span>
                  </p>
                </div>
              </div>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>ออกจากระบบ (Logout)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

