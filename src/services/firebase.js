import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  addDoc, 
  updateDoc,
  orderBy
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Detect if we have real credentials
const isRealFirebase = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key'

if (!isRealFirebase) {
  console.info(
    '[ExamHub] No valid Firebase credentials found — running in Demo Mode.\n' +
    'Sign up / Sign in works locally. Google OAuth requires real Firebase setup.\n' +
    'Add your credentials to .env to enable full cloud sync.'
  )
}

const app = isRealFirebase ? initializeApp(firebaseConfig) : null
const auth = isRealFirebase ? getAuth(app) : null
const db = isRealFirebase ? getFirestore(app) : null
const googleProvider = isRealFirebase ? new GoogleAuthProvider() : null

/* ══════════════════════════════════════════════════════════════
   DEMO AUTH  — localStorage-backed, no server required
   ══════════════════════════════════════════════════════════════ */
const DEMO_USERS_KEY = 'examhub_demo_users'
const DEMO_SESSION_KEY = 'examhub_demo_session'

// User accounts persist in localStorage (data survives browser close)
function getDemoUsers() { try { return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}') } catch { return {} } }
function saveDemoUsers(users) { localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users)) }

// Session lives in sessionStorage — clears when browser/tab is closed
// so the user must log in again, but their data is still there
function getDemoSession() { try { return JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY) || 'null') } catch { return null } }
function saveDemoSession(session) { if (session) sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session)); else sessionStorage.removeItem(DEMO_SESSION_KEY) }

async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + 'examhub_salt'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function makeUser(email) { return { uid: `demo_${crypto.randomUUID()}`, email } }

const listeners = new Set()
function notifyListeners(user) { listeners.forEach(cb => { try { cb(user) } catch (_) {} }) }

const demoAuth = {
  signUp: async (email, password) => {
    await new Promise(r => setTimeout(r, 600))
    const users = getDemoUsers()
    if (users[email]) throw new Error('User already registered.')
    const hash = await hashPassword(password)
    const user = makeUser(email)
    users[email] = { hash, user }
    saveDemoUsers(users)
    saveDemoSession({ user })
    notifyListeners(user)
    return { user }
  },
  signIn: async (email, password) => {
    await new Promise(r => setTimeout(r, 600))
    const users = getDemoUsers()
    const record = users[email]
    if (!record) throw new Error('No account found with this email.')
    const hash = await hashPassword(password)
    if (hash !== record.hash) throw new Error('Incorrect password.')
    saveDemoSession({ user: record.user })
    notifyListeners(record.user)
    return { user: record.user }
  },
  signOut: async () => {
    saveDemoSession(null)
    notifyListeners(null)
  },
  onAuthStateChange: (cb) => {
    listeners.add(cb)
    const session = getDemoSession()
    setTimeout(() => cb(session?.user || null), 0)
    return () => listeners.delete(cb)
  }
}

/* ── Auth helpers ────────────────────────────────────────── */
export const authService = {
  signUp: async (email, password) => {
    if (isRealFirebase) return createUserWithEmailAndPassword(auth, email, password)
    return demoAuth.signUp(email, password)
  },
  signIn: async (email, password) => {
    if (isRealFirebase) return signInWithEmailAndPassword(auth, email, password)
    return demoAuth.signIn(email, password)
  },
  signInGoogle: async () => {
    if (isRealFirebase) return signInWithPopup(auth, googleProvider)
    throw new Error('Google Sign-In requires a real Firebase project. Please use Email/Password.')
  },
  signOut: async () => {
    if (isRealFirebase) return firebaseSignOut(auth)
    return demoAuth.signOut()
  },
  onAuthStateChange: (cb) => {
    if (isRealFirebase) return onAuthStateChanged(auth, cb)
    return demoAuth.onAuthStateChange(cb)
  }
}

/* ── Safe no-op / LocalStorage wrappers for Demo Mode ────── */
const noopResult = (data = null) => Promise.resolve({ data, error: null })

export const progressService = {
  getAll: async (userId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'chapter_progress'), where('user_id', '==', userId))
      const snap = await getDocs(q)
      return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
    }
    return noopResult([]) // Demo mode doesn't save tracker fully, or you can add localstorage logic
  },
  upsert: async (row) => {
    if (isRealFirebase) {
      const docRef = doc(db, 'chapter_progress', `${row.user_id}_${row.chapter_id}`)
      await setDoc(docRef, row, { merge: true })
      return noopResult()
    }
    return noopResult()
  },
  delete: async (userId, chapterId) => {
    if (isRealFirebase) {
      await deleteDoc(doc(db, 'chapter_progress', `${userId}_${chapterId}`))
    }
    return noopResult()
  }
}

export const historyService = {
  getAll: async (userId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'mock_history'), where('user_id', '==', userId), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
    }
    // Demo: load from localStorage
    const records = JSON.parse(localStorage.getItem(`mock_history_${userId}`) || '[]')
    return { data: records, error: null }
  },
  insert: async (row) => {
    if (isRealFirebase) {
      const docRef = await addDoc(collection(db, 'mock_history'), { ...row, created_at: new Date().toISOString() })
      return { data: { id: docRef.id, ...row }, error: null }
    }
    // Demo: persist to localStorage
    const userId = row.user_id
    const records = JSON.parse(localStorage.getItem(`mock_history_${userId}`) || '[]')
    const newRecord = { id: crypto.randomUUID(), ...row, created_at: new Date().toISOString() }
    records.unshift(newRecord)
    localStorage.setItem(`mock_history_${userId}`, JSON.stringify(records))
    return { data: newRecord, error: null }
  },
  update: async (id, updates) => {
    if (isRealFirebase) {
      await updateDoc(doc(db, 'mock_history', id), updates)
      return { data: { id, ...updates }, error: null }
    }
    // Demo: update in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('mock_history_')) {
        let records = JSON.parse(localStorage.getItem(key) || '[]')
        const idx = records.findIndex(r => r.id === id)
        if (idx >= 0) {
          records[idx] = { ...records[idx], ...updates }
          localStorage.setItem(key, JSON.stringify(records))
          return { data: records[idx], error: null }
        }
      }
    }
    return { data: { id, ...updates }, error: null }
  },
  delete: async (id) => {
    if (isRealFirebase) await deleteDoc(doc(db, 'mock_history', id))
    else {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('mock_history_')) {
          let records = JSON.parse(localStorage.getItem(key) || '[]')
          if (records.some(r => r.id === id)) {
            records = records.filter(r => r.id !== id)
            localStorage.setItem(key, JSON.stringify(records))
            break
          }
        }
      }
    }
    return noopResult()
  }
}

export const favoritesService = {
  getAll: async (userId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'user_favorites'), where('user_id', '==', userId))
      const snap = await getDocs(q)
      return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
    }
    return noopResult(JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]'))
  },
  add: async (userId, examId, pyqId, details) => {
    const newFav = { user_id: userId, exam_id: examId, pyq_id: pyqId, details, created_at: new Date().toISOString() }
    if (isRealFirebase) {
      const docRef = await addDoc(collection(db, 'user_favorites'), newFav)
      return { data: { id: docRef.id, ...newFav }, error: null }
    }
    const favs = JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]')
    newFav.id = crypto.randomUUID()
    favs.push(newFav)
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(favs))
    return { data: newFav, error: null }
  },
  remove: async (userId, pyqId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'user_favorites'), where('user_id', '==', userId), where('pyq_id', '==', pyqId))
      const snap = await getDocs(q)
      snap.docs.forEach(async (d) => await deleteDoc(d.ref))
      return noopResult()
    }
    let favs = JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]')
    favs = favs.filter(f => f.pyq_id !== pyqId)
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(favs))
    return noopResult()
  }
}

export const predictionsService = {
  getAll: async (userId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'predictions'), where('user_id', '==', userId), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
    }
    return noopResult(JSON.parse(localStorage.getItem(`predictions_${userId}`) || '[]'))
  },
  add: async (userId, examId, rank, colleges) => {
    const newPred = { user_id: userId, exam_id: examId, rank, colleges_json: JSON.stringify(colleges), created_at: new Date().toISOString() }
    if (isRealFirebase) {
      const docRef = await addDoc(collection(db, 'predictions'), newPred)
      return { data: { id: docRef.id, ...newPred }, error: null }
    }
    const preds = JSON.parse(localStorage.getItem(`predictions_${userId}`) || '[]')
    newPred.id = crypto.randomUUID()
    preds.unshift(newPred)
    localStorage.setItem(`predictions_${userId}`, JSON.stringify(preds))
    return { data: newPred, error: null }
  },
  remove: async (id) => {
    if (isRealFirebase) {
      await deleteDoc(doc(db, 'predictions', id))
      return noopResult()
    }
    for(let i = 0; i < localStorage.length; i++){
       let key = localStorage.key(i);
       if(key.startsWith('predictions_')){
          let preds = JSON.parse(localStorage.getItem(key) || '[]')
          if(preds.some(p => p.id === id)){
              preds = preds.filter(p => p.id !== id);
              localStorage.setItem(key, JSON.stringify(preds));
              break;
          }
       }
    }
    return noopResult()
  }
}

/* ── MARKS App Features: Tests & Question Bank ──────────── */
export const testService = {
  getAll: async (userId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'user_tests'), where('user_id', '==', userId), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
    }
    return noopResult(JSON.parse(localStorage.getItem(`tests_${userId}`) || '[]'))
  },
  insert: async (userId, testData) => {
    const newTest = { user_id: userId, ...testData, created_at: new Date().toISOString() }
    if (isRealFirebase) {
      const docRef = await addDoc(collection(db, 'user_tests'), newTest)
      return { data: { id: docRef.id, ...newTest }, error: null }
    }
    const tests = JSON.parse(localStorage.getItem(`tests_${userId}`) || '[]')
    newTest.id = crypto.randomUUID()
    tests.unshift(newTest)
    localStorage.setItem(`tests_${userId}`, JSON.stringify(tests))
    return { data: newTest, error: null }
  }
}

export const questionActionService = {
  getBookmarks: async (userId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'bookmarked_questions'), where('user_id', '==', userId))
      const snap = await getDocs(q)
      return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
    }
    return noopResult(JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]'))
  },
  toggleBookmark: async (userId, question) => {
    if (!isRealFirebase) {
      let bms = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]')
      const exists = bms.find(b => b.question_id === question.id)
      if (exists) {
        bms = bms.filter(b => b.question_id !== question.id)
        localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bms))
        return { data: null, action: 'removed', error: null }
      } else {
        const newBm = { id: crypto.randomUUID(), user_id: userId, question_id: question.id, question_data: question, created_at: new Date().toISOString() }
        bms.push(newBm)
        localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bms))
        return { data: newBm, action: 'added', error: null }
      }
    }
    
    const qSearch = query(collection(db, 'bookmarked_questions'), where('user_id', '==', userId), where('question_id', '==', question.id))
    const snap = await getDocs(qSearch)
    if (!snap.empty) {
      await deleteDoc(snap.docs[0].ref)
      return { data: null, action: 'removed', error: null }
    } else {
      const newBm = { user_id: userId, question_id: question.id, question_data: question, created_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'bookmarked_questions'), newBm)
      return { data: { id: docRef.id, ...newBm }, action: 'added', error: null }
    }
  },

  getNotes: async (userId) => {
    if (isRealFirebase) {
      const q = query(collection(db, 'custom_answers'), where('user_id', '==', userId))
      const snap = await getDocs(q)
      return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
    }
    return noopResult(JSON.parse(localStorage.getItem(`notes_${userId}`) || '[]'))
  },
  saveNote: async (userId, question, noteText) => {
    if (!isRealFirebase) {
      let notes = JSON.parse(localStorage.getItem(`notes_${userId}`) || '[]')
      const idx = notes.findIndex(n => n.question_id === question.id)
      if (idx >= 0) {
        notes[idx].text = noteText
        notes[idx].updated_at = new Date().toISOString()
      } else {
        notes.push({ id: crypto.randomUUID(), user_id: userId, question_id: question.id, question_data: question, text: noteText, updated_at: new Date().toISOString() })
      }
      localStorage.setItem(`notes_${userId}`, JSON.stringify(notes))
      return { data: notes.find(n => n.question_id === question.id), error: null }
    }

    const qSearch = query(collection(db, 'custom_answers'), where('user_id', '==', userId), where('question_id', '==', question.id))
    const snap = await getDocs(qSearch)
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, { text: noteText, updated_at: new Date().toISOString() })
      return { data: { id: snap.docs[0].id, text: noteText }, error: null }
    } else {
      const newNote = { user_id: userId, question_id: question.id, question_data: question, text: noteText, updated_at: new Date().toISOString() }
      const docRef = await addDoc(collection(db, 'custom_answers'), newNote)
      return { data: { id: docRef.id, ...newNote }, error: null }
    }
  }
}
