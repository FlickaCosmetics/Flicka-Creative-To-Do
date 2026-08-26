import React, { useState } from 'react';
import {
  X,
  Users,
  Tag,
  Upload,
  Download,
  RotateCcw,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { TeamMember, TagCategory, TeamRole, Task, UserAccount } from '../types';
import { exportTasksToJSON, exportTasksToCSV } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
  tags: TagCategory[];
  onUpdateTags: (tags: TagCategory[]) => void;
  tasks: Task[];
  onImportData: (tasks: Task[], members: TeamMember[], tags: TagCategory[]) => void;
  onResetData: () => void;
  currentUser?: UserAccount | null;
  pendingApprovalsCount?: number;
  onOpenAdminApprovals?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  members,
  onUpdateMembers,
  tags,
  onUpdateTags,
  tasks,
  onImportData,
  onResetData,
  currentUser,
  pendingApprovalsCount = 0,
  onOpenAdminApprovals,
}) => {
  const [activeTab, setActiveTab] = useState<'team' | 'tags' | 'data' | 'netlify'>('team');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>('video_editor');
  const [newMemberRoleTitle, setNewMemberRoleTitle] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const initials = newMemberName
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

    const roleDefaults: Record<TeamRole, string> = {
      video_editor: 'Video Editor',
      graphic_designer: 'Graphic Designer',
      performance_marketer: 'Performance Marketer',
      team_lead: 'Creative Lead',
      copywriter: 'Creative Copywriter',
      ugc_creator: 'UGC Creator',
      admin: 'Studio Administrator',
    };

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      initials: initials || 'TM',
      role: newMemberRole,
      roleTitle: newMemberRoleTitle.trim() || roleDefaults[newMemberRole],
      avatarBg: randomBg,
      avatarText: 'text-white',
    };

    onUpdateMembers([...members, newMember]);
    setNewMemberName('');
    setNewMemberRoleTitle('');
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Delete this team member?')) {
      onUpdateMembers(members.filter((m) => m.id !== id));
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const colorPalettes = [
      { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    ];
    const palette = colorPalettes[tags.length % colorPalettes.length];

    const newTag: TagCategory = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      bg: palette.bg,
      text: palette.text,
      border: palette.border,
    };

    onUpdateTags([...tags, newTag]);
    setNewTagName('');
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('Delete this tag?')) {
      onUpdateTags(tags.filter((t) => t.id !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks && Array.isArray(json.tasks)) {
          onImportData(json.tasks, json.members || members, json.tags || tags);
          setImportStatus('Backup loaded successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid backup file format');
        }
      } catch (err) {
        setImportStatus('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="settings-modal-container"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-base">Board Settings</span>
            <span className="text-xs text-slate-400">· Creative Workflow</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-6 text-xs font-bold uppercase tracking-wider bg-slate-50/50">
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'team'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team & Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('tags')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'tags'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Tags & Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'netlify'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>Netlify Hosting</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup & Sync</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs sm:text-sm text-slate-700">
          
          {/* TAB: TEAM & ROLES */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {currentUser?.isAdmin && onOpenAdminApprovals && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-600 text-white rounded-lg font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <div className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                        <span>Admin User Approvals Center</span>
                        {pendingApprovalsCount > 0 && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {pendingApprovalsCount} Pending
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-purple-700">
                        Review pending account requests, set roles & departments, and manage access.
                      </div>
                    </div>
                  </div>
                  <button
                    id="btn-settings-open-approvals"
                    onClick={() => {
                      onClose();
                      onOpenAdminApprovals();
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    Open Approvals &rarr;
                  </button>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900">Creative & Marketing Team Members</h4>
                <p className="text-xs text-slate-500">
                  Assign tasks to Graphic Designers, Video Editors, or Marketing Leads.
                </p>
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${member.avatarBg} ${member.avatarText} shadow-xs`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{member.name}</div>
                        <div className="text-[11px] text-slate-500">{member.roleTitle}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Add New Team Member</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Rahul Sen)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400"
                  />
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as TeamRole)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="video_editor">🎬 Video Editor</option>
                    <option value="graphic_designer">🎨 Graphic Designer</option>
                    <option value="performance_marketer">📈 Performance Marketer</option>
                    <option value="team_lead">👑 Creative Lead</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Custom Title (optional)"
                    value={newMemberRoleTitle}
                    onChange={(e) => setNewMemberRoleTitle(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  + Add Member
                </button>
              </form>
            </div>
          )}

          {/* TAB: TAGS & CATEGORIES */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900">Custom Tags & Deliverable Types</h4>
                <p className="text-xs text-slate-500">
                  Manage tag badges shown in filter bar and card labels (Creative, UGC, AI, Catalogs, etc.).
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-white text-slate-700 border-slate-200 shadow-2xs"
                  >
                    <span>{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="opacity-50 hover:opacity-100 hover:text-rose-600 cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddTag} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="New tag name (e.g. Motion 3D, Performance Ad, Festive Reel)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Add Tag
                </button>
              </form>
            </div>
          )}

          {/* TAB: NETLIFY HOSTING */}
          {activeTab === 'netlify' && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-800">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>Ready to Deploy on Netlify</span>
                </div>
                <p className="leading-relaxed text-teal-800">
                  This app is engineered as a zero-latency client-side Single Page Application (SPA) with automated browser persistence and CSV/JSON sync.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900">How to deploy to Netlify in 1 minute:</span>
                
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                  <li>
                    <strong className="text-slate-800">Direct Drag & Drop:</strong> Run <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">npm run build</code>, then drag the generated <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">dist</code> folder directly into <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">app.netlify.com/drop</a>.
                  </li>
                  <li>
                    <strong className="text-slate-800">GitHub Continuous Deployment:</strong> Connect your repository on Netlify and use:
                    <div className="mt-1.5 p-2.5 bg-white text-slate-800 rounded-lg font-mono text-[11px] space-y-0.5 border border-slate-200 shadow-2xs">
                      <div>Build command: <span className="text-emerald-600 font-bold">npm run build</span></div>
                      <div>Publish directory: <span className="text-emerald-600 font-bold">dist</span></div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB: DATA BACKUP & SYNC */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900">Export & Import Data</h4>
                <p className="text-xs text-slate-500">
                  Save a full backup of all creative briefs, comments, and members.
                </p>
              </div>

              {importStatus && (
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold flex items-center gap-1.5 border border-blue-200">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>{importStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => exportTasksToCSV(tasks, members, tags)}
                  className="p-3 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl text-left flex items-start gap-2.5 transition-all cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Export to CSV Sheet</div>
                    <div className="text-[11px] text-slate-500">For Google Sheets, Excel & Drive uploads</div>
                  </div>
                </button>

                <button
                  onClick={() => exportTasksToJSON(tasks, members, tags)}
                  className="p-3 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl text-left flex items-start gap-2.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Export JSON Backup</div>
                    <div className="text-[11px] text-slate-500">Complete JSON snapshot</div>
                  </div>
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-xs text-slate-800 mb-1.5">
                  Restore from Backup (.json)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Reset board to initial sample tasks:</span>
                <button
                  onClick={() => {
                    if (confirm('Reset to default tasks and members from reference screenshot?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Sample Data</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
