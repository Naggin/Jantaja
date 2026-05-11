import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jantar } from '../types';

export function useJantares(casalId: string) {
  const [jantares, setJantares] = useState<Jantar[]>([]);

  useEffect(() => {
    if (!casalId) return;

    const ref = collection(db, 'casais', casalId, 'jantares');
    const q = query(ref, orderBy('criado', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Jantar[];
      setJantares(dados);
    });

    return () => unsubscribe();
  }, [casalId]);

  return jantares;
}
