import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from './config';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// ─── AUTH ────────────────────────────────────────────────
export const authService = {
  loginWithGoogle: () => signInWithPopup(auth, googleProvider),
  loginWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
  async registerWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await userService.createUser(cred.user.uid, { displayName, email, photoURL: '' });
    return cred;
  },
  logout: () => signOut(auth),
  onAuthChange: (cb) => onAuthStateChanged(auth, cb),
};

// ─── USERS ───────────────────────────────────────────────
export const userService = {
  async createUser(uid, data) {
    await setDoc(doc(db, 'users', uid), {
      ...data, role: 'user', bio: '', city: '',
      joinedGroups: [], savedEvents: [], createdAt: serverTimestamp(),
    });
  },
  async getUser(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  async updateUser(uid, data) { await updateDoc(doc(db, 'users', uid), data); },
  async getAllUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async setRole(uid, role) { await updateDoc(doc(db, 'users', uid), { role }); },
};

// ─── GROUPS ──────────────────────────────────────────────
export const groupService = {
  async create(data) {
    return addDoc(collection(db, 'groups'), {
      ...data, memberCount: 1, members: [data.ownerId], createdAt: serverTimestamp(),
    });
  },
  async getAll(category = null) {
    const q = category
      ? query(collection(db, 'groups'), where('category', '==', category), orderBy('memberCount', 'desc'))
      : query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async get(id) {
    const snap = await getDoc(doc(db, 'groups', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  async update(id, data) { await updateDoc(doc(db, 'groups', id), data); },
  async delete(id) { await deleteDoc(doc(db, 'groups', id)); },
  async join(groupId, userId) {
    await updateDoc(doc(db, 'groups', groupId), { members: arrayUnion(userId), memberCount: increment(1) });
    await updateDoc(doc(db, 'users', userId), { joinedGroups: arrayUnion(groupId) });
  },
  async leave(groupId, userId) {
    await updateDoc(doc(db, 'groups', groupId), { members: arrayRemove(userId), memberCount: increment(-1) });
    await updateDoc(doc(db, 'users', userId), { joinedGroups: arrayRemove(groupId) });
  },
};

// ─── EVENTS ──────────────────────────────────────────────
export const eventService = {
  async create(data) {
    return addDoc(collection(db, 'events'), {
      ...data, attendees: [data.createdBy], attendeeCount: 1, createdAt: serverTimestamp(),
    });
  },
  async getAll() {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getByGroup(groupId) {
    const snap = await getDocs(query(collection(db, 'events'), where('groupId', '==', groupId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async get(id) {
    const snap = await getDoc(doc(db, 'events', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  async update(id, data) { await updateDoc(doc(db, 'events', id), data); },
  async delete(id) { await deleteDoc(doc(db, 'events', id)); },
  async attend(eventId, userId) {
    await updateDoc(doc(db, 'events', eventId), { attendees: arrayUnion(userId), attendeeCount: increment(1) });
    await updateDoc(doc(db, 'users', userId), { savedEvents: arrayUnion(eventId) });
  },
  async unattend(eventId, userId) {
    await updateDoc(doc(db, 'events', eventId), { attendees: arrayRemove(userId), attendeeCount: increment(-1) });
    await updateDoc(doc(db, 'users', userId), { savedEvents: arrayRemove(eventId) });
  },
};

// ─── MESSAGES ────────────────────────────────────────────
export const messageService = {
  subscribe(chatId, cb) {
    const q = query(collection(db, 'messages', chatId, 'msgs'), orderBy('createdAt', 'asc'), limit(100));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },
  async send(chatId, data) {
    await addDoc(collection(db, 'messages', chatId, 'msgs'), { ...data, createdAt: serverTimestamp() });
  },
};

// ─── REPORTS ─────────────────────────────────────────────
export const reportService = {
  async create(data) { return addDoc(collection(db, 'reports'), { ...data, status: 'pending', createdAt: serverTimestamp() }); },
  async getAll() {
    const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async resolve(id) { await updateDoc(doc(db, 'reports', id), { status: 'resolved' }); },
};

// ─── STORAGE ─────────────────────────────────────────────
export const storageService = {
  async upload(path, file) {
    const r = ref(storage, path);
    await uploadBytes(r, file);
    return getDownloadURL(r);
  },
};
