'use client';
import React, { createContext, useMemo, useState, useEffect, useRef } from 'react';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { Customer, Barber } from '@/models/types';

interface UserAuthState { 
  user: User | null; 
  isUserLoading: boolean; 
  isBarber: boolean; 
  isAdmin: boolean;
  profileData: Customer | Barber | null; 
}

export interface FirebaseContextValue extends UserAuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

interface FirebaseProviderProps {
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

export const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export const FirebaseProvider = ({ children, firebaseApp, firestore, auth, storage }: FirebaseProviderProps) => {
  const [state, setState] = useState<UserAuthState>({ 
    user: null, 
    isUserLoading: true, 
    isBarber: false, 
    isAdmin: false,
    profileData: null 
  });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let unsubBarber: (() => void) | undefined;
    let unsubUser: (() => void) | undefined;
    let syncTimeout: NodeJS.Timeout | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Cleanup previous listeners
      if (unsubBarber) unsubBarber();
      if (unsubUser) unsubUser();
      if (syncTimeout) clearTimeout(syncTimeout);

      if (!currentUser) {
        if (isMounted.current) {
          setState({ user: null, isUserLoading: false, isBarber: false, isAdmin: false, profileData: null });
        }
        return;
      }

      // Admin Bypass via Custom Claims (definido via Firebase Admin SDK)
      try {
        const idTokenResult = await currentUser.getIdTokenResult();
        if (idTokenResult.claims.admin === true) {
          if (isMounted.current) {
            setState({ 
              user: currentUser, 
              isUserLoading: false, 
              isBarber: false, 
              isAdmin: true,
              profileData: { id: currentUser.uid, name: 'Admin', email: currentUser.email || '' } as Customer 
            });
          }
          return;
        }
      } catch (err) {
        console.warn('[FirebaseProvider] Erro ao verificar Custom Claims:', err);
      }

      let barberData: Barber | null = null;
      let userData: Customer | null = null;
      let isBarberSyncComplete = false;
      let isUserSyncComplete = false;

      const attemptStateSync = () => {
        if (isBarberSyncComplete && isUserSyncComplete && isMounted.current) {
          setState({ 
            user: currentUser, 
            isUserLoading: false, 
            isBarber: !!barberData, 
            isAdmin: false,
            profileData: barberData || userData || null 
          });
        }
      };

      // Listen for Barber Profile
      unsubBarber = onSnapshot(doc(firestore, 'barbers', currentUser.uid), (snap) => {
        barberData = snap.exists() ? { ...snap.data(), id: snap.id } as Barber : null;
        isBarberSyncComplete = true;
        attemptStateSync();
      }, () => {
        isBarberSyncComplete = true;
        attemptStateSync();
      });

      // Listen for Customer Profile
      unsubUser = onSnapshot(doc(firestore, 'users', currentUser.uid), (snap) => {
        userData = snap.exists() ? { ...snap.data(), id: snap.id } as Customer : null;
        isUserSyncComplete = true;
        attemptStateSync();
      }, () => {
        isUserSyncComplete = true;
        attemptStateSync();
      });

      // Safety timeout to prevent infinite loading
      syncTimeout = setTimeout(() => {
        if (isMounted.current) {
          isBarberSyncComplete = isUserSyncComplete = true;
          attemptStateSync();
        }
      }, 5000);
    });

    return () => {
      isMounted.current = false;
      unsubAuth();
      if (unsubBarber) unsubBarber();
      if (unsubUser) unsubUser();
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }, [auth, firestore]);

  const value = useMemo(() => ({ 
    areServicesAvailable: !!(firebaseApp && firestore && auth && storage), 
    firebaseApp, 
    firestore, 
    auth, 
    storage,
    ...state 
  }), [firebaseApp, firestore, auth, storage, state]);

  return (
    <FirebaseContext.Provider value={value}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};
