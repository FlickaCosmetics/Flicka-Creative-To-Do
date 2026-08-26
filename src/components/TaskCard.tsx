import React from 'react';
import { Task, TeamMember, TagCategory, TaskStatus } from '../types';
import { MessageSquare, CheckSquare, Clock, Paperclip, Flame, Image as ImageIcon, Sparkles, AlertCircle, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  assignee?: TeamMember;
  tags: TagCategory[];
  onClick: () => void;
  onQuickMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const FUNNEL_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  TOF: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  MOF: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  BOF: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Retention: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

function getDeadlineInfo(dueDate?: string, taskStatus?: TaskStatus) {
  if (!dueDate) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDate.split('-').map((v) => parseInt(v, 10));
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (taskStatus === 'done') {
      return {
        label: formattedDate,
        isDone: true,
        className: 'text-slate-500 bg-slate-50 border-slate-200',
      };
    }

    if (diffDays < 0) {
      return {
        label: `Overdue (${Math.abs(diffDays)}d)`,
        isOverdue: true,
        className: 'text-rose-700 bg-rose-50 border-rose-300 font-bold',
      };
    } else if (diffDays === 0) {
      return {
        label: 'Deadline: Today',
        isToday: true,
        className: 'text-amber-800 bg-amber-50 border-amber-300 font-bold',
      };
    } else if (diffDays === 1) {
      return {
        label: 'Due Tomorrow',
        isSoon: true,
        className: 'text-blue-700 bg-blue-50 border-blue-200 font-medium',
      };
    } else {
      return {
        label: `Due ${formattedDate}`,
        className: 'text-slate-600 bg-slate-50 border-slate-200 font-medium',
      };
    }
  } catch {
    return {
      label: dueDate,
      className: 'text-slate-500 bg-slate-50 border-slate-200',
    };
  }
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  tags,
  onClick,
}) => {
  const taskTags = tags.filter((t) => task.tagIds.includes(t.id));
  const completedChecklistCount = task.checklist?.filter((c) => c.completed).length || 0;
  const totalChecklistCount = task.checklist?.length || 0;
  const reviewCommentsCount = task.reviewComments?.length || 0;
  const refMediaCount = task.refImages?.length || 0;
  const createdMediaCount = task.createdImages?.length || 0;

  const deadlineInfo = getDeadlineInfo(task.dueDate, task.status);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const funnelBadge = task.funnel && task.funnel !== 'None' ? FUNNEL_BADGES[task.funnel] : null;

  return (
    <div
      id={`task-card-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="group bg-white hover:bg-white rounded-xl p-3.5 border border-slate-200/90 hover:border-slate-400/80 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer select-none relative space-y-2"
    >
      {/* Funnel & Persona / Category Badges on Top */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {funnelBadge && task.funnel && (
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${funnelBadge.bg} ${funnelBadge.text} ${funnelBadge.border}`}
          >
            {task.funnel}
          </span>
        )}

        {task.persona && (
          <span className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[150px]">
            {task.persona}
          </span>
        )}

        {task.priority === 'urgent' && (
          <span title="Urgent Priority" className="shrink-0 flex items-center text-rose-500 ml-auto">
            <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>
      </div>

      {/* Product or Campaign if present */}
      {task.product && (
        <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
          <span className="text-slate-400">📦</span>
          <span className="truncate">{task.product}</span>
        </div>
      )}

      {/* Media Attachments Preview Banner if any */}
      {(refMediaCount > 0 || createdMediaCount > 0) && (
        <div className="flex items-center gap-2 pt-0.5 text-[11px]">
          {refMediaCount > 0 && (
            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[10.5px] font-medium">
              <ImageIcon className="w-3 h-3 text-slate-400" />
              <span>{refMediaCount} ref{refMediaCount > 1 ? 's' : ''}</span>
            </span>
          )}

          {createdMediaCount > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10.5px] font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{createdMediaCount} output{createdMediaCount > 1 ? 's' : ''}</span>
            </span>
          )}
        </div>
      )}

      {/* Middle row: Deliverable format / Checklist / Comments / Deadline */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap font-mono pt-1">
        {task.deliverableFormat && (
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
            {task.deliverableFormat.split(' ')[0]}
          </span>
        )}

        {totalChecklistCount > 0 && (
          <span
            className={`inline-flex items-center gap-1 text-[10.5px] ${
              completedChecklistCount === totalChecklistCount
                ? 'text-emerald-600 font-bold'
                : 'text-slate-500'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>
              {completedChecklistCount}/{totalChecklistCount}
            </span>
          </span>
        )}

        {reviewCommentsCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
            <MessageSquare className="w-3 h-3 text-amber-600" />
            <span>{reviewCommentsCount}</span>
          </span>
        )}

        {/* Prominent Deadline Badge */}
        {deadlineInfo && (
          <span
            className={`inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded-md border ${deadlineInfo.className}`}
            title={`Deadline: ${task.dueDate}`}
          >
            <Clock className="w-3 h-3 shrink-0" />
            <span>{deadlineInfo.label}</span>
          </span>
        )}

        {(task.driveLink || task.figmaLink || task.referenceUrl) && (
          <span className="text-slate-400" title="Asset links attached">
            <Paperclip className="w-3 h-3" />
          </span>
        )}
      </div>

      {/* Bottom row: Assignee Avatar + Tag Pills */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        {/* Left: Assignee avatar */}
        <div className="flex items-center gap-1.5">
          {assignee ? (
            <div
              title={`${assignee.name} (${assignee.roleTitle})`}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${assignee.avatarBg} ${assignee.avatarText} shadow-2xs`}
            >
              {assignee.initials}
            </div>
          ) : (
            <div
              title="Unassigned"
              className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 bg-slate-50"
            >
              +
            </div>
          )}

          {assignee && (
            <span className="text-[11px] text-slate-600 font-medium truncate max-w-[90px]">
              {assignee.name.split(' ')[0]}
            </span>
          )}
        </div>

        {/* Right: Tag Pills */}
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border ${tag.bg} ${tag.text} ${tag.border || 'border-slate-200'}`}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

