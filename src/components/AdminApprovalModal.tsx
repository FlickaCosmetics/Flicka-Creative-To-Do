import React, { useState } from 'react';
import {
  X,
  Shield,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Users,
  KeyRound,
  Trash2,
  Edit2,
  Crown,
  Sparkles,
  ArrowRight,
  Mail,
  Building,
  Briefcase,
} from 'lucide-react';
import { UserAccount, TeamMember, TeamRole } from '../types';
import confetti from 'canvas-confetti';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount | null;
  onApproveUser: (userId: string, updatedDetails?: Partial<UserAccount>) => void;
  onRejectUser: (userId: string, reason?: string) => void;
  onUpdateUser: (userId: string, updates: Partial<UserAccount>) => void;
  onDeleteUser: (userId: string) => void;
  onAddDirectUser: (user: Omit<UserAccount, 'id' | 'createdAt' | 'status'>) => void;
}

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onApproveUser,
  onRejectUser,
  onUpdateUser,
  onDeleteUser,
  onAddDirectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'add_new'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // New direct user form state
  const [newDirectName, setNewDirectName] = useState('');
  const [newDirectEmail, setNewDirectEmail] = useState('');
  const [newDirectRole, setNewDirectRole] = useState<TeamRole>('video_editor');
  const [newDirectDept, setNewDirectDept] = useState('Video Production');
  const [newDirectRoleTitle, setNewDirectRoleTitle] = useState('Video Editor');
  const [newDirectIsAdmin, setNewDirectIsAdmin] = useState(false);
  const [newDirectPassword, setNewDirectPassword] = useState('flicka123');

  if (!isOpen) return null;

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status === 'approved');
  const rejectedUsers = users.filter((u) => u.status === 'rejected');

  const filteredApprovedUsers = approvedUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.roleTitle.toLowerCase().includes(q)
    );
  });

  const handleApprove = (userId: string) => {
    onApproveUser(userId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleConfirmReject = (userId: string) => {
    onRejectUser(userId, rejectionReason);
    setRejectingUserId(null);
    setRejectionReason('');
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      roleTitle: editingUser.roleTitle,
      department: editingUser.department,
      isAdmin: editingUser.isAdmin,
    });
    setEditingUser(null);
  };

  const handleCreateDirectUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectName.trim() || !newDirectEmail.trim()) return;

    const initials = newDirectName
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      'bg-indigo-600',
      'bg-amber-600',
      'bg-teal-600',
      'bg-purple-600',
      'bg-rose-600',
      'bg-blue-600',
      'bg-emerald-600',
    ];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    onAddDirectUser({
      name: newDirectName.trim(),
      email: newDirectEmail.trim().toLowerCase(),
      password: newDirectPassword.trim() || 'flicka123',
      role: newDirectRole,
      roleTitle: newDirectRoleTitle.trim() || 'Creative Specialist',
      department: newDirectDept.trim() || 'Creative Studio',
      isAdmin: newDirectIsAdmin,
      initials: initials || 'TM',
      avatarBg: randomBg,
      avatarText: 'text-white',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.name || 'Admin',
    });

    // Reset form & go to approved tab
    setNewDirectName('');
    setNewDirectEmail('');
    setActiveTab('approved');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Admin User Management & Approvals
                </h2>
                {pendingUsers.length > 0 && (
                  <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {pendingUsers.length} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Review new registration requests, assign roles/departments, and manage access privileges.
              </p>
            </div>
          </div>
          <button
            id="btn-close-admin-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white px-6 gap-2 pt-2">
          <button
            id="tab-admin-pending"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                pendingUsers.length > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {pendingUsers.length}
            </span>
          </button>

          <button
            id="tab-admin-approved"
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'approved'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Team Directory</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {approvedUsers.length}
            </span>
          </button>

          <button
            id="tab-admin-add-direct"
            onClick={() => setActiveTab('add_new')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'add_new'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pre-Approved User</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PENDING APPROVALS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    No Pending Approval Requests
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    All user accounts are up to date. When new team members sign up, their access requests will appear here for your review.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500">
                    The following users have registered and are waiting for your approval to access the workspace:
                  </p>

                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-2xl border border-amber-200/90 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* User Info */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl ${user.avatarBg} ${user.avatarText} flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
                        >
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px] uppercase tracking-wider">
                              Pending Review
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {user.email}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <Building className="w-3 h-3 text-slate-400" />
                              {user.department}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600">{user.roleTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Registered on {new Date(user.createdAt).toLocaleDateString()} at{' '}
                            {new Date(user.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          id={`btn-approve-user-${user.id}`}
                          onClick={() => handleApprove(user.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>

                        <button
                          id={`btn-reject-user-${user.id}`}
                          onClick={() => setRejectingUserId(user.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 text-xs font-medium transition-all cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rejection Reason Submodal/Prompt */}
              {rejectingUserId && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">
                      Specify Rejection Reason (Optional)
                    </span>
                    <button
                      onClick={() => setRejectingUserId(null)}
                      className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Please register using your official @flickacosmetics.com email"
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setRejectingUserId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmReject(rejectingUserId)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE TEAM DIRECTORY */}
          {activeTab === 'approved' && (
            <div className="space-y-4">
              {/* Search filter */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, department, role..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
                  />
                </div>
              </div>

              {/* Users list */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {filteredApprovedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl ${user.avatarBg} ${user.avatarText} flex items-center justify-center font-bold text-xs shrink-0`}
                      >
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900">{user.name}</h4>
                          {user.isAdmin && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" /> Admin
                            </span>
                          )}
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs text-slate-600 font-medium">{user.roleTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span className="font-mono">{user.email}</span>
                          <span>•</span>
                          <span>{user.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Admin Toggle */}
                      <button
                        title={user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                        onClick={() =>
                          onUpdateUser(user.id, { isAdmin: !user.isAdmin })
                        }
                        className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          user.isAdmin
                            ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        title="Edit User Details"
                        onClick={() => setEditingUser(user)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete User */}
                      {user.id !== currentUser?.id && (
                        <button
                          title="Delete User"
                          onClick={() => {
                            if (confirm(`Remove access for ${user.name}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit User Modal Dialog */}
              {editingUser && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">
                      Edit User: {editingUser.name}
                    </h3>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedUser} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editingUser.name}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, name: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, email: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={editingUser.department}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, department: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Designation / Title
                        </label>
                        <input
                          type="text"
                          value={editingUser.roleTitle}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, roleTitle: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="edit-is-admin"
                        checked={editingUser.isAdmin}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, isAdmin: e.target.checked })
                        }
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="edit-is-admin" className="text-xs font-semibold text-slate-700">
                        Grant Full Administrator Privileges
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer shadow-xs"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD PRE-APPROVED USER */}
          {activeTab === 'add_new' && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Add Pre-Approved Team Member
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly provision a user account without going through the pending approval queue.
                </p>
              </div>

              <form onSubmit={handleCreateDirectUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDirectName}
                      onChange={(e) => setNewDirectName(e.target.value)}
                      placeholder="e.g. Ishaan Sen"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newDirectEmail}
                      onChange={(e) => setNewDirectEmail(e.target.value)}
                      placeholder="ishaan@flickacosmetics.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role Category
                    </label>
                    <select
                      value={newDirectRole}
                      onChange={(e) => setNewDirectRole(e.target.value as TeamRole)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                    >
                      <option value="video_editor">🎬 Video Editor</option>
                      <option value="graphic_designer">🎨 Graphic Designer</option>
                      <option value="performance_marketer">📈 Performance Marketer</option>
                      <option value="ugc_creator">📱 UGC Creator</option>
                      <option value="copywriter">✍️ Copywriter</option>
                      <option value="team_lead">⚡ Creative Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={newDirectDept}
                      onChange={(e) => setNewDirectDept(e.target.value)}
                      placeholder="Video Production"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={newDirectRoleTitle}
                      onChange={(e) => setNewDirectRoleTitle(e.target.value)}
                      placeholder="Senior Editor"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Initial Password
                    </label>
                    <input
                      type="text"
                      value={newDirectPassword}
                      onChange={(e) => setNewDirectPassword(e.target.value)}
                      placeholder="flicka123"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDirectIsAdmin}
                        onChange={(e) => setNewDirectIsAdmin(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Grant Administrator Rights 👑</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Create & Provision Approved Account</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
