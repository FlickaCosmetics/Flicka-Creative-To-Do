import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Settings,
  Download,
  FileSpreadsheet,
  Plus,
  Crown,
  Bell,
  LogOut,
  User,
  Users,
  ChevronDown,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { Task, UserAccount } from '../types';

interface HeaderProps {
  tasks: Task[];
  selectedMonth: string;
  currentUser: UserAccount | null;
  pendingApprovalsCount: number;
  onOpenSettings: () => void;
  onOpenNewTask: () => void;
  onExportCSV: () => void;
  onOpenAdminApprovals: () => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tasks,
  selectedMonth,
  currentUser,
  pendingApprovalsCount,
  onOpenSettings,
  onOpenNewTask,
  onExportCSV,
  onOpenAdminApprovals,
  onLogout,
  onSwitchAccount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format month title e.g. "2026-08" -> "Aug 2026"
  const formatMonthTitle = (monthStr: string) => {
    if (monthStr === 'all') return 'All Time';
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  return (
    <header className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1520px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: App Title & Subtitle styled with White Theme aesthetic */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl text-blue-600 font-bold select-none">✦</span>
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
              Creative things to Do <span className="text-blue-600 font-normal text-sm sm:text-base">// Performance Studio</span>
            </h1>
          </div>
          <p className="text-xs sm:text-[12px] text-slate-500 mt-1 flex items-center gap-2 font-mono uppercase tracking-wider flex-wrap">
            <span className="text-slate-700 font-semibold">{formatMonthTitle(selectedMonth)}</span>
            <span>·</span>
            <span className="text-blue-600 font-semibold">{tasks.length} {tasks.length === 1 ? 'card' : 'cards'}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] font-semibold lowercase tracking-normal">
              <Cloud className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>live cloud sync</span>
            </span>
          </p>
        </div>

        {/* Right: Sync Status, Quick Actions & Settings */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Quick Add Assignment Button */}
          <button
            id="btn-header-new-assignment"
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          {/* Admin Pending Approvals Notification Badge */}
          {currentUser?.isAdmin && (
            <button
              id="btn-header-pending-approvals"
              onClick={onOpenAdminApprovals}
              title={`${pendingApprovalsCount} pending registration request(s)`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                pendingApprovalsCount > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <Crown className={`w-3.5 h-3.5 ${pendingApprovalsCount > 0 ? 'text-amber-600' : 'text-purple-600'}`} />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <span className="hidden sm:inline">Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          {/* Export to CSV / Google Sheet */}
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            title="Export tasks to CSV (Google Sheets / Excel compatible)"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Export Sheet</span>
          </button>

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title="Board settings, Team Members & Netlify guide"
            aria-label="Settings"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Current User Profile Pill & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="btn-user-profile-menu"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-lg ${currentUser?.avatarBg || 'bg-purple-600'} ${currentUser?.avatarText || 'text-white'} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
              >
                {currentUser?.initials || 'PP'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1 leading-tight">
                  <span className="truncate max-w-[100px]">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                  {currentUser?.isAdmin && (
                    <Crown className="w-3 h-3 text-purple-600" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[100px] leading-tight">
                  {currentUser?.department || currentUser?.roleTitle || 'Team'}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* User info header */}
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg ${currentUser?.avatarBg || 'bg-purple-600'} ${currentUser?.avatarText || 'text-white'} flex items-center justify-center font-bold text-xs`}
                    >
                      {currentUser?.initials || 'PP'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        <span>{currentUser?.name}</span>
                        {currentUser?.isAdmin && (
                          <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                    <strong>Department:</strong> {currentUser?.department || 'Creative Operations'}
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  {currentUser?.isAdmin && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAdminApprovals();
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 text-purple-600" />
                        <span>User Approvals & Team</span>
                      </span>
                      {pendingApprovalsCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {pendingApprovalsCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Board Settings & Tags</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSwitchAccount();
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Switch Account / Sign In</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
