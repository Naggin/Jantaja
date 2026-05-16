import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Prato } from '../types';

export function usePratos(casalId: string, uid: string): Prato[] {
  const [pratos, setPratos] = useState<Prato[]>([]);

  useEffect(() => {
    if (!casalId || !uid) return;

    const ref = collection(db, 'casais', casalId, 'pratos');
    // Equality filter sem orderBy evita necessidade de índice composto
    const q = query(ref, where('status', '==', 'deck'));

    const unsub = onSnapshot(q, (snap) => {
      const todos = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Prato)
        .filter((p) => p.sugerido_por !== uid)
        .sort((a, b) => (a.criado?.seconds ?? 0) - (b.criado?.seconds ?? 0));
      setPratos(todos);
    });

    return () => unsub();
  }, [casalId, uid]);

  return pratos;
}
