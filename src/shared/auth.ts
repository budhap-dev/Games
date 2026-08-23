/**
 * Optional Google sign-in via Firebase. Everything here is lazy-loaded so guests never download Firebase.
 * Enabled only when VITE_FIREBASE_API_KEY (and friends) are set — see docs/AUTH.md.
 */
export interface AuthUser { uid: string; name: string; photo: string | null }

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}
export const authEnabled = !!(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId)

type Fb = { auth: import('firebase/auth').Auth; db: import('firebase/firestore').Firestore }
let fbPromise: Promise<Fb> | null = null
async function fb(): Promise<Fb> {
  if (!fbPromise) {
    fbPromise = (async () => {
      const [{ initializeApp, getApps }, { getAuth }, { getFirestore }] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
      const app = getApps()[0] ?? initializeApp(cfg as Record<string, string>)
      return { auth: getAuth(app), db: getFirestore(app) }
    })()
  }
  return fbPromise
}

const toUser = (u: import('firebase/auth').User | null): AuthUser | null => (u ? { uid: u.uid, name: u.displayName || 'friend', photo: u.photoURL } : null)

/** Subscribe to auth state. No-op (calls back null once) when auth is disabled. */
export function onUser(cb: (u: AuthUser | null) => void): () => void {
  if (!authEnabled) { cb(null); return () => {} }
  let unsub = () => {}
  fb().then(async ({ auth }) => {
    const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')
    getRedirectResult(auth).catch(() => {})
    unsub = onAuthStateChanged(auth, (u) => cb(toUser(u)))
  })
  return () => unsub()
}

export async function signInWithGoogle(): Promise<AuthUser | null> {
  const { auth } = await fb()
  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth')
  const provider = new GoogleAuthProvider()
  try {
    const res = await signInWithPopup(auth, provider)
    return toUser(res.user)
  } catch (e) {
    // popups are often blocked in installed PWAs / some mobile browsers → fall back to redirect
    if ((e as { code?: string }).code === 'auth/popup-closed-by-user') return null
    await signInWithRedirect(auth, provider)
    return null
  }
}
export async function signOutUser() { const { auth } = await fb(); const { signOut } = await import('firebase/auth'); await signOut(auth) }

export async function loadCloud(uid: string): Promise<Record<string, unknown> | null> {
  const { db } = await fb(); const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null
}
export async function saveCloud(uid: string, data: Record<string, unknown>) {
  const { db } = await fb(); const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}
