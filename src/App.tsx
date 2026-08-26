import React, { useState, useEffect, useMemo } from 'react';
import { Task, TeamMember, TagCategory, TaskStatus, FilterState, UserAccount } from './types';
import {
  loadTasks,
  saveTasks,
  loadMembers,
  saveMembers,
  loadTags,
  saveTags,
  loadUsers,
  saveUsers,
  loadCurrentUser,
  saveCurrentUser,
  exportTasksToCSV,
} from './utils/storage';
import {
  seedInitialDataIfEmpty,
  subscribeToTasks,
  subscribeToUsers,
  subscribeToMembers,
  subscribeToTags,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  saveMembersToFirestore,
  saveTagsToFirestore,
  batchSyncAllTasksToFirestore,
} from './utils/firestoreSync';
import { Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { AnalyticsSection } from './components/AnalyticsSection';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { AdminApprovalModal } from './components/AdminApprovalModal';
import { INITIAL_TASKS, INITIAL_MEMBERS, INITIAL_TAGS, INITIAL_USERS } from './data/initialData';
import confetti from 'canvas-confetti';

export default function App() {
  const [users, setUsers] = useState<UserAccount[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(loadCurrentUser);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [members, setMembers] = useState<TeamMember[]>(loadMembers);
  const [tags, setTags] = useState<TagCategory[]>(loadTags);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    monthKey: '2026-08', // Matches reference screenshot
    assigneeId: 'everyone',
    selectedTag: 'all',
    searchQuery: '',
    funnelFilter: 'all',
    personaFilter: 'all',
    priorityFilter: 'all',
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultNewStatus, setDefaultNewStatus] = useState<TaskStatus>('not_started');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminApprovalsOpen, setIsAdminApprovalsOpen] = useState(false);

  // Initialize and connect real-time Firestore synchronization for all browsers
  useEffect(() => {
    seedInitialDataIfEmpty();

    const unsubTasks = subscribeToTasks((cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
        saveTasks(cloudTasks);
        setIsLiveConnected(true);
      }
    });

    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        saveUsers(cloudUsers);
        // If current user is logged in, refresh approval status from cloud
        setCurrentUser((prev) => {
          if (!prev) return null;
          const fresh = cloudUsers.find((u) => u.id === prev.id || u.email.toLowerCase() === prev.email.toLowerCase());
          return fresh || prev;
        });
      }
    });

    const unsubMembers = subscribeToMembers((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(cloudMembers);
        saveMembers(cloudMembers);
      }
    });

    const unsubTags = subscribeToTags((cloudTags) => {
      if (cloudTags && cloudTags.length > 0) {
        setTags(cloudTags);
        saveTags(cloudTags);
      }
    });

    return () => {
      unsubTasks();
      unsubUsers();
      unsubMembers();
      unsubTags();
    };
  }, []);

  // Save current user locally so session persists per browser window
  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  // Sync approved users to team members roster so they appear in task assignments
  useEffect(() => {
    const approvedUsers = users.filter((u) => u.status === 'approved');
    let hasChanges = false;
    const updatedMembers = [...members];

    approvedUsers.forEach((user) => {
      const exists = updatedMembers.some(
        (m) => m.id === user.id || m.email?.toLowerCase() === user.email.toLowerCase()
      );
      if (!exists) {
        hasChanges = true;
        updatedMembers.push({
          id: user.id,
          name: user.name,
          initials: user.initials,
          role: user.role,
          roleTitle: user.roleTitle || user.department,
          avatarBg: user.avatarBg,
          avatarText: user.avatarText,
          email: user.email,
        });
      }
    });

    if (hasChanges) {
      setMembers(updatedMembers);
      saveMembers(updatedMembers);
    }
  }, [users]);

  // Calculate pending approvals count for Admin
  const pendingApprovalsCount = useMemo(() => {
    return users.filter((u) => u.status === 'pending').length;
  }, [users]);

  // Extract all available months from tasks
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    months.add('2026-08'); // default reference month
    tasks.forEach((t) => {
      if (t.monthKey) months.add(t.monthKey);
    });
    return Array.from(months).sort().reverse().concat(['all']);
  }, [tasks]);

  // Filter tasks based on month, assignee, tag, funnel, search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Month Filter
      if (filters.monthKey !== 'all' && task.monthKey !== filters.monthKey) {
        return false;
      }

      // Assignee Filter
      if (filters.assigneeId === 'unassigned') {
        if (task.assigneeId) return false;
      } else if (filters.assigneeId !== 'everyone') {
        if (task.assigneeId !== filters.assigneeId) return false;
      }

      // Funnel Filter (TOF, MOF, BOF, Retention)
      if (filters.funnelFilter && filters.funnelFilter !== 'all') {
        if (task.funnel !== filters.funnelFilter) return false;
      }

      // Tag Filter
      if (filters.selectedTag !== 'all') {
        const matchesId = task.tagIds.includes(filters.selectedTag);
        const tagObj = tags.find((t) => t.id === filters.selectedTag || t.name === filters.selectedTag);
        const matchesName = tagObj ? task.tagIds.includes(tagObj.id) : false;
        if (!matchesId && !matchesName) return false;
      }

      // Search Query Filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const inTitle = task.title.toLowerCase().includes(q);
        const inDesc = task.description?.toLowerCase().includes(q) || false;
        const inNotes = task.notes?.toLowerCase().includes(q) || false;
        const inProduct = task.product?.toLowerCase().includes(q) || false;
        const inPersona = task.persona?.toLowerCase().includes(q) || false;
        const inConcept = task.concept?.toLowerCase().includes(q) || false;
        const inCreator = task.createdByName?.toLowerCase().includes(q) || false;
        const inFormat = task.deliverableFormat?.toLowerCase().includes(q) || false;
        if (!inTitle && !inDesc && !inNotes && !inProduct && !inPersona && !inConcept && !inCreator && !inFormat) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters, tags]);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSwitchAccount = () => {
    setCurrentUser(null);
  };

  const handleRegister = (
    newUserData: Omit<UserAccount, 'id' | 'createdAt' | 'status' | 'isAdmin'>
  ) => {
    const existing = users.find(
      (u) => u.email.toLowerCase() === newUserData.email.toLowerCase()
    );
    if (existing) {
      if (existing.status === 'pending') {
        return {
          success: false,
          message:
            'An account with this email is already registered and pending Admin approval.',
        };
      }
      return {
        success: false,
        message: 'An account with this email address already exists. Please Sign In.',
      };
    }

    // The very first created user (or if no admin exists) is automatically the Super Admin!
    const isFirstUser = users.length === 0 || !users.some((u) => u.isAdmin);

    const newUser: UserAccount = {
      ...newUserData,
      id: `user-${Date.now()}`,
      status: isFirstUser ? 'approved' : 'pending',
      isAdmin: isFirstUser,
      role: isFirstUser ? 'admin' : newUserData.role,
      roleTitle: isFirstUser ? (newUserData.roleTitle || 'Creative Director & Admin') : newUserData.roleTitle,
      createdAt: new Date().toISOString(),
      approvedAt: isFirstUser ? new Date().toISOString() : undefined,
      approvedBy: isFirstUser ? 'System (First Account Setup)' : undefined,
    };

    setUsers((prev) => [newUser, ...prev]);
    saveUserToFirestore(newUser);

    if (isFirstUser) {
      const newMember: TeamMember = {
        id: newUser.id,
        name: newUser.name,
        initials: newUser.initials,
        role: 'admin',
        roleTitle: newUser.roleTitle || newUser.department,
        avatarBg: newUser.avatarBg,
        avatarText: newUser.avatarText,
        email: newUser.email,
      };
      setMembers((prev) => {
        const exists = prev.some(
          (m) => m.id === newUser.id || m.email?.toLowerCase() === newUser.email.toLowerCase()
        );
        if (!exists) {
          const updated = [...prev, newMember];
          saveMembersToFirestore(updated);
          return updated;
        }
        return prev;
      });
    }

    return {
      success: true,
      isFirstAdmin: isFirstUser,
      message: isFirstUser
        ? `Super Admin account for "${newUser.name}" created successfully! As the first user, you have full administrator privileges and can log in immediately.`
        : `Account request for "${newUser.name}" (${newUser.department}) has been sent to Admin. You will be able to log in once approved.`,
      account: newUser,
    };
  };

  const handleLoadDemoUsers = () => {
    setUsers(INITIAL_USERS);
    saveUsers(INITIAL_USERS);
    INITIAL_USERS.forEach((u) => saveUserToFirestore(u));
    setMembers(INITIAL_MEMBERS);
    saveMembers(INITIAL_MEMBERS);
    saveMembersToFirestore(INITIAL_MEMBERS);
  };

  const handleResetUsers = () => {
    setUsers([]);
    setCurrentUser(null);
    saveUsers([]);
    saveCurrentUser(null);
  };

  const handleApproveUser = (userId: string, updatedDetails?: Partial<UserAccount>) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const approvedUser: UserAccount = {
      ...targetUser,
      ...updatedDetails,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.name || 'Admin',
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? approvedUser : u)));
    saveUserToFirestore(approvedUser);

    // Ensure they are in members list
    setMembers((prev) => {
      const exists = prev.some(
        (m) => m.id === userId || m.email?.toLowerCase() === approvedUser.email.toLowerCase()
      );
      let updated: TeamMember[];
      if (exists) {
        updated = prev.map((m) =>
          m.id === userId || m.email?.toLowerCase() === approvedUser.email.toLowerCase()
            ? {
                ...m,
                name: approvedUser.name,
                role: approvedUser.role,
                roleTitle: approvedUser.roleTitle || approvedUser.department,
                email: approvedUser.email,
              }
            : m
        );
      } else {
        updated = [
          ...prev,
          {
            id: approvedUser.id,
            name: approvedUser.name,
            initials: approvedUser.initials,
            role: approvedUser.role,
            roleTitle: approvedUser.roleTitle || approvedUser.department,
            avatarBg: approvedUser.avatarBg,
            avatarText: approvedUser.avatarText,
            email: approvedUser.email,
          },
        ];
      }
      saveMembersToFirestore(updated);
      return updated;
    });
  };

  const handleRejectUser = (userId: string, reason?: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      const rejectedUser: UserAccount = {
        ...target,
        status: 'rejected',
        rejectionReason: reason || 'Access denied by administrator',
      };
      setUsers((prev) => prev.map((u) => (u.id === userId ? rejectedUser : u)));
      saveUserToFirestore(rejectedUser);
    }
  };

  const handleUpdateUser = (userId: string, updates: Partial<UserAccount>) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      const updated = { ...target, ...updates };
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      saveUserToFirestore(updated);

      if (currentUser?.id === userId) {
        setCurrentUser(updated);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setMembers((prev) => prev.filter((m) => m.id !== userId));
    deleteUserFromFirestore(userId);
  };

  const handleAddDirectUser = (
    directUser: Omit<UserAccount, 'id' | 'createdAt' | 'status'>
  ) => {
    const newUser: UserAccount = {
      ...directUser,
      id: `user-${Date.now()}`,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    saveUserToFirestore(newUser);

    const newMember: TeamMember = {
      id: newUser.id,
      name: newUser.name,
      initials: newUser.initials,
      role: newUser.role,
      roleTitle: newUser.roleTitle || newUser.department,
      avatarBg: newUser.avatarBg,
      avatarText: newUser.avatarText,
      email: newUser.email,
    };

    setMembers((prev) => {
      const updated = [...prev, newMember];
      saveMembersToFirestore(updated);
      return updated;
    });
  };

  // Task & Board Handlers
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleOpenNewTask = (status: TaskStatus = 'not_started') => {
    setEditingTask(null);
    setDefaultNewStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (savedTask: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTask.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
      } else {
        return [savedTask, ...prev];
      }
    });
    saveTaskToFirestore(savedTask);

    if (savedTask.status === 'done' && (!editingTask || editingTask.status !== 'done')) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTaskFromFirestore(taskId);
  };

  const handleMoveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const existing = tasks.find((t) => t.id === taskId);
    if (!existing) return;

    const completedAt =
      newStatus === 'done' ? (existing.completedAt || new Date().toISOString()) : undefined;
    const updatedTask: Task = {
      ...existing,
      status: newStatus,
      completedAt,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    saveTaskToFirestore(updatedTask);

    if (newStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetData = () => {
    setTasks(INITIAL_TASKS);
    setMembers(INITIAL_MEMBERS);
    setTags(INITIAL_TAGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    saveTasks(INITIAL_TASKS);
    saveMembers(INITIAL_MEMBERS);
    saveTags(INITIAL_TAGS);
    saveUsers(INITIAL_USERS);
    saveCurrentUser(INITIAL_USERS[0]);
    batchSyncAllTasksToFirestore(INITIAL_TASKS);
    saveMembersToFirestore(INITIAL_MEMBERS);
    saveTagsToFirestore(INITIAL_TAGS);
    INITIAL_USERS.forEach((u) => saveUserToFirestore(u));
  };

  const handleImportData = (
    importedTasks: Task[],
    importedMembers: TeamMember[],
    importedTags: TagCategory[]
  ) => {
    setTasks(importedTasks);
    setMembers(importedMembers);
    setTags(importedTags);
    saveTasks(importedTasks);
    saveMembers(importedMembers);
    saveTags(importedTags);
    batchSyncAllTasksToFirestore(importedTasks);
    saveMembersToFirestore(importedMembers);
    saveTagsToFirestore(importedTags);
  };

  // If user is not logged in, render Authentication Screen
  if (!currentUser) {
    return (
      <AuthScreen
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Header with Title, Bento quick stats, User Profile, Admin Approvals & Actions */}
      <Header
        tasks={filteredTasks}
        selectedMonth={filters.monthKey}
        currentUser={currentUser}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewTask={() => handleOpenNewTask('not_started')}
        onExportCSV={() => exportTasksToCSV(tasks, members, tags)}
        onOpenAdminApprovals={() => setIsAdminApprovalsOpen(true)}
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
      />

      {/* Filter & Controls Row */}
      <ControlsBar
        filters={filters}
        onFilterChange={handleFilterChange}
        tags={tags}
        members={members}
        onOpenNewTask={() => handleOpenNewTask('not_started')}
        availableMonths={availableMonths}
      />

      {/* Collapsible Analytics Section */}
      <AnalyticsSection
        tasks={filteredTasks}
        allTasks={tasks}
        members={members}
        tags={tags}
        selectedMonth={filters.monthKey}
      />

      {/* 4-Column Kanban Task Board */}
      <KanbanBoard
        tasks={filteredTasks}
        members={members}
        tags={tags}
        onSelectTask={handleSelectTask}
        onMoveTaskStatus={handleMoveTaskStatus}
        onQuickAddTask={(status) => handleOpenNewTask(status)}
      />

      {/* Task Creation & Review Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        initialStatus={defaultNewStatus}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        members={members}
        tags={tags}
        currentMonth={filters.monthKey}
        currentUser={currentUser}
      />

      {/* Settings Modal (Team, Tags, Backup, Netlify Guide, User Approvals) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        members={members}
        onUpdateMembers={setMembers}
        tags={tags}
        onUpdateTags={setTags}
        tasks={tasks}
        onImportData={handleImportData}
        onResetData={handleResetData}
        currentUser={currentUser}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenAdminApprovals={() => setIsAdminApprovalsOpen(true)}
      />

      {/* Admin User Management & Approvals Modal */}
      <AdminApprovalModal
        isOpen={isAdminApprovalsOpen}
        onClose={() => setIsAdminApprovalsOpen(false)}
        users={users}
        currentUser={currentUser}
        onApproveUser={handleApproveUser}
        onRejectUser={handleRejectUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onAddDirectUser={handleAddDirectUser}
      />
    </div>
  );
}
