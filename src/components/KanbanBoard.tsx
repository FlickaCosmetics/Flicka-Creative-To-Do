import React, { useState } from 'react';
import { Task, TaskStatus, TeamMember, TagCategory } from '../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  members: TeamMember[];
  tags: TagCategory[];
  onSelectTask: (task: Task) => void;
  onMoveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  label: string;
  dotColor: string;
  badgeBg: string;
  columnBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'not_started',
    label: 'Not started',
    dotColor: 'bg-slate-400',
    badgeBg: 'text-slate-600 bg-slate-200',
    columnBg: 'bg-slate-100/90',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    dotColor: 'bg-blue-500',
    badgeBg: 'text-blue-700 bg-blue-100',
    columnBg: 'bg-slate-100/90',
  },
  {
    id: 'in_review',
    label: 'In Review',
    dotColor: 'bg-amber-500',
    badgeBg: 'text-amber-700 bg-amber-100',
    columnBg: 'bg-slate-100/90',
  },
  {
    id: 'done',
    label: 'Done',
    dotColor: 'bg-emerald-500',
    badgeBg: 'text-emerald-700 bg-emerald-100',
    columnBg: 'bg-slate-100/90',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  members,
  tags,
  onSelectTask,
  onMoveTaskStatus,
  onQuickAddTask,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (status: TaskStatus) => {
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTaskStatus(taskId, status);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-[1520px] mx-auto pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              id={`kanban-column-${col.id}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl p-3.5 flex flex-col transition-all duration-200 min-h-[520px] border ${
                isOver
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-400/30 shadow-md'
                  : 'bg-[#F1F5F9] border-slate-200/90 shadow-2xs'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 py-1 mb-3 border-b border-slate-200/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {col.label}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="flex-1 space-y-3">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={task.assigneeId ? memberMap.get(task.assigneeId) : undefined}
                    tags={tags}
                    onClick={() => onSelectTask(task)}
                    onQuickMoveStatus={onMoveTaskStatus}
                  />
                ))}

                {/* Empty State placeholder */}
                {colTasks.length === 0 && (
                  <div className="h-28 rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-4 text-center bg-white/40">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      No cards here — drop card or hit + New
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom "+ New" Button */}
              <button
                id={`btn-add-task-${col.id}`}
                onClick={() => onQuickAddTask(col.id)}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-300 transition-colors cursor-pointer w-fit"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>New</span>
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
};
