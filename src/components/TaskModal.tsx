import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Calendar,
  User,
  Tag as TagIcon,
  Package,
  Filter,
  Users,
  Globe,
  Upload,
  Video,
  Link as LinkIcon,
  Plus,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Clock,
  Flame,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  AlertCircle,
  Cloud,
  Folder
} from 'lucide-react';
import {
  Task,
  TeamMember,
  TagCategory,
  TaskStatus,
  DeliverableFormat,
  FunnelStage,
  PlatformType,
  MediaItem,
  ActivityItem,
  ChecklistItem,
  ReviewComment,
  UserAccount,
} from '../types';
import { uploadFileToGoogleDrive } from '../utils/googleDrive';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  initialStatus?: TaskStatus;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  members: TeamMember[];
  tags: TagCategory[];
  currentMonth?: string;
  currentUser?: UserAccount | null;
}

const FUNNEL_OPTIONS: { id: FunnelStage; label: string; desc: string; color: string }[] = [
  { id: 'None', label: 'None', desc: 'Unassigned Funnel Stage', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'TOF', label: 'TOF (Top of Funnel)', desc: 'Awareness, Viral Hooks & Brand Discovery', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'MOF', label: 'MOF (Middle of Funnel)', desc: 'Consideration, Swatches, Comparison & Education', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'BOF', label: 'BOF (Bottom of Funnel)', desc: 'Conversion, Offers, UGC Reviews & Testimonials', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Retention', label: 'Retention', desc: 'Loyalty, Restock & Brand Affinity', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const PERSONA_PRESETS = [
  'Working Professionals',
  'College Students',
  'Beauty Enthusiasts',
  'Festive Shoppers',
  'Gen-Z Glam',
  'Brides & Wedding Guests',
  'Moms On-The-Go',
  'Skincare Purists',
  'Everyday Minimalists',
];

const PLATFORM_OPTIONS: PlatformType[] = [
  'None',
  'Meta (Instagram / FB)',
  'Google Ads',
  'YouTube Shorts',
  'TikTok',
  'Amazon Ads',
  'Website / Shopify',
  'Print / Catalog',
  'Other',
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; pill: string }> = {
  not_started: { label: 'Not started', dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-700 border-slate-300' },
  in_progress: { label: 'In progress', dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_review: { label: 'In review', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  done: { label: 'Done', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  initialStatus = 'not_started',
  onSave,
  onDelete,
  members,
  tags,
  currentMonth = '2026-08',
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [product, setProduct] = useState('');
  const [funnel, setFunnel] = useState<FunnelStage>('None');
  const [persona, setPersona] = useState('');
  const [customPersonaInput, setCustomPersonaInput] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>('None');
  
  // Notes & Brief
  const [notes, setNotes] = useState('');
  const [isAddingNoteText, setIsAddingNoteText] = useState(false);
  
  // Media items
  const [refImages, setRefImages] = useState<MediaItem[]>([]);
  const [createdImages, setCreatedImages] = useState<MediaItem[]>([]);
  
  // Checklist & Review
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  // Modals for URL / Video inputs
  const [isUrlModalOpen, setIsUrlModalOpen] = useState<'ref' | 'created' | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaTitleInput, setMediaTitleInput] = useState('');
  const [mediaTypeInput, setMediaTypeInput] = useState<'image' | 'video' | 'url'>('image');

  // Preview lightbox
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  // Hidden file inputs
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const createdFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setStatus(task.status || 'not_started');
      setDueDate(task.dueDate || '');
      setAssigneeId(task.assigneeId || '');
      setSelectedTagIds(task.tagIds || []);
      setProduct(task.product || '');
      setFunnel(task.funnel || 'None');
      setPersona(task.persona || '');
      setPlatform(task.platform || 'None');
      setNotes(task.notes || task.description || '');
      setIsAddingNoteText(Boolean(task.notes || task.description));
      setRefImages(task.refImages || []);
      setCreatedImages(task.createdImages || []);
      setChecklist(task.checklist || []);
      setReviewComments(task.reviewComments || []);
      setActivity(task.activity || [
        {
          id: 'act-init',
          text: `Card created`,
          timestamp: task.createdAt || new Date().toISOString(),
          user: task.createdByName || 'Marketing Team'
        }
      ]);
    } else {
      // New task defaults
      setTitle('');
      setStatus(initialStatus);
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setDueDate(defaultDate.toISOString().split('T')[0]);
      setAssigneeId('');
      setSelectedTagIds(tags.length > 0 ? [tags[0].id] : []);
      setProduct('');
      setFunnel('None');
      setPersona('');
      setCustomPersonaInput(false);
      setPlatform('Meta (Instagram / FB)');
      setNotes('');
      setIsAddingNoteText(false);
      setRefImages([]);
      setCreatedImages([]);
      setChecklist([]);
      setReviewComments([]);
      setActivity([
        {
          id: `act-${Date.now()}`,
          text: 'Card created',
          timestamp: new Date().toISOString(),
          user: 'Priyanka Paliwal'
        }
      ]);
    }
  }, [task, initialStatus, isOpen, tags]);

  // Automatic Google Drive Upload Helper
  const uploadMediaToDrive = async (file: File | Blob, fileName: string, target: 'ref' | 'created', mediaId: string) => {
    const folderType = target === 'ref' ? 'reference' : 'finish';
    try {
      const result = await uploadFileToGoogleDrive(file, fileName, folderType);
      if (result.success && result.driveFileId) {
        const updateMediaList = (prev: MediaItem[]) =>
          prev.map((item) =>
            item.id === mediaId
              ? {
                  ...item,
                  driveFileId: result.driveFileId,
                  driveWebViewLink: result.driveWebViewLink,
                  driveFolder: folderType,
                  driveUploadStatus: 'synced' as const,
                }
              : item
          );

        if (target === 'ref') {
          setRefImages(updateMediaList);
          addActivityItem(`📁 Saved to Google Drive (Reference Images): ${fileName}`);
        } else {
          setCreatedImages(updateMediaList);
          addActivityItem(`📁 Saved to Google Drive (Finish Images): ${fileName}`);
        }
      } else {
        const updateMediaList = (prev: MediaItem[]) =>
          prev.map((item) =>
            item.id === mediaId ? { ...item, driveUploadStatus: 'local' as const } : item
          );
        if (target === 'ref') setRefImages(updateMediaList);
        else setCreatedImages(updateMediaList);
      }
    } catch (err) {
      console.warn('Error during auto drive upload:', err);
    }
  };

  // Global paste handler for pasting images (Ctrl+V) from Google Images or clipboard
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const fileName = `Pasted_Ref_${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-')}.png`;
            const mediaId = `ref-pasted-${Date.now()}`;
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              const newMedia: MediaItem = {
                id: mediaId,
                type: 'image',
                url: dataUrl,
                dataUrl: dataUrl,
                name: fileName,
                driveFolder: 'reference',
                driveUploadStatus: 'uploading',
                createdAt: new Date().toISOString(),
              };
              setRefImages((prev) => [newMedia, ...prev]);
              addActivityItem('Pasted reference image from clipboard');

              // Automatically save pasted image to Google Drive (Reference Images folder)
              uploadMediaToDrive(blob, fileName, 'ref', mediaId);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const addActivityItem = (text: string) => {
    const newItem: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      timestamp: new Date().toISOString(),
      user: 'You'
    };
    setActivity((prev) => [newItem, ...prev]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'ref' | 'created') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const isVideo = file.type.startsWith('video');
      const mediaId = `${target}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newMedia: MediaItem = {
          id: mediaId,
          type: isVideo ? 'video' : 'image',
          url: dataUrl,
          dataUrl: dataUrl,
          name: file.name,
          driveFolder: target === 'ref' ? 'reference' : 'finish',
          driveUploadStatus: 'uploading',
          createdAt: new Date().toISOString(),
        };

        if (target === 'ref') {
          setRefImages((prev) => [newMedia, ...prev]);
          addActivityItem(`Uploaded ref ${isVideo ? 'video' : 'image'}: ${file.name}`);
        } else {
          setCreatedImages((prev) => [newMedia, ...prev]);
          addActivityItem(`Uploaded deliverable: ${file.name}`);
        }

        // Automatically save uploaded file to Google Drive (Reference vs Finish folder)
        uploadMediaToDrive(file, file.name, target, mediaId);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddMediaUrl = () => {
    if (!mediaUrlInput.trim()) return;

    const newMedia: MediaItem = {
      id: `media-url-${Date.now()}`,
      type: mediaTypeInput,
      url: mediaUrlInput.trim(),
      dataUrl: mediaUrlInput.trim(),
      name: mediaTitleInput.trim() || mediaUrlInput.trim().split('/').pop() || 'Media Link',
      createdAt: new Date().toISOString(),
    };

    if (isUrlModalOpen === 'ref') {
      setRefImages((prev) => [newMedia, ...prev]);
      addActivityItem(`Attached ref ${mediaTypeInput}: ${newMedia.name}`);
    } else if (isUrlModalOpen === 'created') {
      setCreatedImages((prev) => [newMedia, ...prev]);
      addActivityItem(`Attached created deliverable: ${newMedia.name}`);
    }

    setIsUrlModalOpen(null);
    setMediaUrlInput('');
    setMediaTitleInput('');
  };

  const handleDeleteMedia = (id: string, target: 'ref' | 'created') => {
    if (target === 'ref') {
      setRefImages((prev) => prev.filter((m) => m.id !== id));
    } else {
      setCreatedImages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `c-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddComment = (statusChange?: TaskStatus) => {
    if (!newCommentText.trim() && !statusChange) return;

    const newCom: ReviewComment = {
      id: `rev-${Date.now()}`,
      authorId: currentUser?.id || 'priyanka',
      authorName: currentUser ? `${currentUser.name} (${currentUser.roleTitle || currentUser.department})` : 'Priyanka Paliwal (Marketing)',
      text: newCommentText.trim() || (statusChange ? `Status updated to ${statusChange}` : ''),
      timestamp: new Date().toISOString(),
      statusChange,
    };

    setReviewComments((prev) => [...prev, newCom]);
    setNewCommentText('');

    if (statusChange) {
      setStatus(statusChange);
      addActivityItem(`Changed status to ${statusChange.replace('_', ' ')}`);
    } else {
      addActivityItem(`Added review note: "${newCom.text.substring(0, 30)}..."`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTitle = title.trim() || 'Untitled Creative Brief';
    const finalMonth = dueDate ? dueDate.substring(0, 7) : currentMonth || '2026-08';

    const savedTask: Task = {
      id: task?.id || `task-${Date.now()}`,
      title: finalTitle,
      description: notes,
      notes,
      status,
      tagIds: selectedTagIds,
      assigneeId: assigneeId || undefined,
      createdById: task?.createdById || currentUser?.id || 'priyanka',
      createdByName: task?.createdByName || currentUser?.name || 'Priyanka Paliwal',
      product: product.trim() || undefined,
      funnel,
      persona: persona.trim() || undefined,
      concept: task?.concept || (persona ? `${funnel} Concept for ${persona}` : undefined),
      platform,
      deliverableFormat: task?.deliverableFormat || '1080x1920 (9:16 Reel/Story)',
      driveLink: task?.driveLink,
      figmaLink: task?.figmaLink,
      referenceUrl: task?.referenceUrl,
      refImages,
      createdImages,
      activity,
      priority: task?.priority || 'medium',
      dueDate: dueDate || undefined,
      monthKey: finalMonth,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: status === 'done' ? task?.completedAt || new Date().toISOString() : undefined,
      reviewComments,
      checklist,
    };

    onSave(savedTask);
    onClose();
  };

  const selectedAssignee = members.find((m) => m.id === assigneeId);

  // Format activity timestamp: e.g. "26 Aug, 11:15"
  const formatActivityTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      
      {/* Hidden File Inputs */}
      <input
        ref={refFileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFileUpload(e, 'ref')}
        className="hidden"
      />
      <input
        ref={createdFileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFileUpload(e, 'created')}
        className="hidden"
      />

      {/* Main Notion/Craft Style White Card Modal matching Screenshot 2 */}
      <div
        id="task-modal-container"
        className="bg-white w-full max-w-[760px] rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[94vh] text-slate-800 my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Top Floating Actions Bar */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Creative Brief
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {STATUS_CONFIG[status].label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {task && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-6 text-sm">
          
          {/* Main Notion-Style Big Title */}
          <div>
            <input
              id="input-task-title"
              type="text"
              placeholder="Untitled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 placeholder-slate-300 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
          </div>

          {/* Key-Value Properties Table matching Screenshot 2 */}
          <div className="space-y-2.5 pt-1 pb-4 border-b border-slate-100 text-sm">
            
            {/* 1. Deadline */}
            <div className="flex items-start sm:items-center text-slate-600 flex-col sm:flex-row gap-1 sm:gap-0">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Deadline</span>
              </div>
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <input
                  id="input-task-deadline"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent hover:bg-slate-50 focus:bg-white text-slate-800 text-sm px-2.5 py-1 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer font-medium"
                />

                {/* Quick preset buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 3);
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    +1 Wk
                  </button>
                </div>

                {/* Live Deadline status badge */}
                {dueDate && (() => {
                  try {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const [y, m, d] = dueDate.split('-').map((v) => parseInt(v, 10));
                    const target = new Date(y, m - 1, d);
                    target.setHours(0, 0, 0, 0);
                    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (status === 'done') {
                      return <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">✓ Completed</span>;
                    }
                    if (diff < 0) {
                      return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300">⚠️ Overdue by {Math.abs(diff)}d</span>;
                    }
                    if (diff === 0) {
                      return <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">⚡ Due Today</span>;
                    }
                    if (diff === 1) {
                      return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Due Tomorrow</span>;
                    }
                    return <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">In {diff} days</span>;
                  } catch {
                    return null;
                  }
                })()}
              </div>
            </div>

            {/* 2. Status */}
            <div className="flex items-center text-slate-600">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <div className="w-4 h-4 rounded-full border border-dashed border-slate-400 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                </div>
                <span>Status</span>
              </div>
              <div className="flex-1">
                <select
                  value={status}
                  onChange={(e) => {
                    const newSt = e.target.value as TaskStatus;
                    setStatus(newSt);
                    addActivityItem(`Moved status to ${STATUS_CONFIG[newSt].label}`);
                  }}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_CONFIG[status].pill} focus:outline-none cursor-pointer`}
                >
                  <option value="not_started">● Not started</option>
                  <option value="in_progress">● In progress</option>
                  <option value="in_review">● In review</option>
                  <option value="done">● Done</option>
                </select>
              </div>
            </div>

            {/* 3. For (Assignee) */}
            <div className="flex items-center text-slate-600">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>For</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <select
                  value={assigneeId}
                  onChange={(e) => {
                    setAssigneeId(e.target.value);
                    const memberObj = members.find((m) => m.id === e.target.value);
                    if (memberObj) {
                      addActivityItem(`Assigned to ${memberObj.name} (${memberObj.roleTitle})`);
                    }
                  }}
                  className="text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer max-w-[240px]"
                >
                  <option value="">Empty ⌵</option>
                  <optgroup label="Video Editors">
                    {members
                      .filter((m) => m.role === 'video_editor')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          🎬 {m.name} ({m.roleTitle})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Graphic Designers">
                    {members
                      .filter((m) => m.role === 'graphic_designer')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          🎨 {m.name} ({m.roleTitle})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Performance Marketers & Leads">
                    {members
                      .filter((m) => m.role === 'performance_marketer' || m.role === 'team_lead')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          📈 {m.name} ({m.roleTitle})
                        </option>
                      ))}
                  </optgroup>
                </select>

                {selectedAssignee && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedAssignee.avatarBg} ${selectedAssignee.avatarText} shadow-xs`}
                    title={selectedAssignee.name}
                  >
                    {selectedAssignee.initials}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Tag */}
            <div className="flex items-center text-slate-600">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <TagIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Tag</span>
              </div>
              <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                {tags.map((t) => {
                  const isSelected = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTagIds((prev) =>
                          isSelected ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                        );
                      }}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? `${t.bg} ${t.text} ${t.border || 'border-slate-300'} font-semibold ring-1 ring-slate-400/20`
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Product */}
            <div className="flex items-center text-slate-600">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <Package className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Product</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="None (e.g. Skin Glow Foundation, Velvet Matte Shades)"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="flex-1 max-w-sm text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-white placeholder-slate-400 text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* 6. Funnel Stage (TOF, MOF, BOF, Retention) */}
            <div className="flex items-center text-slate-600">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Funnel</span>
              </div>
              <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                {FUNNEL_OPTIONS.map((fOpt) => {
                  const isSelected = funnel === fOpt.id;
                  return (
                    <button
                      key={fOpt.id}
                      type="button"
                      onClick={() => setFunnel(fOpt.id)}
                      title={fOpt.desc}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? `${fOpt.color} ring-2 ring-blue-500/20 shadow-2xs`
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {fOpt.id === 'None' ? 'None' : fOpt.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Persona / Concept */}
            <div className="flex items-center text-slate-600">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Persona</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                {!customPersonaInput ? (
                  <select
                    value={persona}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomPersonaInput(true);
                      } else {
                        setPersona(e.target.value);
                      }
                    }}
                    className="text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer max-w-[240px]"
                  >
                    <option value="">None ⌵</option>
                    {PERSONA_PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom Persona / Concept...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1 flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="e.g. Gen-Z Party Glam / Skin-savvy 20s"
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                      autoFocus
                      className="flex-1 text-xs px-2.5 py-1 rounded-md border border-blue-400 bg-white text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomPersonaInput(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 8. Platform */}
            <div className="flex items-center text-slate-600">
              <div className="w-32 flex items-center gap-2 text-slate-400 font-normal">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Platform</span>
              </div>
              <div className="flex-1">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer max-w-[240px]"
                >
                  {PLATFORM_OPTIONS.map((plat) => (
                    <option key={plat} value={plat}>
                      {plat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* NOTES Section matching Screenshot 2 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                NOTES
              </span>
              {!isAddingNoteText && (
                <button
                  type="button"
                  onClick={() => setIsAddingNoteText(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Text</span>
                </button>
              )}
            </div>

            {isAddingNoteText ? (
              <textarea
                rows={3}
                placeholder="Write creative hooks, copy lines, discount codes, creator scripts, and visual directions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 leading-relaxed transition-all"
              />
            ) : (
              <p
                onClick={() => setIsAddingNoteText(true)}
                className="text-xs text-slate-400 italic hover:text-slate-600 cursor-pointer py-1"
              >
                No notes yet — click to add text
              </p>
            )}
          </div>

          {/* REF IMAGES Section matching Screenshot 2 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  REF IMAGES
                </span>
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                  <Folder className="w-3 h-3 text-blue-500" />
                  <span>Google Drive: Flicka Studio - Reference Images</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => refFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-slate-600" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaTypeInput('video');
                    setIsUrlModalOpen('ref');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span>🎬</span>
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaTypeInput('url');
                    setIsUrlModalOpen('ref');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-slate-600" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* Paste & Drop Zone Hint */}
            <div
              onClick={() => refFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  Array.from(files).forEach((file: File) => {
                    const isVideo = file.type.startsWith('video');
                    const mediaId = `ref-drop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      const newMedia: MediaItem = {
                        id: mediaId,
                        type: isVideo ? 'video' : 'image',
                        url: dataUrl,
                        dataUrl: dataUrl,
                        name: file.name,
                        driveFolder: 'reference',
                        driveUploadStatus: 'uploading',
                        createdAt: new Date().toISOString(),
                      };
                      setRefImages((prev) => [newMedia, ...prev]);
                      uploadMediaToDrive(file, file.name, 'ref', mediaId);
                    };
                    reader.readAsDataURL(file);
                  });
                }
              }}
              className="p-3 rounded-xl border border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/20 text-center transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Cloud className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>Paste (Ctrl+V) or drop reference images here — auto-saved directly into Google Drive</span>
              </div>
            </div>

            {/* Ref Images Thumbnails Grid */}
            {refImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {refImages.map((media) => (
                  <div
                    key={media.id}
                    className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                  >
                    {media.type === 'video' ? (
                      <div
                        onClick={() => setPreviewMedia(media)}
                        className="h-28 bg-slate-900 flex flex-col items-center justify-center text-white cursor-pointer"
                      >
                        <span className="text-2xl mb-1">🎬</span>
                        <span className="text-[10px] px-2 text-center truncate w-full text-slate-300">
                          {media.name}
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => setPreviewMedia(media)}
                        className="h-28 bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
                      >
                        <img
                          src={media.dataUrl || media.url}
                          alt={media.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {media.driveWebViewLink && (
                        <a
                          href={media.driveWebViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open file in Google Drive"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 bg-white/95 hover:bg-blue-50 text-blue-600 rounded-md shadow-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(media.id, 'ref')}
                        className="p-1 bg-white/95 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Google Drive Status Indicator */}
                    <div className="p-1.5 text-[10px] text-slate-600 bg-white border-t border-slate-100 flex flex-col gap-0.5">
                      <div className="truncate font-mono font-medium">{media.name}</div>
                      <div className="flex items-center justify-between text-[9px]">
                        {media.driveUploadStatus === 'uploading' ? (
                          <span className="text-blue-600 flex items-center gap-1 font-medium animate-pulse">
                            <Cloud className="w-2.5 h-2.5 shrink-0" />
                            <span>Saving to Drive...</span>
                          </span>
                        ) : media.driveWebViewLink || media.driveUploadStatus === 'synced' ? (
                          <a
                            href={media.driveWebViewLink || 'https://drive.google.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>In Google Drive</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Cloud className="w-2.5 h-2.5 text-slate-400" />
                            <span>Local</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No reference media yet</p>
            )}
          </div>

          {/* CREATED IMAGES Section (Deliverable Outputs) matching Screenshot 2 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  CREATED IMAGES / DELIVERABLES
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Folder className="w-3 h-3 text-emerald-600" />
                  <span>Google Drive: Flicka Studio - Finish Images</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => createdFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-slate-600" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaTypeInput('video');
                    setIsUrlModalOpen('created');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span>🎬</span>
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaTypeInput('url');
                    setIsUrlModalOpen('created');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-slate-600" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* Created Drop Zone */}
            <div
              onClick={() => createdFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  Array.from(files).forEach((file: File) => {
                    const isVideo = file.type.startsWith('video');
                    const mediaId = `created-drop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      const newMedia: MediaItem = {
                        id: mediaId,
                        type: isVideo ? 'video' : 'image',
                        url: dataUrl,
                        dataUrl: dataUrl,
                        name: file.name,
                        driveFolder: 'finish',
                        driveUploadStatus: 'uploading',
                        createdAt: new Date().toISOString(),
                      };
                      setCreatedImages((prev) => [newMedia, ...prev]);
                      uploadMediaToDrive(file, file.name, 'created', mediaId);
                    };
                    reader.readAsDataURL(file);
                  });
                }
              }}
              className="p-3 rounded-xl border border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/80 text-center transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                <Cloud className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Drop deliverable output files here — auto-saved to "Flicka Studio - Finish Images" in Google Drive</span>
              </div>
            </div>

            {/* Created Media Grid */}
            {createdImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {createdImages.map((media) => (
                  <div
                    key={media.id}
                    className="group relative rounded-xl border border-emerald-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                  >
                    {media.type === 'video' ? (
                      <div
                        onClick={() => setPreviewMedia(media)}
                        className="h-28 bg-slate-900 flex flex-col items-center justify-center text-white cursor-pointer"
                      >
                        <span className="text-2xl mb-1">🎬</span>
                        <span className="text-[10px] px-2 text-center truncate w-full text-emerald-300">
                          {media.name}
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => setPreviewMedia(media)}
                        className="h-28 bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
                      >
                        <img
                          src={media.dataUrl || media.url}
                          alt={media.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    {/* Delete & Open in Drive Buttons */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {media.driveWebViewLink && (
                        <a
                          href={media.driveWebViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in Google Drive"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 bg-white/95 hover:bg-emerald-50 text-emerald-700 rounded-md shadow-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(media.id, 'created')}
                        className="p-1 bg-white/95 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md shadow-xs cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-1.5 text-[10px] text-emerald-900 bg-white border-t border-emerald-100 flex flex-col gap-0.5">
                      <div className="truncate font-bold flex items-center justify-between">
                        <span className="truncate">{media.name}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />
                      </div>
                      <div className="flex items-center justify-between text-[9px]">
                        {media.driveUploadStatus === 'uploading' ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-medium animate-pulse">
                            <Cloud className="w-2.5 h-2.5 shrink-0" />
                            <span>Saving to Drive...</span>
                          </span>
                        ) : media.driveWebViewLink || media.driveUploadStatus === 'synced' ? (
                          <a
                            href={media.driveWebViewLink || 'https://drive.google.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Cloud className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>In Finish Images Drive</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Cloud className="w-2.5 h-2.5" />
                            <span>Local</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No created output yet</p>
            )}
          </div>

          {/* DELIVERABLES CHECKLIST SECTION */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                DELIVERABLE CHECKLIST
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {checklist.filter((c) => c.completed).length}/{checklist.length} completed
              </span>
            </div>

            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 text-slate-700">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={item.completed ? 'line-through text-slate-400' : 'font-medium text-slate-800'}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add checklist item */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="e.g. 9:16 export, clean text-free PNG, promo badge..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200"
                >
                  + Add Item
                </button>
              </div>
            </div>
          </div>

          {/* REVIEWS & FEEDBACK THREAD */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                FEEDBACK & REVIEWS
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddComment('in_review')}
                  className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold cursor-pointer"
                >
                  Request Review
                </button>
                <button
                  type="button"
                  onClick={() => handleAddComment('done')}
                  className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold cursor-pointer"
                >
                  Approve & Done
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {reviewComments.length > 0 ? (
                reviewComments.map((com) => (
                  <div key={com.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-700">{com.authorName}</span>
                      <span className="font-mono">{formatActivityTime(com.timestamp)}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{com.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No review notes yet.</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Post revision note or approval feedback..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => handleAddComment()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Post
              </button>
            </div>
          </div>

          {/* ACTIVITY Section matching Screenshot 2 */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              ACTIVITY
            </span>

            <div className="space-y-1.5">
              {activity.map((act) => (
                <div key={act.id} className="flex items-center justify-between text-xs text-slate-500 py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-medium">{act.text}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatActivityTime(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-task"
              className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md shadow-slate-900/20 transition-all cursor-pointer"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>

      {/* URL / Video Dialog */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 w-full max-w-md space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-900">
                Attach {isUrlModalOpen === 'ref' ? 'Reference' : 'Deliverable'} Link
              </span>
              <button onClick={() => setIsUrlModalOpen(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Type</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaTypeInput('video')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold ${
                      mediaTypeInput === 'video' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🎬 Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTypeInput('image')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold ${
                      mediaTypeInput === 'image' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🖼️ Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTypeInput('url')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold ${
                      mediaTypeInput === 'url' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🔗 Web URL
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Instagram Reel Draft, Lookbook Page 1"
                  value={mediaTitleInput}
                  onChange={(e) => setMediaTitleInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Address *</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/... or https://instagram.com/reel/..."
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Preview modal for Media */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <span className="font-bold truncate">{previewMedia.name}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewMedia.dataUrl || previewMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  download={previewMedia.name}
                  className="p-1 text-slate-300 hover:text-white"
                  title="Open Original / Download"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-2 bg-slate-950 flex items-center justify-center overflow-hidden">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.dataUrl || previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[70vh] max-w-full rounded-lg"
                />
              ) : (
                <img
                  src={previewMedia.dataUrl || previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
