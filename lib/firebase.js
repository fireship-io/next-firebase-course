import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, query, where, limit, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyBX5gkKsbOr1V0zxBuSqHWFct12dFOsQHA',
  authDomain: 'nextfire-demo.firebaseapp.com',
  projectId: 'nextfire-demo',
  storageBucket: 'nextfire-demo.appspot.com',
  messagingSenderId: '827402452263',
  appId: '1:827402452263:web:c9a4bea701665ddf15fd02',
};

// TODO Check if app length check is still needed, firebase v10 docs don't seem to require it
const app = initializeApp(firebaseConfig);

// Auth exports
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Firestore exports
export const firestore = getFirestore(app);

// Storage exports
export const storage = getStorage(app);

/// Helper functions

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username) {
  const usersRef = collection(firestore, 'users');
  const userQuery = query(
    usersRef,
    where('username', '==', username),
    limit(1)
    );
    const userDoc = await getDocs(userQuery);
  return userDoc.docs[0];
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}
