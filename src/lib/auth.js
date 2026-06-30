'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInCustomer = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (profileDoc.exists()) {
      const profile = profileDoc.data();
      if (profile.role && profile.role !== 'customer') {
        await firebaseSignOut(auth);
        throw new Error('Please use the admin login portal.');
      }
    }
    return result;
  };

  const signInAdmin = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!profileDoc.exists()) {
      await firebaseSignOut(auth);
      throw new Error('Admin account not found.');
    }
    const profile = profileDoc.data();
    const adminRoles = ['super_admin', 'admin', 'staff'];
    if (!adminRoles.includes(profile.role)) {
      await firebaseSignOut(auth);
      throw new Error('You do not have admin access.');
    }
    setUserProfile(profile);
    return { user: result.user, profile };
  };

  const signUpCustomer = async (email, password, name, phone) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      name,
      email,
      phone,
      role: 'customer',
      addresses: [],
      createdAt: serverTimestamp(),
    });
    return result;
  };

  const signOut = () => firebaseSignOut(auth);

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      const profileDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data());
      }
    }
  };

  const isAdmin = () => {
    const adminRoles = ['super_admin', 'admin', 'staff'];
    return userProfile && adminRoles.includes(userProfile.role);
  };

  const isSuperAdmin = () => userProfile?.role === 'super_admin';
  const isStaff = () => userProfile?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInCustomer,
        signInAdmin,
        signUpCustomer,
        signOut,
        isAdmin,
        isSuperAdmin,
        isStaff,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
