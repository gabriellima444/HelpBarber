'use client';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FirebaseContext } from './provider';
import { useContext } from 'react';

// Centralização dos hooks do Firestore
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

export function initializeFirebase() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return { firebaseApp: app, auth: getAuth(app), firestore: getFirestore(app), storage: getStorage(app) };
}

export function useFirebase() {
  const c = useContext(FirebaseContext);
  if (!c) throw new Error('useFirebase deve ser usado dentro de um FirebaseProvider');
  return c;
}

export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useStorage = () => useFirebase().storage;
export const useUser = () => {
  const { user, isUserLoading, isBarber, isAdmin, profileData } = useFirebase();
  return { user, isUserLoading, isBarber, isAdmin, profileData };
};

export { useCollection, useDoc };
export * from './provider';
export * from './client-provider';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';