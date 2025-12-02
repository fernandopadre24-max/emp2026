'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  type Firestore,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions {
  sort?: { by: string; direction?: 'asc' | 'desc' };
  filter?: { field: string; operator: '==', value: any };
}

export function useCollection<T extends DocumentData>(
  path: string,
  options?: UseCollectionOptions
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  const queryRef = useMemo(() => {
    let q: Query = collection(firestore, path);
    if (options?.filter) {
        q = query(q, where(options.filter.field, options.filter.operator, options.filter.value));
    }
    if (options?.sort) {
        q = query(q, orderBy(options.sort.by, options.sort.direction));
    }
    return q;
  }, [firestore, path, options]);


  useEffect(() => {
    const unsubscribe = onSnapshot(queryRef, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching collection:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryRef, path]);

  return { data, loading };
}
