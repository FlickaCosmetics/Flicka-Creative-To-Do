import { Task, TeamMember, TagCategory, UserAccount } from '../types';
import { INITIAL_TASKS, INITIAL_MEMBERS, INITIAL_TAGS, INITIAL_USERS } from '../data/initialData';

const TASKS_KEY = 'flicka_creative_tasks_v1';
const MEMBERS_KEY = 'flicka_creative_members_v1';
const TAGS_KEY = 'flicka_creative_tags_v1';
const USERS_KEY = 'flicka_creative_users_v1';
const CURRENT_USER_KEY = 'flicka_creative_current_user_v1';
const LAST_SYNC_KEY = 'flicka_creative_last_sync';

export function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load users from local storage', e);
  }
  // If never saved yet, return empty list so the first registered user becomes the Admin
  return [];
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function loadCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load current user', e);
  }
  // Default is null so default screen is Login or Create Account page
  return null;
}

export function saveCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user', e);
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load tasks from local storage', e);
  }
  return INITIAL_TASKS;
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load members', e);
  }
  return INITIAL_MEMBERS;
}

export function saveMembers(members: TeamMember[]): void {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members', e);
  }
}

export function loadTags(): TagCategory[] {
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load tags', e);
  }
  return INITIAL_TAGS;
}

export function saveTags(tags: TagCategory[]): void {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  } catch (e) {
    console.error('Failed to save tags', e);
  }
}

export function getLastSyncTime(): string {
  return localStorage.getItem(LAST_SYNC_KEY) || 'Just now';
}

export function setLastSyncTime(timeStr: string): void {
  localStorage.setItem(LAST_SYNC_KEY, timeStr);
}

export function exportTasksToCSV(tasks: Task[], members: TeamMember[], tags: TagCategory[]): void {
  const memberMap = new Map(members.map(m => [m.id, m.name]));
  const tagMap = new Map(tags.map(t => [t.id, t.name]));

  const headers = [
    'Task ID',
    'Title',
    'Status',
    'Assignee',
    'Tags',
    'Product / Campaign',
    'Format',
    'Priority',
    'Due Date',
    'Drive Link',
    'Figma Link',
    'Created By',
    'Created Date',
    'Completed Date',
    'Description'
  ];

  const rows = tasks.map(task => {
    const assigneeName = task.assigneeId ? memberMap.get(task.assigneeId) || task.assigneeId : 'Unassigned';
    const tagNames = task.tagIds.map(id => tagMap.get(id) || id).join(', ');
    
    return [
      task.id,
      `"${(task.title || '').replace(/"/g, '""')}"`,
      task.status,
      `"${assigneeName}"`,
      `"${tagNames}"`,
      `"${(task.product || '').replace(/"/g, '""')}"`,
      `"${(task.deliverableFormat || '').replace(/"/g, '""')}"`,
      task.priority,
      task.dueDate || '',
      `"${(task.driveLink || '').replace(/"/g, '""')}"`,
      `"${(task.figmaLink || '').replace(/"/g, '""')}"`,
      `"${(task.createdByName || '').replace(/"/g, '""')}"`,
      task.createdAt ? task.createdAt.split('T')[0] : '',
      task.completedAt ? task.completedAt.split('T')[0] : '',
      `"${(task.description || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `creative_tasks_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTasksToJSON(tasks: Task[], members: TeamMember[], tags: TagCategory[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    tasks,
    members,
    tags,
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `creative_tasks_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
