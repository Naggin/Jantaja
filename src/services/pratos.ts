import {
  collection,
  addDoc,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export async function sugerirPrato(
  casalId: string,
  uid: string,
  nome: string,
  emoji: string,
  ingredientes: string[],
  contrapropostaDe: string | null = null
): Promise<string> {
  const ref = await addDoc(collection(db, 'casais', casalId, 'pratos'), {
    nome,
    emoji,
    ingredientes,
    sugerido_por: uid,
    contraproposta_de: contrapropostaDe,
    status: 'deck',
    criado: serverTimestamp(),
  });
  return ref.id;
}

export async function aceitarPrato(
  casalId: string,
  pratoId: string,
  ingredientes: string[]
): Promise<void> {
  const batch = writeBatch(db);

  batch.update(doc(db, 'casais', casalId, 'pratos', pratoId), {
    status: 'match',
  });

  for (const nome of ingredientes) {
    const itemRef = doc(collection(db, 'casais', casalId, 'compras'));
    batch.set(itemRef, {
      nome,
      quantidade: '1',
      comprado: false,
      origem: 'match',
      prato_id: pratoId,
      criado: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function recusarPrato(casalId: string, pratoId: string): Promise<void> {
  await updateDoc(doc(db, 'casais', casalId, 'pratos', pratoId), {
    status: 'descartado',
  });
}
