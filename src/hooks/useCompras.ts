import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ItemCompra } from '../types';

export function useCompras(casalId: string) {
  const [itens, setItens] = useState<ItemCompra[]>([]);

  useEffect(() => {
    if (!casalId) return;

    const ref = collection(db, 'casais', casalId, 'compras');
    const q = query(ref, orderBy('criado', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      setItens(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ItemCompra[]
      );
    });

    return () => unsub();
  }, [casalId]);

  return itens;
}
