import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Task, TeamMember, TagCategory, UserAccount } from '../types';
import { INITIAL_TASKS, INITIAL_MEMBERS, INITIAL_TAGS, INITIAL_USERS } from '../data/initialData';

// Firestore collection names
const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users';
const MEMBERS_COLLECTION = 'members';
const TAGS_COLLECTION = 'tags';

let isSeeding = false;

/**
 * Seed initial data to Firestore if the collections are empty
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  if (isSeeding) return;
  try {
    const db = getFirebaseDb();
    const tasksSnap = await getDocs(collection(db, TASKS_COLLECTION));
    
    if (tasksSnap.empty) {
      isSeeding = true;
      console.log('Seeding initial workspace data to Firestore for multi-browser collaboration...');
      const batch = writeBatch(db);

      // Seed Tasks
      INITIAL_TASKS.forEach((task) => {
        const ref = doc(db, TASKS_COLLECTION, task.id);
        batch.set(ref, task);
      });

      // Seed Members
      INITIAL_MEMBERS.forEach((member) => {
        const ref = doc(db, MEMBERS_COLLECTION, member.id);
        batch.set(ref, member);
      });

      // Seed Tags
      INITIAL_TAGS.forEach((tag) => {
        const ref = doc(db, TAGS_COLLECTION, tag.id);
        batch.set(ref, tag);
      });

      // Seed Demo Users
      INITIAL_USERS.forEach((user) => {
        const ref = doc(db, USERS_COLLECTION, user.id);
        batch.set(ref, user);
      });

      await batch.commit();
      console.log('Initial data seeded to Firestore successfully!');
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  } finally {
    isSeeding = false;
  }
}

/**
 * Subscribe to real-time Tasks updates from Firestore
 */
export function subscribeToTasks(onUpdate: (tasks: Task[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const tasksCol = collection(db, TASKS_COLLECTION);

  return onSnapshot(
    tasksCol,
    (snapshot) => {
      if (snapshot.empty && !isSeeding) {
        seedInitialDataIfEmpty();
        return;
      }
      const tasksList: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasksList.push(docSnap.data() as Task);
      });
      onUpdate(tasksList);
    },
    (err) => {
      console.warn('Firestore tasks snapshot listener error:', err);
    }
  );
}

/**
 * Subscribe to real-time Users updates from Firestore
 */
export function subscribeToUsers(onUpdate: (users: UserAccount[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const usersCol = collection(db, USERS_COLLECTION);

  return onSnapshot(
    usersCol,
    (snapshot) => {
      const usersList: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as UserAccount);
      });
      if (usersList.length > 0) {
        onUpdate(usersList);
      }
    },
    (err) => {
      console.warn('Firestore users snapshot listener error:', err);
    }
  );
}

/**
 * Subscribe to real-time Members updates from Firestore
 */
export function subscribeToMembers(onUpdate: (members: TeamMember[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const membersCol = collection(db, MEMBERS_COLLECTION);

  return onSnapshot(
    membersCol,
    (snapshot) => {
      const membersList: TeamMember[] = [];
      snapshot.forEach((docSnap) => {
        membersList.push(docSnap.data() as TeamMember);
      });
      if (membersList.length > 0) {
        onUpdate(membersList);
      }
    },
    (err) => {
      console.warn('Firestore members snapshot listener error:', err);
    }
  );
}

/**
 * Subscribe to real-time Tags updates from Firestore
 */
export function subscribeToTags(onUpdate: (tags: TagCategory[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const tagsCol = collection(db, TAGS_COLLECTION);

  return onSnapshot(
    tagsCol,
    (snapshot) => {
      const tagsList: TagCategory[] = [];
      snapshot.forEach((docSnap) => {
        tagsList.push(docSnap.data() as TagCategory);
      });
      if (tagsList.length > 0) {
        onUpdate(tagsList);
      }
    },
    (err) => {
      console.warn('Firestore tags snapshot listener error:', err);
    }
  );
}

/**
 * Save or update a single task in Firestore
 */
export async function saveTaskToFirestore(task: Task): Promise<void> {
  try {
    const db = getFirebaseDb();
    await setDoc(doc(db, TASKS_COLLECTION, task.id), task, { merge: true });
  } catch (err) {
    console.error(`Failed to save task ${task.id} to Firestore:`, err);
  }
}

/**
 * Delete a single task from Firestore
 */
export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
  } catch (err) {
    console.error(`Failed to delete task ${taskId} from Firestore:`, err);
  }
}

/**
 * Save or update a user account in Firestore
 */
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const db = getFirebaseDb();
    await setDoc(doc(db, USERS_COLLECTION, user.id), user, { merge: true });
  } catch (err) {
    console.error(`Failed to save user ${user.id} to Firestore:`, err);
  }
}

/**
 * Delete a user account from Firestore
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (err) {
    console.error(`Failed to delete user ${userId} from Firestore:`, err);
  }
}

/**
 * Batch save all team members to Firestore
 */
export async function saveMembersToFirestore(members: TeamMember[]): Promise<void> {
  try {
    const db = getFirebaseDb();
    const batch = writeBatch(db);
    members.forEach((member) => {
      const ref = doc(db, MEMBERS_COLLECTION, member.id);
      batch.set(ref, member, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to batch save members to Firestore:', err);
  }
}

/**
 * Batch save all tags to Firestore
 */
export async function saveTagsToFirestore(tags: TagCategory[]): Promise<void> {
  try {
    const db = getFirebaseDb();
    const batch = writeBatch(db);
    tags.forEach((tag) => {
      const ref = doc(db, TAGS_COLLECTION, tag.id);
      batch.set(ref, tag, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to batch save tags to Firestore:', err);
  }
}

/**
 * Batch import or reset all tasks in Firestore
 */
export async function batchSyncAllTasksToFirestore(tasks: Task[]): Promise<void> {
  try {
    const db = getFirebaseDb();
    const batch = writeBatch(db);
    tasks.forEach((task) => {
      const ref = doc(db, TASKS_COLLECTION, task.id);
      batch.set(ref, task, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to batch sync tasks to Firestore:', err);
  }
}
