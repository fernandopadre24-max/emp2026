'use client';

import { ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';
import { signInAnonymously } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    const fb = initializeFirebase();
    setFirebase(fb);
    
    const signIn = async () => {
      try {
        await signInAnonymously(fb.auth);
      } catch (error) {
        console.error("Anonymous sign-in failed", error);
      }
    };

    if(fb.auth.currentUser === null) {
        signIn();
    }

  }, []);

  if (!firebase) {
    // You can return a loading spinner here if needed
    return <div>Loading Firebase...</div>;
  }

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
