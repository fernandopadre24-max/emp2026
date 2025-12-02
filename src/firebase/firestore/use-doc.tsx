'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, doc, type DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T extends DocumentData>(path: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const docRef = useMemo(() => doc(firestore, path), [firestore, path]);

  useEffect(() => {
    const unsubscribe = onSnapshot(docRef, 
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(`Error fetching document at ${path}:`, err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, path]);

  return { data, loading };
}
